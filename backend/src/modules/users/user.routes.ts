import { Router } from 'express';
import { getUserProfile } from './user.controller';
import { requireAuth } from '../../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/profile', getUserProfile);

export default router;
