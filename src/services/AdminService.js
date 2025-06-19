import user from "../models/users.js";
import doctor from "../models/doctor_info.js";
import clinic from "../models/clinic.js";
import booking from "../models/booking.js";

const adminHomePage = async () => {
  return new Promise(async (resolve, reject) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

    try {
      const countOfNewUserThisMonth = await user.countDocuments({
        isVerified: true,
        createdAt: {
          $gte: startOfMonth,
          $lt: startOfNextMonth,
        },
      });
      const totalDoctors = await doctor.countDocuments();
      const totalClinics = await clinic.countDocuments();
      const totalBookingThisMonth = await booking.countDocuments({
        appointmentDate: {
          $gte: startOfMonth,
          $lt: startOfNextMonth,
        },
      });

      resolve({
        status: 200,
        message: "Success",
        data: {
          totalClinics: totalClinics,
          totalDoctors: totalDoctors,
          countOfNewUserThisMonth: countOfNewUserThisMonth,
          totalBookingThisMonth: totalBookingThisMonth,
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

const revenueChart = async () => {
  return new Promise(async (resolve, reject) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    try {
      const revenueEachMonth = await booking.aggregate([
        {
          $match: {
            appointmentDate: {
              $gte: new Date(currentYear, 0, 1),
              $lt: new Date(currentYear + 1, 0, 1),
            },
            status: "S4",
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

      const fullYearRevenue = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalRevenue: 0,
      }));

      revenueEachMonth.forEach((item) => {
        fullYearRevenue[item._id.month - 1].totalRevenue = item.totalRevenue;
      });

      const labels = fullYearRevenue.map((item) => `Tháng ${item.month}`);
      const values = fullYearRevenue.map((item) => item.totalRevenue);

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

const statusBookingChart = async () => {
  return new Promise(async (resolve, reject) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const firstDayOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

    try {
      const statusBooking = await booking.aggregate([
        {
          $match: {
            appointmentDate: {
              $gte: firstDayOfMonth,
              $lt: firstDayOfNextMonth,
            },
          },
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

const bookingDayInMonthChart = async () => {
  return new Promise(async (resolve, reject) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const firstDayOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    try {
      const bookingDayInMonth = await booking.aggregate([
        {
          $match: {
            appointmentDate: {
              $gte: firstDayOfMonth,
              $lt: firstDayOfNextMonth,
            },
            status: { $in: ["S2", "S3", "S4"] },
          },
        },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: "$appointmentDate" },
              status: "$status",
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
      reject(e);
    }
  });
};

const bookingMonthInYearChart = async () => {
  return new Promise(async (resolve, reject) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    try {
      const bookingMonthInYear = await booking.aggregate([
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
        },
      ]);

      const fullYear = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        total: 0,
      }));

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
      reject(e);
    }
  });
};

export default {
  adminHomePage,
  revenueChart,
  statusBookingChart,
  bookingDayInMonthChart,
  bookingMonthInYearChart,
};
