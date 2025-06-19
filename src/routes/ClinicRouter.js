import express from "express";
import clinicController from "../controllers/ClinicController.js";
import {
  authAdminMiddleware,
  authClinicMiddleware,
  authMiddleware
} from "../middlewares/authMiddleware.js";
import { upload } from "../utils/uploadCloudinary.js";

const router = express.Router();

router.get("/statistics", authMiddleware, clinicController.getStatistics);
router.get(
  "/revenue-chart",
  authMiddleware,
  clinicController.revenueChart
);
router.get(
  "/status-booking-chart",
  authMiddleware,
  clinicController.statusBookingChart
);
router.get(
  "/booking-dayinmonth-chart",
  authMiddleware,
  clinicController.bookingDayInMonthChart
);
router.get(
  "/booking-monthinyear-chart",
  authMiddleware,
  clinicController.bookingMonthInYearChart
);

router.get("/getClinicByProvinceId", clinicController.getClinicByProvinceId);
router.get("/dropdown", clinicController.getDropdownClinics);
router.get("/", clinicController.filterClinics);
router.post(
  "/",
  authAdminMiddleware,
  upload.fields([{ name: "image", maxCount: 1 }]),
  clinicController.createClinic
);
router.put(
  "/:id",
  authAdminMiddleware,
  upload.fields([{ name: "image", maxCount: 1 }]),
  clinicController.updateClinic
);
router.get("/", clinicController.getAllClinic);
router.get("/:id", clinicController.getDetailClinic);
router.delete("/:id", authAdminMiddleware, clinicController.deleteClinic);

export default router;
