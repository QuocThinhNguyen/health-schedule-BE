import chatMessageService from "../services/ChatMessageService.js";

const getMessageByChatRoomId = async (req, res) => {
  try {
    const chatRoomId = parseInt(req.params.id);
    const lastMessageTime = req.query.lastMessageTime;
    if (!chatRoomId) {
      return res.status(400).json({
        status: 400,
        message: "Missing chatRoomId",
      });
    }
    const result = await chatMessageService.getMessageByChatRoomId(
      chatRoomId,
      lastMessageTime
    );
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

export default {
  getMessageByChatRoomId,
};
