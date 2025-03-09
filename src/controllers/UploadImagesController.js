import cloudinary from "../configs/cloudinaryConfig.js";

const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "No files were uploaded.",
      });
    }
    console.log("req.files", req.files);

    const uploadedImages = req.files.images.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));
    console.log("uploadedImages", uploadedImages);

    return res.status(200).json({
      status: 200,
      message: "Upload images successfully",
      datas: uploadedImages,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};

export default {
  uploadImages,
};
