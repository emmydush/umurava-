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
  specialties: string[];
  availability: 'immediate' | '2weeks' | '1month' | '2months' | '3months';
  salaryExpectation?: {
    min: number;
    max: number;
    currency: string;
  };
  workType: 'fulltime' | 'freelance' | 'both';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJobPosting {
  _id?: string;
  recruiterId: string;
  title: string;
  description: string;
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
  createdAt?: Date;
  updatedAt?: Date;
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
  createdAt?: Date;
  completedAt?: Date;
}
