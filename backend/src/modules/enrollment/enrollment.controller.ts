import { Request, Response, NextFunction } from 'express';
import { EnrollmentService } from './enrollment.service';

const service = new EnrollmentService();

export const enrollUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const subjectId = parseInt(req.params.subjectId);
    if (isNaN(subjectId)) return res.status(400).json({ message: 'Invalid subject ID' });

    const result = await service.enroll(userId, subjectId);
    if (result.success) {
      return res.status(201).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getMyCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const courses = await service.getMyCourses(userId);
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

export const checkEnrollmentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const subjectId = parseInt(req.params.subjectId);
    if (isNaN(subjectId)) return res.status(400).json({ message: 'Invalid subject ID' });

    const status = await service.checkStatus(userId, subjectId);
    res.json(status);
  } catch (error) {
    next(error);
  }
};
