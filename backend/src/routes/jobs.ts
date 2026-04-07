import express from 'express';
import { 
  createJob, 
  getJobs, 
  getJobById, 
  updateJob, 
  deleteJob 
} from '../controllers/jobController';
import { getShortlistedCandidates } from '../controllers/screeningController';
import { authenticateToken, optionalAuthenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateToken, requireRole(['recruiter', 'admin']), createJob);
router.get('/', optionalAuthenticateToken, getJobs);
router.get('/:id', getJobById);
router.get('/:id/shortlist', authenticateToken, requireRole(['recruiter', 'admin']), getShortlistedCandidates);
router.put('/:id', authenticateToken, requireRole(['recruiter', 'admin']), updateJob);
router.delete('/:id', authenticateToken, requireRole(['recruiter', 'admin']), deleteJob);

export { router as jobRoutes };
