import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorMiddleware } from './middleware/errorMiddleware';

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import subjectRoutes from './modules/subjects/subject.routes';
import videoRoutes from './modules/videos/video.routes';
import progressRoutes from './modules/progress/progress.routes';
import aiRoutes from './modules/ai/ai.routes';

const app = express();

app.use(cors());
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

// Error Middleware
app.use(errorMiddleware);

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
