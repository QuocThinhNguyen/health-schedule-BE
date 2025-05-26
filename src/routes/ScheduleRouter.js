import express from "express";
import scheduleController from "../controllers/ScheduleController.js";
import { authDoctorMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authDoctorMiddleware, scheduleController.getAllScheduleByDate); //Xử lí trả về tên bác sĩ, ngày làm việc và các ca trong ngày đó
router.get(
  "/clinic",
  authDoctorMiddleware,
  scheduleController.getScheduleByClinicAndDate
);
router.get("/:id", scheduleController.getScheduleByDate);
router.post("/", authDoctorMiddleware, scheduleController.createSchedule); //Xử lí tạo lịch làm việc cho bác sĩ
router.put("/:id", authDoctorMiddleware, scheduleController.updateSchedule);
router.delete("/:id", authDoctorMiddleware, scheduleController.deleteSchedule); //Xử lí cập nhật lịch làm việc cho bác sĩ
export default router;
