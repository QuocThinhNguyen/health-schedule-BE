import comments from "../models/comments.js"
import commentLikes from "../models/commentlikes.js"

const addComment = (data) => {
    console.log("data", data)
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.comment || !data.videoId || !data.userId || !data.createdAt) {
                console.log("1")
                resolve({
                    status: 400,
                    message: "Missing required data"
                })
            } else {
                if (data.parentId) {
                    console.log("2")
                    const result = await comments.create({
                        videoId: data.videoId,
                        userId: data.userId,
                        comment: data.comment,
                        parentId: data.parentId,
                        createdAt: data.createdAt
                    })
                    resolve({
                        status: 200,
                        message: "Add comment successfully",
                        data: result
                    })
                }else{
                    console.log("3")
                const result = await comments.create({
                    videoId: data.videoId,
                    userId: data.userId,
                    comment: data.comment,
                    createdAt: data.createdAt
                })
                resolve({
                    status: 200,
                    message: "Add comment successfully",
                    data: result
                })
            }
                
            }
        } catch (e) {
            reject(e)
        }
    })
}

const getTotalCommentByVideoId = (videoId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const total = await comments.countDocuments({ videoId: videoId })
            resolve({
                status: 200,
                data: total
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getAllCommentByVideoId = async (videoId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const allComments = await comments.find({ videoId: videoId })
            .populate({
                path: "userId",
                model: "Users",
                localField: "userId",
                foreignField: "userId",
                select: "fullname image roleId"
            })
            .lean(); // Lấy toàn bộ comment theo videoId
            // console.log("allComments", allComments)
            // Tạo map để tra cứu bình luận theo commentId
            const commentMap = new Map();
            allComments.forEach(comment => {
                comment.replies = []; // Tạo mảng chứa reply
                commentMap.set(comment.commentId, comment);
            });

            // Danh sách bình luận cha (root comments)
            const rootComments = [];

            allComments.forEach(comment => {
                if (comment.parentId) {
                    // Nếu là reply, thêm vào replies của bình luận cha
                    const parent = commentMap.get(comment.parentId);
                    if (parent) {
                        parent.replies.push(comment);
                    }
                } else {
                    // Nếu là bình luận cha, thêm vào danh sách root
                    rootComments.push(comment);
                }
            });

            resolve({
                status: 200,
                data: rootComments
            });
        } catch (e) {
            reject(e);
        }
    });
};

export default {
    addComment,
    getTotalCommentByVideoId,
    getAllCommentByVideoId
}