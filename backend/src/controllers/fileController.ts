import { Request, Response } from 'express';
import { FileUploadService } from '../services/fileUploadService';
import { TalentProfile } from '../models';

const fileUploadService = new FileUploadService();

export const uploadResume = async (req: Request & { user?: any, file?: Express.Multer.File }, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user._id.toString();
    
    // Check if user already has a talent profile
    let profile = await TalentProfile.findOne({ userId });
    
    if (!profile) {
      return res.status(404).json({ 
        message: 'Talent profile not found. Please create a profile first.' 
      });
    }

    // Parse the uploaded resume
    const parsedResume = await fileUploadService.parseResume(req.file.path, req.file.originalname);
    
    // Update the talent profile with parsed data
    if (parsedResume.extractedData) {
      const { firstName, lastName, email, phone, skills, experience, education } = parsedResume.extractedData;
      
      if (firstName) profile.firstName = firstName;
      if (lastName) profile.lastName = lastName;
      if (email) profile.email = email;
      if (phone) profile.phone = phone;
      if (skills && skills.length > 0) {
        // Merge with existing skills, avoiding duplicates
        const existingSkills = profile.skills || [];
        const newSkills = skills.filter(skill => !existingSkills.includes(skill));
        profile.skills = [...existingSkills, ...newSkills];
      }
      if (experience && experience.length > 0) {
        // Add to existing experience, converting to proper format
        const existingExperience = profile.experience || [];
        const formattedExperience = experience
          .filter(exp => exp.position && exp.company) // Only add valid entries
          .map(exp => ({
            company: exp.company || 'Unknown Company',
            position: exp.position || 'Unknown Position',
            startDate: new Date(), // Default to current date since we don't have specific dates
            description: exp.duration || `Duration: ${exp.duration || 'Not specified'}`
          }));
        profile.experience = [...existingExperience, ...formattedExperience];
      }
      if (education && education.length > 0) {
        // Add to existing education, converting to proper format
        const existingEducation = profile.education || [];
        const formattedEducation = education
          .filter(edu => edu.institution && edu.degree) // Only add valid entries
          .map(edu => ({
            institution: edu.institution || 'Unknown Institution',
            degree: edu.degree || 'Unknown Degree',
            field: edu.field || 'Not specified',
            startDate: new Date(), // Default to current date since we don't have specific dates
            description: `Field of study: ${edu.field || 'Not specified'}`
          }));
        profile.education = [...existingEducation, ...formattedEducation];
      }
    }
    
    // Store the resume text and URL
    profile.resumeText = parsedResume.text;
    profile.resumeUrl = `/uploads/${req.file.filename}`;
    
    await profile.save();
    
    // Clean up the uploaded file
    await fileUploadService.cleanupFile(req.file.path);
    
    res.json({
      message: 'Resume uploaded and parsed successfully',
      profile: {
        id: profile._id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        skills: profile.skills,
        resumeUrl: profile.resumeUrl,
        extractedData: parsedResume.extractedData
      }
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    
    // Clean up file on error
    if (req.file) {
      await fileUploadService.cleanupFile(req.file.path);
    }
    
    res.status(500).json({ message: 'Failed to upload and parse resume' });
  }
};

export const parseResumeOnly = async (req: Request & { user?: any, file?: Express.Multer.File }, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Parse the uploaded resume
    const parsedResume = await fileUploadService.parseResume(req.file.path, req.file.originalname);
    
    // Clean up the uploaded file
    await fileUploadService.cleanupFile(req.file.path);
    
    res.json({
      message: 'Resume parsed successfully',
      data: parsedResume
    });
  } catch (error) {
    console.error('Error parsing resume:', error);
    
    // Clean up file on error
    if (req.file) {
      await fileUploadService.cleanupFile(req.file.path);
    }
    
    res.status(500).json({ message: 'Failed to parse resume' });
  }
};
