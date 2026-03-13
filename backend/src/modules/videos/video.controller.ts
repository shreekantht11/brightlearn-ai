import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';

export const getVideoById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoId } = req.params;
    const [videos]: any = await pool.query(
      'SELECT v.*, s.subject_id FROM videos v JOIN sections s ON v.section_id = s.id WHERE v.id = ?',
      [videoId]
    );

    if (videos.length === 0) return res.status(404).json({ message: 'Video not found' });
    res.json(videos[0]);
  } catch (error) {
    next(error);
  }
};

export const getFirstVideo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subjectId } = req.params;

    const query = `
      SELECT v.id, v.title, v.youtube_url, v.description
      FROM videos v
      JOIN sections s ON v.section_id = s.id
      WHERE s.subject_id = ?
      ORDER BY s.order_index ASC, v.order_index ASC
      LIMIT 1
    `;

    const [videos]: any = await pool.query(query, [subjectId]);

    if (videos.length === 0) return res.status(404).json({ message: 'No videos found in this subject' });
    res.json(videos[0]);
  } catch (error) {
    next(error);
  }
};
