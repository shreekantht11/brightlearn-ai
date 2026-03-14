import { Router } from 'express';
import { enrollUser, getMyCourses, checkEnrollmentStatus } from './enrollment.controller';
import { requireAuth } from '../../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/my-courses', getMyCourses);
router.get('/:subjectId/status', checkEnrollmentStatus);
router.post('/:subjectId', enrollUser);

export default router;
