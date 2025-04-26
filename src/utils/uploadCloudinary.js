import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../configs/cloudinaryConfig.js";

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "clinic_management",
    public_id: (req, file) => {
      const fileName = file.originalname.split(".")[0];
      const timestamp = Date.now();
      return `${fileName}_${timestamp}`;
    },
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "mp4",
      "mov",
      "avi",
      "wmv",
      "flv",
      "mkv",
    ],
    resource_type: (req, file) => {
      if (file.mimetype.startsWith("video/")) {
        return "video";
      }
      return "image";
    },
  },
});

export const upload = multer({
  storage: cloudinaryStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, 
  },
});
