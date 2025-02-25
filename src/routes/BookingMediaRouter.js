import express from 'express';
import bookingMediaController from '../controllers/BookingMediaController.js';
import upload from "../utils/fileUpload.js";
import {authAdminMiddleware} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/:id',bookingMediaController.getAllBookingImageByBookingId)

export default router