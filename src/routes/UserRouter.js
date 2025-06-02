import express from "express";
import userController from "../controllers/UserController.js";
import {
  authAdminMiddleware,
  authMiddleware,
} from "../middlewares/authMiddleware.js";
import { upload } from "../utils/uploadCloudinary.js";

const router = express.Router();


router.get("/suggestions",userController.getSuggest)
router.get("/statistics/:idUser",authMiddleware,userController.getPatientStatistics)
//CRUD user
router.get(
  "/dropdown",
  authAdminMiddleware,
  userController.getDropdownUsersController
); //Lấy dropdown user
router.get(
  "/search",
  authAdminMiddleware,
  userController.getUserByNameOrEmailController
); //Tìm kiếm user theo tên, email
router.get("/", authMiddleware, userController.getAllUserController); //Lấy tất cả user
router.get("/:id", authMiddleware, userController.getDetailsUserController); //Lấy thông tin một user
router.get("/:userId/clinic", userController.getClinicIdByUserId)
router.post(
  "/",
  authAdminMiddleware,
  upload.single("image"),
  userController.createUserController
); //Thêm user
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  userController.updateUserController
); //Cập nhật user
router.delete("/:id", authAdminMiddleware, userController.deleteUserController); //Xóa user
router.post(
  "/update-password",
  authMiddleware,
  userController.updatePasswordController
); // Định nghĩa tuyến đường để cập nhật mật khẩu




export default router;
