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

export default { adminHomePage };
