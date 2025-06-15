import CommentService from "../services/CommentService.js";

const addComment = async (req, res) => {
    try{
        const data = await CommentService.addComment(req.body);
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

const getTotalCommentByVideoId = async (req, res) => {
    try{
        const videoId = req.params.videoId;
        const data = await CommentService.getTotalCommentByVideoId(videoId);
        return res.status(200).json(data)
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

const getAllCommentByVideoId = async (req, res) => {
    try{
        const videoId = req.params.videoId;
        const data = await CommentService.getAllCommentByVideoId(videoId);
        return res.status(200).json(data)
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

const likeComment = async (req, res) => {
    try{
        const userId = req.params.userId;
        const commentId = req.params.commentId;
        const data = await CommentService.likeComment(userId, commentId);
        return res.status(200).json(data)
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

const unLikeComment = async (req, res) => {
    try{
        const userId = req.params.userId;
        const commentId = req.params.commentId;
        const data = await CommentService.unLikeComment(userId, commentId);
        return res.status(200).json(data)
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

const checkUserLikeComment = async (req, res) => {
    try{
        const userId = req.params.userId;
        const commentId = req.params.commentId;
        const data = await CommentService.checkUserLikeComment(userId, commentId);
        return res.status(200).json(data)
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

const getTotalLikeCommentByCommentId = async (req, res) => {
    try{
        const commentId = req.params.commentId;
        const data = await CommentService.getTotalLikeCommentByCommentId(commentId);
        return res.status(200).json(data)
    }catch(e){
        return res.status(500).json({
            status: 500,
            message: e.message
        })
    }
}

export default {
    addComment,
    getTotalCommentByVideoId,
    getAllCommentByVideoId,
    likeComment,
    unLikeComment,
    checkUserLikeComment,
    getTotalLikeCommentByCommentId
}