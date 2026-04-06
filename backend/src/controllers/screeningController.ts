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

    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    if (job.recruiterId.toString() !== recruiterId) {
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
    const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
    const limit = parseInt(req.query.limit as string) || 20;

    const candidates = await screeningService.getShortlistedCandidates(jobId, limit);

    res.json({
      message: 'Shortlisted candidates retrieved successfully',
      candidates
    });
  } catch (error) {
    console.error('Error getting shortlisted candidates:', error);
    res.status(500).json({ message: 'Internal server error' });
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
    const csvContent = await screeningService.exportShortlistToCSV(jobId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=shortlist_${jobId}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ message: 'Failed to export shortlist' });
  }
};
