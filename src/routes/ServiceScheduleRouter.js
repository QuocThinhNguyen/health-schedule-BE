import express from "express";
import serviceScheduleController from "../controllers/ServiceScheduleController.js";
import upload from "../utils/fileUpload.js";
import { authAdminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", serviceScheduleController.getServiceBySearchAndFilter);
router.get("/:id", serviceScheduleController.getServiceScheduleBySerivceIdAndDate);
router.post("/", serviceScheduleController.createServiceSchedule);
router.put("/:id", serviceScheduleController.updateServiceSchedule);
router.delete("/:id", serviceScheduleController.deleteServiceSchedule);

export default router;