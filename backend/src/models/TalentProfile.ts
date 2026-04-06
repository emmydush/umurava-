import mongoose, { Schema, Document } from 'mongoose';
import { ITalentProfile } from '../types';

interface ITalentProfileDocument extends Omit<ITalentProfile, '_id'>, Document {}

const ExperienceSchema = new Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  description: { type: String, required: true }
}, { _id: false });

const EducationSchema = new Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date }
}, { _id: false });

const SalaryExpectationSchema = new Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  currency: { type: String, default: 'USD' }
}, { _id: false });

const TalentProfileSchema = new Schema<ITalentProfileDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  } as any,
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  location: { type: String, trim: true },
  title: { type: String, required: true, trim: true },
  summary: { type: String, required: true },
  skills: [{ type: String, trim: true }],
  experience: [ExperienceSchema],
  education: [EducationSchema],
  portfolio: { type: String, trim: true },
  linkedin: { type: String, trim: true },
  github: { type: String, trim: true },
  resumeUrl: { type: String, trim: true },
  resumeText: { type: String },
  specialties: [{ type: String, trim: true }],
  availability: {
    type: String,
    enum: ['immediate', '2weeks', '1month', '2months', '3months'],
    default: 'immediate'
  },
  salaryExpectation: SalaryExpectationSchema,
  workType: {
    type: String,
    enum: ['fulltime', 'freelance', 'both'],
    default: 'both'
  }
}, {
  timestamps: true
});

TalentProfileSchema.index({ skills: 1 });
TalentProfileSchema.index({ specialties: 1 });
TalentProfileSchema.index({ workType: 1 });
TalentProfileSchema.index({ availability: 1 });

export const TalentProfile = mongoose.model<ITalentProfileDocument>('TalentProfile', TalentProfileSchema);
