import express from 'express';
import videoController from '../controllers/VideoController.js'
import upload from "../utils/fileUpload.js";
import { authDoctorMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/',authDoctorMiddleware,upload.single("video"),videoController.addVideo);
router.get('/:doctorId',authDoctorMiddleware,videoController.getAllVideoByDoctorId);
router.get('/detail/:videoId',authDoctorMiddleware,videoController.getDetailVideoByVideoId);
router.put('/:videoId',authDoctorMiddleware,videoController.updateVideo);
router.delete('/:videoId',authDoctorMiddleware,videoController.deleteVideo);

export default router;