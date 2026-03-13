import { Router } from 'express';
import { getSubjects, getSubjectById, getSubjectTree } from './subject.controller';
import { requireAuth } from '../../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', getSubjects);
router.get('/:subjectId', getSubjectById);
router.get('/:subjectId/tree', getSubjectTree);

export default router;
