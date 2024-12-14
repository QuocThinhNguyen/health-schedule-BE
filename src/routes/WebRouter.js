import express from "express";
import userController from "../controllers/UserController.js";

const router = express.Router();

router.post("/sign-up", userController.createAndSendOTPController);
router.post("/verify-account/:token", userController.verifyUserController);
router.post("/sign-in", userController.loginUserController);
router.post("/logout", userController.logoutUserController);
router.post("/reset-password", userController.resetUserPasswordController);
router.get(
  "/reset-password/:token",
  userController.handleResetPasswordTokenController
);
router.post("/refresh_token", userController.refreshToken);
router.post("/google-login", userController.googleLogin);

export default router;
