import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';
import bcrypt from 'bcryptjs';

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const [users]: any = await pool.query(
      'SELECT id, email, name, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    
    res.json(users[0]);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { name, password } = req.body;

    if (!name && !password) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    if (name) {
      await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
    }

    const [updatedUsers]: any = await pool.query(
      'SELECT id, email, name, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({ message: 'Profile updated successfully', user: updatedUsers[0] });
  } catch (error) {
    next(error);
  }
};

export const getUserEnrollments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    const [enrollments]: any = await pool.query(
      `SELECT e.id, e.subject_id, s.title, s.slug, s.description
       FROM enrollments e
       JOIN subjects s ON e.subject_id = s.id
       WHERE e.user_id = ?`,
      [userId]
    );

    // Get progress for each subject
    const enrollmentsWithProgress = await Promise.all(enrollments.map(async (subj: any) => {
      const [videos]: any = await pool.query(
        `SELECT v.id FROM videos v JOIN sections sec ON v.section_id = sec.id WHERE sec.subject_id = ?`,
        [subj.subject_id]
      );
      
      const total = videos.length;
      let completed = 0;
      let percentage = 0;

      if (total > 0) {
        const videoIds = videos.map((v: any) => v.id);
        const [progress]: any = await pool.query(
          `SELECT COUNT(*) as completedCount FROM video_progress WHERE user_id = ? AND video_id IN (?) AND is_completed = TRUE`,
          [userId, videoIds]
        );
        completed = progress[0].completedCount;
        percentage = Math.round((completed / total) * 100);
      }

      return {
        ...subj,
        total_videos: total,
        completed_videos: completed,
        percentage
      };
    }));

    res.json(enrollmentsWithProgress);
  } catch (error) {
    next(error);
  }
};
