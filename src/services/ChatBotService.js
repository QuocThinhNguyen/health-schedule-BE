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

const getAvailableTimeSlots = (timeTypes, currentNumbers) => {
    const timeSlots = [
        { label: "8:00 - 9:00", value: "T1" },
        { label: "9:00 - 10:00", value: "T2" },
        { label: "10:00 - 11:00", value: "T3" },
        { label: "11:00 - 12:00", value: "T4" },
        { label: "13:00 - 14:00", value: "T5" },
        { label: "14:00 - 15:00", value: "T6" },
        { label: "15:00 - 16:00", value: "T7" },
        { label: "16:00 - 17:00", value: "T8" },
    ];

    return timeTypes
        .map((time, index) => ({
            label: timeSlots.find(slot => slot.value === time)?.label,
            value: time,
            booked: currentNumbers[index],
        }))
        .filter(slot => slot.booked < 3) // Chỉ giữ lại khung giờ có số lượt đặt < 3
        .map(slot => `- ${slot.label}`)
        .join("\n");
};

const userContext = new Map();

const convertMessagesToOpenRouter = (messages) => {
    return messages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: [{ type: "text", text: msg.text }]
    }));
};

const PROMPT = `
Bạn là chatbot tư vấn y tế của hệ thống đặt lịch khám bệnh EasyMed.

Vai trò của bạn:
- Cung cấp thông tin tham khảo về các bệnh thường gặp và cách phòng tránh dựa trên nguồn y khoa uy tín.
- Hướng dẫn người dùng cách đặt lịch khám bệnh trên hệ thống EasyMed.
- Gợi ý bác sĩ và bệnh viện phù hợp theo nhu cầu của người dùng.
- Khuyến nghị người dùng đến bệnh viện nếu có triệu chứng nghiêm trọng.
- **KHÔNG** chẩn đoán bệnh, kê đơn thuốc hay thay thế bác sĩ.
- **KHÔNG** trả lời các câu hỏi ngoài lĩnh vực y tế.

Khi cung cấp thông tin về bác sĩ và bệnh viện:
- Kiểm tra dữ liệu trong *Dữ liệu liên quan* để cung cấp câu trả lời chi tiết.
- Nếu tìm thấy thông tin, hiển thị thông tin bác sĩ/bệnh viện một cách ngắn gọn, dễ hiểu.
- Nếu không tìm thấy, phản hồi bằng: "Bạn có thể xem danh sách bác sĩ và bệnh viện trên hệ thống EasyMed hoặc nhập từ khóa (tên bác sĩ, chuyên khoa, khu vực) để tôi giúp bạn tìm kiếm dễ dàng hơn!"

Khi cung cấp thông tin về bệnh lý:
- Nếu người dùng hỏi về triệu chứng hoặc bệnh thường gặp, hãy giải thích một cách dễ hiểu dựa trên nguồn y khoa uy tín.
- **KHÔNG** chẩn đoán bệnh hay đưa ra lời khuyên y tế chính thức.
- Nếu triệu chứng có dấu hiệu nghiêm trọng, khuyến nghị người dùng đến bệnh viện.

Khi hướng dẫn đặt lịch khám:
Nếu câu hỏi liên quan đến đặt lịch khám, hãy hướng dẫn người dùng theo các bước sau:

Bước 1: Truy cập hệ thống EasyMed và tìm kiếm bác sĩ, chuyên khoa hoặc dịch vụ y tế bạn cần.

Bước 2: Ở mục *Tư vấn trực tiếp*, chọn ngày và khung giờ theo nhu cầu.

Bước 3: Chọn *người sử dụng dịch vụ*. Nếu chưa có hồ sơ bệnh nhân, bạn có thể tạo mới bằng cách nhấn *Thêm hồ sơ bệnh nhân*.

Bước 4: Nhập lý do khám bệnh hoặc mô tả chi tiết. Bạn cũng có thể gửi ảnh hoặc video về tình trạng sức khỏe tại mục *tệp đính kèm*.

Bước 5: Chọn phương thức thanh toán phù hợp:
- Nếu chọn *Thanh toán online*, hệ thống sẽ tự động xác nhận đặt lịch sau khi thanh toán thành công.
- Nếu chọn *Thanh toán trực tiếp*, bạn sẽ nhận được một email xác nhận đặt lịch. *Vui lòng mở email và click vào "Xác nhận" để hoàn thành đặt khám*.

Bước 6: Kiểm tra lại thông tin và xác nhận đặt lịch.

Sau khi đặt lịch thành công, bạn sẽ nhận được thông báo xác nhận.

Bạn đang gặp khó khăn ở bước nào? Tôi có thể hướng dẫn chi tiết hơn!`

