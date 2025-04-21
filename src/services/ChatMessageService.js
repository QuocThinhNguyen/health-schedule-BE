import chatMessage from "../models/chat_message.js";

const getMessageByChatRoomId = (chatRoomId) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("chatRoomId service ID:", chatRoomId);
      const listMessage = await chatMessage.find({ chatRoomId }).sort({
        createdAt: 1,
      });

      return resolve({
        status: 200,
        message: "Get message by room successfully",
        data: listMessage,
      });
    } catch (e) {
      reject(e);
    }
  });
};

export default {
  getMessageByChatRoomId,
};
