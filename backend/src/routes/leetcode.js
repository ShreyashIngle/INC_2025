import express from 'express';
import * as leetcodeController from '../controllers/leetcodeController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile/:username', authenticate, leetcodeController.getUserProfile);
router.get('/solved/:username', authenticate, leetcodeController.getProblemsSolved);
router.get('/submissions/:username', authenticate, leetcodeController.getSubmissions);
router.get('/active-year/:username/:year', authenticate, leetcodeController.getActiveYear);
router.get('/contests/:username', authenticate, leetcodeController.getContests);
router.get('/badges/:username', authenticate, leetcodeController.getBadges);

export default router;