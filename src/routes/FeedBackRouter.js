import express from 'express';
import feedBackController from '../controllers/FeedBackController.js';
import { authAdminMiddleware } from '../middlewares/authMiddleware.js';
import { upload } from "../utils/uploadCloudinary.js";

const router = express.Router();
router.get('/filter',feedBackController.getAllFeedBackByFilter);
router.post('/',upload.array("images"),feedBackController.createFeedBack);
router.put('/:id',feedBackController.updateFeedBack);
router.get('/',feedBackController.getAllFeedBack);
router.delete('/:id',feedBackController.deleteFeedBack);
router.get('/:doctorId',feedBackController.getFeedBackByDoctorId);
router.post('/check',feedBackController.checkFeedBacked);
router.get('/clinic/:clinicId', feedBackController.getFeedBackByClinicId);

export default router;