import express from "express";
import adminController from "../controllers/AdminController.js";
import { authAdminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/homepage", authAdminMiddleware, adminController.adminHomePage);
router.get("/revenue-chart", authAdminMiddleware, adminController.revenueChart);
router.get(
  "/status-booking-chart",
  authAdminMiddleware,
  adminController.statusBookingChart
);
router.get(
  "/booking-dayinmonth-chart",
  authAdminMiddleware,
  adminController.bookingDayInMonthChart
);
router.get(
  "/booking-monthinyear-chart",
    authAdminMiddleware,
  adminController.bookingMonthInYearChart
);
export default router;
