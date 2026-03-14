import { Router } from 'express';
import { getSubjects, getSubjectById, getSubjectTree, enrollToSubject } from './subject.controller';
import { requireAuth } from '../../middleware/authMiddleware';

const router = Router();

// Public routes – no auth needed to browse
router.get('/', getSubjects);
router.get('/:subjectId', getSubjectById);
router.get('/:subjectId/tree', getSubjectTree);

// Protected routes – must be logged in
router.post('/:subjectId/enroll', requireAuth, enrollToSubject);

export default router;

