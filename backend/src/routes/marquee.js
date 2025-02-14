import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import * as marqueeController from '../controllers/marqueeController.js';

const router = express.Router();

router.post('/', authenticate, isAdmin, marqueeController.createMarquee);
router.get('/active', authenticate, marqueeController.getActiveMarquee);
router.put('/:id', authenticate, isAdmin, marqueeController.updateMarquee);
router.delete('/:id', authenticate, isAdmin, marqueeController.deleteMarquee);

export default router;