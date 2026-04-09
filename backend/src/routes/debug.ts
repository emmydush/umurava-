import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { User } from '../models';

const router = express.Router();

// Debug endpoint to check current user info
router.get('/current-user', authenticateToken, async (req: any, res) => {
  try {
    // Get fresh user data from database
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'Current user info',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt
      },
      tokenUser: req.user
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export { router as debugRoutes };
