import express from "express";
import clinicController from "../controllers/ClinicController.js";
import { authAdminMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../utils/uploadCloudinary.js";

const router = express.Router();

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
