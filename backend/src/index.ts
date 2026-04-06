import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';

import { authRoutes } from './routes/auth';
import { jobRoutes } from './routes/jobs';
import { talentRoutes } from './routes/talents';
import { screeningRoutes } from './routes/screening';
import { fileRoutes } from './routes/files';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/talents', talentRoutes);
app.use('/api/screening', screeningRoutes);
app.use('/api/files', fileRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/umurava-ai-hackathon')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API endpoints available at:`);
      console.log(`  - Health: http://localhost:${PORT}/health`);
      console.log(`  - Auth: http://localhost:${PORT}/api/auth`);
      console.log(`  - Jobs: http://localhost:${PORT}/api/jobs`);
      console.log(`  - Talents: http://localhost:${PORT}/api/talents`);
      console.log(`  - Screening: http://localhost:${PORT}/api/screening`);
      console.log(`  - Files: http://localhost:${PORT}/api/files`);
    });
  })
  .catch((error) => {
    console.warn('MongoDB connection failed, running in demo mode:', error.message);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} (Demo Mode - No Database)`);
      console.log(`API endpoints available at:`);
      console.log(`  - Health: http://localhost:${PORT}/health`);
      console.log(`  - Auth: http://localhost:${PORT}/api/auth`);
      console.log(`  - Jobs: http://localhost:${PORT}/api/jobs`);
      console.log(`  - Talents: http://localhost:${PORT}/api/talents`);
      console.log(`  - Screening: http://localhost:${PORT}/api/screening`);
      console.log(`  - Files: http://localhost:${PORT}/api/files`);
      console.log(`Note: Database operations will fail - this is demo mode only`);
    });
  });
