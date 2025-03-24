import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const { Schema } = mongoose;

const chatbotMessageSchema = new Schema({
    chatbotMessageId:{
        type: Number,
        unique: true,
    },
    userId:{
        type: Number,
        ref: "Users",
        required: true,
    },
    messages: [
        {
            sender: { type: String, enum: ['user', 'bot'], required: true },
            text: { type: String, required: true },
            time: { type: String, required: true }
        }
    ],
    sessionId:{
        type: String,
        required: true,
    },
    createdAt:{
        type: Date,
        required: true,
    }
})

chatbotMessageSchema.plugin(AutoIncrement, { inc_field: "chatbotMessageId", start_seq: 1 });
const ChatbotMessage = mongoose.model("ChatbotMessage", chatbotMessageSchema);
export default ChatbotMessage;