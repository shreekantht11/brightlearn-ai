import { Request, Response, NextFunction } from 'express';
import pool from '../../config/database';

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
