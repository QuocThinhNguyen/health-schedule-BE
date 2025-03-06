import { resolve } from 'path'
import videos from '../models/videos.js'
import { rejects } from 'assert'

const addVideo=(data,file)=>{
    return new Promise(async(resolve, reject)=>{
        try{
            if(!data.title || !data.specialty  || !data.doctorId || !data.currentDate){
                resolve({
                    status: 400,
                    message: "Missing required data"
                })
            }else{
                // console.log("doctorId",data.doctorId)
                // console.log("specialtyId",data.specialty)
                // console.log("title",data.title)
                // console.log("currentDate",data.currentDate)
                // console.log("videoName",file.filename)

                const video = await videos.create({
                    doctorId: data.doctorId,
                    specialtyId: data.specialty,
                    videoTitle: data.title,
                    videoName: file.filename,
                    
                    createAt: data.currentDate
                })
                console.log("VIDEO:")
                resolve({
                    status: 200,
                    message: "Add video successfully",
                    data: video
                })
            }
        }catch(e){
            reject(e)
        }
    })
}

const getAllVideoByDoctorId=(query)=>{
    return new Promise(async(resolve, reject)=>{
        try{
            const page = parseInt(query.page) || 1
            const limit = parseInt(query.limit) || 100

            const formatQuery ={
                doctorId: query.doctorId
            }

            const videoList = await videos.find(formatQuery)
                        .sort({createAt: -1})
                        .skip((page-1)*limit)
                        .limit(limit)

            if (videoList.length === 0){
                resolve({
                    status: 404,
                    message: "No video found"
                })
            }else{
                const totalVideo = await videos.countDocuments(formatQuery);
                const totalPage = Math.ceil(totalVideo/limit)
    
                resolve({
                    status: 200,
                    data: videoList,
                    totalPages: totalPage,
                    totalVideo: totalVideo
                })
            }
        }catch(e){
            reject(e)
        }
    })
}

const getDetailVideoByVideoId = (videoId)=>{
    return new Promise(async(resolve, reject)=>{
        try{
            const video = await videos.findOne({
                videoId: videoId
            })
            if(!video){
                resolve({
                    status: 404,
                    message: "Video not found"
                })
            }
            resolve({
                status: 200,
                data: video
            })
        }catch(e){
            reject(e)
        }
    })
}

const updateVideo = (id, data)=>{
    return new Promise(async(resolve, reject)=>{
        try{
            const updateVideo = await videos.findOne({
                videoId: id
            })

            if(!updateVideo){
                resolve({
                    status: 404,
                    message: "Video not found"
                })
            }
            await videos.updateOne({videoId:id},data,{new:true})
            resolve({
                status: 200,
                message: "Update video successfully"
            })
        }catch(e){
            reject(e)
        }
    })
}

const deleteVideo = (id) => {
    return new Promise(async(resolve, rejects) => {
        try{
            const video = await videos.findOne({
                videoId: id
            })

            if(!video){
                resolve({
                    status: 404,
                    message: "Video not found"
                })
            }
            await videos.deleteOne({videoId: id})
            resolve({
                status: 200,
                message: "Delete video successfully"
            })
        }catch(e){
            rejects(e)
        }
    })
}
export default{
    addVideo,
    getAllVideoByDoctorId,
    getDetailVideoByVideoId,
    updateVideo,
    deleteVideo
}