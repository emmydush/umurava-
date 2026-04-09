import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { ScreeningService } from '../services/screeningService';
import { JobPosting } from '../models';

const screeningService = new ScreeningService();

export const initiateScreening = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { jobId } = req.body;
    const recruiterId = req.user._id.toString();

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: 'Invalid Job ID format' });
    }

    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    if (job.recruiterId?.toString() !== recruiterId) {
      return res.status(403).json({ message: 'Unauthorized to screen candidates for this job' });
    }

    const session = await screeningService.initiateScreening(jobId, recruiterId);

    res.status(201).json({
      message: 'Screening initiated successfully',
      session
    });
  } catch (error) {
    console.error('Error initiating screening:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getScreeningResults = async (req: Request & { user?: any }, res: Response) => {
  try {
    const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
    const userId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: 'Invalid Session ID format' });
    }

    const results = await screeningService.getScreeningResults(sessionId, userId);

    res.json({
      message: 'Screening results retrieved successfully',
      results
    });
  } catch (error) {
    console.error('Error getting screening results:', error);
    if (error instanceof Error && error.message === 'Screening session not found') {
      return res.status(404).json({ message: 'Screening session not found' });
    }
    if (error instanceof Error && error.message === 'Unauthorized access to screening results') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getShortlistedCandidates = async (req: Request & { user?: any }, res: Response) => {
  try {
    const jobId = (Array.isArray(req.params.jobId) ? req.params.jobId[0] : (req.params.jobId || req.params.id)) as string;
    
    console.log('Request received for shortlisted candidates:', {
      jobId,
      params: req.params,
      query: req.query,
      user: req.user?._id,
      role: req.user?.role
    });
    
    if (!jobId || jobId === 'undefined') {
      console.log('Invalid jobId - missing or undefined:', jobId);
      return res.status(400).json({ message: 'Job ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      console.log('Invalid jobId format received:', jobId);
      return res.status(400).json({ message: 'Invalid Job ID format' });
    }

    const limit = parseInt(req.query.limit as string) || 20;

    console.log('Getting shortlisted candidates for jobId:', jobId, 'limit:', limit);

    const job = await JobPosting.findById(jobId);
    if (!job) {
      console.log('Job not found:', jobId);
      return res.status(404).json({ message: 'Job not found' });
    }

    console.log('Job found:', {
      jobId: job._id,
      title: job.title,
      recruiterId: job.recruiterId,
      requesterId: req.user._id
    });

    // Safe comparison for recruiterId
    if (req.user.role === 'recruiter' && job.recruiterId && job.recruiterId.toString() !== req.user._id.toString()) {
      console.log('Unauthorized access attempt for job:', jobId, 'by recruiter:', req.user._id);
      return res.status(403).json({ message: 'Unauthorized to view shortlist for this job' });
    }

    const candidates = await screeningService.getShortlistedCandidates(jobId, limit);
    console.log(`Found ${candidates?.length || 0} candidates for jobId: ${jobId}`);

    // If no candidates found, return empty array with proper message
    if (!candidates || candidates.length === 0) {
      console.log(`No shortlisted candidates found for job ${jobId}. Screening may not have been completed.`);
      return res.json({
        message: 'No shortlisted candidates found. Screening may not have been completed for this job.',
        candidates: []
      });
    }

    res.json({
      message: 'Shortlisted candidates retrieved successfully',
      candidates
    });
  } catch (error: any) {
    console.error('Error getting shortlisted candidates:', error);
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      params: req.params,
      query: req.query,
      user: req.user?._id
    });
    res.status(500).json({ 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

export const getScreeningSessions = async (req: Request & { user?: any }, res: Response) => {
  try {
    const recruiterId = req.user._id.toString();

    const sessions = await screeningService.getAllScreeningSessions(recruiterId);

    res.json({
      message: 'Screening sessions retrieved successfully',
      sessions
    });
  } catch (error) {
    console.error('Error getting screening sessions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const downloadShortlistCSV = async (req: Request & { user?: any }, res: Response) => {
  try {
    const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
    const recruiterId = req.user._id.toString();

    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    if (job.recruiterId?.toString() !== recruiterId) {
      return res.status(403).json({ message: 'Unauthorized to download shortlist for this job' });
    }

    const csvContent = await screeningService.exportShortlistToCSV(jobId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=shortlist_${jobId}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ message: 'Failed to export shortlist' });
  }
};
