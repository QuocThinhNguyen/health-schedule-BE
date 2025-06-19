import SpecialtyService from "./SpecialtyService.js";
import doctorInfo from "../models/doctor_info.js";
import feedBack from "../models/feedbacks.js";
import booking from "../models/booking.js";
import clinic from "../models/clinic.js";

const COMMISSION_RATE = process.env.DEFAULT_COMMISSION_RATEE || 0.04;

const getStatistics = (clinicId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!clinicId) {
        return resolve({
          status: 400,
          message: "Missing clinicId",
        });
      }
      const currentDate = new Date();
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
        23,
        59,
        59
      );
      const clinicInfo = await clinic.findOne({ clinicId });
      console.log("Clinic Info:", clinicInfo);

      if (!clinicInfo) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy bệnh viện",
        });
      }
      //1. Tính tổng doanh thu tháng này của bệnh viện

      const doctorInfos = await doctorInfo.find({ clinicId: clinicId });
      const doctorIds = doctorInfos.map((info) => info.doctorId);

      const completedBookings = await booking.find({
        doctorId: { $in: doctorIds },
        status: "S4",
        appointmentDate: {
          $gte: firstDayOfMonth,
          $lte: lastDayOfMonth,
        },
      });
      console.log("Completed Bookings:", completedBookings);
      // Tính tổng doanh thu từ booking và dịch vụ
      const totalRevenue = completedBookings.reduce(
        (sum, booking) => sum + (Number(booking.price) || 0),
        0
      );
      console.log("Total Revenue:", totalRevenue);
      const commission = totalRevenue * COMMISSION_RATE;
      console.log("Commission:", commission);
      const actualRevenue = totalRevenue - commission;
      console.log("Actual Revenue:", actualRevenue);

      const bookingsThisMonth = await booking.countDocuments({
        doctorId: { $in: doctorIds },
        appointmentDate: {
          $gte: firstDayOfMonth,
          $lte: lastDayOfMonth,
        },
      });
      console.log("Bookings This Month:", bookingsThisMonth);

      const countDoctorInfos = await doctorInfo.countDocuments({
        clinicId: clinicId,
      });
      console.log("Doctor Infos Count:", doctorInfos);
      const successfulPatientRecords = await booking
        .find({
          doctorId: { $in: doctorIds },
          status: "S4",
        })
        .distinct("patientRecordId");
      const totalPatients = successfulPatientRecords.length;
      console.log("Total Patients:", totalPatients);

      resolve({
        status: 200,
        message: "Get clinic statistics successfully",
        data: {
          clinic: {
            clinicId: clinicInfo.clinicId,
            name: clinicInfo.name,
            address: clinicInfo.address,
          },
          statistics: {
            totalRevenue,
            commission,
            actualRevenue,
            countDoctorInfos,
            totalPatients,
            bookingsThisMonth,
          },
          period: {
            fromDate: firstDayOfMonth,
            toDate: lastDayOfMonth,
          },
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

const revenueChart = async (clinicId) => {
  return new Promise(async (resolve, reject) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    try {
      // Bước 1: Tìm tất cả doctorId thuộc clinicId này
      const doctorIds = await getListDoctorIdsByClinicId(clinicId);
      console.log("Doctor IDs:", doctorIds);

      // Bước 2: Tính doanh thu theo tháng với điều kiện doctorId nằm trong danh sách
      const revenueEachMonth = await booking.aggregate([
        {
          $match: {
            appointmentDate: {
              $gte: new Date(currentYear, 0, 1),
              $lt: new Date(currentYear + 1, 0, 1),
            },
            status: "S4",
            doctorId: { $in: doctorIds },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$appointmentDate" } },
            totalRevenue: {
              $sum: {
                $toDouble: "$price",
              },
            },
          },
        },
        {
          $sort: { "_id.month": 1 },
        },
      ]);
      console.log("Revenue Each Month:", revenueEachMonth);

      const fullYearRevenue = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalRevenue: 0,
      }));
      console.log("Full Year Revenue Before Update:", fullYearRevenue);

      revenueEachMonth.forEach((item) => {
        fullYearRevenue[item._id.month - 1].totalRevenue = item.totalRevenue;
      });

      const labels = fullYearRevenue.map((item) => `Tháng ${item.month}`);
      const values = fullYearRevenue.map((item) => item.totalRevenue);
      console.log("Labels:", labels);
      console.log("Values:", values);

      resolve({
        status: 200,
        message: "Success",
        data: {
          labels,
          values,
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

const statusBookingChart = async (clinicId) => {
  return new Promise(async (resolve, reject) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const firstDayOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

    try {
      // Trường hợp có clinicId, cần tìm tất cả doctorId thuộc về clinic
      let doctorIds = [];
      if (clinicId) {
        doctorIds = await getListDoctorIdsByClinicId(clinicId);
      }

      // Xây dựng điều kiện match
      const matchCondition = {
        appointmentDate: {
          $gte: firstDayOfMonth,
          $lt: firstDayOfNextMonth,
        },
      };

      // Nếu có clinicId, thêm điều kiện lọc theo doctorId
      if (clinicId && doctorIds.length > 0) {
        matchCondition.doctorId = { $in: doctorIds };
      }

      const statusBooking = await booking.aggregate([
        {
          $match: matchCondition,
        },
        {
          $group: {
            _id: { status: "$status" },
            total: {
              $sum: 1,
            },
          },
        },
      ]);

      const defaultStatuses = ["S1", "S2", "S3", "S4", "S5"];
      const statusLabels = {
        S1: "Chưa xác nhận",
        S2: "Đã xác nhận",
        S3: "Đã thanh toán",
        S4: "Đã hoàn thành",
        S5: "Đã hủy",
      };
      const fullStatusBooking = defaultStatuses.map((status) => ({
        status,
        total: 0,
      }));

      statusBooking.forEach((item) => {
        const index = fullStatusBooking.findIndex(
          (s) => s.status === item._id.status
        );
        if (index !== -1) {
          fullStatusBooking[index].total = item.total;
        }
      });

      const labels = fullStatusBooking.map((item) => statusLabels[item.status]);
      const values = fullStatusBooking.map((item) => item.total);

      resolve({
        status: 200,
        message: "Success",
        data: {
          labels,
          values,
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

const bookingDayInMonthChart = async (clinicId) => {
  return new Promise(async (resolve, reject) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const firstDayOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    try {
      // Xây dựng điều kiện match
      let matchCondition = {
        appointmentDate: {
          $gte: firstDayOfMonth,
          $lt: firstDayOfNextMonth,
        },
        status: { $in: ["S2", "S3", "S4"] },
      };

      // Nếu có clinicId, tìm tất cả doctorIds thuộc clinic này
      if (clinicId) {
        const doctorIds = await getListDoctorIdsByClinicId(clinicId);

        // Thêm điều kiện lọc theo doctorIds
        matchCondition.doctorId = { $in: doctorIds };
      }

      const bookingDayInMonth = await booking.aggregate([
        {
          $match: matchCondition,
        },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: "$appointmentDate" },
            },
            total: {
              $sum: 1,
            },
          },
        },
        {
          $sort: { "_id.day": 1 },
        },
      ]);

      const fullMonth = Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        total: 0,
      }));

      bookingDayInMonth.forEach((item) => {
        const index = fullMonth.findIndex((d) => d.day === item._id.day);
        if (index !== -1) {
          fullMonth[index].total = item.total;
        }
      });

      const labels = fullMonth.map((item) => item.day);
      const values = fullMonth.map((item) => item.total);

      resolve({
        status: 200,
        message: "Success",
        data: {
          labels,
          values,
        },
      });
    } catch (e) {
      console.error("Error in bookingDayInMonthChart:", e);
      reject(e);
    }
  });
};

const bookingMonthInYearChart = async (clinicId) => {
  return new Promise(async (resolve, reject) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    try {
      // Xây dựng pipeline
      const pipeline = [];

      // Nếu có clinicId, thêm lookup để lọc theo clinicId
      if (clinicId) {
        pipeline.push(
          // Lookup để kết nối với doctorInfo và lấy thông tin clinic
          {
            $lookup: {
              from: "doctorinfos", // Tên collection doctorInfo trong MongoDB
              localField: "doctorId",
              foreignField: "doctorId",
              as: "doctorInfo",
            },
          },
          // Unwrap mảng doctorInfo
          {
            $unwind: "$doctorInfo",
          },
          // Lọc theo clinicId
          {
            $match: {
              "doctorInfo.clinicId": clinicId,
            },
          }
        );
      }

      // Thêm các bước match thời gian và status, group theo tháng
      pipeline.push(
        {
          $match: {
            appointmentDate: {
              $gte: new Date(currentYear, 0, 1),
              $lt: new Date(currentYear + 1, 0, 1),
            },
            status: { $in: ["S2", "S3", "S4"] },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$appointmentDate" } },
            total: {
              $sum: 1,
            },
          },
        },
        {
          $sort: { "_id.month": 1 },
        }
      );

      const bookingMonthInYear = await booking.aggregate(pipeline);

      // Khởi tạo mảng với tất cả các tháng trong năm
      const fullYear = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        total: 0,
      }));

      // Cập nhật tổng số booking cho mỗi tháng
      bookingMonthInYear.forEach((item) => {
        fullYear[item._id.month - 1].total = item.total;
      });

      const labels = fullYear.map((item) => `Tháng ${item.month}`);
      const values = fullYear.map((item) => item.total);

      resolve({
        status: 200,
        message: "Success",
        data: {
          labels,
          values,
        },
      });
    } catch (e) {
      console.error("Error in bookingMonthInYearChart:", e);
      reject(e);
    }
  });
};

