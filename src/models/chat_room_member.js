import mongoose from "mongoose";
import pkg from "mongoose-sequence"; 
import mongoose_delete from "mongoose-delete";

const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const ChatRoomMemberSchema = new Schema(
  {
    chatRoomMemberId: {
      type: Number,
      unique: true,
    },
    chatRoomId: {
      type: Number,
      ref: "ChatRoom",
      required: true,
    },
    userId: {
      type: Number,
      ref: "Users",
      required: true,
    },
    role: {
      type: String,
      enum: ["leader", "member"],
      default: "member",
    },
  },
  { timestamps: true }
);

ChatRoomMemberSchema.plugin(AutoIncrement, { inc_field: "chatRoomMemberId", start_seq: 1 });
ChatRoomMemberSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const ChatRoomMember = mongoose.model("ChatRoomMember", ChatRoomMemberSchema);

export default ChatRoomMember;
