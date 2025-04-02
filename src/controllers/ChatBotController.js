import ChatBotService from "../services/ChatBotService.js";

const chatWithGemini = async (req, res) => {
    try {
        const { message, imageUrl } = req.body;
        const userId = req.params.userId;
        const sessionId = req.params.sessionId;
        // console.log("Check", req.body);
        if (!message) return res.status(400).json({ error: "Message không được để trống" });

        const response = await ChatBotService.chatWithGemini(userId,message, imageUrl,sessionId);
        return res.status(200).json(response);
    } catch (e) {
      return res.status(500).json({
        status: 500,
        message: "Error from server",
      });
    }
}

const saveChatbotMessage = async (req,res)=>{
  try{
    const userId = req.params.userId;
    const messages = req.body.messages;
    const sessionId = req.body.sessionId;
    
    const response = await ChatBotService.saveChatbotMessage(userId,messages,sessionId);
    return res.status(200).json(response);
  }catch(e){
    return res.status(500).json({
      status:500,
      message:e.message
    })
  }
}

const getHistoryChatbotMessage = async(req,res)=>{
  try{
    const userId = req.params.userId;
    const response = await ChatBotService.getHistoryChatbotMessage(userId);
    return res.status(200).json(response);
  }catch(e){
    return res.status(500).json({
      status:500,
      message:e.message
    })
  }
}

const getDetailChatbotMessage = async(req,res)=>{
  try{
    const chatbotMessageId = req.params.chatbotMessageId;
    const response = await ChatBotService.getDetailChatbotMessage(chatbotMessageId);
    return res.status(200).json(response);
  }catch(e){
    return res.status(500).json({
      status:500,
      message:e.message
    })
  }
}

export default {
    chatWithGemini,
    saveChatbotMessage,
    getHistoryChatbotMessage,
    getDetailChatbotMessage
}