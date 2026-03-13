import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../config/database';
import { env } from '../../config/env';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [existing]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result]: any = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [email, passwordHash, name]
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    await pool.query('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))', [user.id, refreshToken]);

    res.json({ token, refreshToken, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

    const payload: any = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    const [tokens]: any = await pool.query('SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL AND user_id = ?', [refreshToken, payload.id]);
    
    if (tokens.length === 0) return res.status(403).json({ message: 'Invalid refresh token' });

    const [users]: any = await pool.query('SELECT * FROM users WHERE id = ?', [payload.id]);
    const user = users[0];

    const newToken = jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token: newToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?', [refreshToken]);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
