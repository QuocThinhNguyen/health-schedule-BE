import express from 'express';
import allCodeController from "../controllers/AllCodeController.js";
import { authAdminMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/', authAdminMiddleware,allCodeController.createAllCode);
router.put('/:id', authAdminMiddleware,allCodeController.updateAllCode);
router.get('/', authAdminMiddleware,allCodeController.getAllCode);
router.delete('/:id', authAdminMiddleware,allCodeController.deleteAllCode);

export default router;