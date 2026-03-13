import { Router } from 'express';
import { getUserProfile, updateUserProfile, getUserEnrollments } from './user.controller';
import { requireAuth } from '../../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/enrollments', getUserEnrollments);

export default router;