const checkHospitalOrDoctorQuery = async (message) => {
    const keywords = ["bác sĩ", "bệnh viện", "khám bệnh", "giờ làm việc", "chuyên khoa", "đặt lịch"];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
};

const getHospitalOrDoctorInfo = async (message) => {
    console.log("Message check:", message);
    if (message.toLowerCase().includes("bác sĩ")) {
        console.log("Người dùng yêu cầu xem thông tin bác sĩ");
        const response = await axios.get(`${process.env.WEB_LINK}/doctor/dropdown`);
        const doctors = response.data.data;

        if (doctors.length === 0) return "Không tìm thấy thông tin bác sĩ phù hợp.";

        // return doctors.map(doc => 
        //     `*Bác sĩ ${doc.doctorId.fullname}*\n- Chuyên khoa: ${doc.specialtyId.name}\n- Làm việc tại: ${doc.clinicId.name}\n- Thông tin bác sĩ: ${doc.description}\n- Giá khám: ${doc.price}\n-Trung bình sao đánh giá: ${doc.avgRating}\n- Lượt khám: ${doc.bookingCount}\n-Lịch khám: Vui lòng kiểm tra trên hệ thống.`
        // ).join("\n\n");

        const reactUrl = process.env.URL_REACT; 

        return doctors.map(doc => 
            `*Bác sĩ ${doc.doctorId.fullname}*\n- Chuyên khoa: ${doc.specialtyId.name}\n- Làm việc tại: ${doc.clinicId.name}\n- Thông tin bác sĩ: * [Xem chi tiết](${reactUrl}/bac-si/get?id=${doc.doctorId.userId})*\n- Giá khám: ${doc.price}\n-Trung bình sao đánh giá: ${doc.avgRating}\n- Số lượt khám: ${doc.bookingCount}\n-Lịch khám: Vui lòng kiểm tra trên hệ thống.`
        ).join("\n\n");

        // let result = doctors.map(doc => {
        //     // userContext.set(userId, { doctorId: doc.doctorId.userId, doctorName: doc.doctorId.fullname });
        //     return `*Bác sĩ ${doc.doctorId.fullname}*\n- Chuyên khoa: ${doc.specialtyId.name}\n- Làm việc tại: ${doc.clinicId.name}\n- Thông tin bác sĩ: ${doc.description}\n- Giá khám: ${doc.price}\n-Trung bình sao đánh giá: ${doc.avgRating}\n- Lượt khám: ${doc.bookingCount}`
        // }).join("\n\n");
        // return result;
    }

    if (message.toLowerCase().includes("bệnh viện")) {
        console.log("Người dùng yêu cầu xem thông tin bệnh viện");
        const response = await axios.get(`${process.env.WEB_LINK}/clinic/dropdown`);
        const hospitals = response.data.data;

        if (hospitals.length === 0) return "Không tìm thấy thông tin bệnh viện phù hợp.";

        // return hospitals.map(hosp => 
        //     `*Bệnh viện ${hosp.name}*\n- Địa chỉ: ${hosp.address}\n- Thông tin bệnh viện: ${hosp.description}\n- Chuyên khoa:\n${hosp.specialties.map(spec => `  + ${spec.name}: ${spec.description}`).join("\n")}`
        // ).join("\n\n");
        return hospitals.map(hosp => 
            `*Bệnh viện ${hosp.name}*\n- Địa chỉ: ${hosp.address}\n- Thông tin bệnh viện: Truy cập trang web để xem thông tin chi tiết\n- Chuyên khoa:\n${hosp.specialties.map(spec => `  + ${spec.name}: ${spec.description}`).join("\n")}`
        ).join("\n\n");
    }

    // if (message.toLowerCase().includes("đặt lịch khám") || message.toLowerCase().includes("hẹn lịch khám")) {
    //     console.log("Người dùng yêu cầu đặt lịch khám với bác sĩ");
    //     return `🔹 *Hướng dẫn đặt lịch khám với bác sĩ:*\n
    //     *Bước 1:* Truy cập hệ thống EasyMed và tìm kiếm bác sĩ, chuyên khoa hoặc dịch vụ y tế bạn cần.\n
    //     *Bước 2:* Ở mục *Tư vấn trực tiếp*, chọn ngày và khung giờ theo nhu cầu.\n
    //     *Bước 3:* Chọn *người sử dụng dịch vụ*. Nếu chưa có hồ sơ bệnh nhân, bạn có thể tạo mới bằng cách nhấn *Thêm hồ sơ bệnh nhân*.\n
    //     *Bước 4:* Nhập lý do khám bệnh hoặc mô tả chi tiết. Bạn cũng có thể gửi ảnh hoặc video về tình trạng sức khỏe tại mục *tệp đính kèm*.\n
    //     *Bước 5:* Chọn phương thức thanh toán phù hợp.\n
    //        - Nếu chọn *Thanh toán online*, hệ thống sẽ tự động xác nhận đặt lịch sau khi thanh toán thành công.\n
    //        - Nếu chọn *Thanh toán trực tiếp*, bạn sẽ nhận được một email xác nhận đặt lịch. *Vui lòng mở email và click vào "Xác nhận" để hoàn thành đặt khám*.\n
    //     *Bước 6:* Kiểm tra lại thông tin và xác nhận đặt lịch.\n\n
    //     Sau khi đặt lịch thành công, bạn sẽ nhận được thông báo xác nhận.`;
    // }

// Kiểm tra nếu người dùng yêu cầu xem lịch làm việc
// if (message.toLowerCase().includes("lịch làm việc")) {
//     console.log("Người dùng yêu cầu xem lịch làm việc của bác sĩ");
//     if (!userSession.doctorId) {
//         return "Bạn muốn xem lịch làm việc của bác sĩ nào? Vui lòng cung cấp tên bác sĩ trước.";
//     }

//     userContext.set(userId, { ...userSession, waitingForDate: true });

//     return `Bạn muốn xem lịch làm việc của bác sĩ ${userSession.doctorName} vào ngày nào? (Chỉ xem được từ hôm nay trở đi)`;
// }
    return "Xin lỗi, tôi không tìm thấy thông tin phù hợp.";
};


