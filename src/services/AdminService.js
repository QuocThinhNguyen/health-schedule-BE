import user from "../models/users.js";
import doctor from "../models/doctor_info.js";
import clinic from "../models/clinic.js";
import booking from "../models/booking.js";

const adminHomePage = async () => {
  return new Promise(async (resolve, reject) => {
    const today = new Date();

    const currentYear = today.getFullYear(); // Lấy năm hiện tại
    const currentMonth = today.getMonth(); // Lấy tháng hiện tại (0-11)

    // Ngày đầu tiên của tháng hiện tại
    const startOfMonth = new Date(currentYear, currentMonth, 1);

    // Ngày đầu tiên của tháng tiếp theo (để xác định khoảng thời gian của tháng hiện tại)
    const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

    try {
      // đếm tổng số người dùng mới
      const countOfNewUserThisMonth = await user.countDocuments({
        isVerified: true, // Điều kiện isVerified = true
        createdAt: {
          // Điều kiện createdAt nằm trong tháng hiện tại
          $gte: startOfMonth, // Lớn hơn hoặc bằng ngày đầu tiên của tháng
          $lt: startOfNextMonth, // Nhỏ hơn ngày đầu tiên của tháng tiếp theo
        },
      });

      // Đếm tổng số bác sĩ
      const totalDoctors = await doctor.countDocuments();

      // Đếm tổng số phòng khám
      const totalClinics = await clinic.countDocuments();

      // Đếm tổng số lượt đặt khám bệnh trong tháng
      const totalBookingThisMonth = await booking.countDocuments({
        appointmentDate: {
          // Điều kiện createdAt nằm trong tháng hiện tại
          $gte: startOfMonth, // Lớn hơn hoặc bằng ngày đầu tiên của tháng
          $lt: startOfNextMonth, // Nhỏ hơn ngày đầu tiên của tháng tiếp theo
        },
      });

      // Tính tổng doanh thu tháng hiện tại
      const revenueThisMonth = await booking.aggregate([
        {
          $match: {
            appointmentDate: {
              $gte: startOfMonth, // Ngày đầu tiên của tháng hiện tại
              $lt: startOfNextMonth, // Ngày đầu tiên của tháng tiếp theo
            },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $toDouble: "$price", // Chuyển đổi price từ String sang Number
              },
            },
          },
        },
      ]);

      // Tính tổng doanh thu từng tháng trong năm
      const revenueEachMonth = await booking.aggregate([
        {
          $match: {
            appointmentDate: {
              $gte: new Date(currentYear, 0, 1), // Ngày đầu tiên của năm
              $lt: new Date(currentYear + 1, 0, 1), // Ngày đầu tiên của năm tiếp theo
            },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$appointmentDate" } }, // Nhóm theo tháng
            totalRevenue: {
              $sum: {
                $toDouble: "$price", // Chuyển đổi price từ String sang Number
              },
            },
          },
        },
        {
          $sort: { "_id.month": 1 }, // Sắp xếp theo thứ tự tháng
        },
      ]);

      resolve({
        status: 200,
        message: "Success",
        countOfNewUserThisMonth: countOfNewUserThisMonth,
        totalDoctors: totalDoctors,
        totalClinics: totalClinics,
        totalBookingThisMonth: totalBookingThisMonth,
        revenueThisMonth: revenueThisMonth.length
          ? revenueThisMonth[0].totalRevenue
          : 0,
        revenueEachMonth: revenueEachMonth,
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
            status: { $in: ["S2", "S3", "S4", "S5"] },
          },
        },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: "$appointmentDate" }
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
            status: { $in: ["S2", "S3", "S4", "S5"] },
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