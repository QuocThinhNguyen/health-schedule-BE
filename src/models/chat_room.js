import mongoose from "mongoose";
import pkg from "mongoose-sequence"; // Import AutoIncrement
const AutoIncrement = pkg(mongoose);

const { Schema } = mongoose;

const chatRoomSchema = new Schema(
  {
    chatRoomId: {
      type: Number,
      // required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

chatRoomSchema.plugin(AutoIncrement, { inc_field: "chatRoomId", start_seq: 1 });
const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

export default ChatRoom;
