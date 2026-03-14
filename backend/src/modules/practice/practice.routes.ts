import { Router } from 'express';
import { getTests, getTestQuestions, submitTest, getUserResults } from './practice.controller';
import { requireAuth } from '../../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/tests/:subjectId', getTests);
router.get('/test/:testId', getTestQuestions);
router.post('/submit', submitTest);
router.get('/results/:testId', getUserResults);

export default router;
