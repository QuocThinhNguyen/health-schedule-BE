import jwtService from "../services/JwtService.js";
import userService from "../services/UserService.js";
import user from "../models/users.js";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";

const clinet_id = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clinet_id);
const createUserController = async (req, res) => {
  try {
    const {
      email,
      password,
      fullname,
      gender,
      birthDate,
      address,
      phoneNumber,
      roleId,
    } = req.body;
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const isCheckEmail = reg.test(email);
    if (
      !email ||
      !password ||
      !fullname ||
      !gender ||
      !birthDate ||
      !address ||
      !phoneNumber ||
      !roleId
    ) {
      return res.status(200).json({
        status: 404,
        message: "The input is required",
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: 404,
        message: "The input is not email",
      });
    }
    const image = req.file
      ? req.file.path
      : "https://res.cloudinary.com/dv9yzzjgg/image/upload/v1745633104/user_default_zzwsco.png";

    const userData = {
      ...req.body,
      image,
    };

    const response = await userService.createUserService(userData);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      status: 500,
      message: e.message,
    });
  }
};

const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const isCheckEmail = reg.test(email);
    if (!email || !password) {
      return res.status(200).json({
        status: 404,
        message: "The input is required",
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: 404,
        message: "The input is not email",
      });
    }
    const response = await userService.loginUserService(req.body);
    const { refresh_token, ...newResponse } = response;
    res.cookie("refresh_token", refresh_token, {
      HttpOnly: true,
      Secure: false,
      SameSite: "Strict",
    });
    return res.status(200).json(newResponse);
  } catch (e) {
    return res.status(404).json({
      status: 500,
      message: e.message,
    });
  }
};

const logoutUserController = async (req, res) => {
  try {
    res.clearCookie("refresh_token");
    return res.status(200).json({
      status: 200,
      message: "Logout successfully",
    });
  } catch (e) {
    return res.status(404).json({
      status: 500,
      message: e.message,
    });
  }
};

const resetUserPasswordController = async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(200).json({
        status: 404,
        message: "The email is required",
      });
    }
    const response = await userService.resetUserPasswordService(email);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      status: 500,
      message: e.message,
    });
  }
};

const handleResetPasswordTokenController = async (req, res) => {
  const token = req.params.token;
  try {
    // Verify the token
    const response = await jwtService.handleResetPasswordTokenService(token);
    // return res.status(200).json(response);
    return res.redirect(`${process.env.URL_REACT}/login`);
  } catch (e) {
    return res.status(404).json({
      status: 500,
      message: e.message,
    });
  }
};

const createAndSendOTPController = async (req, res) => {
  try {
    const otp_token = await jwtService.generalOTPToken(req.body.email);
    const response = await jwtService.createAndSendOTPService(
      req.body,
      otp_token
    );
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: e.message,
    });
  }
};

const verifyUserController = async (req, res) => {
  const otp_token = req.params.token;
  const otpCode = req.body.otpCode;
  try {
    const response = await jwtService.verifyUserService(otpCode, otp_token);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      status: 500,
      message: e.message,
    });
  }
};

const updateUserController = async (req, res) => {
  try {
    const userId = req.params.id;
    const image = req.file ? req.file.path : null;
    const data = {
      ...req.body,
    };

    if (image) {
      data.image = image;
    }
    if (!userId) {
      return res.status(200).json({
        status: 404,
        message: "The user is required",
      });
    }
    const response = await userService.updateUserService(userId, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      status: 500,
      message: e.message,
    });
  }
};

const deleteUserController = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(200).json({
        status: 404,
        message: "The user is required",
      });
    }
    const response = await userService.deleteUserService(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      status: 500,
      message: e.message,
    });
  }
};

const getAllUserController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 6;
    if (limit > 20) limit = 20;

    const skip = (page - 1) * limit;

    const response = await userService.getAllUserService(
      req.query,
      skip,
      limit
    );

    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      status: 500,
      message: e.message,
    });
  }
};

