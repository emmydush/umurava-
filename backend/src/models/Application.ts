import mongoose, { Schema, Document } from 'mongoose';
import { IApplication } from '../types';

interface IApplicationDocument extends Omit<IApplication, '_id'>, Document {}

const SkillMatchSchema = new Schema({
  skill: { type: String, required: true },
  matched: { type: Boolean, required: true },
  relevance: { type: Number, required: true, min: 0, max: 1 }
}, { _id: false });

const ReasoningSchema = new Schema({
  overall: { type: String, required: true },
  skills: [SkillMatchSchema],
  experience: {
    relevance: { type: Number, required: true, min: 0, max: 1 },
    explanation: { type: String, required: true }
  },
  education: {
    relevance: { type: Number, required: true, min: 0, max: 1 },
    explanation: { type: String, required: true }
  }
}, { _id: false });

const ApplicationSchema = new Schema<IApplicationDocument>({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true
  } as any,
  candidateId: {
    type: Schema.Types.ObjectId,
    ref: 'TalentProfile',
    required: true
  } as any,
  status: {
    type: String,
    enum: ['pending', 'screening', 'shortlisted', 'rejected', 'hired'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  aiScore: {
    type: Number,
    min: 0,
    max: 100
  },
  aiRanking: {
    type: Number,
    min: 1
  },
  aiReasoning: {
    type: ReasoningSchema
  },
  recruiterNotes: {
    type: String,
    trim: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
ApplicationSchema.index({ jobId: 1, status: 1 });
ApplicationSchema.index({ jobId: 1, aiRanking: 1 });
ApplicationSchema.index({ candidateId: 1 });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ appliedAt: -1 });

// Ensure a candidate can only apply once per job
ApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

export const Application = mongoose.model<IApplicationDocument>('Application', ApplicationSchema);
