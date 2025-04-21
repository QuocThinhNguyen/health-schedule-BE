import chatMessage from "../models/chat_message.js";
import chatRoom from "../models/chat_room.js";

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    console.log("New client connected:", socket.handshake.auth.userId);
    const userId = socket.handshake.auth.userId;
    console.log("User connected:", userId);

    socket.on("join_room", (chatRoomId) => {
      console.log("User joined room:", chatRoomId);
      socket.join(chatRoomId);
    });

    socket.on("client_send_message", async ({ chatRoomId, content, type }) => {
      console.log("Message received:", {
        chatRoomId,
        content,
        type,
      });

      const newMsg = await chatMessage.create({
        chatRoomId,
        senderId: userId,
        content,
        type,
      });

      await chatRoom.update

      io.to(chatRoomId).emit("server_send_message", newMsg);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
