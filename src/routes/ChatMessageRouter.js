import express from "express";
import chatMessageController from "../controllers/ChatMessageController.js";

const router = express.Router();

router.get("/:id", chatMessageController.getMessageByChatRoomId);

export default router;
