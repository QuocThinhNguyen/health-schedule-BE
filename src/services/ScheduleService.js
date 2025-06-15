import clinicManager from "../models/clinicmanager.js";
import schedule from "../models/schedule.js";
import doctorinfo from "../models/doctor_info.js";
import booking from "../models/booking.js";

const getAllScheduleByDate = (date, page, limit, query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const filter = {};
      if (date) {
        filter.scheduleDate = {
          $gte: new Date(date + "T00:00:00Z"),
          $lt: new Date(date + "T23:59:59Z"),
        };
      }

      const allScheduleByDate = await schedule.find(filter).populate({
        path: "doctorId",
        model: "Users",
        localField: "doctorId",
        foreignField: "userId",
        select: "fullname",
      });

      const groupedSchedules = {};

      allScheduleByDate.forEach((schedule) => {
        const doctorId = schedule.doctorId._id.toString();
        const scheduleDate = schedule.scheduleDate.toISOString();
        const key = `${doctorId}_${scheduleDate}`;
        if (!groupedSchedules[key]) {
          groupedSchedules[key] = {
            doctorId: schedule.doctorId,
            scheduleDate: schedule.scheduleDate,
            timeTypes: [],
          };
        }
        groupedSchedules[key].timeTypes.push(schedule.timeType);
      });

      const regex = new RegExp(query.query, "i");

      const result = Object.values(groupedSchedules).map((item) => ({
        doctorId: item.doctorId,
        scheduleDate: item.scheduleDate.toISOString().split("T")[0],
        timeTypes: item.timeTypes,
      }));

      const totalFilteredResults = result.filter((doctor) => {
        return regex.test(doctor.doctorId?.fullname);
      }).length;

      const filteredResults = result.filter((doctor) => {
        return regex.test(doctor.doctorId?.fullname);
      });
      const sortedResults = filteredResults
        .sort((a, b) => {
          const dateA = new Date(a.scheduleDate);
          const dateB = new Date(b.scheduleDate);
          return dateA - dateB;
        })
        .slice((page - 1) * limit, page * limit);
      const totalPages = Math.ceil(totalFilteredResults / limit);
      resolve({
        status: 200,
        message: "SUCCESS",
        data: sortedResults,
        totalPages,
      });
    } catch (e) {
      reject(e.message);
    }
  });
};

const getScheduleByClinicAndDate = (userId, keyword, date, page, limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const clinicId = await getClinicIdByUserId(userId);

      const filter = {};
      filter.clinicId;
      if (date) {
        filter.scheduleDate = {
          $gte: new Date(date + "T00:00:00Z"),
          $lt: new Date(date + "T23:59:59Z"),
        };
      }

      const listDoctorInfos = await doctorinfo.find({ clinicId: clinicId });
      const listDoctorIds = listDoctorInfos.map(
        (doctorInfo) => doctorInfo.doctorId
      );
      console.log("listDoctorIds", listDoctorIds);
      if (listDoctorIds) {
        filter.doctorId = { $in: listDoctorIds };
      }

      const allScheduleByDate = await schedule.find(filter).populate({
        path: "doctorId",
        model: "Users",
        localField: "doctorId",
        foreignField: "userId",
        select: "fullname",
      });

      const groupedSchedules = {};

      allScheduleByDate.forEach((schedule) => {
        const doctorId = schedule.doctorId._id.toString();
        const scheduleDate = schedule.scheduleDate.toISOString();
        const key = `${doctorId}_${scheduleDate}`;
        if (!groupedSchedules[key]) {
          groupedSchedules[key] = {
            doctorId: schedule.doctorId,
            scheduleDate: schedule.scheduleDate,
            timeTypes: [],
          };
        }
        groupedSchedules[key].timeTypes.push(schedule.timeType);
      });

      const regex = new RegExp(keyword, "i");

      const result = Object.values(groupedSchedules).map((item) => ({
        doctorId: item.doctorId,
        scheduleDate: item.scheduleDate.toISOString().split("T")[0],
        timeTypes: item.timeTypes,
      }));

      const totalFilteredResults = result.filter((doctor) => {
        return regex.test(doctor.doctorId?.fullname);
      }).length;

      const filteredResults = result.filter((doctor) => {
        return regex.test(doctor.doctorId?.fullname);
      });
      const sortedResults = filteredResults
        .sort((a, b) => {
          const dateA = new Date(a.scheduleDate);
          const dateB = new Date(b.scheduleDate);
          return dateB - dateA;
        })
        .slice((page - 1) * limit, page * limit);
      const totalPages = Math.ceil(totalFilteredResults / limit);
      resolve({
        status: 200,
        message: "SUCCESS",
        data: sortedResults,
        totalPages,
      });
    } catch (e) {
      reject(e.message);
    }
  });
};

