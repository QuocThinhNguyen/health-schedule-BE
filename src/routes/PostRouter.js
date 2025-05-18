import express from "express";
import postController from "../controllers/PostController.js";
import { authAdminMiddleware, authClinicMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../utils/uploadCloudinary.js";
const router = express.Router();

router.get("/", postController.getAllPost);
router.get("/:clinicId/clinic-posts", postController.getPostInClinic);
router.get("/:id", postController.getPostById);
router.post(
  "/",
  authClinicMiddleware,
  upload.single("image"),
  postController.createPost
);
router.put(
  "/:id",
  authClinicMiddleware,
  upload.single("image"),
  postController.updatePost
);
router.delete("/:id", authClinicMiddleware, postController.deletePost);

export default router;
