import pool from '../../config/database';

export class EnrollmentRepository {
  async enrollUser(userId: number, subjectId: number) {
    const [result]: any = await pool.query(
      'INSERT IGNORE INTO enrollments (user_id, subject_id) VALUES (?, ?)',
      [userId, subjectId]
    );
    return result;
  }

  async checkEnrollment(userId: number, subjectId: number) {
    const [rows]: any = await pool.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND subject_id = ?',
      [userId, subjectId]
    );
    return rows.length > 0;
  }

  async getMyCourses(userId: number) {
    const [rows]: any = await pool.query(
      `SELECT s.id, s.title, s.description, s.slug
       FROM enrollments e
       JOIN subjects s ON e.subject_id = s.id
       WHERE e.user_id = ?
       ORDER BY e.id DESC`,
      [userId]
    );

    const result = [];
    for (const course of rows) {
      const [totalRows]: any = await pool.query(
        `SELECT COUNT(*) as total FROM videos v JOIN sections sec ON v.section_id = sec.id WHERE sec.subject_id = ?`,
        [course.id]
      );
      const totalLessons = totalRows[0].total;

      const [completedRows]: any = await pool.query(
        `SELECT COUNT(*) as completed FROM video_progress vp 
         JOIN videos v ON vp.video_id = v.id 
         JOIN sections sec ON v.section_id = sec.id 
         WHERE sec.subject_id = ? AND vp.user_id = ? AND vp.is_completed = TRUE`,
        [course.id, userId]
      );
      const completedLessons = completedRows[0].completed;

      let progress = 0;
      if (totalLessons > 0) {
        progress = Math.round((completedLessons / totalLessons) * 100);
      }

      result.push({
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=340&fit=crop",
        progressPercentage: progress,
        totalLessons,
        completedLessons
      });
    }

    return result;
  }
}
