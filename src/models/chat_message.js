import mongoose from "mongoose";
import pkg from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";

const AutoIncrement = pkg(mongoose);
const { Schema } = mongoose;

const chatMessageSchema = new Schema(
  {
    chatMessageId: {
      type: Number,
      // required: true,
      unique: true,
    },
    chatRoomId: {
      type: Number,
      ref: "ChatRoom",
      required: true,
    },
    senderId: {
      type: Number,
      ref: "Users",
    },
    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "file"],
      default: "text",
    },
    content: {
      type: String,
    },
    file: {
      type: Number,
      ref: "File",
    },
    replyTo: {
      type: Number,
      ref: "ChatMessage",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  { timestamps: true }
);

chatMessageSchema.plugin(AutoIncrement, {
  inc_field: "chatMessageId",
  start_seq: 1,
});
chatMessageSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
});
const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;
