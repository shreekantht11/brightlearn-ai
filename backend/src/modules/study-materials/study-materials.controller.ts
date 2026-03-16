import { Request, Response } from 'express';
import { StudyMaterialsService } from './study-materials.service';
import { CreateStudyMaterialRequest, UpdateStudyMaterialRequest, StudyMaterialSearchQuery } from './study-materials.model';

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
