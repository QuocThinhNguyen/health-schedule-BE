import chatRoom from "../models/chat_room.js";
import chatRoomMember from "../models/chat_room_member.js";
import chatMessage from "../models/chat_message.js";
import user from "../models/users.js";

const getRecentChatsByUserId = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userRooms = await chatRoomMember.find({ userId: userId });
      console.log("userRooms", userRooms);
      
      const chatRoomIds = userRooms.map((room) => room.chatRoomId);

      const otherMembers = await chatRoomMember.find({
        chatRoomId: { $in: chatRoomIds },
        userId: { $ne: userId },
      });

      const uniquePartnerIds = [
        ...new Set(otherMembers.map((otherMenber) => otherMenber.userId)),
      ];
      const infoPartners = await user.find({
        userId: { $in: uniquePartnerIds },
      });
      console.log("infoPartners", infoPartners);
      console.log("chatRoomIds", chatRoomIds);
      

      const latestMessages = await Promise.all(
        chatRoomIds.map(async (chatRoomId) => {
          const latestMessage = await chatMessage
            .findOne({ chatRoomId })
            .sort({ createdAt: -1 })
            .limit(1);
          return { chatRoomId, latestMessage };
        })
      );
      console.log("latestMessages", latestMessages);
      

      const recentChats = chatRoomIds.map((chatRoomId) => {
        const partner = infoPartners.find((p) =>
          otherMembers.some(
            (m) => m.chatRoomId === chatRoomId && m.userId === p.userId
          )
        );
        const latestMessage = latestMessages.find(
          (m) => m.chatRoomId === chatRoomId
        )?.latestMessage;
        return {
          chatRoomId,
          partner: partner,
          latestMessage: latestMessage,
        };
      });

      return resolve({
        status: 200,
        message: "Get recent chats by userId successfully",
        data: recentChats,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getOrCreateRoom = (userId, partnerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (userId === partnerId) {
        const selfRoom = await chatRoomMember.aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: "$chatRoomId",
              count: { $sum: 1 },
            },
          },
          { $match: { count: 1 } },
        ]);

        if (selfRoom.length > 0) {
          const room = await chatRoom.findOne({ chatRoomId: selfRoom[0]._id });
          return resolve({
            status: 200,
            message: "Phòng tự trò chuyện đã tồn tại",
            data: room,
          });
        }

        const newRoom = await chatRoom.create({});
        await chatRoomMember.create({ chatRoomId: newRoom.chatRoomId, userId });

        return resolve({
          status: 200,
          message: "Tạo phòng tự trò chuyện thành công",
          data: newRoom,
        });
      }

      const userRooms = await chatRoomMember.find({ userId });
      const userRoomIds = userRooms.map((r) => r.chatRoomId);

      const commonRoom = await chatRoomMember.findOne({
        chatRoomId: { $in: userRoomIds },
        userId: partnerId,
      });

      if (commonRoom) {
        const existingRoom = await chatRoom.findOne({
          chatRoomId: commonRoom.chatRoomId,
        });
        return resolve({
          status: 200,
          message: "Phòng đã tồn tại",
          data: existingRoom,
        });
      }

      // Không có phòng chung, tạo mới
      const newRoom = await chatRoom.create({});
      await chatRoomMember.create([
        { chatRoomId: newRoom.chatRoomId, userId },
        { chatRoomId: newRoom.chatRoomId, userId: partnerId },
      ]);

      return resolve({
        status: 200,
        message: "Tạo phòng mới thành công",
        data: newRoom,
      });
    } catch (e) {
      reject(e);
    }
  });
};

export default {
  getRecentChatsByUserId,
  getOrCreateRoom,
};
