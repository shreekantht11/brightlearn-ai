import { Router } from 'express';
import { requireAuth } from '../../middleware/authMiddleware';
import {
  getUserStudyMaterials,
  createStudyMaterial,
  getStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
  downloadStudyMaterial,
  getMaterialsByCourse,
  getCategories,
  migrateStudyMaterials
} from './study-materials.controller';

const router = Router();

// Migration endpoint (no auth required for setup)
router.post('/migrate', migrateStudyMaterials);

// All other routes require authentication
router.get('/', requireAuth, getUserStudyMaterials);
router.post('/', requireAuth, createStudyMaterial);
router.get('/categories', requireAuth, getCategories);
router.get('/course/:courseId', requireAuth, getMaterialsByCourse);
router.get('/:id', requireAuth, getStudyMaterial);
router.put('/:id', requireAuth, updateStudyMaterial);
router.delete('/:id', requireAuth, deleteStudyMaterial);
router.post('/:id/download', requireAuth, downloadStudyMaterial);

export default router;
