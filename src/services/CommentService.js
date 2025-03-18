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

// const getAllCommentByVideoId = async (videoId) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const allComments = await comments.find({ videoId: videoId })
//                 .populate({
                    // path: "userId",
                    // model: "Users",
                    // localField: "userId",
                    // foreignField: "userId",
                    // select: "fullname image roleId"
//                 })
//                 .lean(); // Lấy toàn bộ comment theo videoId

//             // Lấy danh sách commentId để tối ưu truy vấn
//             const commentIds = allComments.map(comment => comment.commentId);

//             // Lấy tổng số lượt like cho tất cả comment một lần
//             const likeCounts = await commentLikes.aggregate([
//                 { $match: { commentId: { $in: commentIds } } },
//                 { $group: { _id: "$commentId", totalLikes: { $sum: 1 } } }
//             ]);

//             // Chuyển đổi dữ liệu likes thành object map { commentId: totalLikes }
//             const likeMap = {};
//             likeCounts.forEach(like => {
//                 likeMap[like._id] = like.totalLikes;
//             });

//             // Gán tổng số lượt like vào từng comment
//             allComments.forEach(comment => {
//                 comment.totalLikes = likeMap[comment.commentId] || 0;
//             });

//             // Tạo map để tra cứu bình luận theo commentId
//             const commentMap = new Map();
//             allComments.forEach(comment => {
//                 comment.replies = []; // Tạo mảng chứa reply
//                 commentMap.set(comment.commentId, comment);
//             });

//             // Danh sách bình luận cha (root comments)
//             const rootComments = [];

//             allComments.forEach(comment => {
//                 if (comment.parentId) {
//                     // Nếu là reply, thêm vào replies của bình luận cha
//                     const parent = commentMap.get(comment.parentId);
//                     if (parent) {
//                         parent.replies.push(comment);
//                     }
//                 } else {
//                     // Nếu là bình luận cha, thêm vào danh sách root
//                     rootComments.push(comment);
//                 }
//             });

//             resolve({
//                 status: 200,
//                 data: rootComments
//             });
//         } catch (e) {
//             reject(e);
//         }
//     });
// };

const getAllCommentByVideoId = async (videoId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const allComments = await comments.find({ videoId })
                .populate({
                    path: "userId",
                    model: "Users",
                    localField: "userId",
                    foreignField: "userId",
                    select: "fullname image roleId"
                })
                .lean();

            // Lấy danh sách commentId
            const commentIds = allComments.map(comment => comment.commentId);

            // Lấy tổng số like và danh sách user đã like
            const likesData = await commentLikes.find({ commentId: { $in: commentIds } })
                .populate({
                    path: "userId",
                    model: "Users",
                    localField: "userId",
                    foreignField: "userId",
                    select: "fullname image roleId"
                })
                .lean();

            // Tạo map chứa danh sách user đã like theo commentId
            const likeMap = {};
            likesData.forEach(like => {
                if (!likeMap[like.commentId]) likeMap[like.commentId] = [];
                likeMap[like.commentId].push(like.userId); // Lưu danh sách user đã like
            });

            // Gán totalLikes & danh sách user đã like vào comment
            allComments.forEach(comment => {
                comment.totalLikes = likeMap[comment.commentId]?.length || 0;
                comment.likedUsers = likeMap[comment.commentId] || []; // Thêm danh sách user đã like
            });

            // Tạo map bình luận cha - con
            const commentMap = new Map();
            allComments.forEach(comment => {
                comment.replies = [];
                commentMap.set(comment.commentId, comment);
            });

            // Danh sách bình luận cha (root comments)
            const rootComments = [];

            allComments.forEach(comment => {
                if (comment.parentId) {
                    const parent = commentMap.get(comment.parentId);
                    if (parent) parent.replies.push(comment);
                } else {
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

const likeComment = (userId,commentId)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            const like = await commentLikes.create({
                userId: userId,
                commentId: commentId,
                createdAt: new Date()
            })
            resolve({
                status: 200,
                message: "Like comment successfully",
                data: like
            })
        }catch(e){
            reject(e)
        }
    })
}

const unLikeComment = (userId,commentId)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            const like = await commentLikes.findOne({
                userId: userId,
                commentId: commentId
            })
            if(!like){
                resolve({
                    status: 400,
                    message: "You haven't liked this comment"
                })
            }
            await commentLikes.deleteOne({
                userId: userId,
                commentId: commentId
            })
            resolve({
                status: 200,
                message: "Unlike comment successfully",
            })
        }catch(e){
            reject(e)
        }
    })
}

const checkUserLikeComment = (userId,commentId)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            const like = await commentLikes.findOne({
                userId: userId,
                commentId: commentId
            })
            resolve({
                status: 200,
                data: !!like
            })
        }catch(e){
            reject(e)
        }
    })
}

const getTotalLikeCommentByCommentId = (commentId)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            const comment = await commentLikes.findOne({
                commentId:commentId
            })
            if (comment){
                const total = await commentLikes.countDocuments({commentId});
                resolve({
                    status: 200,
                    data: total
                })
            }else{
                resolve({
                    status: 200,
                    data:0
            })
        }
        }catch(e){
            reject(e)
        }
    })
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