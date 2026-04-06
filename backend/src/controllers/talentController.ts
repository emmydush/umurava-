import { Request, Response } from 'express';
import { TalentProfile } from '../models';

export const createTalentProfile = async (req: Request & { user?: any }, res: Response) => {
  try {
    const profileData = {
      ...req.body,
      userId: req.user._id
    };

    const existingProfile = await TalentProfile.findOne({ userId: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Talent profile already exists' });
    }

    const profile = new TalentProfile(profileData);
    await profile.save();

    res.status(201).json({
      message: 'Talent profile created successfully',
      profile
    });
  } catch (error) {
    console.error('Error creating talent profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTalentProfiles = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      skills, 
      workType, 
      availability,
      search 
    } = req.query;
    
    const filter: any = {};
    
    if (skills) {
      const skillArray = Array.isArray(skills) ? skills : [skills];
      filter.skills = { $in: skillArray };
    }
    
    if (workType) {
      filter.workType = workType === 'both' ? { $in: ['fulltime', 'freelance', 'both'] } : { $in: [workType, 'both'] };
    }
    
    if (availability) {
      filter.availability = availability;
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }

    const profiles = await TalentProfile.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await TalentProfile.countDocuments(filter);

    res.json({
      message: 'Talent profiles retrieved successfully',
      profiles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error getting talent profiles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTalentProfileById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await TalentProfile.findById(id);

    if (!profile) {
      return res.status(404).json({ message: 'Talent profile not found' });
    }

    res.json({
      message: 'Talent profile retrieved successfully',
      profile
    });
  } catch (error) {
    console.error('Error getting talent profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTalentProfile = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await TalentProfile.findById(id);

    if (!profile) {
      return res.status(404).json({ message: 'Talent profile not found' });
    }

    if (profile.userId.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this profile' });
    }

    Object.assign(profile, req.body);
    await profile.save();

    res.json({
      message: 'Talent profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Error updating talent profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyTalentProfile = async (req: Request & { user?: any }, res: Response) => {
  try {
    const profile = await TalentProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Talent profile not found' });
    }

    res.json({
      message: 'Talent profile retrieved successfully',
      profile
    });
  } catch (error) {
    console.error('Error getting talent profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
