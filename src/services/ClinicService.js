import clinic from "../models/clinic.js";
import SpecialtyService from "./SpecialtyService.js";

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
      const clinics = await clinic.find();
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
          ? [{ $sort: { avgRating: sortDirection } }]
          : []),

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
      const clinicsWithSpecialties = await Promise.all(
        clinics.map(async (clinicItem) => {
          const specialties = await SpecialtyService.getSpecialtyByClinicId(
            clinicItem.clinicId
          );
          return {
            ...clinicItem._doc,
            specialties: specialties.data,
          };
        })
      );

      resolve({
        status: 200,
        message: "Get dropdown clinic successfully",
        data: clinicsWithSpecialties,
      });
    } catch (e) {
      reject(e);
    }
  });
};

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

export default {
  createClinic,
  updateClinic,
  getAllClinic,
  getDetailClinic,
  deleteClinic,
  filterClinics,
  getDropdownClinics,
  getClinicByProvinceId,
};
