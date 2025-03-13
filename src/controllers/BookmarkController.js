import BookmarkService from "../services/BookmarkService.js";

const getTotalBookmarkByVideoId = async (req, res) => {
    try{
        const videoId = req.params.videoId;
        const data = await BookmarkService.getTotalBookmarkByVideoId(videoId);
        return res.status(200).json(data)
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

const getBookmarkByUserId = async (req, res) => {
    try{
        const userId = req.params.userId;
        const data = await BookmarkService.getBookmarkByVideoId(videoId);
        return res.status(200).json(data)
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

const checkUserBookmark = async (req, res) => {
    try{
        const userId = req.params.userId;
        const videoId = req.params.videoId;
        const data = await BookmarkService.checkUserBookmark(userId, videoId);
        return res.status(200).json(data)
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

const bookMarkVideo = async (req, res) => {
    try{
        const userId = req.params.userId;
        const videoId = req.params.videoId;
        const data = await BookmarkService.bookMarkVideo(userId, videoId);
        return res.status(200).json(data)
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

const unBookMarkVideo = async (req, res) => {
    try{
        const userId = req.params.userId;
        const videoId = req.params.videoId;
        const data = await BookmarkService.unBookMarkVideo(userId, videoId);
        return res.status(200).json(data)
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

export default {
    getTotalBookmarkByVideoId,
    getBookmarkByUserId,
    checkUserBookmark,
    bookMarkVideo,
    unBookMarkVideo
}