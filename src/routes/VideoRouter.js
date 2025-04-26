import express from 'express';
import videoController from '../controllers/VideoController.js'
// import upload from "../utils/fileUpload.js";
import { authDoctorMiddleware,authMiddleware } from '../middlewares/authMiddleware.js';
import { upload } from '../utils/uploadCloudinary.js';

const router = express.Router();
router.post('/',authDoctorMiddleware,upload.single("video"),videoController.addVideo);
router.get('/:doctorId',videoController.getAllVideoByDoctorId);
router.get('/detail/:videoId',videoController.getDetailVideoByVideoId);
router.put('/:videoId',authMiddleware,videoController.updateVideo);
router.delete('/:videoId',authDoctorMiddleware,videoController.deleteVideo);
router.get('/like/:videoId/:userId',authMiddleware,videoController.checkUserLikeVideo);
router.post('/like/:videoId/:userId',authMiddleware,videoController.likeVideo);
router.delete('/like/:videoId/:userId',authMiddleware,videoController.dislikeVideo);
router.put('/view/:videoId',videoController.updateViewVideo);

export default router;