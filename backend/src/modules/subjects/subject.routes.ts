import { Router } from 'express';
import { getSubjects, getSubjectById, getSubjectTree, enrollToSubject } from './subject.controller';
import { requireAuth } from '../../middleware/authMiddleware';

const router = Router();

// Public routes – no auth needed to browse
router.get('/', getSubjects);
router.get('/:subjectId', getSubjectById);

// Protected routes – must be logged in
router.get('/:subjectId/tree', requireAuth, getSubjectTree);
router.post('/:subjectId/enroll', requireAuth, enrollToSubject);

export default router;

