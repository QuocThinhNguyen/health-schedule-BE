import doctorInfor from "../models/doctor_info.js";
import users from "../models/users.js";
import specialties from "../models/specialty.js";
import clinics from "../models/clinic.js";
import allcodes from "../models/allcodes.js";
import feedBacks from "../models/feedbacks.js";
import booking from "../models/booking.js";
import { elasticClient } from "../configs/connectElastic.js";
import { syncDoctorsToElasticsearch } from "../utils/syncDoctorsToElasticsearch.js";

const getDoctorInfor = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm tài liệu doctor_info dựa trên doctorId
      const doctorData = await doctorInfor.findOne({ doctorId: id });
      if (!doctorData) {
        resolve({
          status: 404,
          message: "Cannot find doctor",
        });
        return;
      }

      const userData = await users.findOne({ userId: doctorData.doctorId });
      const specialtyData = await specialties.findOne({
        specialtyId: doctorData.specialtyId,
      });
      const clinicData = await clinics.findOne({
        clinicId: doctorData.clinicId,
      });
      const allCodeData = await allcodes.findOne({
        keyMap: doctorData.position,
      });

      const combinedData = {
        doctorInforId: doctorData.doctorInforId,
        doctorId: doctorData.doctorId,
        email: userData.email,
        fullname: userData.fullname,
        address: userData.address,
        gender: userData.gender,
        phoneNumber: userData.phoneNumber,
        birthDate: userData.birthDate,
        image: userData.image,
        specialtyName: specialtyData.name,
        specialtyId: doctorData.specialtyId,
        clinicName: clinicData.name,
        addressClinic: clinicData.address,
        clinicId: doctorData.clinicId,
        price: doctorData.price,
        note: doctorData.note,
        description: doctorData.description,
        position: allCodeData.keyMap,
      };
      resolve({
        status: 200,
        message: "Success",
        data: combinedData,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getPriceRange = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const minPrice = await doctorInfor
        .find()
        .sort({ price: 1 })
        .limit(1)
        .select("price");
      const maxPrice = await doctorInfor
        .find()
        .sort({ price: -1 })
        .limit(1)
        .select("price");

      resolve({
        status: 200,
        message: "success",
        data: {
          minPrice: minPrice[0].price,
          maxPrice: maxPrice[0].price,
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllDoctor = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Query:", query);

      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 6;

      let formatQuery = {};

      // Thêm điều kiện truy vấn theo clinicId và specialtyId
      if (query.clinicId) {
        formatQuery.clinicId = query.clinicId;
      }
      if (query.specialtyId) {
        formatQuery.specialtyId = query.specialtyId;
      }

      if (query.minPrice && query.maxPrice) {
        formatQuery.price = {
          $gte: parseFloat(query.minPrice),
          $lte: parseFloat(query.maxPrice),
        };
      }

      let allDoctor = await doctorInfor
        .find(formatQuery)
        .populate({
          path: "doctorId",
          model: "Users",
          localField: "doctorId",
          foreignField: "userId",
          select:
            "email fullname address gender birthDate phoneNumber image userId",
        })
        .populate({
          path: "specialtyId",
          model: "Specialty",
          localField: "specialtyId",
          foreignField: "specialtyId",
          select: "name image",
        })
        .populate({
          path: "clinicId",
          model: "Clinic",
          localField: "clinicId",
          foreignField: "clinicId",
          select: "name image address",
        });

      if (query.gender) {
        allDoctor = allDoctor.filter((doctor) =>
          query.gender.includes(doctor.doctorId.gender)
        );
      }

      // Tính trung bình cộng số rating và tổng số feedback từ bảng Feedback cho mỗi doctorId
      const doctorIds = allDoctor.map((doctor) => doctor.doctorId.userId);
      const avgFeedbacks = await feedBacks.aggregate([
        { $match: { doctorId: { $in: doctorIds } } },
        {
          $group: {
            _id: "$doctorId",
            avgRating: { $avg: "$rating" },
            countFeedBack: { $sum: 1 },
          },
        },
        {
          $project: {
            avgRating: { $round: ["$avgRating", 1] },
            countFeedBack: 1,
          },
        },
      ]);

      // Tạo một map để dễ dàng truy cập rating trung bình và tổng số feedback theo doctorId
      const feedbackMap = avgFeedbacks.reduce((acc, feedback) => {
        acc[feedback._id] = {
          avgRating: feedback.avgRating,
          countFeedBack: feedback.countFeedBack,
        };
        return acc;
      }, {});

      // Thêm rating trung bình và tổng số feedback vào allDoctor
      allDoctor.forEach((doctor) => {
        const feedback = feedbackMap[doctor.doctorId.userId] || {
          avgRating: 0,
          countFeedBack: 0,
        };
        doctor._doc.avgRating = feedback.avgRating;
        doctor._doc.countFeedBack = feedback.countFeedBack;
      });

      // Đếm số lượt được đặt khám của từng bác sĩ trong bảng Booking
      const bookingCounts = await booking.aggregate([
        { $match: { doctorId: { $in: doctorIds } } },
        { $group: { _id: "$doctorId", count: { $sum: 1 } } },
      ]);

      // Tạo một map để dễ dàng truy cập số lượt đặt khám theo doctorId
      const bookingMap = bookingCounts.reduce((acc, booking) => {
        acc[booking._id] = booking.count;
        return acc;
      }, {});

      // Thêm số lượt đặt khám vào allDoctor
      allDoctor.forEach((doctor) => {
        doctor._doc.bookingCount = bookingMap[doctor.doctorId.userId] || 0;
      });

      // Bộ lọc
      const regex = new RegExp(query.query, "i");
      console.log("Regex:", regex);

      // 1. Tính tổng số lượng doctor phù hợp (không phân trang)
      const totalFilteredDoctors = allDoctor.filter((doctor) => {
        return (
          regex.test(doctor.doctorId?.fullname) ||
          regex.test(doctor.clinicId?.name)
          // ||
          // regex.test(doctor.specialtyId?.name)
        );
      }).length;

      // 2. Áp dụng skip và limit cho danh sách đã filter
      const filteredDoctors = allDoctor
        .filter((doctor) => {
          return (
            regex.test(doctor.doctorId?.fullname) ||
            regex.test(doctor.clinicId?.name)
            // ||
            // regex.test(doctor.specialtyId?.name)
          );
        })
        .slice((page - 1) * limit, page * limit); // Phân trang bằng slice

      // Xác định tiêu chí sắp xếp
      let sortCriteria = {};
      if (query.sort) {
        switch (query.sort) {
          case "danh-gia-cao-den-thap":
            sortCriteria = { avgRating: -1 };
            break;
          case "danh-gia-thap-den-cao":
            sortCriteria = { avgRating: 1 };
            break;
          case "gia-cao-den-thap":
            sortCriteria = { price: -1 };
            break;
          case "gia-thap-den-cao":
            sortCriteria = { price: 1 };
            break;
          default:
            sortCriteria = {};
        }
      }

      // Sắp xếp danh sách đã filter
      filteredDoctors.sort((a, b) => {
        for (let key in sortCriteria) {
          if (a._doc[key] < b._doc[key]) return -sortCriteria[key];
          if (a._doc[key] > b._doc[key]) return sortCriteria[key];
        }
        return 0;
      });

      // tính totalPages
      const totalPages = Math.ceil(totalFilteredDoctors / limit);

      resolve({
        status: 200,
        message: "Success",
        data: filteredDoctors,
        totalDoctors: totalFilteredDoctors,
        totalPages: totalPages,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updateDoctorInfor = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doctorData = await doctorInfor.findOne({ doctorId: id });
      if (!doctorData) {
        resolve({
          status: 404,
          message: "Cannot find doctor",
        });
        return;
      }

      const userData = await users.findOne({ userId: doctorData.doctorId });
      const specialtyData = await specialties.findOne({
        specialtyId: doctorData.specialtyId,
      });
      const clinicData = await clinics.findOne({
        clinicId: doctorData.clinicId,
      });

      const updateUser = await users.findOneAndUpdate({ userId: id }, data, {
        new: true,
      });

      if (!updateUser) {
        resolve({
          status: 404,
          message: "Cannot update user",
        });
        return;
      }

      const updateDoctorInfor = await doctorInfor.findOneAndUpdate(
        { doctorId: id },
        data,
        { new: true }
      );

      if (!updateDoctorInfor) {
        resolve({
          status: 404,
          message: "Cannot update doctor information",
        });
        return;
      }
      syncDoctorsToElasticsearch();

      resolve({
        status: 200,
        message: "Update doctor information successfully",
        data: {
          user: updateUser,
          doctorInfor: updateDoctorInfor,
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

const searchDoctor = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // const query = {
      //     roleID: 'R2'
      // };
      // if (data) {
      //     query.fullname = { $regex: data, $options: 'i' }; // 'i' để không phân biệt chữ hoa chữ thường
      // }
      const doctorFind = await users.find({
        roleId: "R2",
        $or: [{ fullname: { $regex: data, $options: "i" } }],
      });

      if (doctorFind.length === 0) {
        resolve({
          status: 404,
          message: "No doctor found",
        });
      } else {
        resolve({
          status: 200,
          message: "Filter clinic successfully",
          data: doctorFind,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const getDropdownDoctors = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const dropdownDoctors = await doctorInfor
        .find()
        .populate({
          path: "doctorId",
          model: "Users",
          localField: "doctorId",
          foreignField: "userId",
          select: "email fullname address gender birthDate phoneNumber image",
        })
        .populate({
          path: "specialtyId",
          model: "Specialty",
          localField: "specialtyId",
          foreignField: "specialtyId",
          select: "name",
        })
        .populate({
          path: "clinicId",
          model: "Clinic",
          localField: "clinicId",
          foreignField: "clinicId",
          select: "name address",
        });

      // Tính trung bình cộng số rating từ bảng Feedback cho mỗi doctorId
      const doctorIds = dropdownDoctors.map((doctor) => doctor.doctorId.userId);
      const avgFeedbacks = await feedBacks.aggregate([
        { $match: { doctorId: { $in: doctorIds } } },
        { $group: { _id: "$doctorId", avgRating: { $avg: "$rating" } } },
        { $project: { avgRating: { $round: ["$avgRating", 1] } } },
      ]);

      // Tạo một map để dễ dàng truy cập rating trung bình theo doctorId
      const feedbackMap = avgFeedbacks.reduce((acc, feedback) => {
        acc[feedback._id] = feedback.avgRating;
        return acc;
      }, {});

      // Thêm rating trung bình vào allDoctor
      dropdownDoctors.forEach((doctor) => {
        doctor._doc.avgRating = feedbackMap[doctor.doctorId.userId] || 0;
      });

      // Đếm số lượt được đặt khám của từng bác sĩ trong bảng Booking
      const bookingCounts = await booking.aggregate([
        { $match: { doctorId: { $in: doctorIds } } },
        { $group: { _id: "$doctorId", count: { $sum: 1 } } },
      ]);

      // Tạo một map để dễ dàng truy cập số lượt đặt khám theo doctorId
      const bookingMap = bookingCounts.reduce((acc, booking) => {
        acc[booking._id] = booking.count;
        return acc;
      }, {});

      // Thêm số lượt đặt khám vào allDoctor
      dropdownDoctors.forEach((doctor) => {
        doctor._doc.bookingCount = bookingMap[doctor.doctorId.userId] || 0;
      });

      resolve({
        status: 200,
        message: "Get dropdown doctor successfully",
        data: dropdownDoctors,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAcademicRanksAndDegrees = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const academicRanksAndDegrees = await allcodes.find({
        type: "Position",
      });

      const filterAcademicRanksAndDegrees = academicRanksAndDegrees.map(
        (item) => {
          return {
            keyMap: item.keyMap,
            valueEn: item.valueEn,
            valueVi: item.valueVi,
          };
        }
      );

      resolve({
        status: 200,
        message: "success",
        data: filterAcademicRanksAndDegrees,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const searchDoctorByElasticeSearch = (
  keyword,
  filters,
  sortOption,
  pagination
) => {
  return new Promise(async (resolve, reject) => {
    try {
      let keywordQueries = [];
      let filterQueries = [];
      let sortQueries = [];

      if (keyword) {
        const words = keyword.toLowerCase().split(" ");

        const fullnameQueries = words.map((word) => ({
          match_phrase: {
            fullname: word,
          },
        }));
        const commentsQueries = words.map((word) => ({
          fuzzy: {
            comments: {
              value: word,
              fuzziness: 1,
              prefix_length: 1,
              max_expansions: 50,
              transpositions: false,
            },
          },
        }));

        keywordQueries.push({
          bool: {
            should: [...fullnameQueries, ...commentsQueries],
            minimum_should_match: 1,
          },
        });
      }

      if (filters.clinicId) {
        filterQueries.push({
          term: { clinicId: filters.clinicId },
        });
      }

      if (filters.specialtyId) {
        filterQueries.push({
          term: { specialtyId: filters.specialtyId },
        });
      }

      if (filters.gender) {
        const genderArray = Array.isArray(filters.gender)
          ? filters.gender
          : filters.gender.split(",");

        filterQueries.push({
          terms: { gender: genderArray },
        });
      }

      if (filters.minPrice || filters.maxPrice) {
        let priceRange = {};
        if (filters.minPrice) {
          priceRange.gte = filters.minPrice;
        }
        if (filters.maxPrice) {
          priceRange.lte = filters.maxPrice;
        }
        filterQueries.push({
          range: { price: priceRange },
        });
      }

      if (sortOption) {
        switch (sortOption) {
          case "danh-gia-cao-den-thap":
            sortQueries.push({ avgRating: "desc" });
            break;
          case "danh-gia-thap-den-cao":
            sortQueries.push({ avgRating: "asc" });
            break;
          case "gia-cao-den-thap":
            sortQueries.push({ price: "desc" });
            break;
          case "gia-thap-den-cao":
            sortQueries.push({ price: "asc" });
            break;
        }
      }

      const results = await elasticClient.search({
        index: "doctors",
        body: {
          query: {
            bool: {
              must:
                keywordQueries.length > 0
                  ? [...keywordQueries]
                  : { match_all: {} },
              filter: filterQueries,
            },
          },
          sort: sortQueries,
          from: (pagination.page - 1) * pagination.limit,
          size: pagination.limit,
          track_total_hits: true,
          highlight: {
            fields: {
              fullname: {},
              comments: {},
            },
          },
        },
      });

      const totalDoctors = results.hits.total.value;
      const totalPages = Math.ceil(totalDoctors / pagination.limit);

      resolve({
        status: 200,
        message: "Success",
        totalPages: totalPages,
        totalDoctors: totalDoctors,
        data: results.hits.hits.map((hit) => ({
          ...hit._source,
          highlight: hit.highlight || {},
        })),
      });
    } catch (e) {
      reject(e);
    }
  });
};

export default {
  getDoctorInfor,
  updateDoctorInfor,
  searchDoctor,
  getPriceRange,
  getAllDoctor,
  getDropdownDoctors,
  getAcademicRanksAndDegrees,
  searchDoctorByElasticeSearch,
};
