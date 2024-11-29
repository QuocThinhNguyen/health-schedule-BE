import User from "../models/users.js";
import DoctorInfor from "../models/doctor_info.js"
import bcrypt from "bcrypt";
import {
  generalAccessToken,
  generalRefreshToken,
  generalResetPasswordToken,
} from "./JwtService.js";
import dotenv from "dotenv";
import sendMail from "../utils/sendMail.js";
dotenv.config();

export const createUserService = (newUser) => {
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
      const checkUser = await User.findOne({
        email: email,
      });
      if (checkUser !== null) {
        resolve({
          status: "ERR",
          message: "The email is already exists!",
        });
      }
      const hash = bcrypt.hashSync(password, 10);
      const createdUser = await User.create({
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
          const a = await DoctorInfor.create({
            doctorId: createdUser.userId
          })
          console.log(a)
        }
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: createdUser,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

export const loginUserService = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { email, password } = userLogin;
    try {
      const checkUser = await User.findOne({
        email: email,
      });
      if (checkUser === null) {
        resolve({
          status: "ERR",
          message: "The email is not defined",
        });
      } else {
        if (!checkUser.isVerified) {
          resolve({
            status: "ERR",
            message: "The email is not verified",
          });
        }
      }
      const comparePassword = bcrypt.compareSync(password, checkUser.password);

      if (!comparePassword) {
        resolve({
          status: "ERR",
          message: "The user or password is incorrect",
        });
      }

      const access_token = await generalAccessToken({
        userId: checkUser.userId,
        roleId: checkUser.roleId,
      });

      const refresh_token = await generalRefreshToken({
        userId: checkUser.userId,
        roleId: checkUser.roleId,
      });

      resolve({
        status: "OK",
        message: "SUCCESS",
        access_token,
        refresh_token,
      });
    } catch (e) {
      reject(e);
    }
  });
};

export const resetUserPasswordService = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkEmail = await User.findOne({
        email: email,
      });
      if (checkEmail === null) {
        resolve({
          status: "ERR",
          message: "The email is not defined",
        });
      }

      // Create reset password token
      const token = await generalResetPasswordToken(email);
      // Create reset password link
      const resetLink = `${process.env.WEB_LINK}/reset-password/${token}`;
      // Create text
      const text = `Click the link to reset your password: ${resetLink}`;
      const subject = "Reset password";
      sendMail(email, text, subject);

      resolve({
        status: "OK",
        message: "Password reset link has been sent to your email",
      });
    } catch (e) {
      reject(e);
    }
  });
};

export const updateUserService = (id, data) => {
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
      const checkUser = await User.findOne({
        userId: id,
      });
      if (checkUser === null) {
        resolve({
          status: "ERR",
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

      const updatedUser = await User.findOneAndUpdate(
        { userId: id }, // Điều kiện tìm kiếm
        updateData, // Giá trị cần cập nhật
        { new: true }
      );
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: updatedUser,
      });
    } catch (e) {
      reject(e);
    }
  });
};

export const deleteUserService = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({
        userId: id,
      });
      if (checkUser === null) {
        resolve({
          status: "ERR",
          message: "The user is not defined",
        });
      }

      await User.findOneAndDelete({ userId: id });
      await DoctorInfor.findOneAndDelete({doctorId: id})
      resolve({
        status: "OK",
        message: "Delete user success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

export const getAllUserService = (query, skip, limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let formatQuery = {}
      // Sử dụng biểu thức chính quy để tìm kiếm không chính xác
      if (query.query) {
        formatQuery = {
          $or: [
            { fullname: { $regex: query.query, $options: 'i' } }, // Tìm trong trường 'name'
            { address: { $regex: query.query, $options: 'i' } }, // Tìm trong trường 'address'
          ],
        };
      }
      const allUsers = await User.find(formatQuery).skip(skip).limit(limit);
      const totalUsers = await User.countDocuments(formatQuery)
      const totalPages = Math.ceil(totalUsers / limit);
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: allUsers,
        totalPages
      });
    } catch (e) {
      reject(e);
    }
  });
};

export const getDetailsUserService = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({
        userId: id,
      }).lean();
      if (user === null) {
        resolve({
          status: "ERR",
          message: "The user is not defined",
        });
      }
      let formatUser = {
        ...user
      }
      if (user.birthDate) {
        const birthDateOnly = user.birthDate.toISOString().split('T')[0];
        formatUser = {
          ...user,
          birthDate: birthDateOnly
        }
      }

      resolve({
        status: "OK",
        message: "Success",
        data: formatUser,
      });
    } catch (e) {
      reject(e);
    }
  });
};

export const getUserByNameOrEmailService = (keyword) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.find({
        $or: [
          { fullname: { $regex: keyword, $options: "i" } }, // Tìm kiếm không phân biệt hoa thường
          { email: { $regex: keyword, $options: "i" } }, // Tìm kiếm không phân biệt hoa thường
        ],
      });
      resolve({
        status: "OK",
        message: "Success",
        data: user,
      });
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
};

export const updatePassword = async (userId, oldPassword, newPassword, confirmPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm người dùng theo userId
      const user = await User.findOne({ userId: userId });
      if (!user) {
        return resolve({
          status: "ERR",
          message: "User not found",
        });
      }

      // Kiểm tra mật khẩu cũ
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return resolve({
          status: "ERR",
          message: "Mật khẩu cũ không đúng",
        });
      }

      // Kiểm tra mật khẩu mới và xác nhận mật khẩu mới
      if (newPassword !== confirmPassword) {
        return resolve({
          status: "ERR",
          message: "New password and confirm password do not match",
        });
      }

      // Mã hóa mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Cập nhật mật khẩu mới
      user.password = hashedPassword;
      await user.save();

      resolve({
        status: "OK",
        message: "Password updated successfully",
      });
    } catch (e) {
      reject({
        status: "ERR",
        message: "Error from server",
        error: e.message,
      });
    }
  });
};

export const getDropdownUsersService = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const dropdowUsers = await User.find()

      resolve({
        errCode: 0,
        message: "Get dropdown user successfully",
        data: dropdowUsers
      })
    } catch (e) {
      reject(e)
    }
  })
}