import axios from "axios";
import chatbotMessage from "../models/chatbot_message.js";

const OPENROUTER_API_KEY=process.env.OPENROUTER_API_KEY

// const chatWithGemini = async (message, imageUrl) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const prompt = `
//                 Bạn là một trợ lý y tế ảo của EasyMed. Hãy trả lời câu hỏi dựa trên kiến thức y khoa chính xác, dễ hiểu.
//                 Không đưa ra chẩn đoán mà chỉ hướng dẫn người dùng đến bác sĩ chuyên khoa phù hợp.
//                 Nếu câu hỏi liên quan đến bác sĩ, hãy lấy dữ liệu từ danh sách bác sĩ của hệ thống.
//                 Nếu câu hỏi liên quan đến đặt lịch, hãy hướng dẫn người dùng cách đặt lịch khám trên EasyMed.

//                 Câu hỏi: ${message}
//                 Trả lời:
//             `;

//             const messages = [
//                 {
//                     role: "user",
//                     content: [{ type: "text", text: prompt }]
//                 }
//             ];

//             // Nếu có imageUrl, thêm vào content
//             if (imageUrl) {
//                 messages[0].content.push({
//                     type: "image_url",
//                     image_url: { url: imageUrl }
//                 });
//             }

//             const response = await axios.post(
//                 "https://openrouter.ai/api/v1/chat/completions",
//                 { model: "google/gemini-2.0-pro-exp-02-05:free", messages },
//                 {
//                     headers: {
//                         "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
//                         "Content-Type": "application/json"
//                     }
//                 }
//             );

//             resolve({
//                 status: 200,
//                 message: "Chatbot phản hồi thành công",
//                 data: response.data.choices[0].message.content
//             });
//         } catch (error) {
//             console.error("Lỗi khi gọi API Gemini:", error.response ? error.response.data : error.message);
//             reject(error);
//         }
//     });
// };

const convertMessagesToOpenRouter = (messages) => {
    return messages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: [{ type: "text", text: msg.text }]
    }));
};

const PROMPT = `
Bạn là chatbot tư vấn y tế của hệ thống đặt lịch khám bệnh EasyMed. 
Vai trò của bạn:
- Cung cấp thông tin về các bệnh thường gặp và cách phòng tránh.
- Khuyến nghị người dùng đến bệnh viện nếu có triệu chứng nghiêm trọng.
- KHÔNG chẩn đoán bệnh, kê đơn thuốc hay thay thế bác sĩ.
- KHÔNG trả lời các câu hỏi ngoài lĩnh vực y tế.

Nếu câu hỏi liên quan đến bác sĩ hoặc bệnh viện, hãy phản hồi bằng:
"Bạn có thể xem danh sách bác sĩ và bệnh viện trên hệ thống EasyMed." 
(Tôi sẽ lấy dữ liệu từ hệ thống và cung cấp cho người dùng).

Nếu câu hỏi thuộc lĩnh vực y tế, hãy giải thích một cách dễ hiểu nhưng KHÔNG đưa ra lời khuyên y tế chính thức.
`;

const checkHospitalOrDoctorQuery = async (message) => {
    const keywords = ["bác sĩ", "bệnh viện", "khám bệnh", "giờ làm việc", "chuyên khoa", "đặt lịch"];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
};

const getHospitalOrDoctorInfo = async (message) => {
    if (message.toLowerCase().includes("bác sĩ")) {
        const doctors = await DoctorModel.find().limit(5);
        return doctors.map(doc => `👨‍⚕️ Bác sĩ ${doc.name}, chuyên khoa: ${doc.specialty}, làm việc tại: ${doc.hospital}`).join("\n");
    }

    if (message.toLowerCase().includes("bệnh viện")) {
        const hospitals = await HospitalModel.find().limit(5);
        return hospitals.map(hosp => `🏥 Bệnh viện ${hosp.name}, địa chỉ: ${hosp.address}`).join("\n");
    }

    return "Xin lỗi, tôi không tìm thấy thông tin phù hợp.";
};


const chatWithGemini = async (userId, message, imageUrl, sessionId) => {
    try {

        // const isHospitalOrDoctorQuery = await checkHospitalOrDoctorQuery(message);

        // if (isHospitalOrDoctorQuery) {
        //     // Nếu đúng, lấy dữ liệu từ MongoDB
        //     const result = await getHospitalOrDoctorInfo(message);
        //     return { status: 200, message: "Trả lời từ MongoDB", data: result };
        // }

        const previousMessages = await chatbotMessage.findOne({ userId, sessionId });
        let messages = previousMessages?.messages || [];

        // console.log("previousMessages", previousMessages);
        // console.log("messages trước khi chuyển đổi:", messages);

        // Chuyển đổi tin nhắn lịch sử sang định dạng OpenRouter
        const openRouterMessages = convertMessagesToOpenRouter(messages);

        openRouterMessages.unshift({
            role: "system",
            content: [{ type: "text", text: `Bạn là chatbot tư vấn y tế của EasyMed. ${PROMPT}` }]
        });

        // Thêm tin nhắn mới của người dùng
        openRouterMessages.push({
            role: "user",
            content: [{ type: "text", text: message }]
        });

        if (imageUrl) {
            openRouterMessages.push({ type: "image_url", image_url: { url: imageUrl } });
        }

        // console.log("messages gửi đến OpenRouter:", JSON.stringify(openRouterMessages, null, 2));

        // Gửi tin nhắn đến OpenRouter
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            { model: "google/gemini-2.0-pro-exp-02-05:free", messages: openRouterMessages },
            {
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // console.log("Phản hồi từ OpenRouter:", JSON.stringify(response.data, null, 2));

        // Lấy phản hồi từ chatbot
        const reply = response.data.choices[0].message.content || "Không có phản hồi.";

        return { status: 200, message: "Chatbot phản hồi thành công", data: reply };
    } catch (error) {
        console.error("Lỗi khi gọi API Gemini:", error.response?.data || error.message);
        return { status: 500, message: "Lỗi khi gọi API Gemini", error: error.response?.data || error.message };
    }
};

const saveChatbotMessage = (userId, messages,sessionId)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            const findChatbotMessage = await chatbotMessage.findOne({
                userId: userId,
                sessionId:sessionId
            })

            if(findChatbotMessage){
                // update messages 
                await chatbotMessage.findOneAndUpdate({
                    userId: userId,
                    sessionId:sessionId
                },{
                    messages:messages,
                    createdAt: new Date()
                })
            }else{
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
            }

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
            }).sort({createdAt:-1})
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