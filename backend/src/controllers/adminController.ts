import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import JobPosting, { IJobPosting } from '../models/JobPosting';
import Application from '../models/Application';
import { TalentProfile } from '../models/TalentProfile';
import { ScreeningSession } from '../models/ScreeningSession';

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user: IUser;
}

export const getSystemStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const [
      totalUsers,
      totalJobs,
      totalApplications,
      activeScreenings,
      totalRecruiters,
      totalTalents
    ] = await Promise.all([
      User.countDocuments(),
      JobPosting.countDocuments(),
      Application.countDocuments(),
      ScreeningSession.countDocuments({ status: 'processing' }),
      User.countDocuments({ role: 'recruiter' }),
      User.countDocuments({ role: 'talent' })
    ]);

    const stats = {
      totalUsers,
      totalJobs,
      totalApplications,
      activeScreenings,
      totalRecruiters,
      totalTalents,
      systemHealth: 'healthy' as const
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ message: 'Failed to fetch system stats' });
  }
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

export const getSystemActivities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Get recent activities from various collections
    const [
      recentJobs,
      recentApplications,
      recentScreenings,
      recentUsers
    ] = await Promise.all([
      JobPosting.find({}).sort({ createdAt: -1 }).limit(5).select('title createdAt recruiterId'),
      Application.find({}).sort({ createdAt: -1 }).limit(5).select('jobId candidateId status createdAt'),
      ScreeningSession.find({}).sort({ createdAt: -1 }).limit(5).select('jobId status createdAt'),
      User.find({}).sort({ createdAt: -1 }).limit(5).select('firstName lastName email role createdAt')
    ]);

    // Transform into activity format
    const activities = [
      ...recentJobs.map((job: IJobPosting) => ({
        _id: job._id,
        type: 'job_created',
        description: `New job posted: ${job.title}`,
        userId: job.recruiterId,
        createdAt: job.createdAt,
        userName: 'Recruiter'
      })),
      ...recentApplications.map((app: any) => ({
        _id: app._id,
        type: 'application_submitted',
        description: `Application ${app.status} for job ${app.jobId}`,
        userId: app.candidateId,
        createdAt: app.createdAt,
        userName: 'Candidate'
      })),
      ...recentScreenings.map((session: any) => ({
        _id: session._id,
        type: 'screening_started',
        description: `Screening session ${session.status} for job ${session.jobId}`,
        userId: session.recruiterId,
        createdAt: session.createdAt,
        userName: 'Recruiter'
      })),
      ...recentUsers.map((user: IUser) => ({
        _id: user._id,
        type: 'user_registered',
        description: `New ${user.role} registered: ${user.firstName} ${user.lastName}`,
        userId: user._id,
        createdAt: user.createdAt,
        userName: `${user.firstName} ${user.lastName}`
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
     .slice(0, 20);

    res.json({ activities });
  } catch (error) {
    console.error('Error fetching system activities:', error);
    res.status(500).json({ message: 'Failed to fetch system activities' });
  }
};

export const getUserDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get additional details based on user role
    let additionalDetails = {};
    
    if (user.role === 'talent') {
      const talentProfile = await TalentProfile.findOne({ userId: user._id });
      additionalDetails = { talentProfile };
    } else if (user.role === 'recruiter') {
      const jobs = await JobPosting.find({ recruiterId: user._id }).select('title isActive createdAt');
      additionalDetails = { jobs };
    }

    res.json({ user, ...additionalDetails });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { userId } = req.params;
    const { role } = req.body;
    
    if (!['talent', 'recruiter', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user, message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { userId } = req.params;
    
    // Don't allow admin to delete themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clean up related data based on role
    if (user.role === 'talent') {
      await TalentProfile.deleteMany({ userId: user._id });
      await Application.deleteMany({ candidateId: user._id });
    } else if (user.role === 'recruiter') {
      await JobPosting.deleteMany({ recruiterId: user._id });
      await ScreeningSession.deleteMany({ recruiterId: user._id });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};
