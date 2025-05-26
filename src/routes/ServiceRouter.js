import express from "express";
import serviceController from "../controllers/ServiceController.js";
import upload from "../utils/fileUpload.js";
import { authClinicMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", serviceController.getServiceBySearchAndFilter);
router.get("/clinic",authClinicMiddleware, serviceController.getServiceByClinic);
router.get("/:id", serviceController.getServiceById);
router.post("/",authClinicMiddleware, upload.single("image"), serviceController.createService);
router.put("/:id",authClinicMiddleware, upload.single("image"), serviceController.updateService);
router.delete("/:id", authClinicMiddleware, serviceController.deleteService);

export default router;
