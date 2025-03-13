import bookMarks from '../models/bookmarks.js'

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
                    status: 404,
                    message: "Bookmark not found"
                })
            }
           
        }catch(e){
            reject(e)
        }
    })
}

const getBookmarkByUserId = (userId) => {
    return new Promise(async(resolve, reject) => {
        try{
            const bookMark = await bookMarks.findOne({
                userId: userId
            })
            if(!bookMark){
                resolve({
                    status: 404,
                    message: "Bookmark not found"
                })
            }
            resolve({
                status: 200,
                data: bookMark
            })
        }catch(e){
            reject(e)
        }
    })
}

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