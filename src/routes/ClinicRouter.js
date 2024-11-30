import express from 'express';
import clinicController from "../controllers/ClinicController.js";
import upload from "../utils/fileUpload.js";
import {authAdminMiddleware} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/dropdown', clinicController.getDropdownClinics)
router.get('/', clinicController.filterClinics)
router.post('/', authAdminMiddleware, upload.single("image"), clinicController.createClinic)
router.put('/:id', authAdminMiddleware, upload.single("image"), clinicController.updateClinic)
router.get('/', clinicController.getAllClinic)
router.get('/:id', clinicController.getDetailClinic)
router.delete('/:id', authAdminMiddleware, clinicController.deleteClinic)

export default router