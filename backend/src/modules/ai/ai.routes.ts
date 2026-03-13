import { Router } from 'express';
import { chat, summarize, quiz } from './ai.controller';
import { requireAuth } from '../../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.post('/chat', chat);
router.post('/summarize', summarize);
router.post('/quiz', quiz);

export default router;
