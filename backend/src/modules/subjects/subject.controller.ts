import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';

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
    const [subjects]: any = await pool.query('SELECT id, title, slug, description FROM subjects WHERE id = ? AND is_published = TRUE', [subjectId]);
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
    const [sections]: any = await pool.query(
      'SELECT id, title, order_index FROM sections WHERE subject_id = ? ORDER BY order_index ASC',
      [subjectId]
    );

    if (sections.length === 0) return res.json([]);

    const sectionIds = sections.map((s: any) => s.id);
    
    // Fetch videos for these sections
    const [videos]: any = await pool.query(
      'SELECT id, section_id, title, duration_seconds, order_index FROM videos WHERE section_id IN (?) ORDER BY order_index ASC',
      [sectionIds]
    );

    // Group videos by section_id
    const tree = sections.map((section: any) => {
      const sectionVideos = videos.filter((v: any) => v.section_id === section.id);
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
