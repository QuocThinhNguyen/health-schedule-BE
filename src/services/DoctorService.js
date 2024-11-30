import doctorInfor from "../models/doctor_info.js";
import users from "../models/users.js";
import specialties from "../models/specialty.js";
import clinics from "../models/clinic.js";
import allcodes from "../models/allcodes.js";

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
        clinicName: clinicData.name,
        addressClinic: clinicData.address,
        price: doctorData.price,
        note: doctorData.note,
        description: doctorData.description,
        position: allCodeData.valueVi,
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

const getAllDoctor = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 6;
      let formatQuery = {};
      // Sử dụng biểu thức chính quy để tìm kiếm không chính xác
      // if (query.query) {
      //     formatQuery = {
      //         $or: [
      //             { 'doctorId.fullname': { $regex: query.query, $options: 'i' } },
      //             { 'clinicId.name': { $regex: query.query, $options: 'i' } },
      //             { 'specialtyId.name': { $regex: query.query, $options: 'i' } }
      //         ]
      //     };
      // }

      // const allDoctor = await doctorInfor.aggregate([
      //     {
      //         $lookup: {
      //             from: 'users', // Tên bộ sưu tập của người dùng
      //             localField: 'doctorId', // Trường doctor có doctorId
      //             foreignField: 'userId', // Trường userId của user
      //             as: 'user'
      //         }
      //     },
      //     {
      //         $lookup: {
      //             from: 'clinics', // Tên bộ sưu tập của phòng khám
      //             localField: 'clinicId', // Trường doctor có clinicId
      //             foreignField: 'clinicId', // Trường clinicId của clinic
      //             as: 'clinic'
      //         }
      //     },
      //     {
      //         $lookup: {
      //             from: 'specialties', // Tên bộ sưu tập của chuyên khoa
      //             localField: 'specialtyId', // Trường doctor có specialtyId
      //             foreignField: 'specialtyId', // Trường specialtyId của specialty
      //             as: 'specialty'
      //         }
      //     },
      //     {
      //         $match: formatQuery // Áp dụng bộ lọc từ formatQuery
      //     },
      //     {
      //         $project: {
      //             'user.fullname': 1,
      //             'user.address': 1,
      //             'user.image': 1,
      //             'user.phoneNumber': 1,
      //             'clinic.name': 1,
      //             'specialty.name': 1,
      //             position: 1,
      //             clinicId: 1,
      //             specialtyId: 1,
      //         }
      //     }
      // ])

      // Thêm điều kiện truy vấn theo clinicId và specialtyId
      if (query.clinicId) {
        formatQuery.clinicId = query.clinicId;
      }
      if (query.specialtyId) {
        formatQuery.specialtyId = query.specialtyId;
      }
      const allDoctor = await doctorInfor
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
          select: "name",
        })
        .populate({
          path: "clinicId",
          model: "Clinic",
          localField: "clinicId",
          foreignField: "clinicId",
          select: "name address",
        });
      // .skip((page - 1) * limit)
      // .limit(limit)

      // Bộ lọc
      const regex = new RegExp(query.query, "i");

      // 1. Tính tổng số lượng doctor phù hợp (không phân trang)
      const totalFilteredDoctors = allDoctor.filter((doctor) => {
        return (
          regex.test(doctor.doctorId?.fullname) ||
          regex.test(doctor.clinicId?.name) ||
          regex.test(doctor.specialtyId?.name)
        );
      }).length;

      // 2. Áp dụng skip và limit cho danh sách đã filter
      const filteredDoctors = allDoctor
        .filter((doctor) => {
          return (
            regex.test(doctor.doctorId?.fullname) ||
            regex.test(doctor.clinicId?.name) ||
            regex.test(doctor.specialtyId?.name)
          );
        })
        .slice((page - 1) * limit, page * limit); // Phân trang bằng slice
      // tính totalPages
      const totalPages = Math.ceil(totalFilteredDoctors / limit);

      resolve({
        status: 200,
        message: "Success",
        data: filteredDoctors,
        totalPages,
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
          message: "No clinic found",
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

export default {
  getDoctorInfor,
  updateDoctorInfor,
  searchDoctor,
  getAllDoctor,
  getDropdownDoctors,
};
