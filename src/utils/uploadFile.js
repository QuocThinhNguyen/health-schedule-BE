import cloudinary from "../configs/cloudinaryConfig.js";
import path from "path";

const uploadFile = async (filePath) => {
  try {
    console.log("imageUrl:", filePath);
    const ext = path.extname(filePath);
    const fileName = path.basename(filePath, ext);
    const timestamp = Date.now();
    const newFileName = `${fileName}_${timestamp}`;

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "clinic_management",
      public_id: newFileName,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      transformation: [
        { width: 1000, height: 800, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });
    console.log("result:", result);
    

    return result.secure_url;
  } catch (e) {
    console.log("Error while uploading file:", e);
    throw new Error("Error while uploading file");
  }
};
export default uploadFile;
