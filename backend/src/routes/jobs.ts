import express from 'express';
import { 
  createJob, 
  getJobs, 
  getJobById, 
  updateJob, 
  deleteJob 
} from '../controllers/jobController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateToken, requireRole(['recruiter', 'admin']), createJob);
router.get('/', authenticateToken, getJobs);
router.get('/:id', getJobById);
router.put('/:id', authenticateToken, requireRole(['recruiter', 'admin']), updateJob);
router.delete('/:id', authenticateToken, requireRole(['recruiter', 'admin']), deleteJob);

export { router as jobRoutes };
