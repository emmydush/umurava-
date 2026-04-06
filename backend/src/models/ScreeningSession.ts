import mongoose, { Schema, Document } from 'mongoose';
import { IScreeningSession } from '../types';

interface IScreeningSessionDocument extends Omit<IScreeningSession, '_id'>, Document {}

const ScreeningSessionSchema = new Schema<IScreeningSessionDocument>({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true
  } as any,
  recruiterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  } as any,
  totalCandidates: {
    type: Number,
    required: true,
    min: 0
  },
  shortlistedCount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  results: [{
    type: Schema.Types.ObjectId,
    ref: 'ScreeningResult'
  }],
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

ScreeningSessionSchema.index({ jobId: 1 });
ScreeningSessionSchema.index({ recruiterId: 1 });
ScreeningSessionSchema.index({ status: 1 });

export const ScreeningSession = mongoose.model<IScreeningSessionDocument>('ScreeningSession', ScreeningSessionSchema);
