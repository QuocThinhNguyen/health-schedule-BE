import { resolve } from "path";
import videos from "../models/videos.js";
import { rejects } from "assert";
import videoLike from "../models/videolikes.js";

const addVideo = (data, file) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.title ||
        !data.specialty ||
        !data.doctorId ||
        !data.currentDate
      ) {
        resolve({
          status: 400,
          message: "Missing required data",
        });
      } else {
        const video = await videos.create({
          doctorId: data.doctorId,
          specialtyId: data.specialty,
          videoTitle: data.title,
          videoName: file.path,
          createAt: data.currentDate,
        });
        resolve({
          status: 200,
          message: "Add video successfully",
          data: video,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const getAllVideoByDoctorId = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 100;

      const formatQuery = {
        doctorId: query.doctorId,
      };

      const videoList = await videos
        .find(formatQuery)
        .sort({ createAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      if (videoList.length === 0) {
        resolve({
          status: 404,
          message: "No video found",
        });
      } else {
        const totalVideo = await videos.countDocuments(formatQuery);
        const totalPage = Math.ceil(totalVideo / limit);

        resolve({
          status: 200,
          data: videoList,
          totalPages: totalPage,
          totalVideo: totalVideo,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const getDetailVideoByVideoId = (videoId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const video = await videos
        .findOne({
          videoId: videoId,
        })
        .populate({
          path: "doctorId",
          model: "Users",
          localField: "doctorId",
          foreignField: "userId",
          select: "fullname",
        });
      if (!video) {
        resolve({
          status: 404,
          message: "Video not found",
        });
      }
      resolve({
        status: 200,
        data: video,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updateVideo = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const updateVideo = await videos.findOne({
        videoId: id,
      });

      if (!updateVideo) {
        resolve({
          status: 404,
          message: "Video not found",
        });
      }
      await videos.updateOne({ videoId: id }, data, { new: true });
      resolve({
        status: 200,
        message: "Update video successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteVideo = (id) => {
  return new Promise(async (resolve, rejects) => {
    try {
      const video = await videos.findOne({
        videoId: id,
      });

      if (!video) {
        resolve({
          status: 404,
          message: "Video not found",
        });
      }
      await videos.deleteOne({ videoId: id });
      resolve({
        status: 200,
        message: "Delete video successfully",
      });
    } catch (e) {
      rejects(e);
    }
  });
};

const checkUserLikeVideo = (userId, videoId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const like = await videoLike.findOne({
        userId: userId,
        videoId: videoId,
      });
      // if(!like){
      //     resolve({
      //         status: 404,
      //         message: "User not like this video"
      //     })
      // }
      resolve({
        status: 200,
        data: !!like,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const likeVideo = (userId, videoId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const like = await videoLike.create({
        userId: userId,
        videoId: videoId,
        createdAt: new Date(),
      });
      resolve({
        status: 200,
        message: "Like video successfully",
        data: like,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const dislikeVideo = (userId, videoId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const like = await videoLike.findOne({
        userId: userId,
        videoId: videoId,
      });
      if (!like) {
        resolve({
          status: 404,
          message: "User not like this video",
        });
      }
      await videoLike.deleteOne({ userId: userId, videoId: videoId });
      resolve({
        status: 200,
        message: "Dislike video successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updateViewVideo = (videoId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const video = await videos.findOne({
        videoId: videoId,
      });
      if (!video) {
        resolve({
          status: 404,
          message: "Video not found",
        });
      }

      video.views += 1;
      await video.save();

      resolve({
        status: 200,
        message: "Update view video successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

export default {
  addVideo,
  getAllVideoByDoctorId,
  getDetailVideoByVideoId,
  updateVideo,
  deleteVideo,
  checkUserLikeVideo,
  likeVideo,
  dislikeVideo,
  updateViewVideo,
};
