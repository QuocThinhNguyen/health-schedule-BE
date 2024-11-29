import express from "express";
import {
    createUserController,
    loginUserController,
    updateUserController,
    deleteUserController,
    getAllUserController,
    getDetailsUserController,
    refreshToken,
    logoutUserController,
    resetUserPasswordController,
    handleResetPasswordTokenController,
    verifyUserController,
    createAndSendOTPController,
    getUserByNameOrEmailController,
} from "../controllers/UserController.js";
import {
    authAdminMiddleware,
    authUserMiddleware,
} from "../middlewares/authMiddleware.js";
import upload from "../utils/fileUpload.js";

const router = express.Router();

router.post("/sign-up", createAndSendOTPController);
router.post("/verify-account/:token", verifyUserController);
router.post("/sign-in", loginUserController);
router.post("/logout", logoutUserController);
router.post("/reset-password", resetUserPasswordController);
router.get("/reset-password/:token", handleResetPasswordTokenController);
router.post("/refresh_token", refreshToken);

export default router;