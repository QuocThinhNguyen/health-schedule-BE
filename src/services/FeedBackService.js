import feedBack from "../models/feedbacks.js"

const createFeedBack = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.patientId || !data.doctorId || !data.rating || !data.comment || !data.date) {
                resolve({
                    status:400,
                    message: "Missing required fields"
                })
            } else {
                await feedBack.create({
                    patientId: data.patientId,
                    doctorId: data.doctorId,
                    rating: data.rating,
                    comment: data.comment,
                    date: data.date
                })
                resolve({
                    status:200,
                    message: "Create feedback successfully"
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

const updateFeedBack = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {

            const checkFeedBack = await feedBack.findOne({
                feedBackId: id
            })

            if (!checkFeedBack) {
                resolve({
                    status: 404,
                    message: "Feedback not found"
                });
            }

            await feedBack.updateOne(
                { feedBackId: id },
                data,
                { new: true }
            )

            resolve({
                status: 200,
                message: "Update feedback successfully"
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getAllFeedBack = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const feedBacks = await feedBack.find()
            resolve({
                status: 200,
                message: "Get all feedbacks successfully",
                data: feedBacks
            })

        } catch (e) {
            reject(e)
        }
    })
}

const deleteFeedBack = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const findFeedBack = await feedBack.findOne({
                feedBackId: id
            })

            if (!findFeedBack) {
                resolve({
                    status: 404,
                    message: "Feedback not found"
                })
            }

            await feedBack.deleteOne({
                feedBackId: id
            })

            resolve({
                status: 200,
                message: "Delete feedback successfully"
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getFeedBackByDoctorId = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const feedBacks = await feedBack.find({
                doctorId: doctorId
            })
            .populate({
                path: 'patientId',
                model:"PatientRecords",
                localField: 'patientId',
                foreignField: 'patientRecordId',
                select: "fullname"

            })
            resolve({
                status: 200,
                message: "Get all feedbacks successfully",
                data: feedBacks
            })

        } catch (e) {
            reject(e)
        }
    })
}

const checkFeedBacked = (patientId, doctorId,date) => {
    return new Promise(async (resolve, reject) => {
        try {
            const feedBacks = await feedBack.find({
                patientId: patientId,
                doctorId: doctorId,
                date: date
            })
            if(feedBacks.length > 0){
                resolve({
                    status: 200,
                    message: "Checked",
                    data: true
                })
            }
            resolve({
                status: 200,
                message: "Checked",
                data: false
            })
        } catch (e) {
            reject(e)
        }
    })
}

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
  
  

export default {
    createFeedBack,
    updateFeedBack,
    getAllFeedBack,
    deleteFeedBack,
    getFeedBackByDoctorId,
    checkFeedBacked,
    getAllFeedBackByFilter
}