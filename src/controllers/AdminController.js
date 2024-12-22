import adminService from "../services/AdminService.js";

const adminHomePage = async (req, res) => {
  try {
    const response = await adminService.adminHomePage();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: e.message,
    });
  }
};

const revenueChart = async (req, res) => {
  try {
    const response = await adminService.revenueChart();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: e.message,
    });
  }
};

const statusBookingChart = async (req, res) => {
  try {
    const response = await adminService.statusBookingChart();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: e.message,
    });
  }
};

const bookingDayInMonthChart = async (req, res) => {
  try {
    const response = await adminService.bookingDayInMonthChart();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: e.message,
    });
  }
};

const bookingMonthInYearChart = async (req, res) => {
  try {
    const response = await adminService.bookingMonthInYearChart();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: e.message,
    });
  }
};

export default {
  adminHomePage,
  revenueChart,
  statusBookingChart,
  bookingDayInMonthChart,
  bookingMonthInYearChart,
};
