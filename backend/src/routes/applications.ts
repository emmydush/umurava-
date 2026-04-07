import express from 'express';
import { 
  createApplication,
  bulkCreateApplications,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  triggerAIScoring,
  getPipelineStatus
} from '../controllers/applicationController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Application CRUD operations
router.post('/', authenticateToken, requireRole(['talent', 'recruiter', 'admin']), createApplication);
router.post('/bulk', authenticateToken, requireRole(['recruiter', 'admin']), bulkCreateApplications);
router.get('/', authenticateToken, getApplications);
router.get('/:id', authenticateToken, getApplicationById);
router.put('/:id/status', authenticateToken, requireRole(['recruiter', 'admin']), updateApplicationStatus);

// AI scoring pipeline trigger
router.post('/trigger-ai-scoring', authenticateToken, requireRole(['recruiter', 'admin']), triggerAIScoring);

// Pipeline status
router.get('/pipeline-status/:jobId', authenticateToken, requireRole(['recruiter', 'admin']), getPipelineStatus);

export { router as applicationRoutes };