const getScheduleByDate = (id, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        return reject(new Error("Missing required fields: id or date"));
      }
      const filter = {};
      filter.doctorId = id;
      if (date) {
        filter.scheduleDate = {
          $gte: new Date(date + "T00:00:00Z"),
          $lt: new Date(date + "T23:59:59Z"),
        };
      }

      const allScheduleByDate = await schedule.find(filter).populate({
        path: "doctorId",
        model: "Users",
        localField: "doctorId",
        foreignField: "userId",
        select: "fullname",
      });

      if (allScheduleByDate.length === 0) {
        return resolve({
          status: 200,
          message: "No schedule found",
          data: [],
        });
      }

      const groupedSchedules = {};

      allScheduleByDate.forEach((schedule) => {
        const doctorId = schedule.doctorId._id.toString();
        const scheduleDate = schedule.scheduleDate.toISOString();
        const key = `${doctorId}_${scheduleDate}`;

        if (!groupedSchedules[key]) {
          groupedSchedules[key] = {
            doctorId: schedule.doctorId,
            scheduleDate: schedule.scheduleDate,
            timeTypes: [],
            currentNumbers: [],
          };
        }
        groupedSchedules[key].timeTypes.push(schedule.timeType);
        groupedSchedules[key].currentNumbers.push(schedule.currentNumber);
      });

      // const result = Object.values(groupedSchedules).map((item) => ({
      //   doctorId: item.doctorId,
      //   scheduleDate: item.scheduleDate.toISOString().split("T")[0],
      //   timeTypes: item.timeTypes,
      //   currentNumbers: item.currentNumbers,
      // }));

      const timeTypeOrder = [
        "T1",
        "T2",
        "T3",
        "T4",
        "T5",
        "T6",
        "T7",
        "T8",
        "T9",
      ];

      const result = Object.values(groupedSchedules).map((item) => {
        const combined = item.timeTypes.map((type, idx) => ({
          timeType: type,
          currentNumber: item.currentNumbers[idx],
        }));

        combined.sort(
          (a, b) =>
            timeTypeOrder.indexOf(a.timeType) -
            timeTypeOrder.indexOf(b.timeType)
        );

        return {
          doctorId: item.doctorId,
          scheduleDate: item.scheduleDate.toISOString().split("T")[0],
          timeTypes: combined.map((c) => c.timeType),
          currentNumbers: combined.map((c) => c.currentNumber),
        };
      });

      resolve({
        status: 200,
        message: "SUCCESS",
        data: result,
      });
    } catch (e) {
      reject(e.message);
    }
  });
};

const createSchedule = (doctorId, scheduleDate, timeTypes) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkSchedule = await schedule.find({
        doctorId,
        scheduleDate,
      });
      if (checkSchedule.length > 0) {
        return resolve({
          status: 400,
          message: "Schedule already exists",
        });
      }
      const createdSchedules = [];
      for (const timeType of timeTypes) {
        const newSchedule = new schedule({
          doctorId,
          scheduleDate,
          timeType,
          maxNumber: process.env.MAX_NUMBER || 2,
          currentNumber: 0,
        });
        const savedSchedule = await newSchedule.save();
        createdSchedules.push(savedSchedule);
      }

      resolve({
        status: 200,
        message: "SUCCESS",
        data: createdSchedules,
      });
    } catch (e) {
      reject(e.message);
    }
  });
};

// const updateSchedule = (doctorId, scheduleDate, timeTypes) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const updatedSchedules = [];

//       const checkBooking = await booking.find({
//         doctorId: doctorId,
//         appointmentDate: scheduleDate,
//         status: { $in: ["S2", "S3"] }
//       });

//       if (checkBooking.length > 0) {
//         return resolve({
//           status: 400,
//           message: "Không thể cập nhật lịch hẹn đã có người đặt",
//           data: checkBooking,
//         });
//       } else {
//         await schedule.deleteMany({
//           doctorId,
//           scheduleDate,
//         });

//         for (const timeType of timeTypes) {
//           const updatedSchedule = new schedule({
//             doctorId,
//             scheduleDate,
//             currentNumber: 0,
//             maxNumber: process.env.MAX_NUMBER || 2,
//             timeType,
//           });
//           const savedSchedule = await updatedSchedule.save();
//           updatedSchedules.push(savedSchedule);
//         }

//         resolve({
//           status: 200,
//           message: "SUCCESS",
//           data: updatedSchedules,
//         });
//       }
//     } catch (e) {
//       reject(e.message);
//     }
//   });
// };

// const updateSchedule = async (doctorId, scheduleDate, timeTypes) => {
//   try {
//     const existingSchedules = await schedule.find({ doctorId, scheduleDate });

