import express from "express";
import ChatBotController from "../controllers/ChatBotController.js";
import upload from "../utils/fileUpload.js";

const router = express.Router();

router.post("/:userId/:sessionId", upload.array("images"), ChatBotController.chatWithGemini);
router.put("/:userId", ChatBotController.saveChatbotMessage);
router.get("/:userId", ChatBotController.getHistoryChatbotMessage);
router.get("/detail/:chatbotMessageId", ChatBotController.getDetailChatbotMessage);

export default router;