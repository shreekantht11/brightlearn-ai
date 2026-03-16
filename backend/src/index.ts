import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import pool from './config/database';
import { errorMiddleware } from './middleware/errorMiddleware';

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import subjectRoutes from './modules/subjects/subject.routes';
import videoRoutes from './modules/videos/video.routes';
import progressRoutes from './modules/progress/progress.routes';
import aiRoutes from './modules/ai/ai.routes';
import practiceRoutes from './modules/practice/practice.routes';
import enrollmentRoutes from './modules/enrollment/enrollment.routes';

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:8080',
      'http://localhost:5173',
      'https://brightlearn-ai.vercel.app',
      /\.vercel\.app$/, // allow all vercel deployment URLs
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/enroll', enrollmentRoutes);

// Error Middleware
app.use(errorMiddleware);

const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();

    console.log(
      `Database connected: ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME} (ssl=${env.DB_SSL ? 'on' : 'off'})`
    );

    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to database during startup:', error);
    process.exit(1);
  }
};

startServer();