const chatWithGemini = async (userId, message, imageUrl, sessionId) => {
    try {

        let context = "";
        const isHospitalOrDoctorQuery = await checkHospitalOrDoctorQuery(message);

        if (isHospitalOrDoctorQuery) {
            context = await getHospitalOrDoctorInfo(message);
        }

        console.log("context check:", context);

        const previousMessages = await chatbotMessage.findOne({ userId, sessionId });
        let messages = previousMessages?.messages || [];

        // console.log("previousMessages", previousMessages);
        // console.log("messages trước khi chuyển đổi:", messages);

        // Chuyển đổi tin nhắn lịch sử sang định dạng OpenRouter
        const openRouterMessages = convertMessagesToOpenRouter(messages);

        openRouterMessages.unshift({
            role: "system",
            content: [{ type: "text", text: `Bạn là chatbot tư vấn y tế của EasyMed. ${PROMPT} \n\nDữ liệu liên quan: ${context}` }]
        });

        // Thêm tin nhắn mới của người dùng
        openRouterMessages.push({
            role: "user",
            content: [{ type: "text", text: message }]
        });

        if (imageUrl) {
            openRouterMessages.push({ type: "image_url", image_url: { url: imageUrl } });
        }

        console.log("Check tin nhắn:", openRouterMessages);
        console.log("messages gửi đến OpenRouter:", JSON.stringify(openRouterMessages, null, 2));

        // Gửi tin nhắn đến OpenRouter
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            { model: "google/gemma-3-27b-it:free", messages: openRouterMessages },
            {
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Phản hồi từ OpenRouter:", JSON.stringify(response.data, null, 2));

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