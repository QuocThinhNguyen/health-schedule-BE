import express from "express";
import commentController from "../controllers/CommentController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/", authMiddleware, commentController.addComment);
router.get("/:videoId", commentController.getTotalCommentByVideoId);
router.get("/all/:videoId", commentController.getAllCommentByVideoId);

export default router;