import { Request, Response } from 'express';
import { StudyMaterialsService } from './study-materials.service';
import { CreateStudyMaterialRequest, UpdateStudyMaterialRequest, StudyMaterialSearchQuery } from './study-materials.model';
import pool from '../../config/database';

export const getUserStudyMaterials = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const query: StudyMaterialSearchQuery = {
      q: req.query.q as string,
      course_id: req.query.course_id ? parseInt(req.query.course_id as string) : undefined,
      category: req.query.category as string,
      is_completed: req.query.is_completed ? req.query.is_completed === 'true' : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    };

    const result = await StudyMaterialsService.getUserStudyMaterials(userId, query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting study materials:', error);
    res.status(500).json({ success: false, message: 'Failed to get study materials' });
  }
};

export const migrateStudyMaterials = async (req: Request, res: Response) => {
  try {
    // Create study_materials table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS study_materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        lesson_id INT NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        file_url VARCHAR(1000) NOT NULL,
        file_type VARCHAR(10) NOT NULL,
        file_size BIGINT NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'General',
        is_completed BOOLEAN DEFAULT FALSE,
        download_count INT DEFAULT 0,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_materials (user_id),
        INDEX idx_course_materials (course_id),
        INDEX idx_category (category),
        INDEX idx_upload_date (upload_date)
      )
    `;
    
    await pool.execute(createTableSQL);
    
    // Insert sample data
    const insertSQL = `
      INSERT IGNORE INTO study_materials (user_id, course_id, lesson_id, title, description, file_url, file_type, file_size, category) VALUES
      (1, 1, 1, 'Python Basics Cheat Sheet', 
      'Comprehensive reference guide covering Python syntax, data types, and basic operations', 
      '/materials/python-basics-cheatsheet.pdf', 'PDF', 2048576, 'Reference'),
      
      (1, 1, 2, 'Python Loops Exercises', 
      'Practice problems and solutions for mastering Python loops and iterations', 
      '/materials/python-loops-exercises.zip', 'ZIP', 3145728, 'Exercises'),
      
      (1, 2, 1, 'JavaScript Fundamentals', 
      'Core concepts and syntax of JavaScript programming language', 
      '/materials/js-fundamentals.pdf', 'PDF', 1782576, 'Reference'),
      
      (1, 2, 2, 'DOM Manipulation Guide', 
      'Complete guide to working with the Document Object Model', 
      '/materials/dom-manipulation.pdf', 'PDF', 2097152, 'Tutorial'),
      
      (1, 3, 1, 'React Components Tutorial', 
      'Understanding React component patterns and best practices', 
      '/materials/react-components.pdf', 'PDF', 2560000, 'Tutorial'),
      
      (2, 1, NULL, 'Python Study Guide', 
      'Comprehensive study guide for Python programming course', 
      '/materials/python-study-guide.pdf', 'PDF', 4194304, 'Study Guide'),
      
      (2, 2, NULL, 'JavaScript Reference', 
      'Quick reference for JavaScript syntax and common patterns', 
      '/materials/js-reference.pdf', 'PDF', 1048576, 'Reference')
    `;
    
    await pool.execute(insertSQL);
    
    res.json({ success: true, message: 'Study materials table created and populated with sample data' });
  } catch (error) {
    console.error('Error migrating study materials:', error);
    res.status(500).json({ success: false, message: 'Migration failed' });
  }
};

export const createStudyMaterial = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const materialData: CreateStudyMaterialRequest = req.body;

    const material = await StudyMaterialsService.createStudyMaterial(userId, materialData);
    res.status(201).json({ success: true, data: material });
  } catch (error) {
    console.error('Error creating study material:', error);
    if (error instanceof Error && error.message === 'User must be enrolled in the course to add materials') {
      res.status(403).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to create study material' });
    }
  }
};

export const getStudyMaterial = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const materialId = parseInt(req.params.id);

    const material = await StudyMaterialsService.getStudyMaterialById(userId, materialId);
    res.json({ success: true, data: material });
  } catch (error) {
    console.error('Error getting study material:', error);
    res.status(404).json({ success: false, message: 'Study material not found' });
  }
};

export const updateStudyMaterial = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const materialId = parseInt(req.params.id);
    const updateData: UpdateStudyMaterialRequest = req.body;

    const material = await StudyMaterialsService.updateStudyMaterial(userId, materialId, updateData);
    res.json({ success: true, data: material });
  } catch (error) {
    console.error('Error updating study material:', error);
    res.status(404).json({ success: false, message: 'Study material not found' });
  }
};

export const deleteStudyMaterial = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const materialId = parseInt(req.params.id);

    await StudyMaterialsService.deleteStudyMaterial(userId, materialId);
    res.json({ success: true, message: 'Study material deleted successfully' });
  } catch (error) {
    console.error('Error deleting study material:', error);
    res.status(404).json({ success: false, message: 'Study material not found' });
  }
};

export const downloadStudyMaterial = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const materialId = parseInt(req.params.id);

    // Get material to verify ownership
    const material = await StudyMaterialsService.getStudyMaterialById(userId, materialId);
    
    // Increment download count
    await StudyMaterialsService.incrementDownloadCount(materialId);
    
    // In a real implementation, you would serve the file here
    // For now, we'll just return the file URL
    res.json({ 
      success: true, 
      data: { 
        download_url: material.file_url,
        file_name: `${material.title}.${material.file_type.toLowerCase()}`
      } 
    });
  } catch (error) {
    console.error('Error downloading study material:', error);
    res.status(404).json({ success: false, message: 'Study material not found' });
  }
};

export const getMaterialsByCourse = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const courseId = parseInt(req.params.courseId);

    const materials = await StudyMaterialsService.getMaterialsByCourse(userId, courseId);
    res.json({ success: true, data: materials });
  } catch (error) {
    console.error('Error getting course materials:', error);
    res.status(500).json({ success: false, message: 'Failed to get course materials' });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const categories = await StudyMaterialsService.getCategories(userId);
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ success: false, message: 'Failed to get categories' });
  }
};
