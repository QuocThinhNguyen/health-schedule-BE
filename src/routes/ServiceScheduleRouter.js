import express from "express";
import serviceScheduleController from "../controllers/ServiceScheduleController.js";
import upload from "../utils/fileUpload.js";
import { authClinicMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", serviceScheduleController.getServiceBySearchAndFilter);
router.get("/:id", serviceScheduleController.getServiceScheduleBySerivceIdAndDate);
router.post("/",authClinicMiddleware, serviceScheduleController.createServiceSchedule);
router.put("/:id",  authClinicMiddleware, serviceScheduleController.updateServiceSchedule);
router.delete("/:id", authClinicMiddleware, serviceScheduleController.deleteServiceSchedule);

export default router;