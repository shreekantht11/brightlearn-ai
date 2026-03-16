import { Router } from 'express';
import { requireAuth } from '../../middleware/authMiddleware';
import {
  createNote,
  getNote,
  updateNote,
  deleteNote,
  getUserNotes,
  createFolder,
  getFolders,
  updateFolder,
  deleteFolder,
  summarizeNote,
  generateQuizFromNote
} from './notes.controller';

const router = Router();

// Folder routes - must come before note routes to avoid :id conflicts
router.post('/folders', requireAuth, createFolder);
router.get('/folders', requireAuth, getFolders);
router.put('/folders/:id', requireAuth, updateFolder);
router.delete('/folders/:id', requireAuth, deleteFolder);

// Note routes - all require authentication
router.post('/', requireAuth, createNote);
router.get('/', requireAuth, getUserNotes);
router.get('/:id', requireAuth, getNote);
router.put('/:id', requireAuth, updateNote);
router.delete('/:id', requireAuth, deleteNote);

// AI-powered features
router.post('/:id/summarize', requireAuth, summarizeNote);
router.post('/:id/generate-quiz', requireAuth, generateQuizFromNote);

export default router;
