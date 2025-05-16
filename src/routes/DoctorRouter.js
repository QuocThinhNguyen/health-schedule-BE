import express from "express";
import doctorController from "../controllers/DoctorController.js";
import upload from "../utils/fileUpload.js";
import {
  authClinicMiddleware,
  authDoctorMiddleware,
  authUserMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/dropdown", doctorController.getDropdownDoctors);
router.get("/search", doctorController.searchDoctorByElasticeSearch);
router.get(
  "/academic-ranks-and-degrees",
  doctorController.getAcademicRanksAndDegrees
);
router.get("/price", doctorController.getPriceRange);
router.get("/", doctorController.getAllDoctor);
router.get("/:id", doctorController.getDoctorInfor);
router.put(
  "/:id",
  authDoctorMiddleware,
  upload.single("image"),
  doctorController.updateDoctorInfor
);
router.post("/clicked", authUserMiddleware, doctorController.doctorClickLog);

export default router;
