import express from "express";
import uploadImagesController from "../controllers/UploadImagesController.js";
import upload from "../middlewares/upload.js";
const router = express.Router();



router.post("/upload", upload.fields([{ name: "images", maxCount: 10 }]), uploadImagesController.uploadImages);

export default router;
