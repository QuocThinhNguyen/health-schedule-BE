import express from 'express';
import allCodeController from "../controllers/AllCodeController.js";
import { authAdminMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/', authAdminMiddleware,allCodeController.createAllCode);

export default router;