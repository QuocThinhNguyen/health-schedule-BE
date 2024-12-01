import express from 'express';
import doctorController from '../controllers/DoctorController.js';
import upload from "../utils/fileUpload.js";
import {authDoctorMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/dropdown', doctorController.getDropdownDoctors);
router.get('/search', doctorController.searchDoctor);
router.get('/', doctorController.getAllDoctor);
router.get('/:id', doctorController.getDoctorInfor);
router.put('/:id', authDoctorMiddleware, upload.single("image"), doctorController.updateDoctorInfor);

export default router;