import express from 'express';
import bookingController from '../controllers/BookingController.js';
import { authUserMiddleware, authAdminMiddleware, authDoctorMiddleware, authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../utils/fileUpload.js";

const router = express.Router();
router.get("/confirmBooking",bookingController.confirmBooking)
router.post("/book-appointment-online", authUserMiddleware, upload.array("images"),bookingController.patientBookingOnline);
router.post("/book-appointment-direct", authUserMiddleware, upload.array("images"),bookingController.patientBookingDirect);
router.get("/momo_return", bookingController.handlePaymentReturn); // Định nghĩa tuyến đường để xử lý phản hồi từ MoMo
router.post("/allbooking", authMiddleware, bookingController.getAllBookingByUserId);
router.get("/:id",authMiddleware,bookingController.getBooking);
router.get("/",authMiddleware,bookingController.getAllBooking)
router.put("/:id",authMiddleware,bookingController.updateBooking);
router.get("/doctor/latest/:doctorId", authDoctorMiddleware, bookingController.getBookingLatestByDoctorId)
router.get("/doctor/:doctorId", authDoctorMiddleware, bookingController.getBookingByDoctorId)
router.get("/email/:bookingId", authMiddleware, bookingController.getEmailByBookingId)

export default router;