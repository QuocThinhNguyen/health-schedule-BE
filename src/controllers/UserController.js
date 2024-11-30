import {
  handleResetPasswordTokenService,
  refreshTokenJwtService,
  createAndSendOTPService,
  generalOTPToken,
  verifyUserService,
} from "../services/JwtService.js";
import {
  createUserService,
  loginUserService,
  updateUserService,
  deleteUserService,
  getAllUserService,
  getDetailsUserService,
  getUserByNameOrEmailService,
  resetUserPasswordService,
  updatePassword,
  getDropdownUsersService
} from "../services/UserService.js";

export const createUserController = async (req, res) => {
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
    console.log("req.body", req.body);

    console.log("req.file", req.file);

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
        status: "ERR",
        message: "The input is required",
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is not email",
      });
    }

    // Lấy đường dẫn ảnh từ `req.file`
    const image = req.file ? `${req.file.filename}` : null; // Đường dẫn ảnh

    const userData = {
      ...req.body,
      image,
    }

    const response = await createUserService(userData);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message,
    });
  }
};

export const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const isCheckEmail = reg.test(email);
    if (!email || !password) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is required",
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is not email",
      });
    }
    const response = await loginUserService(req.body);
    const { refresh_token, ...newResponse } = response;
    res.cookie("refresh_token", refresh_token, {
      HttpOnly: true,
      Secure: false,
      SameSite: "Strict",
    });
    return res.status(200).json(newResponse);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

export const logoutUserController = async (req, res) => {
  try {
    res.clearCookie("refresh_token");
    return res.status(200).json({
      status: "OK",
      message: "Logout successfully",
    });
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

export const resetUserPasswordController = async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(200).json({
        status: "ERR",
        message: "The email is required",
      });
    }
    const response = await resetUserPasswordService(email);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

export const handleResetPasswordTokenController = async (req, res) => {
  const token = req.params.token;
  try {
    // Verify the token
    const response = await handleResetPasswordTokenService(token);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

export const createAndSendOTPController = async (req, res) => {
  try {
    const otp_token = await generalOTPToken(req.body.email);
    const response = await createAndSendOTPService(req.body, otp_token);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

export const verifyUserController = async (req, res) => {
  const otp_token = req.params.token;
  const otpCode = req.body.otpCode;
  try {
    const response = await verifyUserService(otpCode, otp_token);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

export const updateUserController = async (req, res) => {
  try {
    const userId = req.params.id;
    // Lấy đường dẫn ảnh từ `req.file`
    const image = req.file ? `${req.file.filename}` : null; // Đường dẫn ảnh
    const data = {
      ...req.body,
    }

    if (image) {
      data.image = image;
  }
    console.log("req.body", req.body);

    console.log("req.file", req.file);
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The user is required",
      });
    }
    const response = await updateUserService(userId, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

export const deleteUserController = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The user is required",
      });
    }
    const response = await deleteUserService(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e.message,
    });
  }
};

export const getAllUserController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 6;
    if (limit > 20)
      limit = 20;

    const skip = (page - 1) * limit;

    const response = await getAllUserService(req.query, skip, limit);

    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

export const getDetailsUserController = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The user is required",
      });
    }
    const response = await getDetailsUserService(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;
    if (!token) {
      return res.status(200).json({
        status: "ERR",
        message: "The token is required",
      });
    }
    const response = await refreshTokenJwtService(token);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

export const getUserByNameOrEmailController = async (req, res) => {
  try {
    const keyword = req.query.keyword.replace(/\s+/g, " ").trim();
    console.log("keyword", keyword);

    if (!keyword) {
      return res.status(200).json({
        status: "ERR",
        message: "The keyword is required",
      });
    }
    const response = await getUserByNameOrEmailService(keyword);
    return res.status(200).json(response);
  } catch (e) {
    console.log("Error:", e);
    return res.status(404).json({
      message: e.message,
    });
  }
};

export const updatePasswordController = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword, confirmPassword } = req.body;

    const result = await updatePassword(userId, oldPassword, newPassword, confirmPassword);
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: "ERR",
      message: "Error from server",
    });
  }
};

export const getDropdownUsersController = async (req, res) => {
  try {
      const data = await getDropdownUsersService();
      return res.status(200).json(data)
  } catch (err) {
      console.log(err)
      return res.status(200).json({
          errCode: -1,
          errMessage: "Error from server"
      })
  }
}