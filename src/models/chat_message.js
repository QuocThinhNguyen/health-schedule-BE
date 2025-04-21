import mongoose from "mongoose";
import pkg from "mongoose-sequence"; // Import AutoIncrement
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
      required: true,
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
const ChatMessage = mongoose.model(
  "ChatMessage",
  chatMessageSchema
);

export default ChatMessage;
