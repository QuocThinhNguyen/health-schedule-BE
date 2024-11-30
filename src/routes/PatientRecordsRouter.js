import express from "express";
import patientRecordsController from "../controllers/PatientRecordsController.js";
import { authUserMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authUserMiddleware, patientRecordsController.getAllPatientRecords);
router.get('/:id', authUserMiddleware,patientRecordsController.getPatientRecordsById);
router.get('/patient/:patientId', authUserMiddleware,patientRecordsController.getPatientRecordsByPatientId);
router.post('/', authUserMiddleware,patientRecordsController.createPatientRecord);
router.put('/:id', authUserMiddleware,patientRecordsController.updatePatientRecord);
router.delete('/:id', authUserMiddleware,patientRecordsController.deletePatientRecord)

export default router;