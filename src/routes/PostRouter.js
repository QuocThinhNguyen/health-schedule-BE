import express from "express";
import postController from "../controllers/PostController.js";
import upload from "../utils/fileUpload.js";
import { authAdminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", postController.getAllPost);
router.get("/:id", postController.getPostById);
router.post(
  "/",
  authAdminMiddleware,
  upload.single("image"),
  postController.createPost
);
router.put(
  "/:id",
  authAdminMiddleware,
  upload.single("image"),
  postController.updatePost
);
router.delete("/:id", authAdminMiddleware, postController.deletePost);

export default router;