const getDetailsUserController = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(200).json({
        status: 404,
        message: "The user is required",
      });
    }
    const response = await userService.getDetailsUserService(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      status: 500,
      message: e.message,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;
    if (!token) {
      return res.status(200).json({
        status: 404,
        message: "The token is required",
      });
    }
    const response = await jwtService.refreshTokenJwtService(token);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      status: 500,
      message: e.message,
    });
  }
};

const getUserByNameOrEmailController = async (req, res) => {
  try {
    const keyword = req.query.keyword.replace(/\s+/g, " ").trim();

    if (!keyword) {
      return res.status(200).json({
        status: 404,
        message: "The keyword is required",
      });
    }
    const response = await userService.getUserByNameOrEmailService(keyword);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      status: 500,
      message: e.message,
    });
  }
};

const updatePasswordController = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword, confirmPassword } = req.body;

    const result = await userService.updatePassword(
      userId,
      oldPassword,
      newPassword,
      confirmPassword
    );
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getDropdownUsersController = async (req, res) => {
  try {
    const data = await userService.getDropdownUsersService();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(200).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const verifyToken = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: clinet_id,
  });
  const payload = ticket.getPayload();
  return payload;
};

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const payload = await verifyToken(token);
    const { email, name, picture } = payload;

    let account = await user.findOne({
      email: email,
    });

    if (!account) {
      account = await user.create({
        fullname: name,
        email: email,
        roleId: "R3",
        isVerified: true,
      });
    }
    const access_token = await jwtService.generalAccessToken({
      userId: account.userId,
      roleId: account.roleId,
    });

    const refresh_token = await jwtService.generalRefreshToken({
      userId: account.userId,
      roleId: account.roleId,
    });

    res.cookie("refresh_token", refresh_token, {
      HttpOnly: true,
      Secure: false,
      SameSite: "Strict",
    });

    return res.status(200).json({
      status: 200,
      message: "Login successfully",
      data: account,
      access_token: access_token,
    });
  } catch (e) {
    return res.status(404).json({
      status: 500,
      message: e.message,
    });
  }
};

const facebookLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(404).json({
        status: 404,
        message: "The token is required",
      });
    }

    let response = await axios.get(
      `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email`
    );
    const { id, email, name } = response.data;
    if (!id) {
      return res.status(400).json({
        status: 400,
        message: "Đăng nhập thất bại",
      });
    }

    let account = await user.findOne({
      email: email,
    });

    if (!account) {
      account = await user.create({
        fullname: name,
        email: email,
        roleId: "R3",
        isVerified: true,
      });
    }
    const access_token = await jwtService.generalAccessToken({
      userId: account.userId,
      roleId: account.roleId,
    });

    const refresh_token = await jwtService.generalRefreshToken({
      userId: account.userId,
      roleId: account.roleId,
    });

    res.cookie("refresh_token", refresh_token, {
      HttpOnly: true,
      Secure: false,
      SameSite: "Strict",
    });

    return res.status(200).json({
      status: 200,
      message: "Login successfully",
      data: account,
      access_token: access_token,
    });
  } catch (e) {
    return res.status(404).json({
      status: 500,
      message: e.message,
    });
  }
};

const getPatientStatistics = async (req, res) => {
  try {
    const idUser = req.params.idUser;
    const data = await userService.getPatientStatistics(idUser);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(404).json({
      status: 500,
      message: e.message,
    });
  }
};

const getSuggest = async (req, res) => {
  try {
    const limit = req.query.limit;
    const data = await userService.getSuggestService(limit);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(404).json({
      status: 500,
      message: e.message,
    });
  }
};

export default {
  createUserController,
  loginUserController,
  logoutUserController,
  resetUserPasswordController,
  handleResetPasswordTokenController,
  createAndSendOTPController,
  verifyUserController,
  updateUserController,
  deleteUserController,
  getAllUserController,
  getDetailsUserController,
  refreshToken,
  getUserByNameOrEmailController,
  updatePasswordController,
  getDropdownUsersController,
  googleLogin,
  facebookLogin,
  getPatientStatistics,
  getSuggest,
};
