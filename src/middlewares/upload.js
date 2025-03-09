import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../configs/cloudinaryConfig.js";
import multer from "multer";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: "uploads-health-schedule",
  allowedFormats: ["jpg", "png", "jpeg","mp4","gif","mov","avi","mkv"],
  transformation: [
    { width: 1000, crop: "scale" },
    { quality: 35 },
    { fetch_format: "auto" },
  ],
  params: {
    public_id: (req, file) => {
      const publicId = `${Date.now()}-${file.originalname.split(".")[0]}`;
      console.log("Generated public_id:", publicId);
      return publicId; 
    },
  },
});

const upload = multer({ storage: storage });

export default upload;
