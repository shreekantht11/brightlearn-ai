import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import pool from '../../config/database';

type SubjectRow = RowDataPacket & {
  id: number;
  title: string;
  slug: string;
  description: string;
};

type SectionRow = RowDataPacket & {
  id: number;
  title: string;
  order_index: number;
};

type VideoRow = RowDataPacket & {
  id: number;
  section_id: number;
  title: string;
  description: string;
  youtube_url: string;
  duration_seconds: number;
  order_index: number;
};

export const getSubjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [subjects] = await pool.query('SELECT id, title, slug, description FROM subjects WHERE is_published = TRUE');
    res.json(subjects);
  } catch (error) {
    next(error);
  }
};

export const getSubjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subjectId } = req.params;
    const [subjects] = await pool.query<SubjectRow[]>(
      'SELECT id, title, slug, description FROM subjects WHERE id = ? AND is_published = TRUE',
      [subjectId]
    );
    if (subjects.length === 0) return res.status(404).json({ message: 'Subject not found' });
    res.json(subjects[0]);
  } catch (error) {
    next(error);
  }
};

export const getSubjectTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subjectId } = req.params;
    
    // Fetch sections
    const [sections] = await pool.query<SectionRow[]>(
      'SELECT id, title, order_index FROM sections WHERE subject_id = ? ORDER BY order_index ASC',
      [subjectId]
    );

    if (sections.length === 0) return res.json([]);

    const sectionIds = sections.map((section) => section.id);
    
    // Fetch videos for these sections
    const [videos] = await pool.query<VideoRow[]>(
      `SELECT id, section_id, title, description, youtube_url, duration_seconds, order_index
       FROM videos
       WHERE section_id IN (?)
       ORDER BY section_id ASC, order_index ASC`,
      [sectionIds]
    );

    // Group videos by section_id
    const tree = sections.map((section) => {
      const sectionVideos = videos.filter((video) => video.section_id === section.id);
      return {
        ...section,
        videos: sectionVideos
      };
    });

    res.json(tree);
  } catch (error) {
    next(error);
  }
};

export const enrollToSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user?.id;

    // Check if subject exists
    const [subjects] = await pool.query<Array<RowDataPacket & { id: number }>>(
      'SELECT id FROM subjects WHERE id = ?',
      [subjectId]
    );
    if (subjects.length === 0) return res.status(404).json({ message: 'Subject not found' });

    // Insert enrollment (ignore if already exists due to UNIQUE constraint)
    await pool.query(
      'INSERT IGNORE INTO enrollments (user_id, subject_id) VALUES (?, ?)',
      [userId, subjectId]
    );

    res.json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    next(error);
  }
};
