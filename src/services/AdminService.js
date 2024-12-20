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
      const revenueThisMonth = await booking.aggregate([
        {
          $match: {
            appointmentDate: {
              $gte: startOfMonth, 
              $lt: startOfNextMonth, 
            },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $toDouble: "$price", 
              },
            },
          },
        },
      ]);
      const revenueEachMonth = await booking.aggregate([
        {
          $match: {
            appointmentDate: {
              $gte: new Date(currentYear, 0, 1), 
              $lt: new Date(currentYear + 1, 0, 1), 
            },
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
  // return new Promise(async (resolve, reject) => {
  //   const currentDate = new Date();
  //   const currentYear = currentDate.getFullYear();

  //   try {
  //     const revenueEachMonth = await booking.aggregate([
  //       {
  //         $match: {
  //           appointmentDate: {
  //             $gte: new Date(currentYear, 0, 1), 
  //             $lt: new Date(currentYear + 1, 0, 1), 
  //           },
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: { month: { $month: "$appointmentDate" } },
  //           totalRevenue: {
  //             $sum: {
  //               $toDouble: "$price", 
  //             },
  //           },
  //         },
  //       },
  //       {
  //         $sort: { "_id.month": 1 },
  //       },
  //     ]);

  //     resolve({
  //       status: 200,
  //       message: "Success",
  //       data: revenueEachMonth,
  //     });
  //   } catch (e) {
  //     reject(e);
  //   }
  // });
}

export default { adminHomePage, revenueChart };
