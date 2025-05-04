import chatMessage from "../models/chat_message.js";
import ChatRoomMember from "../models/chat_room_member.js";

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      console.warn("User ID not provided in socket connection");
      return;
    }
    socket.join(`user_${userId}`);
    socket.on("join_room", (chatRoomId) => {
      console.log("User joined room:", chatRoomId);
      socket.join(chatRoomId);
    });
    socket.on("client_send_message", async ({ chatRoomId, content, type }) => {
      const newMsg = await chatMessage.create({
        chatRoomId,
        senderId: userId,
        content,
        type,
      });
      io.to(chatRoomId).emit("server_send_message", newMsg);
      // Gửi tới từng thành viên để cập nhật sidebar nếu họ không ở trong phòng chat
      const otherMembers = await ChatRoomMember.find({
        chatRoomId: chatRoomId,
      });
      const memberIds = otherMembers.map((member) => member.userId);
      memberIds.forEach((memberId) => {
        io.to(`user_${memberId}`).emit("server_sidebar_update", {
          chatRoomId,
          lastMessage: newMsg,
        });
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
