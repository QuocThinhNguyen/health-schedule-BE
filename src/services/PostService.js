import post from "../models/Post.js";

const getAllPost = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 6;

      let formatQuery = {};

      if (query.query) {
        formatQuery = {
          title: {
            $regex: query.query,
            $options: "i",
          },
        };
      }

      const posts = await post
        .find(formatQuery)
        .populate({
          path: "userId",
          model: "Users",
          localField: "userId",
          foreignField: "userId",
          select: "fullname",
        })
        .skip((page - 1) * limit)
        .limit(limit);

      const totalPosts = await post.countDocuments(formatQuery);
      const totalPages = Math.ceil(totalPosts / limit);

      resolve({
        status: 200,
        message: "Get all posts and filter successfully",
        data: posts,
        totalPages,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getPostById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const postById = await post
        .findOne({
          postId: id,
        })
        .populate({
          path: "userId",
          model: "Users",
          localField: "userId",
          foreignField: "userId",
          select: "fullname",
        });

      if (!postById) {
        resolve({
          status: 404,
          message: "Post not found",
        });
      }

      resolve({
        status: 200,
        message: "Get post by id successfully",
        data: postById,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const createPost = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(data);

      if (!data.userId || !data.title || !data.image || !data.content) {
        resolve({
          status: 404,
          message: "Please provide all data",
        });
      } else {
        const now = new Date();
        const gmt7Date = new Date(now.getTime() + 7 * 60 * 60 * 1000); // Cộng thêm 7 giờ
        await post.create({
          userId: data.userId,
          image: data.image,
          title: data.title,
          content: data.content,
          createAt: gmt7Date,
          updateAt: gmt7Date,
        });
        resolve({
          status: 200,
          message: "Post created successfully",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const updatePost = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkPost = await post.findOne({
        postId: id,
      });

      if (!checkPost) {
        resolve({
          status: 404,
          message: "Post not found",
        });
      }
      const now = new Date();
      const gmt7Date = new Date(now.getTime() + 7 * 60 * 60 * 1000); // Cộng thêm 7 giờ

      data.updateAt = gmt7Date;

      await post.updateOne({ postId: id }, data, { new: true });

      resolve({
        status: 200,
        message: "Update post successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deletePost = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkPost = await post.findOne({
        postId: id,
      });

      if (!checkPost) {
        resolve({
          status: 404,
          message: "Post not found",
        });
      }

      await post.deleteOne({ postId: id });

      resolve({
        status: 200,
        message: "Delete post successfully",
      });
    } catch (e) {
      reject(e);
    }
  });
};

export default {
  getAllPost,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
