import { Request, Response } from 'express';
import { JobPosting } from '../models';

export const createJob = async (req: Request & { user?: any }, res: Response) => {
  try {
    const jobData = {
      ...req.body,
      recruiterId: req.user._id
    };

    const job = new JobPosting(jobData);
    await job.save();

    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getJobs = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { page = 1, limit = 10, workType, isActive = true } = req.query;
    
    const filter: any = {};
    if (req.user.role === 'recruiter') {
      filter.recruiterId = req.user._id;
    }
    if (workType) {
      filter.workType = workType;
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const jobs = await JobPosting.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await JobPosting.countDocuments(filter);

    res.json({
      message: 'Jobs retrieved successfully',
      jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await JobPosting.findById(id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({
      message: 'Job retrieved successfully',
      job
    });
  } catch (error) {
    console.error('Error getting job:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateJob = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    const job = await JobPosting.findById(id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this job' });
    }

    Object.assign(job, req.body);
    await job.save();

    res.json({
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteJob = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    const job = await JobPosting.findById(id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this job' });
    }

    await JobPosting.findByIdAndDelete(id);

    res.json({
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
