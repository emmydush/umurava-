import express from 'express';
import { 
  initiateScreening, 
  getScreeningResults, 
  getShortlistedCandidates, 
  getScreeningSessions,
  downloadShortlistCSV
} from '../controllers/screeningController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole(['recruiter', 'admin']));

router.post('/initiate', initiateScreening);
router.get('/results/:sessionId', getScreeningResults);
router.get('/shortlisted/:jobId', getShortlistedCandidates);
router.get('/sessions', getScreeningSessions);
router.get('/export/:jobId', downloadShortlistCSV);

export { router as screeningRoutes };
