import axios from "axios";
import chatbotMessage from "../models/chatbot_message.js";

const OPENROUTER_API_KEY=process.env.OPENROUTER_API_KEY

const chatWithGemini = async (message, imageUrl) => {
    return new Promise(async (resolve, reject) => {
        try {
            const prompt = `
                Bạn là một trợ lý y tế ảo của EasyMed. Hãy trả lời câu hỏi dựa trên kiến thức y khoa chính xác, dễ hiểu.
                Không đưa ra chẩn đoán mà chỉ hướng dẫn người dùng đến bác sĩ chuyên khoa phù hợp.
                Nếu câu hỏi liên quan đến bác sĩ, hãy lấy dữ liệu từ danh sách bác sĩ của hệ thống.
                Nếu câu hỏi liên quan đến đặt lịch, hãy hướng dẫn người dùng cách đặt lịch khám trên EasyMed.

                Câu hỏi: ${message}
                Trả lời:
            `;

            const messages = [
                {
                    role: "user",
                    content: [{ type: "text", text: prompt }]
                }
            ];

            // Nếu có imageUrl, thêm vào content
            if (imageUrl) {
                messages[0].content.push({
                    type: "image_url",
                    image_url: { url: imageUrl }
                });
            }

            const response = await axios.post(
                "https://openrouter.ai/api/v1/chat/completions",
                { model: "google/gemini-2.0-pro-exp-02-05:free", messages },
                {
                    headers: {
                        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            resolve({
                status: 200,
                message: "Chatbot phản hồi thành công",
                data: response.data.choices[0].message.content
            });
        } catch (error) {
            console.error("Lỗi khi gọi API Gemini:", error.response ? error.response.data : error.message);
            reject(error);
        }
    });
};

const saveChatbotMessage = (userId, messages,sessionId)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            await chatbotMessage.deleteMany({
                userId,
                sessionId
            })
            await chatbotMessage.create({
                userId: userId,
                messages:messages,
                sessionId:sessionId,
                createdAt: new Date()
            })
            console.log("2")
            resolve({
                status:200,
                message:"Lưu tin nhắn thành công",
            })
        }catch(e){
            reject(e)
        }
    })
}

const getHistoryChatbotMessage = (userId)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            const messages = await chatbotMessage.find({
                userId
            })
            resolve({
                status:200,
                data:messages
            })
        }catch(e){
            reject(e)
        }
    })
}

const getDetailChatbotMessage = (chatbotMessageId)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            const messages = await chatbotMessage.findOne({
                chatbotMessageId:chatbotMessageId
            })
            resolve({
                status:200,
                data:messages
            })
        }catch(e){
            reject(e)
        }
    })
}

export default {
    chatWithGemini,
    saveChatbotMessage,
    getHistoryChatbotMessage,
    getDetailChatbotMessage
}