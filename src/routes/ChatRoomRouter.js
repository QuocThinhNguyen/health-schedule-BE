import express from "express";
import chatRoomController from "../controllers/ChatRoomController.js";
import {authMiddleware} from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/",authMiddleware, chatRoomController.getRecentChatsByUserId);
router.post("/",authMiddleware, chatRoomController.getOrCreateRoom);

export default router;
