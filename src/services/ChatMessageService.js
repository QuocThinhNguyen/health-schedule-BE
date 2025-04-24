import chatMessage from "../models/chat_message.js";

const getMessageByChatRoomId = (chatRoomId, lastMessageTime, limit = 20) => {
  return new Promise(async (resolve, reject) => {
    try {
      const condition = {
        chatRoomId,
        ...(lastMessageTime && {
          createdAt: { $lt: new Date(lastMessageTime) },
        }),
      };
      const listMessage = await chatMessage
        .find(condition)
        .sort({
          createdAt: -1,
        })
        .limit(limit);
      return resolve({
        status: 200,
        message: "Get message by room successfully",
        data: listMessage.reverse(),
      });
    } catch (e) {
      reject(e);
    }
  });
};

export default {
  getMessageByChatRoomId,
};
