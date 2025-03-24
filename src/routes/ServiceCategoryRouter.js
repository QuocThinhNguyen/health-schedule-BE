import express from 'express';
import serviceCategoryController from '../controllers/ServiceCategoryController.js';
import upload from "../utils/fileUpload.js";
import {authAdminMiddleware} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/',serviceCategoryController.getServiceCategoryBySearch)
router.get('/dropdown', serviceCategoryController.getDropdownServiceCategory)
router.post('/',serviceCategoryController.createServiceCategory)
router.put('/:id',serviceCategoryController.updateServiceCategory)
router.delete('/:id',serviceCategoryController.deleteServiceCategory)

export default router