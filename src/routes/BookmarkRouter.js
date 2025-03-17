import express from "express";
import bookMarkController from "../controllers/BookMarkController.js";
import { authUserMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/video/:videoId',authUserMiddleware,bookMarkController.getTotalBookmarkByVideoId);
router.get('/user/:userId',authUserMiddleware,bookMarkController.getBookmarkByUserId);
router.get('/:videoId/:userId',authUserMiddleware,bookMarkController.checkUserBookmark);
router.post('/:videoId/:userId',authUserMiddleware,bookMarkController.bookMarkVideo);
router.delete('/:videoId/:userId',authUserMiddleware,bookMarkController.unBookMarkVideo);

export default router;
