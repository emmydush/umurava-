export interface IUser {
  _id?: string;
  email: string;
  password: string;
  role: 'recruiter' | 'talent' | 'admin';
  firstName: string;
  lastName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITalentProfile {
  _id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  title: string;
  summary: string;
  skills: string[];
  experience: Array<{
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate?: Date;
  }>;
  portfolio?: string;
  linkedin?: string;
  github?: string;
  resumeUrl?: string;
  resumeText?: string;
  resumeFile?: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
  };
  specialties: string[];
  availability: 'immediate' | '2weeks' | '1month' | '2months' | '3months';
  salaryExpectation?: {
    min: number;
    max: number;
    currency: string;
  };
  workType: 'fulltime' | 'freelance' | 'both';
  source: 'umurava_platform' | 'resume_upload';
  isStructured: boolean; // true if from Umurava platform, false if from resume parsing
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJobPosting {
  _id?: string;
  recruiterId: string;
  title: string;
  description: string;
  jdText?: string; // Raw job description text for AI processing
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  experience: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  location?: string;
  workType: 'fulltime' | 'freelance' | 'both';
  duration?: string;
  department?: string;
  isActive: boolean;
  idealProfile?: {
    experience: string;
    education: string;
    skills: string[];
    qualifications: string[];
    personalityTraits?: string[];
    certifications?: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IApplication {
  _id?: string;
  jobId: string;
  candidateId: string;
  status: 'pending' | 'screening' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: Date;
  aiScore?: number;
  aiRanking?: number;
  aiReasoning?: {
    overall: string;
    skills: Array<{
      skill: string;
      matched: boolean;
      relevance: number;
    }>;
    experience: {
      relevance: number;
      explanation: string;
    };
    education: {
      relevance: number;
      explanation: string;
    };
  };
  recruiterNotes?: string;
  lastUpdated?: Date;
}

export interface IScreeningResult {
  _id?: string;
  jobId: string;
  talentId: string;
  score: number;
  ranking: number;
  reasoning: {
    overall: string;
    skills: Array<{
      skill: string;
      matched: boolean;
      relevance: number;
    }>;
    experience: {
      relevance: number;
      explanation: string;
    };
    education: {
      relevance: number;
      explanation: string;
    };
  };
  shortlisted: boolean;
  talentProfileUpdatedAt: Date;
  createdAt?: Date;
}

export interface IScreeningSession {
  _id?: string;
  jobId: string;
  recruiterId: string;
  totalCandidates: number;
  shortlistedCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results: IScreeningResult[];
  shortlistExplanation?: string;
  createdAt?: Date;
  completedAt?: Date;
}
