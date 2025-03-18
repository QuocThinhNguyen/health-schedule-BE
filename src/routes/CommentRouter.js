import express from "express";
import commentController from "../controllers/CommentController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/", authMiddleware, commentController.addComment);
router.get("/:videoId", commentController.getTotalCommentByVideoId);
router.get("/all/:videoId", commentController.getAllCommentByVideoId);
router.post("/like/:userId/:commentId", authMiddleware, commentController.likeComment);
router.delete("/like/:userId/:commentId", authMiddleware, commentController.unLikeComment);
router.get("/check/:userId/:commentId", authMiddleware, commentController.checkUserLikeComment);
router.get("/total/:commentId", commentController.getTotalLikeCommentByCommentId);

export default router;