import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getSystemStats,
  getAllUsers,
  getSystemActivities,
  getUserDetails,
  updateUserRole,
  deleteUser
} from '../controllers/adminController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// System stats endpoint
router.get('/stats', getSystemStats as any);

// User management endpoints
router.get('/users', getAllUsers as any);
router.get('/users/:userId', getUserDetails as any);
router.put('/users/:userId/role', updateUserRole as any);
router.delete('/users/:userId', deleteUser as any);

// System activities endpoint
router.get('/activities', getSystemActivities as any);

export { router as adminRoutes };