//     // Kiểm tra những khung giờ nào đã có người đặt
//     const booked = await booking.find({
//       doctorId,
//       appointmentDate: scheduleDate,
//       status: { $in: ['S2', 'S3'] },
//     });

//     // Nếu có khung giờ đã được đặt → không xóa lịch cũ
//     if (booked.length > 0) {
//       // Tạo map khung giờ đã tồn tại
//       const existingTimeTypes = existingSchedules.map((s) => s.timeType);

//       // Tìm các khung giờ mới chưa tồn tại
//       const newTimeTypes = timeTypes.filter(
//         (type) => !existingTimeTypes.includes(type)
//       );

//       const addedSchedules = [];

//       for (const timeType of newTimeTypes) {
//         const newSchedule = new schedule({
//           doctorId,
//           scheduleDate,
//           currentNumber: 0,
//           maxNumber: process.env.MAX_NUMBER || 2,
//           timeType,
//         });
//         const saved = await newSchedule.save();
//         addedSchedules.push(saved);
//       }

//       return {
//         status: 200,
//         message: 'Đã thêm các khung giờ mới. Các khung giờ cũ có thể đã có người đặt.',
//         data: addedSchedules,
//       };
//     }

//     // Nếu không có ai đặt → xóa hết và ghi lại toàn bộ
//     await schedule.deleteMany({ doctorId, scheduleDate });

//     const recreatedSchedules = [];

//     for (const timeType of timeTypes) {
//       const newSchedule = new schedule({
//         doctorId,
//         scheduleDate,
//         currentNumber: 0,
//         maxNumber: process.env.MAX_NUMBER || 2,
//         timeType,
//       });
//       const saved = await newSchedule.save();
//       recreatedSchedules.push(saved);
//     }

//     return {
//       status: 200,
//       message: 'Cập nhật lịch thành công',
//       data: recreatedSchedules,
//     };
//   } catch (err) {
//     return {
//       status: 500,
//       message: 'Lỗi hệ thống',
//       error: err.message,
//     };
//   }
// };

const updateSchedule = async (doctorId, scheduleDate, timeTypes) => {
  try {
    // 1. Tìm tất cả lịch đã đặt (chỉ lấy status còn hiệu lực: S2, S3)
    const activeBookings = await booking.find({
      doctorId,
      appointmentDate: scheduleDate,
      status: { $in: ["S2", "S3"] },
    });

    // 2. Tạo danh sách các khung giờ không được phép xóa
    const lockedTimeTypes = activeBookings.map((b) => b.timeType);

    // 3. Lấy toàn bộ lịch hiện có trong ngày đó
    const existingSchedules = await schedule.find({ doctorId, scheduleDate });

    // 4. Lọc ra khung giờ cũ mà:
    // - Không có người đặt
    // - Không nằm trong danh sách mới => cần xóa
    const schedulesToDelete = existingSchedules.filter(
      (s) =>
        !timeTypes.includes(s.timeType) && !lockedTimeTypes.includes(s.timeType)
    );

    const deletePromises = schedulesToDelete.map((s) =>
      schedule.deleteOne({ _id: s._id })
    );
    await Promise.all(deletePromises);

    // 5. Tìm khung giờ mới cần thêm vào
    const existingTimeTypes = existingSchedules.map((s) => s.timeType);
    const timeTypesToAdd = timeTypes.filter(
      (type) => !existingTimeTypes.includes(type)
    );

    const addPromises = timeTypesToAdd.map((timeType) =>
      new schedule({
        doctorId,
        scheduleDate,
        currentNumber: 0,
        maxNumber: parseInt(process.env.MAX_NUMBER, 10) || 2,
        timeType,
      }).save()
    );

    const addedSchedules = await Promise.all(addPromises);

    return {
      status: 200,
      message: "Cập nhật lịch thành công",
      data: addedSchedules,
    };
  } catch (err) {
    return {
      status: 500,
      message: "Lỗi khi cập nhật lịch",
      error: err.message,
    };
  }
};

const deleteSchedule = (id, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      const filter = {};
      filter.doctorId = id;
      filter.scheduleDate = {
        $gte: new Date(date + "T00:00:00Z"),
        $lt: new Date(date + "T23:59:59Z"),
      };
      const deletedSchedule = await schedule.deleteMany(filter);
      if (!deletedSchedule) {
        return reject(new Error("Schedule not found"));
      }

      resolve({
        status: 200,
        message: "SUCCESS",
        data: deletedSchedule,
      });
    } catch (e) {
      reject(e.message);
    }
  });
};

const getClinicIdByUserId = async (userId) => {
  const clinic = await clinicManager.findOne({ userId: userId });
  if (!clinic) {
    return null;
  }
  return clinic.clinicId;
};

export default {
  getAllScheduleByDate,
  getScheduleByClinicAndDate,
  getScheduleByDate,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getClinicIdByUserId,
};
