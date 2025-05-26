import clinicManager from "../models/clinicmanager.js";
import schedule from "../models/schedule.js";
import doctorinfo from "../models/doctor_info.js"
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
      filter.clinicId
      if (date) {
        filter.scheduleDate = {
          $gte: new Date(date + "T00:00:00Z"),
          $lt: new Date(date + "T23:59:59Z"),
        };
      }

      const listDoctorInfos = await doctorinfo.find({clinicId: clinicId})
      const listDoctorIds = listDoctorInfos.map(doctorInfo => doctorInfo.doctorId)
      console.log("listDoctorIds", listDoctorIds);
      if(listDoctorIds){
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

      const result = Object.values(groupedSchedules).map((item) => ({
        doctorId: item.doctorId,
        scheduleDate: item.scheduleDate.toISOString().split("T")[0],
        timeTypes: item.timeTypes,
        currentNumbers: item.currentNumbers,
      }));

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

const updateSchedule = (doctorId, scheduleDate, timeTypes) => {
  return new Promise(async (resolve, reject) => {
    try {
      const updatedSchedules = [];

      const checkBooking = await booking.find({
        doctorId: doctorId,
        appointmentDate: scheduleDate,
        status: { $in: ["S2", "S3"] }
      });

      if (checkBooking.length > 0) {
        return resolve({
          status: 400,
          message: "Không thể cập nhật lịch hẹn đã có người đặt",
          data: checkBooking,
        });
      } else {
        await schedule.deleteMany({
          doctorId,
          scheduleDate,
        });

        for (const timeType of timeTypes) {
          const updatedSchedule = new schedule({
            doctorId,
            scheduleDate,
            currentNumber: 0,
            maxNumber: process.env.MAX_NUMBER || 2,
            timeType,
          });
          const savedSchedule = await updatedSchedule.save();
          updatedSchedules.push(savedSchedule);
        }

        resolve({
          status: 200,
          message: "SUCCESS",
          data: updatedSchedules,
        });
      }
    } catch (e) {
      reject(e.message);
    }
  });
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
  getClinicIdByUserId
};
