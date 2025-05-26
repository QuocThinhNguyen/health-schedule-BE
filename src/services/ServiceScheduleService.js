import serviceSchedule from "../models/service_schedule.js";

const getServiceBySearchAndFilter = (keyword, date, pageNo, pageSize) => {
  return new Promise(async (resolve, reject) => {
    try {
      const filter = {};
      if (date) {
        filter.scheduleDate = {
          $gte: new Date(date + "T00:00:00Z"),
          $lt: new Date(date + "T23:59:59Z"),
        };
      }
      // Truy vấn Schedule theo filter (có thể có hoặc không có scheduleDate)
      const allScheduleByDate = await serviceSchedule.find(filter).populate({
        path: "serviceId",
        model: "Service",
        localField: "serviceId",
        foreignField: "serviceId",
        select: "name",
      });

      // Nhóm các timeType theo doctorId
      const groupedSchedules = {};

      allScheduleByDate.forEach((schedule) => {
        // Sử dụng combination của doctorId và scheduleDate làm khóa
        const serviceId = schedule.serviceId._id.toString(); // Chuyển đổi ID thành chuỗi
        const scheduleDate = schedule.scheduleDate.toISOString(); // Chuyển đổi ngày thành chuỗi
        const key = `${serviceId}_${scheduleDate}`; // Tạo khóa duy nhất cho mỗi bác sĩ theo từng ngày
        if (!groupedSchedules[key]) {
          groupedSchedules[key] = {
            serviceId: schedule.serviceId,
            scheduleDate: schedule.scheduleDate,
            timeTypes: [],
            currentNumbers: [],
            maxNumbers: [],
          };
        }
        groupedSchedules[key].timeTypes.push(schedule.timeType);
        groupedSchedules[key].currentNumbers.push(schedule.currentNumber);
        groupedSchedules[key].maxNumbers.push(schedule.maxNumber);
      });
      // Bộ lọc
      const regex = new RegExp(keyword, "i");

      // Chuyển đổi groupedSchedules thành mảng
      const result = Object.values(groupedSchedules).map((item) => ({
        serviceId: item.serviceId,
        scheduleDate: item.scheduleDate.toISOString().split("T")[0],
        timeTypes: item.timeTypes,
        currentNumbers: item.currentNumbers,
        maxNumbers: item.maxNumbers,
      })); //.slice((page - 1) * limit, page * limit);
      //Tính tổng số lượng kết quả phù hợp (không phân trang)
      const totalFilteredResults = result.filter((service) => {
        return regex.test(service.serviceId?.name);
      }).length;
      //Áp dụng skip và limit cho danh sách đã filter
      const filteredResults = result.filter((service) => {
        return regex.test(service.serviceId?.name);
      });
      const sortedResults = filteredResults
        .sort((a, b) => {
          const dateA = new Date(a.scheduleDate);
          const dateB = new Date(b.scheduleDate);
          return dateB - dateA;
        })
        .slice((pageNo - 1) * pageSize, pageNo * pageSize);
      const totalPages = Math.ceil(totalFilteredResults / pageSize);
      resolve({
        status: 200,
        message: "Get all schedule service successfully",
        currentPage: pageNo,
        totalPages: totalPages,
        totalElements: totalFilteredResults,
        data: sortedResults,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getServiceScheduleBySerivceIdAndDate = (serviceId, scheduleDate) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!serviceId) {
        return resolve({
          status: 400,
          message: "Missing required fields",
        });
      }
      const filter = {};
      filter.serviceId = serviceId;
      if (scheduleDate) {
        filter.scheduleDate = {
          $gte: new Date(scheduleDate + "T00:00:00Z"),
          $lt: new Date(scheduleDate + "T23:59:59Z"),
        };
      }

      const allScheduleBySerivceIdAndDate = await serviceSchedule
        .find(filter)
        .populate({
          path: "serviceId",
          model: "Service",
          localField: "serviceId",
          foreignField: "serviceId",
          select: "name",
        });

      if (allScheduleBySerivceIdAndDate.length === 0) {
        return resolve({
          status: 200,
          message: "No schedule found",
          data: [],
        });
      }
      // Nhóm các timeType theo doctorId
      const groupedSchedules = {};

      allScheduleBySerivceIdAndDate.forEach((schedule) => {
        // Sử dụng combination của doctorId và scheduleDate làm khóa
        const serviceId = schedule.serviceId._id.toString(); // Chuyển đổi ID thành chuỗi
        const scheduleDate = schedule.scheduleDate.toISOString(); // Chuyển đổi ngày thành chuỗi
        const key = `${serviceId}_${scheduleDate}`; // Tạo khóa duy nhất cho mỗi bác sĩ theo từng ngày

        if (!groupedSchedules[key]) {
          groupedSchedules[key] = {
            serviceId: schedule.serviceId,
            scheduleDate: schedule.scheduleDate,
            timeTypes: [],
            currentNumbers: [],
            maxNumbers: [],
          };
        }
        groupedSchedules[key].timeTypes.push(schedule.timeType);
        groupedSchedules[key].currentNumbers.push(schedule.currentNumber);
        groupedSchedules[key].maxNumbers.push(schedule.maxNumber);
      });

      // Chuyển đổi groupedSchedules thành mảng
      const groupedValues = Object.values(groupedSchedules);
      const result =
        groupedValues.length === 1
          ? {
              serviceId: groupedValues[0].serviceId,
              scheduleDate: groupedValues[0].scheduleDate
                .toISOString()
                .split("T")[0],
              timeTypes: groupedValues[0].timeTypes,
              currentNumbers: groupedValues[0].currentNumbers,
              maxNumbers: groupedValues[0].maxNumbers,
            }
          : groupedValues.map((item) => ({
              serviceId: item.serviceId,
              scheduleDate: item.scheduleDate.toISOString().split("T")[0],
              timeTypes: item.timeTypes,
              currentNumbers: item.currentNumbers,
              maxNumbers: item.maxNumbers,
            }));

      resolve({
        status: 200,
        message: "Get service schedule successfully",
        data: result,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const createServiceSchedule = (serviceId, scheduleDate, timeTypes) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkSchedule = await serviceSchedule.find({
        serviceId,
        scheduleDate,
        timeType: { $in: timeTypes },
      });
      if (checkSchedule.length > 0) {
        return resolve({
          status: 400,
          message: "Schedule already exists",
        });
      }

      const createdSchedules = [];

      for (const timeType of timeTypes) {
        const newServiceSchedule = new serviceSchedule({
          serviceId: serviceId,
          currentNumber: 0,
          maxNumber: process.env.MAX_SERVICE_NUMBER,
          scheduleDate: scheduleDate,
          timeType: timeType,
        });
        const savedSchedule = await newServiceSchedule.save(); // Dùng save để tạo schedule
        createdSchedules.push(savedSchedule);
      }

      return resolve({
        status: 200,
        message: "create service schedule successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updateServiceSchedule = (serviceId, scheduleDate, timeTypes) => {
  return new Promise(async (resolve, reject) => {
    try {
      const updatedSchedules = [];

      await serviceSchedule.deleteMany({
        serviceId,
        scheduleDate,
      });

      for (const timeType of timeTypes) {
        const updatedServiceSchedule = new serviceSchedule({
          serviceId: serviceId,
          currentNumber: 0,
          maxNumber: process.env.MAX_SERVICE_NUMBER,
          scheduleDate: scheduleDate,
          timeType: timeType,
        });
        const savedSchedule = await updatedServiceSchedule.save();
        updatedSchedules.push(savedSchedule);
      }

      resolve({
        status: 200,
        message: "Updated service schedule successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteServiceSchedule = (serviceId, scheduleDate) => {
  return new Promise(async (resolve, reject) => {
    try {
      const filter = {};
      filter.serviceId = serviceId;
      filter.scheduleDate = {
        $gte: new Date(scheduleDate + "T00:00:00Z"),
        $lt: new Date(scheduleDate + "T23:59:59Z"),
      };
      const deletedSchedule = await serviceSchedule.deleteMany(filter);
      if (!deletedSchedule) {
        return resolve({
          status: 404,
          message: "Schedule not found",
        });
      }

      resolve({
        status: 200,
        message: "Delete service schedule successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

export default {
  getServiceBySearchAndFilter,
  getServiceScheduleBySerivceIdAndDate,
  createServiceSchedule,
  updateServiceSchedule,
  deleteServiceSchedule,
};
