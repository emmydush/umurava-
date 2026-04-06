import express from 'express';
import { uploadResume, parseResumeOnly } from '../controllers/fileController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { FileUploadService } from '../services/fileUploadService';

const router = express.Router();
const fileUploadService = new FileUploadService();

// Upload and parse resume (updates talent profile)
router.post('/upload-resume', 
  authenticateToken, 
  requireRole(['talent', 'admin']), 
  fileUploadService.getMulterConfig().single('resume'), 
  uploadResume
);

// Parse resume only (returns parsed data without updating profile)
router.post('/parse-resume', 
  authenticateToken, 
  requireRole(['talent', 'admin']), 
  fileUploadService.getMulterConfig().single('resume'), 
  parseResumeOnly
);

export { router as fileRoutes };
