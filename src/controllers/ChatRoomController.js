import ChatRoomService from "../services/ChatRoomService.js";

const getRecentChatsByUserId = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("User ID:", userId);

    if (!userId) {
      return res.status(400).json({
        status: 400,
        message: "Missing userId",
      });
    }
    const listRecentChats = await ChatRoomService.getRecentChatsByUserId(
      userId
    );
    return res.status(200).json(listRecentChats);
  } catch (err) {
    console.log("Error:", err);
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getOrCreateRoom = async (req, res) => {
  try {
    const userId = parseInt(req.body.userId);
    const partnerId = parseInt(req.body.partnerId);
    console.log("User ID:", userId);
    console.log("Partner ID:", partnerId);

    if (!userId || !partnerId) {
      return res.status(400).json({
        status: 400,
        message: "Missing userId or partnerId",
      });
    }
    const result = await ChatRoomService.getOrCreateRoom(userId, partnerId);
    console.log("Result:", result);
    return res.status(200).json(result);
  } catch (err) {
    console.log("Error:", err);

    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

export default {
  getRecentChatsByUserId,
  getOrCreateRoom,
};
