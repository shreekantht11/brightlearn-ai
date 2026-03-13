import { Router } from 'express';
import { getVideoById, getFirstVideo } from './video.controller';
import { requireAuth } from '../../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/subject/:subjectId/first-video', getFirstVideo);
router.get('/:videoId', getVideoById);

export default router;
