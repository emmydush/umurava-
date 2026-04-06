import express from 'express';
import { 
  createTalentProfile, 
  getTalentProfiles, 
  getTalentProfileById, 
  updateTalentProfile,
  getMyTalentProfile
} from '../controllers/talentController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateToken, requireRole(['talent', 'admin']), createTalentProfile);
router.get('/', getTalentProfiles);
router.get('/my-profile', authenticateToken, requireRole(['talent', 'admin']), getMyTalentProfile);
router.get('/:id', getTalentProfileById);
router.put('/:id', authenticateToken, requireRole(['talent', 'admin']), updateTalentProfile);

export { router as talentRoutes };
