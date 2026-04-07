import { Request, Response } from 'express';
import { Application, JobPosting, TalentProfile, ScreeningResult } from '../models';
import { AIPipelineService } from '../services/aiPipelineService';

export const createApplication = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { jobId, coverNote } = req.body;
    
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    // Get candidate's talent profile
    const talentProfile = await TalentProfile.findOne({ userId: req.user._id });
    if (!talentProfile) {
      return res.status(404).json({ message: 'Talent profile not found. Please create a profile first.' });
    }

    // Check if job exists and is still open
    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (!job.isActive) {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    // Check if application already exists
    const existingApplication = await Application.findOne({ 
      jobId: jobId, 
      candidateId: talentProfile._id 
    } as any);
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = new Application({
      jobId,
      candidateId: talentProfile._id,
      status: 'pending_score', // Changed from 'pending' to 'pending_score' as per requirements
      appliedAt: new Date(),
      recruiterNotes: coverNote || null // Store cover note in recruiterNotes field
    });

    await application.save();

    console.log(`Application created: ${application._id} - queuing for AI scoring`);
    // Trigger background scoring for this new application
    setImmediate(async () => {
      try {
        const aiPipeline = new AIPipelineService();
        await aiPipeline.processJobApplications({
          jobId: jobId.toString(),
          candidateIds: [talentProfile._id!.toString()],
          maxResults: 1
        });
      } catch (pipelineError) {
        console.error(`Background AI scoring failed for application ${application._id}:`, pipelineError);
      }
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application: {
        _id: application._id,
        jobId: application.jobId,
        status: application.status,
        appliedAt: application.appliedAt
      }
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const bulkCreateApplications = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { jobId, candidateIds } = req.body;
    
    if (!jobId || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({ 
        message: 'Job ID and candidate IDs array are required',
        maxBatchSize: 100
      });
    }

    if (candidateIds.length > 100) {
      return res.status(400).json({ 
        message: 'Maximum batch size is 100 applications',
        maxBatchSize: 100
      });
    }

    // Check if job exists
    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if candidates exist
    const candidates = await TalentProfile.find({ '_id': { $in: candidateIds } });
    if (candidates.length !== candidateIds.length) {
      return res.status(404).json({ 
        message: 'One or more candidates not found',
        foundCandidates: candidates.length,
        requestedCandidates: candidateIds.length
      });
    }

    // Check for existing applications
    const existingApplications = await Application.find({ 
      jobId, 
      candidateId: { $in: candidateIds } 
    });
    
    if (existingApplications.length > 0) {
      const existingCandidateIds = existingApplications.map(app => app.candidateId.toString());
      return res.status(400).json({
        message: 'Some candidates have already applied for this job',
        existingApplications: existingCandidateIds
      });
    }

    // Create applications in bulk
    const applications = candidateIds.map(candidateId => ({
      jobId,
      candidateId,
      status: 'pending',
      appliedAt: new Date()
    }));

    const createdApplications = await Application.insertMany(applications);

    res.status(201).json({
      message: 'Bulk applications created successfully',
      applications: createdApplications,
      count: createdApplications.length
    });
  } catch (error) {
    console.error('Error creating bulk applications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getApplications = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { page = 1, limit = 10, jobId, status, candidateId } = req.query;
    
    const filter: any = {};
    
    // Role-based filtering
    if (req.user.role === 'recruiter') {
      // Only show applications for recruiter's jobs
      const recruiterJobs = await JobPosting.find({ recruiterId: req.user._id }).select('_id');
      filter.jobId = { $in: recruiterJobs.map(job => job._id) };
    } else if (req.user.role === 'talent') {
      // Only show applications for talent's profile
      const talentProfile = await TalentProfile.findOne({ userId: req.user._id });
      if (talentProfile) {
        filter.candidateId = talentProfile._id;
      }
    }
    
    // Additional filters
    if (jobId) filter.jobId = jobId;
    if (status) filter.status = status;
    if (candidateId) filter.candidateId = candidateId;

    const applications = await Application.find(filter)
      .populate('jobId', 'title department location workType')
      .populate('candidateId', 'firstName lastName email title skills')
      .sort({ appliedAt: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Application.countDocuments(filter);

    res.json({
      message: 'Applications retrieved successfully',
      applications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error getting applications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getApplicationById = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    
    const application = await Application.findById(id)
      .populate('jobId')
      .populate('candidateId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Role-based access control
    if (req.user.role === 'recruiter') {
      const job = await JobPosting.findById(application.jobId);
      if (!job || (job.recruiterId.toString() !== req.user._id && req.user.role !== 'admin')) {
        return res.status(403).json({ message: 'Unauthorized to view this application' });
      }
    } else if (req.user.role === 'talent') {
      const talentProfile = await TalentProfile.findOne({ userId: req.user._id });
      if (!talentProfile || application.candidateId.toString() !== talentProfile._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized to view this application' });
      }
    }

    res.json({
      message: 'Application retrieved successfully',
      application
    });
  } catch (error) {
    console.error('Error getting application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateApplicationStatus = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    const { status, recruiterNotes } = req.body;
    
    if (!['pending', 'pending_score', 'scored', 'screening', 'under_review', 'shortlisted', 'rejected', 'hired'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(id).populate('jobId');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Only recruiters and admins can update application status
    if (req.user.role === 'recruiter') {
      const job = application.jobId as any;
      if (job.recruiterId.toString() !== req.user._id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized to update this application' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update application status' });
    }

    application.status = status;
    application.lastUpdated = new Date();
    if (recruiterNotes) {
      application.recruiterNotes = recruiterNotes;
    }

    await application.save();

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const triggerAIScoring = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { jobId, candidateIds, maxResults = 20 } = req.body;
    
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    // Check if job exists and user has permission
    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to trigger AI scoring for this job' });
    }

    // Initialize AI pipeline service
    const aiPipeline = new AIPipelineService();

    // Start processing (this could be made asynchronous with a job queue for production)
    console.log(`Starting AI pipeline processing for job ${jobId}`);
    
    const pipelineResult = await aiPipeline.processJobApplications({
      jobId,
      candidateIds,
      maxResults
    });

    res.json({
      message: 'AI scoring pipeline completed successfully',
      result: pipelineResult,
      summary: {
        jobId: pipelineResult.jobId,
        jobTitle: pipelineResult.jobTitle,
        totalCandidates: pipelineResult.totalCandidates,
        processedCandidates: pipelineResult.processedCandidates,
        topCandidates: pipelineResult.ranking.candidates.slice(0, 10).map(c => ({
          candidateId: c.candidateId,
          candidateName: c.candidateName,
          score: c.score.overallScore,
          rank: c.rank,
          recommendation: c.score.recommendation,
          explanation: c.score.explanation
        })),
        processingTime: `${pipelineResult.processingTime}ms`,
        errors: pipelineResult.errors
      }
    });
  } catch (error) {
    console.error('Error triggering AI scoring:', error);
    res.status(500).json({ 
      message: 'Failed to process AI scoring pipeline',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getPipelineStatus = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { jobId } = req.params;
    
    if (!jobId || typeof jobId !== 'string') {
      return res.status(400).json({ message: 'Valid Job ID is required' });
    }

    // Check if job exists and user has permission
    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to view pipeline status for this job' });
    }

    const aiPipeline = new AIPipelineService();
    const status = await aiPipeline.getPipelineStatus(jobId);

    res.json({
      message: 'Pipeline status retrieved successfully',
      status
    });
  } catch (error) {
    console.error('Error getting pipeline status:', error);
    res.status(500).json({ 
      message: 'Failed to get pipeline status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
