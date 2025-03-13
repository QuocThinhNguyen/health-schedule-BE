import VideoService  from "../services/VideoService.js";

const addVideo = async(req, res)=>{
    try{
        // console.log("CHECK:",req.body)
        const file = req.file || [];
        const data = await VideoService.addVideo(req.body,file);
        if(data.status === 200){
            return res.status(200).json(data)
        }
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

const getAllVideoByDoctorId = async(req, res)=>{
    try{
        const doctorId = req.params.doctorId;
        const query = {
            doctorId: doctorId,
            page: req.query.page,
            limit: req.query.limit
        }
        const data = await VideoService.getAllVideoByDoctorId(query);
        return res.status(200).json(data)
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

const getDetailVideoByVideoId = async(req, res)=>{
    try{
        const videoId = req.params.videoId;
        const data = await VideoService.getDetailVideoByVideoId(videoId);
        return res.status(200).json(data)
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

const updateVideo = async (req, res) => {
    try{
        const videoId = req.params.videoId;
        const data = await VideoService.updateVideo(videoId, req.body);
        return res.status(200).json(data)
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

const deleteVideo = async (req, res) => {
    try{
        const videoId = req.params.videoId;
        const data = await VideoService.deleteVideo(videoId);
        return res.status(200).json(data)
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

const checkUserLikeVideo = async (req, res) => {
    try{
        const userId = req.params.userId;
        const videoId = req.params.videoId;
        const data = await VideoService.checkUserLikeVideo(userId, videoId);
        return res.status(200).json(data)
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

const likeVideo = async (req, res) => {
    try{
        const userId = req.params.userId;
        const videoId = req.params.videoId;
        const data = await VideoService.likeVideo(userId, videoId);
        return res.status(200).json(data)
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

const dislikeVideo = async (req, res) => {
    try{
        const userId = req.params.userId;
        const videoId = req.params.videoId;
        const data = await VideoService.dislikeVideo(userId, videoId);
        return res.status(200).json(data)
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

export default {
    addVideo,
    getAllVideoByDoctorId,
    getDetailVideoByVideoId,
    updateVideo,
    deleteVideo,
    checkUserLikeVideo,
    likeVideo,
    dislikeVideo
}

