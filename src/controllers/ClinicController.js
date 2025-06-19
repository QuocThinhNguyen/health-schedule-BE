import clinicService from "../services/ClinicService.js";
import scheduleService from "../services/ScheduleService.js";

const getStatistics = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const clinicId = await scheduleService.getClinicIdByUserId(userId);
    const data = await clinicService.getStatistics(clinicId);
    return res.status(200).json(data);
  } catch (err) {
    console.error("Error in getStatistics:", err);
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const revenueChart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const clinicId = await scheduleService.getClinicIdByUserId(userId);
    const data = await clinicService.revenueChart(clinicId);
    return res.status(200).json(data);
  } catch (err) {
    console.error("Error in revenueChart:", err);
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const statusBookingChart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const clinicId = await scheduleService.getClinicIdByUserId(userId);
    const data = await clinicService.statusBookingChart(clinicId);
    return res.status(200).json(data);
  } catch (err) {
    console.error("Error in statusBookingChart:", err);
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};
const bookingDayInMonthChart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const clinicId = await scheduleService.getClinicIdByUserId(userId);
    const data = await clinicService.bookingDayInMonthChart(clinicId);
    return res.status(200).json(data);
  } catch (err) {
    console.error("Error in bookingDayInMonthChart:", err);
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};
const bookingMonthInYearChart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const clinicId = await scheduleService.getClinicIdByUserId(userId);
    const data = await clinicService.bookingMonthInYearChart(clinicId);
    return res.status(200).json(data);
  } catch (err) {
    console.error("Error in bookingMonthInYearChart:", err);
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const createClinic = async (req, res) => {
  try {
    const imageArray = Object.values(req.files["image"] || {});
    const image =
      imageArray.length > 0
        ? imageArray[0].path
        : "https://res.cloudinary.com/dv9yzzjgg/image/upload/v1745632787/clinic_default_sbbquh.png";
    const clinicData = {
      ...req.body,
      image,
    };

    const infor = await clinicService.createClinic(clinicData);
    return res.status(200).json(infor);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const updateClinic = async (req, res) => {
  try {
    const id = req.params.id;
    const imageArray = Object.values(req.files["image"] || {});
    const image = imageArray.length > 0 ? imageArray[0].path : null;
    const clinicData = {
      ...req.body,
    };

    if (image) {
      clinicData.image = image;
    }
    const info = await clinicService.updateClinic(id, clinicData);
    return res.status(200).json(info);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getAllClinic = async (req, res) => {
  try {
    const data = await clinicService.getAllClinic();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getDetailClinic = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await clinicService.getDetailClinic(id);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const deleteClinic = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await clinicService.deleteClinic(id);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const filterClinics = async (req, res) => {
  try {
    const data = await clinicService.filterClinics(req.query);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getDropdownClinics = async (req, res) => {
  try {
    const data = await clinicService.getDropdownClinics();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};

const getClinicByProvinceId = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await clinicService.getClinicByProvinceId(id);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};

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
