import { Request, Response } from 'express';
import { NotesService } from './notes.service';
import { CreateNoteRequest, UpdateNoteRequest, NoteSearchQuery } from './notes.model';

// Notes Controllers
export const createNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const noteData: CreateNoteRequest = req.body;
    
    const note = await NotesService.createNote(userId, noteData);
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ success: false, message: 'Failed to create note' });
  }
};

export const getNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const noteId = parseInt(req.params.id);
    
    const note = await NotesService.getNoteById(userId, noteId);
    res.json({ success: true, data: note });
  } catch (error) {
    console.error('Error getting note:', error);
    res.status(404).json({ success: false, message: 'Note not found' });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const noteId = parseInt(req.params.id);
    const updateData: UpdateNoteRequest = req.body;
    
    const note = await NotesService.updateNote(userId, noteId, updateData);
    res.json({ success: true, data: note });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(404).json({ success: false, message: 'Note not found' });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const noteId = parseInt(req.params.id);
    
    await NotesService.deleteNote(userId, noteId);
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(404).json({ success: false, message: 'Note not found' });
  }
};

export const getUserNotes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const query: NoteSearchQuery = {
      q: req.query.q as string,
      course_id: req.query.course_id ? parseInt(req.query.course_id as string) : undefined,
      folder_id: req.query.folder_id ? parseInt(req.query.folder_id as string) : undefined,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      sort: req.query.sort as any,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    };
    
    const result = await NotesService.getUserNotes(userId, query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting user notes:', error);
    res.status(500).json({ success: false, message: 'Failed to get notes' });
  }
};

// Folder Controllers
export const createFolder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, color } = req.body;
    
    const folder = await NotesService.createFolder(userId, name, color);
    res.status(201).json({ success: true, data: folder });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ success: false, message: 'Failed to create folder' });
  }
};

export const getFolders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const folders = await NotesService.getUserFolders(userId);
    res.json({ success: true, data: folders });
  } catch (error) {
    console.error('Error getting folders:', error);
    res.status(500).json({ success: false, message: 'Failed to get folders' });
  }
};

export const updateFolder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const folderId = parseInt(req.params.id);
    const { name, color } = req.body;
    
    const folder = await NotesService.updateFolder(userId, folderId, name, color);
    res.json({ success: true, data: folder });
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(404).json({ success: false, message: 'Folder not found' });
  }
};

export const deleteFolder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const folderId = parseInt(req.params.id);
    
    await NotesService.deleteFolder(userId, folderId);
    res.json({ success: true, message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(404).json({ success: false, message: 'Folder not found' });
  }
};

// AI-powered features
export const summarizeNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const noteId = parseInt(req.params.id);
    
    const note = await NotesService.getNoteById(userId, noteId);
    
    // TODO: Integrate with existing AI module
    // For now, return a simple summary
    const summary = `Summary of "${note.title}": ${note.content.substring(0, 200)}...`;
    
    res.json({ success: true, data: { summary } });
  } catch (error) {
    console.error('Error summarizing note:', error);
    res.status(500).json({ success: false, message: 'Failed to summarize note' });
  }
};

export const generateQuizFromNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const noteId = parseInt(req.params.id);
    
    const note = await NotesService.getNoteById(userId, noteId);
    
    // TODO: Integrate with existing AI module for quiz generation
    // For now, return sample questions
    const quiz = {
      title: `Quiz from ${note.title}`,
      questions: [
        {
          question: "What is the main topic of this note?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0
        }
      ]
    };
    
    res.json({ success: true, data: quiz });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to generate quiz' });
  }
};
