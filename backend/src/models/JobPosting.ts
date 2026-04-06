import mongoose, { Schema, Document } from 'mongoose';
import { IJobPosting } from '../types';

interface IJobPostingDocument extends Omit<IJobPosting, '_id'>, Document {}

const SalarySchema = new Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  currency: { type: String, default: 'USD' }
}, { _id: false });

const JobPostingSchema = new Schema<IJobPostingDocument>({
  recruiterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  } as any,
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: [{ type: String, trim: true }],
  responsibilities: [{ type: String, trim: true }],
  skills: [{ type: String, trim: true }],
  experience: {
    type: String,
    required: true
  },
  salary: SalarySchema,
  location: { type: String, trim: true },
  workType: {
    type: String,
    enum: ['fulltime', 'freelance', 'both'],
    default: 'both'
  },
  duration: { type: String, trim: true },
  department: { type: String, trim: true },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

JobPostingSchema.index({ skills: 1 });
JobPostingSchema.index({ workType: 1 });
JobPostingSchema.index({ isActive: 1 });
JobPostingSchema.index({ recruiterId: 1 });

export const JobPosting = mongoose.model<IJobPostingDocument>('JobPosting', JobPostingSchema);
