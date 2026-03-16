import pool from '../../config/database';
import { Note, NoteFolder, CreateNoteRequest, UpdateNoteRequest, NoteSearchQuery } from './notes.model';

export class NotesService {
  // Notes CRUD operations
  static async createNote(userId: number, noteData: CreateNoteRequest): Promise<Note> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO notes (user_id, course_id, lesson_id, title, content, tags, folder_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          noteData.course_id,
          noteData.lesson_id || null,
          noteData.title,
          noteData.content,
          JSON.stringify(noteData.tags || []),
          noteData.folder_id || null
        ]
      );

      const insertId = (result as any).insertId;
      return await this.getNoteById(userId, insertId);
    } finally {
      connection.release();
    }
  }

  static async getNoteById(userId: number, noteId: number): Promise<Note> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM notes WHERE id = ? AND user_id = ?`,
        [noteId, userId]
      );

      const note = (rows as any[])[0];
      if (!note) {
        throw new Error('Note not found');
      }

      return {
        ...note,
        tags: note.tags ? JSON.parse(note.tags) : [],
        attachments: note.attachments ? JSON.parse(note.attachments) : []
      };
    } finally {
      connection.release();
    }
  }

  static async updateNote(userId: number, noteId: number, updateData: UpdateNoteRequest): Promise<Note> {
    const connection = await pool.getConnection();
    try {
      const updateFields = [];
      const values = [];

      if (updateData.title !== undefined) {
        updateFields.push('title = ?');
        values.push(updateData.title);
      }
      if (updateData.content !== undefined) {
        updateFields.push('content = ?');
        values.push(updateData.content);
      }
      if (updateData.tags !== undefined) {
        updateFields.push('tags = ?');
        values.push(JSON.stringify(updateData.tags));
      }
      if (updateData.folder_id !== undefined) {
        updateFields.push('folder_id = ?');
        values.push(updateData.folder_id);
      }
      if (updateData.is_starred !== undefined) {
        updateFields.push('is_starred = ?');
        values.push(updateData.is_starred);
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(noteId, userId);

      await connection.execute(
        `UPDATE notes SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
        values
      );

      return await this.getNoteById(userId, noteId);
    } finally {
      connection.release();
    }
  }

  static async deleteNote(userId: number, noteId: number): Promise<void> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `DELETE FROM notes WHERE id = ? AND user_id = ?`,
        [noteId, userId]
      );

      if ((result as any).affectedRows === 0) {
        throw new Error('Note not found');
      }
    } finally {
      connection.release();
    }
  }

  static async getUserNotes(userId: number, query: NoteSearchQuery = {}): Promise<{ notes: Note[]; total: number }> {
    const connection = await pool.getConnection();
    try {
      let whereClause = 'WHERE n.user_id = ?';
      const values: any[] = [userId];

      if (query.course_id) {
        whereClause += ' AND n.course_id = ?';
        values.push(query.course_id);
      }

      if (query.folder_id) {
        whereClause += ' AND n.folder_id = ?';
        values.push(query.folder_id);
      }

      if (query.q) {
        whereClause += ' AND (n.title LIKE ? OR n.content LIKE ?)';
        values.push(`%${query.q}%`, `%${query.q}%`);
      }

      if (query.tags && query.tags.length > 0) {
        const tagConditions = query.tags.map(() => 'JSON_CONTAINS(n.tags, ?)').join(' OR ');
        whereClause += ` AND (${tagConditions})`;
        values.push(...query.tags.map(tag => JSON.stringify(String(tag))));
      }

      // Count query
      const [countRows] = await connection.execute(
        `SELECT COUNT(*) as total FROM notes n ${whereClause}`,
        values
      );
      const total = (countRows as any[])[0].total;

      // Sort and pagination
      let orderClause = 'ORDER BY n.updated_at DESC';
      if (query.sort) {
        switch (query.sort) {
          case 'newest':
            orderClause = 'ORDER BY n.created_at DESC';
            break;
          case 'oldest':
            orderClause = 'ORDER BY n.created_at ASC';
            break;
          case 'updated':
            orderClause = 'ORDER BY n.updated_at DESC';
            break;
          case 'title':
            orderClause = 'ORDER BY n.title ASC';
            break;
        }
      }

      const limit = query.limit || 50;
      const offset = query.offset || 0;

      const [rows] = await connection.execute(
        `SELECT n.*, s.title as course_title, v.title as lesson_title
         FROM notes n
         LEFT JOIN subjects s ON n.course_id = s.id
         LEFT JOIN videos v ON n.lesson_id = v.id
         ${whereClause}
         ${orderClause}
         LIMIT ? OFFSET ?`,
        [...values, limit, offset]
      );

      const notes = (rows as any[]).map(row => ({
        ...row,
        tags: row.tags ? JSON.parse(row.tags) : [],
        attachments: row.attachments ? JSON.parse(row.attachments) : []
      }));

      return { notes, total };
    } finally {
      connection.release();
    }
  }

  // Folder operations
  static async createFolder(userId: number, name: string, color?: string): Promise<NoteFolder> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO note_folders (user_id, name, color) VALUES (?, ?, ?)`,
        [userId, name, color || '#3B82F6']
      );

      const insertId = (result as any).insertId;
      return await this.getFolderById(userId, insertId);
    } finally {
      connection.release();
    }
  }

  static async getFolderById(userId: number, folderId: number): Promise<NoteFolder> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM note_folders WHERE id = ? AND user_id = ?`,
        [folderId, userId]
      );

      const folder = (rows as any[])[0];
      if (!folder) {
        throw new Error('Folder not found');
      }

      return folder;
    } finally {
      connection.release();
    }
  }

  static async getUserFolders(userId: number): Promise<NoteFolder[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT f.*, COUNT(n.id) as note_count
         FROM note_folders f
         LEFT JOIN notes n ON f.id = n.folder_id
         WHERE f.user_id = ?
         GROUP BY f.id
         ORDER BY f.name`,
        [userId]
      );

      return rows as NoteFolder[];
    } finally {
      connection.release();
    }
  }

  static async updateFolder(userId: number, folderId: number, name: string, color?: string): Promise<NoteFolder> {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `UPDATE note_folders SET name = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
        [name, color || '#3B82F6', folderId, userId]
      );

      return await this.getFolderById(userId, folderId);
    } finally {
      connection.release();
    }
  }

  static async deleteFolder(userId: number, folderId: number): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Move notes from this folder to root (folder_id = NULL)
      await connection.execute(
        `UPDATE notes SET folder_id = NULL WHERE folder_id = ? AND user_id = ?`,
        [folderId, userId]
      );

      // Delete the folder
      await connection.execute(
        `DELETE FROM note_folders WHERE id = ? AND user_id = ?`,
        [folderId, userId]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
