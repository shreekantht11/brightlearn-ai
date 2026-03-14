import { Request, Response, NextFunction } from 'express';
import { PracticeService } from './practice.service';

const service = new PracticeService();

export const getTests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subjectId = parseInt(req.params.subjectId);
    if (isNaN(subjectId)) return res.status(400).json({ message: 'Invalid subject ID' });

    const tests = await service.getTestsForSubject(subjectId);
    res.json(tests);
  } catch (error) {
    next(error);
  }
};

export const getTestQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const testId = parseInt(req.params.testId);
    if (isNaN(testId)) return res.status(400).json({ message: 'Invalid test ID' });

    const questions = await service.getTestQuestions(testId);
    res.json(questions);
  } catch (error) {
    next(error);
  }
};

export const submitTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { testId, answers } = req.body;

    if (!testId || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Missing testId or answers array' });
    }

    const result = await service.submitAttempt(userId, testId, answers);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUserResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const testId = parseInt(req.params.testId);
    if (isNaN(testId)) return res.status(400).json({ message: 'Invalid test ID' });

    const results = await service.getUserTestResults(userId, testId);
    res.json(results);
  } catch (error) {
    next(error);
  }
};
