import pool from '../../config/database';
import { StudyMaterial, CreateStudyMaterialRequest, UpdateStudyMaterialRequest, StudyMaterialSearchQuery } from './study-materials.model';

export class StudyMaterialsService {
  // Get study materials for enrolled courses only
  static async getUserStudyMaterials(userId: number, query: StudyMaterialSearchQuery = {}): Promise<{ materials: StudyMaterial[]; total: number }> {
    const connection = await pool.getConnection();
    try {
      let whereClause = 'WHERE sm.user_id = ?';
      const values: any[] = [userId];

      if (query.course_id) {
        whereClause += ' AND sm.course_id = ?';
        values.push(query.course_id);
      }

      if (query.category) {
        whereClause += ' AND sm.category = ?';
        values.push(query.category);
      }

      if (query.is_completed !== undefined) {
        whereClause += ' AND sm.is_completed = ?';
        values.push(query.is_completed);
      }

      if (query.q) {
        whereClause += ' AND (sm.title LIKE ? OR sm.description LIKE ?)';
        values.push(`%${query.q}%`, `%${query.q}%`);
      }

      // Count query
      const [countRows] = await connection.execute(
        `SELECT COUNT(*) as total FROM study_materials sm ${whereClause}`,
        values
      );
      const total = (countRows as any[])[0].total;

      // Data query
      const limit = query.limit || 50;
      const offset = query.offset || 0;

      const [rows] = await connection.execute(
        `SELECT sm.*, s.title as course_title, v.title as lesson_title
         FROM study_materials sm
         LEFT JOIN subjects s ON sm.course_id = s.id
         LEFT JOIN videos v ON sm.lesson_id = v.id
         ${whereClause}
         ORDER BY sm.upload_date DESC
         LIMIT ? OFFSET ?`,
        [...values, limit, offset]
      );

      const materials = (rows as any[]).map(row => ({
        ...row,
        upload_date: row.upload_date || row.created_at
      }));

      return { materials, total };
    } finally {
      connection.release();
    }
  }

  static async createStudyMaterial(userId: number, materialData: CreateStudyMaterialRequest): Promise<StudyMaterial> {
    const connection = await pool.getConnection();
    try {
      // Verify user is enrolled in the course
      const [enrollmentCheck] = await connection.execute(
        'SELECT id FROM enrollments WHERE user_id = ? AND subject_id = ?',
        [userId, materialData.course_id]
      );

      if ((enrollmentCheck as any[]).length === 0) {
        throw new Error('User must be enrolled in the course to add materials');
      }

      const [result] = await connection.execute(
        `INSERT INTO study_materials (user_id, course_id, lesson_id, title, description, file_url, file_type, file_size, category, is_completed, download_count, upload_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          userId,
          materialData.course_id,
          materialData.lesson_id || null,
          materialData.title,
          materialData.description,
          materialData.file_url,
          materialData.file_type,
          materialData.file_size,
          materialData.category,
          false,
          0
        ]
      );

      const insertId = (result as any).insertId;
      return await this.getStudyMaterialById(userId, insertId);
    } finally {
      connection.release();
    }
  }

  static async getStudyMaterialById(userId: number, materialId: number): Promise<StudyMaterial> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT sm.*, s.title as course_title, v.title as lesson_title
         FROM study_materials sm
         LEFT JOIN subjects s ON sm.course_id = s.id
         LEFT JOIN videos v ON sm.lesson_id = v.id
         WHERE sm.id = ? AND sm.user_id = ?`,
        [materialId, userId]
      );

      const material = (rows as any[])[0];
      if (!material) {
        throw new Error('Study material not found');
      }

      return {
        ...material,
        upload_date: material.upload_date || material.created_at
      };
    } finally {
      connection.release();
    }
  }

  static async updateStudyMaterial(userId: number, materialId: number, updateData: UpdateStudyMaterialRequest): Promise<StudyMaterial> {
    const connection = await pool.getConnection();
    try {
      const updateFields = [];
      const values = [];

      if (updateData.title !== undefined) {
        updateFields.push('title = ?');
        values.push(updateData.title);
      }
      if (updateData.description !== undefined) {
        updateFields.push('description = ?');
        values.push(updateData.description);
      }
      if (updateData.category !== undefined) {
        updateFields.push('category = ?');
        values.push(updateData.category);
      }
      if (updateData.is_completed !== undefined) {
        updateFields.push('is_completed = ?');
        values.push(updateData.is_completed);
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(materialId, userId);

      await connection.execute(
        `UPDATE study_materials SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
        values
      );

      return await this.getStudyMaterialById(userId, materialId);
    } finally {
      connection.release();
    }
  }

  static async deleteStudyMaterial(userId: number, materialId: number): Promise<void> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `DELETE FROM study_materials WHERE id = ? AND user_id = ?`,
        [materialId, userId]
      );

      if ((result as any).affectedRows === 0) {
        throw new Error('Study material not found');
      }
    } finally {
      connection.release();
    }
  }

  static async incrementDownloadCount(materialId: number): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE study_materials SET download_count = download_count + 1 WHERE id = ?',
        [materialId]
      );
    } finally {
      connection.release();
    }
  }

  static async getMaterialsByCourse(userId: number, courseId: number): Promise<StudyMaterial[]> {
    const result = await this.getUserStudyMaterials(userId, { course_id: courseId });
    return result.materials;
  }

  static async getCategories(userId: number): Promise<string[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT DISTINCT category FROM study_materials WHERE user_id = ? ORDER BY category',
        [userId]
      );

      return (rows as any[]).map(row => row.category);
    } finally {
      connection.release();
    }
  }
}
