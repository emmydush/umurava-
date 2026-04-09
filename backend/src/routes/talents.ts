import express from 'express';
import { 
  createTalentProfile, 
  getTalentProfiles, 
  getTalentProfileById, 
  updateTalentProfile,
  getMyTalentProfile,
  updateMyTalentProfile,
  createCompleteProfile,
  getProfileWithAnalysis
} from '../controllers/talentController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Basic CRUD operations
router.post('/', authenticateToken, requireRole(['talent', 'admin']), createTalentProfile);
router.get('/', getTalentProfiles);
router.get('/my-profile', authenticateToken, getMyTalentProfile);
router.put('/profile', authenticateToken, requireRole(['talent', 'admin']), updateMyTalentProfile);
router.get('/:id', getTalentProfileById);
router.put('/:id', authenticateToken, requireRole(['talent', 'admin']), updateTalentProfile);

// Enhanced profile operations
router.post('/complete', authenticateToken, requireRole(['talent', 'admin']), createCompleteProfile);
router.get('/:id/analysis', getProfileWithAnalysis);

export { router as talentRoutes };
