import express from "express";
import serviceController from "../controllers/ServiceController.js";
import upload from "../utils/fileUpload.js";
import { authAdminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", serviceController.getServiceBySearchAndFilter);
router.get("/:id", serviceController.getServiceById);
router.post("/", upload.single("image"), serviceController.createService);
router.put("/:id", upload.single("image"), serviceController.updateService);
router.delete("/:id", serviceController.deleteService);

export default router;