const createClinic = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.address ||
        !data.image ||
        !data.name ||
        !data.email ||
        !data.phoneNumber
      ) {
        resolve({
          status: 400,
          message: "Missing required fields",
        });
      } else {
        const encodedAddress = encodeURIComponent(data.address);
        const map_url = `https://www.google.com/maps?q=${encodedAddress}`;
        await clinic.create({
          name: data.name,
          address: data.address,
          image: data.image,
          email: data.email,
          phoneNumber: data.phoneNumber,
          description: data.description,
          provinceCode: data.provinceCode,
          provinceName: data.provinceName,
          districtCode: data.districtCode,
          districtName: data.districtName,
          wardCode: data.wardCode,
          wardName: data.wardName,
          street: data.street,
          mapUrl: map_url,
        });
        resolve({
          status: 200,
          message: "Create clinic successfully",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const updateClinic = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkClinic = await clinic.findOne({
        clinicId: id,
      });
      if (!checkClinic) {
        return resolve({
          status: 404,
          message: "Clinic not found",
        });
      }
      console.log("Check data", data);

      const encodedAddress = encodeURIComponent(data.address);
      const map_url = `https://www.google.com/maps?q=${encodedAddress}`;
      data.mapUrl = map_url;
      await clinic.updateOne({ clinicId: id }, data, { new: true });

      return resolve({
        status: 200,
        message: "Update clinic successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllClinic = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const clinics = await clinic.find().sort({ updatedAt: -1 });
      resolve({
        status: 200,
        message: "Get all clinic successfully",
        data: clinics,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getDetailClinic = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const clinicData = await clinic.findOne({
        clinicId: id,
      });
      if (!clinicData) {
        resolve({
          status: 404,
          message: "Clinic is not defined",
        });
      }
      resolve({
        status: 200,
        message: "Get clinic successfully",
        data: clinicData,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteClinic = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const findClinic = await clinic.findOne({
        clinicId: id,
      });

      if (!findClinic) {
        resolve({
          status: 404,
          message: "Clinic is not defined",
        });
      }

      await clinic.deleteOne({
        clinicId: id,
      });

      resolve({
        status: 200,
        message: "Delete clinic successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

// const filterClinics = (query) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const page = parseInt(query.page) || 1;
//       const limit = parseInt(query.limit) || 6;
//       let formatQuery = {};
//       // Sử dụng biểu thức chính quy để tìm kiếm không chính xác
//       // if (query.query) {
//       //   formatQuery = {
//       //     $or: [
//       //       { name: { $regex: query.query, $options: "i" } }, // Tìm trong trường 'name'
//       //       { address: { $regex: query.query, $options: "i" } }, // Tìm trong trường 'address'
//       //     ],
//       //   };
//       // }

//       if (query.query && query.provinceCode) {
//         formatQuery = {
//           $and: [
//             {
//               $or: [
//                 { name: { $regex: query.query, $options: "i" } },
//                 { address: { $regex: query.query, $options: "i" } },
//               ],
//             },
//             { provinceCode: query.provinceCode },
//           ],
//         };
//       } else if (query.query) {
//         formatQuery = {
//           $or: [
//             { name: { $regex: query.query, $options: "i" } },
//             { address: { $regex: query.query, $options: "i" } },
//           ],
//         };
//       } else if (query.provinceCode) {
//         formatQuery = { provinceCode: query.provinceCode };
//       }

//       const clinics = await clinic
//         .find(formatQuery)
//         .skip((page - 1) * limit)
//         .limit(limit);

//       const totalClinics = await clinic.countDocuments(formatQuery);
//       const totalPages = Math.ceil(totalClinics / limit);

//       resolve({
//         status: 200,
//         message: "Filter clinic successfully",
//         data: clinics,
//         totalPages,
//       });
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

const filterClinics = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 6;
      const skip = (page - 1) * limit;
      const sortDirection =
        query.sort === "asc" ? 1 : query.sort === "desc" ? -1 : null;

      // Tạo điều kiện tìm kiếm cơ bản
      let matchClinic = {};
      if (query.query && query.provinceCode) {
        matchClinic = {
          $and: [
            {
              $or: [
                { name: { $regex: query.query, $options: "i" } },
                { address: { $regex: query.query, $options: "i" } },
              ],
            },
            { provinceCode: query.provinceCode },
          ],
        };
      } else if (query.query) {
        matchClinic = {
          $or: [
            { name: { $regex: query.query, $options: "i" } },
            { address: { $regex: query.query, $options: "i" } },
          ],
        };
      } else if (query.provinceCode) {
        matchClinic = { provinceCode: query.provinceCode };
      }

      const clinicsWithRating = await clinic.aggregate([
        { $match: matchClinic },

        // Join với doctorInfo để lấy danh sách doctorId của clinic
        {
          $lookup: {
            from: "doctorinfos",
            localField: "clinicId",
            foreignField: "clinicId",
            as: "doctors",
          },
        },

        // Lấy danh sách tất cả doctorId
        {
          $addFields: {
            doctorIds: {
              $map: {
                input: "$doctors",
                as: "doc",
                in: "$$doc.doctorId",
              },
            },
          },
        },

        // Join với bảng feedback
        {
          $lookup: {
            from: "feedbacks",
            let: { doctorIds: "$doctorIds" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$doctorId", "$$doctorIds"] },
                },
              },
            ],
            as: "feedbacks",
          },
        },

        // Tính avgRating từ feedbacks
        {
          $addFields: {
            avgRating: {
              $cond: [
                { $gt: [{ $size: "$feedbacks" }, 0] },
                { $round: [{ $avg: "$feedbacks.rating" }, 1] },
                0,
              ],
            },
            totalFeedbacks: { $size: "$feedbacks" },
          },
        },

        // Sắp xếp nếu có sort
        ...(sortDirection !== null
          ? [{ $sort: { avgRating: sortDirection, updatedAt: -1 } }] // Sort theo rating và updatedAt
          : [{ $sort: { updatedAt: -1 } }]),

        // Phân trang
        { $skip: skip },
        { $limit: limit },
      ]);

      // Tính tổng số trang (phải làm lại với match ban đầu)
      const totalClinics = await clinic.countDocuments(matchClinic);
      const totalPages = Math.ceil(totalClinics / limit);

      resolve({
        status: 200,
        message: "Filter clinic successfully",
        data: clinicsWithRating,
        totalPages,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getDropdownClinics = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const clinics = await clinic.find();

      const clinicsWithSpecialtiesAndRating = await Promise.all(
        clinics.map(async (clinicItem) => {
          // Lấy danh sách doctorId thuộc clinic
          const doctors = await doctorInfo
            .find({ clinicId: clinicItem.clinicId })
            .select("doctorId");
          const doctorIds = doctors.map((doc) => doc.doctorId);

          let avgRating = 0;

          if (doctorIds.length > 0) {
            // Tính trung bình rating từ feedbacks
            const ratingResult = await feedBack.aggregate([
              { $match: { doctorId: { $in: doctorIds } } },
              {
                $group: {
                  _id: null,
                  avg: { $avg: "$rating" },
                },
              },
            ]);

            avgRating =
              ratingResult.length > 0
                ? parseFloat(ratingResult[0].avg.toFixed(1))
                : 0;
          }

          // Lấy chuyên khoa
          const specialties = await SpecialtyService.getSpecialtyByClinicId(
            clinicItem.clinicId
          );

          return {
            ...clinicItem._doc,
            specialties: specialties.data,
            avgRating: avgRating,
          };
        })
      );

      // Sắp xếp theo avgRating giảm dần
      clinicsWithSpecialtiesAndRating.sort((a, b) => b.avgRating - a.avgRating);

      resolve({
        status: 200,
        message: "Get dropdown clinic successfully",
        data: clinicsWithSpecialtiesAndRating,
      });
    } catch (e) {
      reject(e);
    }
  });
};

// const getDropdownClinics = () => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const clinics = await clinic.find();
//       // console.log("Clinics data:", clinics);

//       const clinicsWithSpecialties = await Promise.all(
//         clinics.map(async (clinicItem) => {
//           const specialties = await SpecialtyService.getSpecialtyByClinicId(
//             clinicItem.clinicId
//           );
//           return {
//             ...clinicItem._doc,
//             specialties: specialties.data,
//           };
//         })
//       );

//       resolve({
//         status: 200,
//         message: "Get dropdown clinic successfully",
//         data: clinicsWithSpecialties,
//       });
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

// const getDropdownClinics = () => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       // Lấy thông tin tất cả clinic
//       const clinics = await clinic.aggregate([
//         {
//           // Nối doctorInfo để lấy doctor theo clinicId
//           $lookup: {
//             from: "doctorinfos",
//             localField: "clinicId",
//             foreignField: "clinicId",
//             as: "doctors",
//           },
//         },
//         {
//           // Lấy mảng các doctorId
//           $addFields: {
//             doctorIds: {
//               $map: {
//                 input: "$doctors",
//                 as: "doc",
//                 in: "$$doc.doctorId",
//               },
//             },
//           },
//         },
//         {
//           // Nối bảng feedback theo doctorIds
//           $lookup: {
//             from: "feedbacks",
//             let: { doctorIds: "$doctorIds" },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: { $in: ["$doctorId", "$$doctorIds"] },
//                 },
//               },
//             ],
//             as: "feedbacks",
//           },
//         },
//         {
//           // Tính avgRating
//           $addFields: {
//             avgRating: {
//               $cond: [
//                 { $gt: [{ $size: "$feedbacks" }, 0] },
//                 {
//                   $round: [
//                     {
//                       $avg: "$feedbacks.rating",
//                     },
//                     1,
//                   ],
//                 },
//                 0,
//               ],
//             },
//           },
//         },
//         {
//           $sort: {
//             avgRating: -1, // sắp xếp giảm dần
//           },
//         },
//       ]);

//       resolve({
//         status: 200,
//         message: "Get dropdown clinics with avgRating successfully",
//         data: clinics,
//       });
//     } catch (err) {
//       console.error("Error getDropdownClinics:", err.message);
//       reject(err);
//     }
//   });
// };

const getClinicByProvinceId = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await clinic.find({
        provinceCode: id,
      });
      if (!data || data.length === 0) {
        resolve({
          status: 404,
          message: "Clinic is not defined",
        });
      }

      console.log("Check data", data);

      resolve({
        status: 200,
        message: "Get clinic successfull",
        data: data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

async function getListDoctorIdsByClinicId(clinicId) {
  const doctorInfos = await doctorInfo.find({ clinicId });
  return doctorInfos.map((info) => info.doctorId);
}

export default {
  getStatistics,
  revenueChart,
  statusBookingChart,
  bookingDayInMonthChart,
  bookingMonthInYearChart,
  createClinic,
  updateClinic,
  getAllClinic,
  getDetailClinic,
  deleteClinic,
  filterClinics,
  getDropdownClinics,
  getClinicByProvinceId,
};
