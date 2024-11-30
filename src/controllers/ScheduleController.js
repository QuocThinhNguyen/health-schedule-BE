import scheduleService from "../services/ScheduleService.js";

const getAllScheduleByDate = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const date = req.query.date;
    const response = await scheduleService.getAllScheduleByDate(
      date,
      page,
      limit,
      req.query
    );
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status:500,
      message: e.message,
    });
  }
};

const getScheduleByDate = async (req, res) => {
  try {
    const id = req.params.id;
    const date = req.query.date;
    const response = await scheduleService.getScheduleByDate(id, date);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status:500,
      message: e.message,
    });
  }
};

const createSchedule = async (req, res) => {
  try {
    const doctorId = req.body.doctorId;
    const scheduleDate = req.body.scheduleDate;
    const timeTypes = req.body.timeTypes;

    if (
      !doctorId ||
      !scheduleDate ||
      !Array.isArray(timeTypes) ||
      timeTypes.length === 0
    ) {
      return res.status(200).json({
        status: 404,
        message: "The doctorId, scheduleDate and timeTypes are required",
      });
    }

    const response = await scheduleService.createSchedule(
      doctorId,
      scheduleDate,
      timeTypes
    );
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status:500,
      message: e.message,
    });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const scheduleDate = req.body.scheduleDate;
    const timeTypes = req.body.timeTypes;

    // if (
    //   !doctorId ||
    //   !scheduleDate ||
    //   !Array.isArray(timeTypes) ||
    //   timeTypes.length === 0
    // ) {
    //   return res.status(200).json({
    //     status: "ERR",
    //     message: "The doctorId, scheduleDate and timeTypes are required",
    //   });
    // }

    const response = await scheduleService.updateSchedule(
      doctorId,
      scheduleDate,
      timeTypes
    );
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status:500,
      message: e.message,
    });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    if (!req.params.id && !req.query.date) {
      return res.status(200).json({
        status: 404,
        message: "The doctorId and date are required",
      });
    }
    const id = req.params.id;
    const date = req.query.date;
    const response = await scheduleService.deleteSchedule(id, date);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status:500,
      message: e.message,
    });
  }
};

export default {
  getAllScheduleByDate,
  getScheduleByDate,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
