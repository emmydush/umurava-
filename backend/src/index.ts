import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';

import { authRoutes } from './routes/auth';
import { jobRoutes } from './routes/jobs';
import { talentRoutes } from './routes/talents';
import { screeningRoutes } from './routes/screening';
import { fileRoutes } from './routes/files';
import { applicationRoutes } from './routes/applications';
import { adminRoutes } from './routes/admin';
import { debugRoutes } from './routes/debug';
import { generalLimiter, authLimiter, uploadLimiter, aiLimiter } from './middleware/rateLimit';
import { securityHeaders } from './middleware/security';
import { config } from './config';

const app = express();

app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24 hours
}));

app.use(securityHeaders);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is running' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/jobs', generalLimiter, jobRoutes);
app.use('/api/talents', generalLimiter, talentRoutes);
app.use('/api/screening', aiLimiter, screeningRoutes);
app.use('/api/files', uploadLimiter, fileRoutes);
app.use('/api/applications', generalLimiter, applicationRoutes);
app.use('/api/admin', generalLimiter, adminRoutes);
app.use('/api/debug', debugRoutes);

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const errorResponse = {
    message: isDevelopment ? error.message : 'Internal server error',
    ...(isDevelopment && { stack: error.stack })
  };

  res.status(error.status || 500).json(errorResponse);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
      console.log(`📊 API endpoints available at:`);
      console.log(`  - Health: http://localhost:${config.port}/health`);
      console.log(`  - Auth: http://localhost:${config.port}/api/auth`);
      console.log(`  - Jobs: http://localhost:${config.port}/api/jobs`);
      console.log(`  - Talents: http://localhost:${config.port}/api/talents`);
      console.log(`  - Screening: http://localhost:${config.port}/api/screening`);
      console.log(`  - Files: http://localhost:${config.port}/api/files`);
      console.log(`  - Applications: http://localhost:${config.port}/api/applications`);
      console.log(`  - Admin: http://localhost:${config.port}/api/admin`);
      console.log(`🔒 Security: Rate limiting and security headers enabled`);
      console.log(`📁 Uploads served from: /uploads`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  });
