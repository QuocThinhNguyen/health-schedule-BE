import express from "express";
import serviceCategoryController from "../controllers/ServiceCategoryController.js";
import upload from "../utils/fileUpload.js";
import { authClinicMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", serviceCategoryController.getServiceCategoryBySearch);
router.get("/dropdown", serviceCategoryController.getDropdownServiceCategory);
router.get(
  "clinic",
  authClinicMiddleware,
  serviceCategoryController.getDropdownServiceCategoryByClinic
);
router.get("/:id", serviceCategoryController.getDetailServiceCategory);
router.post(
  "/",
  authClinicMiddleware,
  serviceCategoryController.createServiceCategory
);
router.put(
  "/:id",
  authClinicMiddleware,
  serviceCategoryController.updateServiceCategory
);
router.delete(
  "/:id",
  authClinicMiddleware,
  serviceCategoryController.deleteServiceCategory
);

export default router;
