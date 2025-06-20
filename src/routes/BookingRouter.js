import express from "express";
import bookingController from "../controllers/BookingController.js";
import {
  authUserMiddleware,
  authAdminMiddleware,
  authDoctorMiddleware,
  authMiddleware,
} from "../middlewares/authMiddleware.js";
import { upload } from "../utils/uploadCloudinary.js";

const router = express.Router();
router.get(
  "/getBookingByTimeType",
  authMiddleware,
  bookingController.getBookingByTimeType
);
router.get(
  "/getBookingByClinicId",
  authMiddleware,
  bookingController.getAllBookingByClinic
);
router.get("/patient", authMiddleware, bookingController.getBookingByPatientId);
router.get("/confirmBooking", bookingController.confirmBooking);
router.get("/confirmBookingService", bookingController.confirmBookingService);
router.post(
  "/book-appointment-online",
  authUserMiddleware,
  upload.array("images"),
  bookingController.patientBookingOnline
);
router.post(
  "/book-appointment-direct",
  authUserMiddleware,
  upload.array("images"),
  bookingController.patientBookingDirect
);

router.post(
  "/booking-appointment",
  // authUserMiddleware,
  upload.array("images"),
  bookingController.bookingAppointment
);


router.get("/momo_return", bookingController.handlePaymentReturn); // Định nghĩa tuyến đường để xử lý phản hồi từ MoMo
router.post(
  "/allbooking",
  authMiddleware,
  bookingController.getAllBookingByUserId
);
router.get("/:id", authMiddleware, bookingController.getBooking);
router.get("/", authMiddleware, bookingController.getAllBooking);
// router.put("/:id",authMiddleware,bookingController.updateBooking);
router.put("/:id", bookingController.updateBooking);

router.get(
  "/doctor/latest/:doctorId",
  authDoctorMiddleware,
  bookingController.getBookingLatestByDoctorId
);
router.get(
  "/doctor/:doctorId",
  authDoctorMiddleware,
  bookingController.getBookingByDoctorId
);
router.get(
  "/email/:bookingId",
  authMiddleware,
  bookingController.getEmailByBookingId
);

export default router;
