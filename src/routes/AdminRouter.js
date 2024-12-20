import express from "express";
import adminController from "../controllers/AdminController.js";
import { authAdminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/homepage", authAdminMiddleware, adminController.adminHomePage);
router.get("/revenue-chart", adminController.revenueChart);

export default router;
