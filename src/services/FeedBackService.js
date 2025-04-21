import feedBack from "../models/feedbacks.js";
import doctorInfo from "../models/doctor_info.js";
import ReviewMedia from "../models/review_media.js";
import { syncDoctorsToElasticsearch } from "../utils/syncDoctorsToElasticsearch.js";

const createFeedBack = (data) => {
  console.log("DATA: ", data);
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.patientId ||
        !data.doctorId ||
        !data.rating ||
        !data.comment ||
        !data.date
      ) {
        resolve({
          status: 400,
          message: "Missing required fields",
        });
      } else {
        const newFeedBack = await feedBack.create({
          patientId: data.patientId,
          doctorId: data.doctorId,
          rating: data.rating,
          comment: data.comment,
          date: data.date,
          clinicId: data.clinicId,
        });
        syncDoctorsToElasticsearch();
        resolve({
          status: 200,
          message: "Create feedback successfully",
          data: newFeedBack,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const updateFeedBack = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkFeedBack = await feedBack.findOne({
        feedBackId: id,
      });

      if (!checkFeedBack) {
        resolve({
          status: 404,
          message: "Feedback not found",
        });
      }

      await feedBack.updateOne({ feedBackId: id }, data, { new: true });

      resolve({
        status: 200,
        message: "Update feedback successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllFeedBack = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const feedBacks = await feedBack.find();
      resolve({
        status: 200,
        message: "Get all feedbacks successfully",
        data: feedBacks,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteFeedBack = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const findFeedBack = await feedBack.findOne({
        feedBackId: id,
      });

      if (!findFeedBack) {
        resolve({
          status: 404,
          message: "Feedback not found",
        });
      }

      await feedBack.deleteOne({
        feedBackId: id,
      });

      resolve({
        status: 200,
        message: "Delete feedback successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

// const getFeedBackByDoctorId = (doctorId) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const feedBacks = await feedBack
//         .find({
//           doctorId: doctorId,
//         })
//         .populate({
//           path: "patientId",
//           model: "PatientRecords",
//           localField: "patientId",
//           foreignField: "patientRecordId",
//           // foreignField: "patientId",
//           select: "fullname",
//         });
//       resolve({
//         status: 200,
//         message: "Get all feedbacks successfully",
//         data: feedBacks,
//       });
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

const getFeedBackByDoctorId = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;

      const formatQuery = {
        doctorId: query.doctorId,
      };

      const feedBacks = await feedBack
        .find(formatQuery)
        .populate({
          path: "patientId",
          model: "PatientRecords",
          localField: "patientId",
          foreignField: "patientRecordId",
          select: "fullname",
        })
        // .populate({
        //   path:"feedBackId",
        //   model:"ReviewMedia",
        //   localField:"feedBackId",
        //   foreignField:"feedBackId",
        //   select:"mediaName"
        // })
        .sort({ date: -1 }) // Sắp xếp theo ngày và giờ mới nhất
        .skip((page - 1) * limit)
        .limit(limit);

      const totalFeedBacks = await feedBack.countDocuments(formatQuery);
      const totalPages = Math.ceil(totalFeedBacks / limit);

      // Tính tổng và trung bình rating
      const totalRating = feedBacks.reduce((sum, fb) => sum + fb.rating, 0);
      const averageRating =
        totalFeedBacks > 0 ? (totalRating / totalFeedBacks).toFixed(1) : 0;

      // Lấy tất cả các mediaName từ ReviewMedia
      const feedbacksWithMedia = await Promise.all(
        feedBacks.map(async (feedback) => {
          const media = await ReviewMedia.find({
            feedBackId: feedback.feedBackId,
          }).select("mediaName");
          return {
            ...feedback._doc,
            mediaNames: media.map((m) => m.mediaName),
          };
        })
      );

      resolve({
        status: 200,
        message: "Get all feedbacks successfully",
        data: feedbacksWithMedia,
        totalPages,
        totalFeedBacks,
        averageRating,
      });
    } catch (e) {
      reject(e);
    }
  });
};
const checkFeedBacked = (patientId, doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      const feedBacks = await feedBack.find({
        patientId: patientId,
        doctorId: doctorId,
        date: date,
      });
      if (feedBacks.length > 0) {
        resolve({
          status: 200,
          message: "Checked",
          data: true,
        });
      }
      resolve({
        status: 200,
        message: "Checked",
        data: false,
      });
    } catch (e) {
      reject(e);
    }
  });
};

// const getAllFeedBackByFilter = (query) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const page = parseInt(query.page) || 1; // Mặc định trang 1
//             const limit = parseInt(query.limit) || 10; // Mặc định mỗi trang 10 feedbacks
//             let formatQuery = {};

//             // Áp dụng filter (tìm kiếm)
//             if (query.query) {
//                 formatQuery = {
//                     $or: [
//                         { "patientId.fullname": { $regex: query.query, $options: 'i' } }, // Tìm kiếm theo tên bệnh nhân
//                         { "doctorId.fullname": { $regex: query.query, $options: 'i' } }, // Tìm kiếm theo tên bác sĩ
//                     ],
//                 };
//             }

//             // Lấy danh sách feedbacks với phân trang và filter
//             const feedBacks = await feedBack.find(formatQuery)
//             .populate({
//                 path: 'patientId',
//                 model:"PatientRecords",
//                 localField: 'patientId',
//                 foreignField: 'patientRecordId',
//                 select: "fullname"
//             })
//             .populate({
//                 path: 'doctorId',
//                 model:"Users",
//                 localField: 'doctorId',
//                 foreignField: 'userId',
//                 select: "fullname"
//             })
//                 .skip((page - 1) * limit) // Bỏ qua feedbacks không thuộc trang hiện tại
//                 .limit(limit); // Lấy số lượng feedbacks theo giới hạn `limit`

//                 console.log(formatQuery);
//             // Tổng số feedbacks sau khi áp dụng filter
//             const totalFeedBacks = await feedBack.countDocuments(formatQuery);

//             // Tính tổng số trang
//             const totalPages = Math.ceil(totalFeedBacks / limit);

//             resolve({
//                 status: 200,
//                 message: "Get all feedbacks successfully",
//                 data: feedBacks,
//                 totalPages,
//                 currentPage: page,
//             });

//         } catch (e) {
//             reject(e);
//         }
//     });
// };

const getAllFeedBackByFilter = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const page = parseInt(query.page) || 1; // Trang hiện tại, mặc định là 1
      const limit = parseInt(query.limit) || 10; // Số lượng feedback mỗi trang, mặc định là 10
      const regex = new RegExp(query.query, "i"); // Regex để tìm kiếm tên bác sĩ hoặc bệnh nhân
      let formatQuery = {};

      // Lấy tất cả feedbacks và populate dữ liệu liên quan
      const allFeedBacks = await feedBack
        .find()
        .populate({
          path: "doctorId",
          model: "Users",
          localField: "doctorId",
          foreignField: "userId",
          select: "fullname",
        })
        .populate({
          path: "patientId",
          model: "PatientRecords",
          localField: "patientId",
          foreignField: "patientRecordId",
          select: "fullname",
        });

      // 1. Lọc danh sách feedbacks dựa trên query
      const totalFilteredFeedBacks = allFeedBacks.filter((feedback) => {
        return (
          regex.test(feedback.patientId?.fullname) ||
          regex.test(feedback.doctorId?.fullname)
        );
      }).length;

      const filteredComment = allFeedBacks
        .filter((feedback) => {
          return (
            regex.test(feedback.patientId?.fullname) ||
            regex.test(feedback.doctorId?.fullname)
          );
        })
        .slice((page - 1) * limit, page * limit);

      // Tính tổng số trang
      const totalPages = Math.ceil(totalFilteredFeedBacks / limit);

      resolve({
        status: 200,
        message: "Get all feedbacks successfully",
        data: filteredComment,
        totalPages,
        currentPage: page,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getFeedBackByClinicId = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;

      // Lấy danh sách doctorId theo clinicId
      const doctors = await doctorInfo
        .find({ clinicId: query.clinicId })
        .select("doctorId");
      const doctorIds = doctors.map((doc) => doc.doctorId);

      // console.log("CHEKC: ",doctorIds);
      if (doctorIds.length === 0) {
        return resolve({
          status: 200,
          message: "No feedbacks found",
          data: [],
          avgRating: 0,
          totalFeedBacks: 0,
          totalPages: 0,
        });
      }

      // Lấy danh sách feedbacks theo doctorId trong danh sách
      const feedBacks = await feedBack
        .find({ doctorId: { $in: doctorIds } })
        // .populate({
        //   path: "patientId",
        //   model: "PatientRecords",
        //   select: "fullname",
        // })
        .populate({
          path: "patientId",
          model: "PatientRecords",
          localField: "patientId",
          foreignField: "patientRecordId",
          select: "fullname",
        })
        .populate({
          path: "doctorId",
          model: "Users",
          localField: "doctorId",
          foreignField: "userId",
          select: "fullname image ",
        })
        .sort({ date: -1 }) // Sắp xếp theo ngày mới nhất
        .skip((page - 1) * limit)
        .limit(limit);

      // Tính tổng số feedbacks
      const totalFeedBacks = await feedBack.countDocuments({
        doctorId: { $in: doctorIds },
      });
      const totalPages = Math.ceil(totalFeedBacks / limit);

      // Tính trung bình cộng số rating và tổng số feedback từ bảng Feedback cho mỗi doctorId
      const avgFeedbacks = await feedBack.aggregate([
        { $match: { doctorId: { $in: doctorIds } } },
        {
          $group: {
            _id: "$doctorId",
            avgRating: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
        { $project: { avgRating: { $round: ["$avgRating", 1] }, count: 1 } },
      ]);

      // Tạo một map để dễ dàng truy cập rating trung bình và tổng số feedback theo doctorId
      const feedbackMap = avgFeedbacks.reduce((acc, feedback) => {
        acc[feedback._id] = {
          avgRating: feedback.avgRating,
          count: feedback.count,
        };
        return acc;
      }, {});

      // Thêm rating trung bình và tổng số feedback vào feedBacks
      feedBacks.forEach((feedback) => {
        const feedbackData = feedbackMap[feedback.doctorId] || {
          avgRating: 0,
          count: 0,
        };
        feedback._doc.avgRating = feedbackData.avgRating;
        feedback._doc.feedbackCount = feedbackData.count;
      });

      // Tính trung bình cộng của tổng số feedbacks và rating
      const totalFeedbackCount = avgFeedbacks.reduce(
        (acc, feedback) => acc + feedback.count,
        0
      );
      const avgRating =
        totalFeedbackCount > 0
          ? avgFeedbacks.reduce(
              (acc, feedback) => acc + feedback.avgRating * feedback.count,
              0
            ) / totalFeedbackCount
          : 0;
      const feedbacksWithMedia = await Promise.all(
        feedBacks.map(async (feedback) => {
          const media = await ReviewMedia.find({
            feedBackId: feedback.feedBackId,
          }).select("mediaName");
          return {
            ...feedback._doc,
            mediaNames: media.map((m) => m.mediaName),
          };
        })
      );

      resolve({
        status: 200,
        message: "Get all feedbacks successfully",
        data: feedbacksWithMedia,
        avgRating: avgRating.toFixed(1),
        totalFeedbacks: totalFeedBacks,
        totalPages: totalPages,
      });
    } catch (e) {
      reject(e);
    }
  });
};

export default {
  createFeedBack,
  updateFeedBack,
  getAllFeedBack,
  deleteFeedBack,
  getFeedBackByDoctorId,
  checkFeedBacked,
  getAllFeedBackByFilter,
  getFeedBackByClinicId,
};
