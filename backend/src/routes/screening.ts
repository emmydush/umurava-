import express from 'express';
import { 
  initiateScreening, 
  getScreeningResults, 
  getShortlistedCandidates, 
  getScreeningSessions 
} from '../controllers/screeningController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole(['recruiter', 'admin']));

router.post('/initiate', initiateScreening);
router.get('/results/:sessionId', getScreeningResults);
router.get('/shortlisted/:jobId', getShortlistedCandidates);
router.get('/sessions', getScreeningSessions);

export { router as screeningRoutes };
