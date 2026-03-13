import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';

export const getSubjectProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user?.id;

    // Get all videos in this subject
    const [videos]: any = await pool.query(
      `SELECT v.id FROM videos v JOIN sections s ON v.section_id = s.id WHERE s.subject_id = ?`,
      [subjectId]
    );

    if (videos.length === 0) return res.json({ total: 0, completed: 0, percentage: 0 });

    const videoIds = videos.map((v: any) => v.id);

    // Get completed videos count for this user
    const [progress]: any = await pool.query(
      `SELECT COUNT(*) as completedCount FROM video_progress WHERE user_id = ? AND video_id IN (?) AND is_completed = TRUE`,
      [userId, videoIds]
    );

    const total = videoIds.length;
    const completed = progress[0].completedCount;
    const percentage = Math.round((completed / total) * 100);

    res.json({ total, completed, percentage });
  } catch (error) {
    next(error);
  }
};

export const getVideoProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoId } = req.params;
    const userId = req.user?.id;

    // Get subject and order of the current video
    const [currentVid]: any = await pool.query(
      `SELECT v.id, v.section_id, s.subject_id, s.order_index as sec_order, v.order_index as vid_order
       FROM videos v JOIN sections s ON v.section_id = s.id WHERE v.id = ?`,
      [videoId]
    );

    if (currentVid.length === 0) return res.status(404).json({ message: 'Video not found' });
    const { subject_id } = currentVid[0];

    // Get all videos in exact order
    const [allVids]: any = await pool.query(
      `SELECT v.id, v.title
       FROM videos v JOIN sections s ON v.section_id = s.id
       WHERE s.subject_id = ?
       ORDER BY s.order_index ASC, v.order_index ASC`,
      [subject_id]
    );

    const vidIndex = allVids.findIndex((v: any) => v.id === parseInt(videoId));
    const previousVideoId = vidIndex > 0 ? allVids[vidIndex - 1].id : null;
    const nextVideoId = vidIndex < allVids.length - 1 ? allVids[vidIndex + 1].id : null;

    let locked = false;
    if (previousVideoId) {
      const [prevProgress]: any = await pool.query(
        `SELECT is_completed FROM video_progress WHERE user_id = ? AND video_id = ?`,
        [userId, previousVideoId]
      );
      if (prevProgress.length === 0 || !prevProgress[0].is_completed) {
        locked = true; // Previous video is not completed
      }
    }

    const [currProgress]: any = await pool.query(
      `SELECT last_position_seconds, is_completed FROM video_progress WHERE user_id = ? AND video_id = ?`,
      [userId, videoId]
    );

    res.json({
      video_id: parseInt(videoId),
      previous_video_id: previousVideoId,
      next_video_id: nextVideoId,
      locked,
      progress: currProgress.length > 0 ? currProgress[0] : { last_position_seconds: 0, is_completed: false }
    });

  } catch (error) {
    next(error);
  }
};

export const updateVideoProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoId } = req.params;
    const userId = req.user?.id;
    const { last_position_seconds, is_completed } = req.body;

    const completedAt = is_completed ? new Date() : null;

    await pool.query(
      `INSERT INTO video_progress (user_id, video_id, last_position_seconds, is_completed, completed_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       last_position_seconds = VALUES(last_position_seconds),
       is_completed = VALUES(is_completed),
       completed_at = IF(is_completed = TRUE AND completed_at IS NULL, VALUES(completed_at), completed_at)`,
      [userId, videoId, last_position_seconds || 0, is_completed || false, completedAt]
    );

    res.json({ message: 'Progress updated successfully' });
  } catch (error) {
    next(error);
  }
};
