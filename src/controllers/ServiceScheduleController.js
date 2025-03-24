import serviceScheduleService from "../services/ServiceScheduleService.js";

const getServiceBySearchAndFilter = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const pageNo = parseInt(req.query.pageNo) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const date = req.query.scheduleDate;
    const response = await serviceScheduleService.getServiceBySearchAndFilter(
      keyword,
      date,
      pageNo,
      pageSize
    );
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: e.message,
    });
  }
};

const getServiceScheduleBySerivceIdAndDate = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const scheduleDate = req.query.scheduleDate;
    const response =
      await serviceScheduleService.getServiceScheduleBySerivceIdAndDate(
        serviceId,
        scheduleDate
      );
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: e.message,
    });
  }
};

const createServiceSchedule = async (req, res) => {
  try {
    const { serviceId, scheduleDate, timeTypes } = req.body;
    const result = await serviceScheduleService.createServiceSchedule(
      serviceId,
      scheduleDate,
      timeTypes
    );
    return res.status(200).json(result);
  } catch (e) {
    console.log("Error from createServiceSchedule controller:", e.message);
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const updateServiceSchedule = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { scheduleDate, timeTypes } = req.body;
    console.log("serviceId", serviceId);
    console.log("scheduleDate", scheduleDate);
    console.log("timeTypes", timeTypes);

    const result = await serviceScheduleService.updateServiceSchedule(
      serviceId,
      scheduleDate,
      timeTypes
    );
    return res.status(200).json(result);
  } catch (e) {
    console.log("Error from updateServiceSchedule controller:", e.message);
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const deleteServiceSchedule = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const scheduleDate = req.query.scheduleDate;
    console.log("serviceId:", serviceId);
    console.log("scheduleDate:", scheduleDate);

    if (!serviceId && !scheduleDate) {
      return res.status(200).json({
        status: 404,
        message: "The serviceId or scheduleDate are required",
      });
    }
    const result = await serviceScheduleService.deleteServiceSchedule(
      serviceId,
      scheduleDate
    );
    return res.status(200).json(result);
  } catch (e) {
    console.log("Error from deleteServiceSchedule controller:", e.message);
    return res.status(500).json({
      status: 500,
      message: e.message,
    });
  }
};

export default {
  getServiceBySearchAndFilter,
  getServiceScheduleBySerivceIdAndDate,
  createServiceSchedule,
  updateServiceSchedule,
  deleteServiceSchedule,
};
