import { Request, Response } from 'express';
import { TalentProfile } from '../models';
import { CandidateAnalyzerService } from '../services/candidateAnalyzerService';
import { createCompleteTalentProfile } from '../examples/completeTalentProfile';
import { ITalentProfile } from '../types';

/**
 * Convert MongoDB document to ITalentProfile interface
 */
function convertToITalentProfile(doc: any): ITalentProfile {
  return {
    ...doc.toObject(),
    _id: doc._id?.toString()
  };
}

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
  } catch (error: any) {
    console.error('Error creating talent profile:', error);

    if (error.name === 'ValidationError') {
      const details = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        message: 'Talent profile validation failed',
        details
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Talent profile already exists for this user or duplicate field value',
        duplicateKey: error.keyValue
      });
    }

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
      return res.json({ profile: null });
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

export const updateMyTalentProfile = async (req: Request & { user?: any }, res: Response) => {
  try {
    let profile = await TalentProfile.findOne({ userId: req.user._id.toString() });

    if (!profile) {
      // Create profile if it doesn't exist - need all required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'title', 'summary'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          message: `Missing required fields for profile creation: ${missingFields.join(', ')}` 
        });
      }

      profile = new TalentProfile({
        ...req.body,
        userId: req.user._id.toString()
      });
    } else {
      // Update existing profile - only update provided fields
      const allowedFields = [
        'firstName', 'lastName', 'email', 'phone', 'location', 'title', 'summary',
        'skills', 'specialties', 'experience', 'education', 'portfolio', 'linkedin', 
        'github', 'workType', 'availability', 'salaryExpectation'
      ];
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined && profile) {
          (profile as any)[field] = req.body[field];
        }
      });
    }

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

export const createCompleteProfile = async (req: Request & { user?: any }, res: Response) => {
  try {
    const existingProfile = await TalentProfile.findOne({ userId: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Talent profile already exists' });
    }

    // Create a complete profile with provided data or defaults
    const profileData = createCompleteTalentProfile({
      ...req.body,
      userId: req.user._id,
      source: 'umurava_platform',
      isStructured: true
    });

    const profile = new TalentProfile(profileData);
    await profile.save();

    // Optionally analyze with AI if resume text is provided
    if (req.body.resumeText || req.body.resumeFile) {
      try {
        const analyzerService = new CandidateAnalyzerService();
        const profileData = convertToITalentProfile(profile);
        const parsedProfile = await analyzerService.normalizeCandidateProfile(profileData);
        
        // Update profile with AI analysis
        profile.parsedProfile = parsedProfile;
        await profile.save();
      } catch (aiError) {
        console.warn('AI analysis failed:', aiError);
        // Continue without AI analysis
      }
    }

    res.status(201).json({
      message: 'Complete talent profile created successfully',
      profile
    });
  } catch (error: any) {
    console.error('Error creating complete talent profile:', error);

    if (error.name === 'ValidationError') {
      const details = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        message: 'Talent profile validation failed',
        details
      });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProfileWithAnalysis = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await TalentProfile.findById(id);

    if (!profile) {
      return res.status(404).json({ message: 'Talent profile not found' });
    }

    // Perform AI analysis if not already done
    if (!profile.parsedProfile) {
      try {
        const analyzerService = new CandidateAnalyzerService();
        const profileData = convertToITalentProfile(profile);
        const parsedProfile = await analyzerService.normalizeCandidateProfile(profileData);
        
        profile.parsedProfile = parsedProfile;
        await profile.save();
      } catch (aiError) {
        console.warn('AI analysis failed:', aiError);
        // Continue without AI analysis
      }
    }

    res.json({
      message: 'Talent profile with analysis retrieved successfully',
      profile,
      analysis: profile.parsedProfile
    });
  } catch (error) {
    console.error('Error getting talent profile with analysis:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
