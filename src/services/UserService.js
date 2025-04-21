import user from "../models/users.js";
import doctorInfor from "../models/doctor_info.js";
import bcrypt from "bcrypt";
import jwtService from "./JwtService.js";
import dotenv from "dotenv";
import sendMail from "../utils/sendMail.js";
import patientRecord from "../models/patient_records.js";
import booking from "../models/booking.js";
import feedbackService from "./FeedBackService.js";
import doctorClickLog from "../models/doctor_click_log.js";

dotenv.config();

const createUserService = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const {
      email,
      password,
      fullname,
      gender,
      birthDate,
      address,
      phoneNumber,
      image,
      roleId,
    } = newUser;
    try {
      const checkUser = await user.findOne({
        email: email,
      });
      if (checkUser !== null) {
        resolve({
          status: 404,
          message: "The email is already exists!",
        });
      }
      const hash = bcrypt.hashSync(password, 10);
      const createdUser = await user.create({
        email,
        password: hash,
        fullname,
        gender,
        birthDate,
        address,
        phoneNumber,
        image,
        isVerified: true,
        roleId,
      });
      if (createdUser) {
        if (createdUser.roleId === "R2") {
          const a = await doctorInfor.create({
            doctorId: createdUser.userId,
          });
        }
        resolve({
          status: 200,
          message: "Create user successfully",
          data: createdUser,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const loginUserService = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { email, password } = userLogin;
    try {
      const checkUser = await user.findOne({
        email: email,
      });
      if (checkUser === null) {
        resolve({
          status: 404,
          message: "The email is not defined",
        });
      } else {
        if (!checkUser.isVerified) {
          resolve({
            status: 404,
            message: "The email is not verified",
          });
        }
      }
      const comparePassword = bcrypt.compareSync(password, checkUser.password);

      if (!comparePassword) {
        resolve({
          status: 404,
          message: "The user or password is incorrect",
        });
      }

      const access_token = await jwtService.generalAccessToken({
        userId: checkUser.userId,
        roleId: checkUser.roleId,
      });

      const refresh_token = await jwtService.generalRefreshToken({
        userId: checkUser.userId,
        roleId: checkUser.roleId,
      });

      resolve({
        status: 200,
        message: "SUCCESS",
        access_token,
        refresh_token,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const resetUserPasswordService = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkEmail = await user.findOne({
        email: email,
      });
      if (checkEmail === null) {
        resolve({
          status: 404,
          message: "The email is not defined",
        });
      }

      // Create reset password token
      const token = await jwtService.generalResetPasswordToken(email);
      // Create reset password link
      const resetLink = `${process.env.WEB_LINK}/reset-password/${token}`;
      // Create text
      const text = `Click the link to reset your password: ${resetLink}`;
      const subject = "Đặt lại mật khẩu";
      sendMail.sendMailResetPassword(email, resetLink, subject);

      resolve({
        status: 200,
        message: "Password reset link has been sent to your email",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updateUserService = (id, data) => {
  return new Promise(async (resolve, reject) => {
    const {
      password,
      fullname,
      gender,
      birthDate,
      address,
      phoneNumber,
      image,
      roleId,
    } = data;
    try {
      const checkUser = await user.findOne({
        userId: id,
      });
      if (checkUser === null) {
        resolve({
          status: 404,
          message: "The user is not defined",
        });
      }
      // const hash = bcrypt.hashSync(password, 10);
      const updateData = {};
      if (data.password)
        updateData.password = bcrypt.hashSync(data.password, 10);
      if (data.fullname) updateData.fullname = data.fullname;
      if (data.gender) updateData.gender = data.gender;
      if (data.birthDate) updateData.birthDate = data.birthDate;
      if (data.address) updateData.address = data.address;
      if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
      if (data.image) updateData.image = data.image;
      if (data.roleId) updateData.roleId = data.roleId;

      const updatedUser = await user.findOneAndUpdate(
        { userId: id }, // Điều kiện tìm kiếm
        updateData, // Giá trị cần cập nhật
        { new: true }
      );
      resolve({
        status: 200,
        message: "SUCCESS",
        data: updatedUser,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteUserService = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await user.findOne({
        userId: id,
      });
      if (checkUser === null) {
        resolve({
          status: 404,
          message: "The user is not defined",
        });
      }

      await user.findOneAndDelete({ userId: id });
      await doctorInfor.findOneAndDelete({ doctorId: id });
      resolve({
        status: 200,
        message: "Delete user success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllUserService = (query, skip, limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let formatQuery = {};
      // Sử dụng biểu thức chính quy để tìm kiếm không chính xác
      if (query.query) {
        formatQuery = {
          $or: [
            { fullname: { $regex: query.query, $options: "i" } }, // Tìm trong trường 'name'
            { address: { $regex: query.query, $options: "i" } }, // Tìm trong trường 'address'
          ],
        };
      }
      const allUsers = await user.find(formatQuery).skip(skip).limit(limit);
      const totalUsers = await user.countDocuments(formatQuery);
      const totalPages = Math.ceil(totalUsers / limit);
      resolve({
        status: 200,
        message: "SUCCESS",
        data: allUsers,
        totalPages,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getDetailsUserService = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userFind = await user
        .findOne({
          userId: id,
        })
        .lean();
      if (userFind === null) {
        resolve({
          status: 404,
          message: "The user is not defined",
        });
      }
      let formatUser = {
        ...userFind,
      };
      if (userFind.birthDate) {
        const birthDateOnly = userFind.birthDate.toISOString().split("T")[0];
        formatUser = {
          ...userFind,
          birthDate: birthDateOnly,
        };
      }

      resolve({
        status: 200,
        message: "Success",
        data: formatUser,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getUserByNameOrEmailService = (keyword) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userFind = await user.find({
        $or: [
          { fullname: { $regex: keyword, $options: "i" } }, // Tìm kiếm không phân biệt hoa thường
          { email: { $regex: keyword, $options: "i" } }, // Tìm kiếm không phân biệt hoa thường
        ],
      });
      resolve({
        status: 200,
        message: "Success",
        data: userFind,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updatePassword = async (
  userId,
  oldPassword,
  newPassword,
  confirmPassword
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm người dùng theo userId
      const userFind = await user.findOne({ userId: userId });
      if (!userFind) {
        return resolve({
          status: 404,
          message: "User not found",
        });
      }

      // Kiểm tra mật khẩu cũ
      const isMatch = await bcrypt.compare(oldPassword, userFind.password);
      if (!isMatch) {
        return resolve({
          status: 404,
          message: "Mật khẩu cũ không đúng",
        });
      }

      // Kiểm tra mật khẩu mới và xác nhận mật khẩu mới
      if (newPassword !== confirmPassword) {
        return resolve({
          status: 404,
          message: "New password and confirm password do not match",
        });
      }

      // Mã hóa mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Cập nhật mật khẩu mới
      userFind.password = hashedPassword;
      await userFind.save();

      resolve({
        status: 200,
        message: "Password updated successfully",
      });
    } catch (e) {
      reject({
        status: 500,
        message: "Error from server",
        error: e.message,
      });
    }
  });
};

const getDropdownUsersService = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const dropdowUsers = await user.find();

      resolve({
        status: 200,
        message: "Get dropdown user successfully",
        data: dropdowUsers,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getPatientStatistics = (idUser) => {
  return new Promise(async (resolve, reject) => {
    try {
      const patientProfile = await patientRecord.find({
        patientId: idUser,
      });

      if (patientProfile === null) {
        resolve({
          status: 200,
          data: [],
          message: "Don't find patient profile",
        });
      }

      const stats = [];

      for (const profile of patientProfile) {
        const bookings = await booking
          .find({
            patientRecordId: profile.patientRecordId,
            status: { $in: ["S4", "S5"] },
          })
          .populate({
            path: "doctorId",
            model: "Users",
            localField: "doctorId",
            foreignField: "userId",
            select: "fullname userId",
          });

        let totalVisits = 0;
        let totalCost = 0;
        let monthlyVisitsMap = new Map();
        let monthlyCostMap = new Map();
        let doctorStatsMap = new Map();
        let success = 0;
        let canceled = 0;

        bookings.forEach((booking) => {
          if (booking.status === "S4") {
            totalVisits++;
            const date = new Date(booking.appointmentDate);
            // console.log(date);
            const month = `${String(date.getMonth() + 1).padStart(
              2,
              "0"
            )}/${date.getFullYear()}`;
            // const month = new Date(booking.appointmentDate).toLocaleDateString(
            //   "vi-VN",
            //   { month: "2-digit", year: "numeric" }
            // );
            const cost = parseInt(booking.price || "0");

            totalCost += cost;

            // Thống kê theo tháng
            monthlyVisitsMap.set(month, (monthlyVisitsMap.get(month) || 0) + 1);
            monthlyCostMap.set(month, (monthlyCostMap.get(month) || 0) + cost);

            // Thống kê theo bác sĩ
            const doctorName = booking.doctorId?.fullname || "Unknown";
            doctorStatsMap.set(
              doctorName,
              (doctorStatsMap.get(doctorName) || 0) + 1
            );
          }

          // Thống kê trạng thái
          if (booking.status === "S4") success++;
          else if (booking.status === "S5") canceled++;
        });
        stats.push({
          profileId: profile.patientRecordId,
          fullName: profile.fullname,
          totalVisits,
          totalCost,
          monthlyVisits: Array.from(monthlyVisitsMap.entries()).map(
            ([month, visits]) => ({ month, visits })
          ),
          monthlyCost: Array.from(monthlyCostMap.entries()).map(
            ([month, cost]) => ({ month, cost })
          ),
          doctorStats: Array.from(doctorStatsMap.entries()).map(
            ([doctorName, count]) => ({ doctorName, count })
          ),
          successRate: { success, canceled },
        });
      }
      resolve({
        status: 200,
        data: stats,
        message: "Get patient profile successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getSuggestService = (limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      const list = [];
      const data = await user.find({
        roleId: "R3",
      });

      const clickLogs = await doctorClickLog.aggregate([
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: { doctorId: "$doctorId", userId: "$userId" },
            click_count: { $sum: 1 },
          },
        },
      ]);

      console.log("clickLogs: ", clickLogs);

      const clickMap = {};
      for (const item of clickLogs) {
        const key = `${item._id.userId}_${item._id.doctorId}`;
        clickMap[key] = item.click_count;
      }

      console.log("clickMap: ", clickMap);

      for (const info of data) {
        const patientProfile = await patientRecord.find({
          patientId: info.userId,
        });

        for (const profile of patientProfile) {
          const bookings = await booking.find({
            patientRecordId: profile.patientRecordId,
            status: "S4",
          });

          for (const booking of bookings) {
            const doctorInfos = await doctorInfor.find({
              doctorId: booking.doctorId,
            });

            const query = {
              doctorId: booking.doctorId,
            };

            const rate = await feedbackService.getFeedBackByDoctorId(query);

            // console.log("checkrate: ", rate);

            for (const doctorInfo of doctorInfos) {
              list.push({
                patient_id: info.userId,
                // profile_id: profile.patientRecordId,
                doctor_id: booking.doctorId,
                specialty_id: doctorInfo.specialtyId,
                rating: rate.averageRating,
                last_visit_date: booking.appointmentDate,
              });
            }
          }
        }
      }

      const result = {};
      for (const item of list) {
        const key = `${item.patient_id}_${item.doctor_id}`;
        if (!result[key]) {
          result[key] = {
            patient_id: item.patient_id,
            doctor_id: item.doctor_id,
            specialty_id: item.specialty_id,
            rating: item.rating,
            visits: 1,
            last_visit_date: item.last_visit_date,
            click_count: clickMap[key] || 0,
          };
        } else {
          result[key].visits += 1;

          if (item.last_visit_date > result[key].last_visit_date) {
            result[key].last_visit_date = item.last_visit_date;
          }
        }
      }

      for (const item of clickLogs) {
        const key = `${item._id.userId}_${item._id.doctorId}`;
        if (!result[key]) {
          const doctorInfo = await doctorInfor.findOne({
            doctorId: item._id.doctorId,
          });
          const rate = await feedbackService.getFeedBackByDoctorId({
            doctorId: item._id.doctorId,
          });
          // console.log("checkrate: ", rate);
          let rating = 0;
          if (rate.averageRating === 0) {
            rating = "5.0";
          }
          result[key] = {
            patient_id: item._id.userId,
            doctor_id: item._id.doctorId,
            specialty_id: doctorInfo?.specialtyId,
            rating: rate.averageRating,
            last_visit_date: new Date(),
            visits: 0,
            click_count: item.click_count,
          };
        }
      }

      // console.log(result);
      const convertResult = Object.values(result);

      convertResult.sort((a, b) => {
        const aDate = a.last_visit_date || null;
        const bDate = b.last_visit_date || null;

        if (!aDate && bDate) return 1;
        if (aDate && !bDate) return -1;
        if (!aDate && !bDate) return 0;

        return new Date(bDate) - new Date(aDate);
      });

      const resultFinal = convertResult.slice(0, limit);

      resolve({
        status: 200,
        message: "Get suggest successfully",
        data: resultFinal,
      });
    } catch (e) {
      reject(e);
    }
  });
};

export default {
  createUserService,
  loginUserService,
  resetUserPasswordService,
  updateUserService,
  deleteUserService,
  getAllUserService,
  getDetailsUserService,
  getUserByNameOrEmailService,
  updatePassword,
  getDropdownUsersService,
  getPatientStatistics,
  getSuggestService,
};
