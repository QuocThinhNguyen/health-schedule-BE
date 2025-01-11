import express from 'express';
import bookingImageController from '../controllers/BookingImageController.js';
import upload from "../utils/fileUpload.js";
import {authAdminMiddleware} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/:id',bookingImageController.getAllBookingImageByBookingId)

export default router