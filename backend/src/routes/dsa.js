import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import * as dsaController from '../controllers/dsaController.js';

const router = express.Router();

// Topic routes
router.post('/topics', authenticate, isAdmin, dsaController.createTopic);
router.get('/topics', authenticate, dsaController.getTopics);

// Question routes
router.post('/questions', authenticate, isAdmin, dsaController.createQuestion);
router.post('/questions/bulk', authenticate, isAdmin, dsaController.createBulkQuestions);
router.get('/topics/:topicId/questions', authenticate, dsaController.getQuestionsByTopic);
router.post('/questions/:questionId/notes', authenticate, dsaController.addNote);
router.post('/questions/:questionId/star', authenticate, dsaController.toggleStar);
router.post('/questions/:questionId/solve', authenticate, dsaController.markAsSolved);
router.get('/progress', authenticate, dsaController.getProgress);

export default router;