import postService from "../services/PostService.js";

const getAllPost = async (req, res) => {
  try {
    const data = await postService.getAllPost(req.query);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const userId = req.params.id;
    const response = await postService.getPostById(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const createPost = async (req, res) => {
  try {
    const image = req.file ? req.file.path : null;
    const data = {
      ...req.body,
      image,
    };
    const response = await postService.createPost(data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const id = req.params.id;
    const image = req.file ? req.file.path : null;
    const data = {
      ...req.body,
    };
    if (image) {
      data.image = image;
    }

    const response = await postService.updatePost(id, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await postService.deletePost(id);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

const getPostInClinic = async (req, res) => {
  try {
    const query = req.query.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const clinicId = req.params.clinicId;
    const response = await postService.getPostInClinic(
      clinicId,
      query,
      page,
      limit
    );
    return res.status(200).json(response);
  } catch (e) {
    console.log("erorr", e);

    return res.status(500).json({
      status: 500,
      message: "Error from server",
    });
  }
};

export default {
  getAllPost,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getPostInClinic,
};
