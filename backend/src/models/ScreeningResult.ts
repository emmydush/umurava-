import mongoose, { Schema, Document } from 'mongoose';
import { IScreeningResult } from '../types';

export interface IScreeningResultDocument extends Omit<IScreeningResult, '_id'>, Document {}

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

const ScreeningResultSchema = new Schema<IScreeningResultDocument>({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true
  } as any,
  talentId: {
    type: Schema.Types.ObjectId,
    ref: 'TalentProfile',
    required: true
  } as any,
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  ranking: {
    type: Number,
    required: true,
    min: 1
  },
  reasoning: {
    type: ReasoningSchema,
    required: true
  },
  shortlisted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

ScreeningResultSchema.index({ jobId: 1, ranking: 1 });
ScreeningResultSchema.index({ jobId: 1, score: -1 });
ScreeningResultSchema.index({ talentId: 1 });
ScreeningResultSchema.index({ shortlisted: 1 });

export const ScreeningResult = mongoose.model<IScreeningResultDocument>('ScreeningResult', ScreeningResultSchema);
