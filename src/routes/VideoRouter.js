import express from 'express';
import videoController from '../controllers/VideoController.js'
import upload from "../utils/fileUpload.js";
import { authDoctorMiddleware,authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/',authDoctorMiddleware,upload.single("video"),videoController.addVideo);
router.get('/:doctorId',videoController.getAllVideoByDoctorId);
router.get('/detail/:videoId',videoController.getDetailVideoByVideoId);
router.put('/:videoId',authDoctorMiddleware,videoController.updateVideo);
router.delete('/:videoId',authDoctorMiddleware,videoController.deleteVideo);

export default router;