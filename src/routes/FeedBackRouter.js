import express from 'express';
import feedBackController from '../controllers/FeedBackController.js';
import { authAdminMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/',feedBackController.createFeedBack);
router.put('/:id',feedBackController.updateFeedBack);
router.get('/',feedBackController.getAllFeedBack);
router.delete('/:id',feedBackController.deleteFeedBack);
router.get('/:doctorId',feedBackController.getFeedBackByDoctorId);
router.post('/check',feedBackController.checkFeedBacked);

export default router;