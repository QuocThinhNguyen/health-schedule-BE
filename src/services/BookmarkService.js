import bookMarks from '../models/bookmarks.js'
import video from '../models/videos.js'
const getTotalBookmarkByVideoId = async(videoId) => {
    return new Promise(async(resolve, reject) => {
        try{
            const bookMark = await bookMarks.findOne({
                videoId: videoId
            })
            // console.log("BOOKMARK:",bookMark)
            if(bookMark){
                const total = await bookMarks.countDocuments({ videoId });
                resolve({
                    status: 200,
                    data: total
                })
            }else{
                resolve({
                    status: 200,
                    data: 0
                })
            }
           
        }catch(e){
            reject(e)
        }
    })
}

const getBookmarkByUserId = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const bookmarks = await bookMarks.find({ userId: userId });

            // Lấy danh sách video dựa trên videoId trong bookmarks
            const videoData = await Promise.all(bookmarks.map(async (bookmark) => {
                const videoInfo = await video.findOne({ videoId: bookmark.videoId });
                return {
                    date: bookmark.createdAt.toISOString().split('T')[0], // Lấy YYYY-MM-DD
                    video: videoInfo
                };
            }));

            // Nhóm dữ liệu theo ngày
            let groupedData = {};
            videoData.forEach(item => {
                if (!groupedData[item.date]) {
                    groupedData[item.date] = [];
                }
                groupedData[item.date].push(item.video);
            });

            // Chuyển về dạng mảng để dễ đọc
            let result = Object.keys(groupedData).map(date => ({
                date,
                videos: groupedData[date]
            }));

            resolve({
                status: 200,
                data: result
            });
        } catch (e) {
            reject({
                status: 500,
                message: e.message
            });
        }
    });
};


const checkUserBookmark = (userId, videoId) => {
    return new Promise(async(resolve, reject) => {
        try{
            const bookMark = await bookMarks.findOne({
                userId: userId,
                videoId: videoId
            })
            resolve({
                status: 200,
                data: !!bookMark
            })
        }catch(e){
            reject(e)
        }
    })
}

const bookMarkVideo = (userId, videoId) => {
    return new Promise(async(resolve, reject) => {
        try{
            const bookMark = await bookMarks.create({
                userId: userId,
                videoId: videoId,
                createdAt: new Date()
            })
            resolve({
                status: 200,
                message: "Bookmark video successfully",
                data: bookMark
            })
        }catch(e){
            reject(e)
        }
    })
}

const unBookMarkVideo = (userId, videoId) => {
    return new Promise(async(resolve, reject) => {
        try{
            const bookMark = await bookMarks.findOne({
                userId: userId,
                videoId: videoId
            })
            if(!bookMark){
                resolve({
                    status: 404,
                    message: "User not bookmark this video"
                })
            }
            await bookMarks.deleteOne({userId: userId, videoId: videoId})
            resolve({
                status: 200,
                message: "Unbookmark video successfully"
            })
        }catch(e){
            reject(e)
        }
    })
}


export default {
    getTotalBookmarkByVideoId,
    getBookmarkByUserId,
    checkUserBookmark,
    bookMarkVideo,
    unBookMarkVideo
}