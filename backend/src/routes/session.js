import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import * as sessionController from '../controllers/sessionController.js';

const router = express.Router();

router.post('/', authenticate, isAdmin, sessionController.createSession);
router.get('/', authenticate, sessionController.getSessions);
router.delete('/:id', authenticate, isAdmin, sessionController.deleteSession);

export default router;