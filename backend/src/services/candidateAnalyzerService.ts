import { GoogleGenAI } from '@google/genai';
import { ITalentProfile } from '../types';
import { FileUploadService, ParsedResume } from './fileUploadService';

export interface AnalyzedCandidate {
  skills: {
    technical: string[];
    soft: string[];
    domain: string[];
  };
  experience: {
    totalYears: number;
    relevantYears: number;
    roles: Array<{
      title: string;
      company: string;
      duration: number; // in months
      relevance: number; // 0-1
      description: string;
    }>;
    projects: Array<{
      name: string;
      description: string;
      technologies: string[];
      impact: string;
    }>;
  };
  education: {
    level: 'high_school' | 'associate' | 'bachelor' | 'master' | 'phd' | 'none';
    field: string;
    institution: string;
    relevance: number; // 0-1
    year?: number;
  };
  certifications: Array<{
    name: string;
    issuer: string;
    date?: string;
    relevance: number; // 0-1
  }>;
  achievements: string[];
  careerProgression: {
    trajectory: 'growing' | 'stable' | 'declining' | 'changing_career';
    consistency: number; // 0-1
    leadership: number; // 0-1
  };
  summary: string;
}

export class CandidateAnalyzerService {
  private genAI: GoogleGenAI;
  private fileUploadService: FileUploadService;

  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    this.fileUploadService = new FileUploadService();
  }

  async analyzePlatformProfile(profile: ITalentProfile): Promise<AnalyzedCandidate> {
    const profileText = this.buildProfileText(profile);
    const prompt = this.buildPlatformProfilePrompt(profileText);
    
    try {
      const result = await this.genAI.models.generateContent({
        model: 'gemini-pro',
        contents: prompt
      });
      
      if (!result || !result.text) {
        throw new Error('Invalid response from Gemini API');
      }
      
      return this.parseCandidateResponse(result.text);
    } catch (error) {
      console.error('Platform profile analysis error:', error);
      throw new Error('Failed to analyze platform profile');
    }
  }

  async analyzeResume(resumeText: string): Promise<AnalyzedCandidate> {
    const prompt = this.buildResumePrompt(resumeText);
    
    try {
      const result = await this.genAI.models.generateContent({
        model: 'gemini-pro',
        contents: prompt
      });
      
      if (!result || !result.text) {
        throw new Error('Invalid response from Gemini API');
      }
      
      return this.parseCandidateResponse(result.text);
    } catch (error) {
      console.error('Resume analysis error:', error);
      throw new Error('Failed to analyze resume');
    }
  }

  async analyzeCandidateFromSource(
    profile: ITalentProfile,
    resumeFilePath?: string,
    resumeOriginalName?: string
  ): Promise<AnalyzedCandidate> {
    if (profile.source === 'umurava_platform' || profile.isStructured) {
      return this.analyzePlatformProfile(profile);
    } else if (resumeFilePath && resumeOriginalName) {
      const parsedResume = await this.fileUploadService.parseResume(resumeFilePath, resumeOriginalName);
      return this.analyzeResume(parsedResume.text);
    } else if (profile.resumeText) {
      return this.analyzeResume(profile.resumeText);
    } else {
      throw new Error('No valid data source for candidate analysis');
    }
  }

  private buildProfileText(profile: ITalentProfile): string {
    return `
CANDIDATE PROFILE:
Name: ${profile.firstName} ${profile.lastName}
Title: ${profile.title}
Summary: ${profile.summary}

SKILLS: ${profile.skills.join(', ')}
SPECIALTIES: ${profile.specialties.join(', ')}

EXPERIENCE:
${profile.experience.map(exp => `
- ${exp.position} at ${exp.company}
  Duration: ${exp.startDate.toLocaleDateString()} - ${exp.endDate ? exp.endDate.toLocaleDateString() : 'Present'}
  Description: ${exp.description}
`).join('\n')}

EDUCATION:
${profile.education.map(edu => `
- ${edu.degree} in ${edu.field}
  Institution: ${edu.institution}
  Duration: ${edu.startDate.toLocaleDateString()} - ${edu.endDate ? edu.endDate.toLocaleDateString() : 'Present'}
`).join('\n')}

ADDITIONAL INFO:
- Work Type: ${profile.workType}
- Availability: ${profile.availability}
- Portfolio: ${profile.portfolio || 'Not provided'}
- LinkedIn: ${profile.linkedin || 'Not provided'}
- GitHub: ${profile.github || 'Not provided'}

${profile.resumeText ? `\nRESUME TEXT:\n${profile.resumeText}` : ''}
`;
  }

  private buildPlatformProfilePrompt(profileText: string): string {
    return `
You are an expert talent analyst for Umurava Talent Marketplace. Analyze the following structured candidate profile and extract detailed insights for AI-powered job matching.

${profileText}

Please analyze this candidate profile and return a JSON object with the following structure:

{
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["communication", "leadership"],
    "domain": ["fintech", "healthcare"]
  },
  "experience": {
    "totalYears": 5,
    "relevantYears": 3,
    "roles": [
      {
        "title": "Senior Developer",
        "company": "Tech Corp",
        "duration": 24,
        "relevance": 0.9,
        "description": "Led development of microservices"
      }
    ],
    "projects": [
      {
        "name": "E-commerce Platform",
        "description": "Built full-stack e-commerce solution",
        "technologies": ["React", "Node.js", "MongoDB"],
        "impact": "Increased revenue by 30%"
      }
    ]
  },
  "education": {
    "level": "bachelor",
    "field": "Computer Science",
    "institution": "University of Technology",
    "relevance": 0.8,
    "year": 2018
  },
  "certifications": [
    {
      "name": "AWS Certified Developer",
      "issuer": "Amazon",
      "date": "2022",
      "relevance": 0.7
    }
  ],
  "achievements": ["Led team of 5 developers", "Published technical paper"],
  "careerProgression": {
    "trajectory": "growing",
    "consistency": 0.8,
    "leadership": 0.7
  },
  "summary": "Experienced full-stack developer with strong technical skills and leadership experience"
}

ANALYSIS GUIDELINES:
1. **Skills**: Categorize skills into technical, soft, and domain-specific
2. **Experience**: Calculate total years and relevant years for typical tech roles
3. **Roles**: Extract key roles with duration in months and relevance score (0-1)
4. **Projects**: Identify significant projects with technologies and impact
5. **Education**: Determine education level and relevance to tech roles
6. **Career Progression**: Assess career trajectory, consistency, and leadership potential
7. **Summary**: Provide a concise 2-3 sentence summary of the candidate

Be thorough and objective. Focus on information that would be valuable for matching with job requirements.
`;
  }

  private buildResumePrompt(resumeText: string): string {
    return `
You are an expert resume analyzer for Umurava Talent Marketplace. Analyze the following resume text and extract structured information for AI-powered job matching.

RESUME TEXT:
${resumeText}

Please analyze this resume and return a JSON object with the following structure:

{
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["communication", "leadership"],
    "domain": ["fintech", "healthcare"]
  },
  "experience": {
    "totalYears": 5,
    "relevantYears": 3,
    "roles": [
      {
        "title": "Senior Developer",
        "company": "Tech Corp",
        "duration": 24,
        "relevance": 0.9,
        "description": "Led development of microservices"
      }
    ],
    "projects": [
      {
        "name": "E-commerce Platform",
        "description": "Built full-stack e-commerce solution",
        "technologies": ["React", "Node.js", "MongoDB"],
        "impact": "Increased revenue by 30%"
      }
    ]
  },
  "education": {
    "level": "bachelor",
    "field": "Computer Science",
    "institution": "University of Technology",
    "relevance": 0.8,
    "year": 2018
  },
  "certifications": [
    {
      "name": "AWS Certified Developer",
      "issuer": "Amazon",
      "date": "2022",
      "relevance": 0.7
    }
  ],
  "achievements": ["Led team of 5 developers", "Published technical paper"],
  "careerProgression": {
    "trajectory": "growing",
    "consistency": 0.8,
    "leadership": 0.7
  },
  "summary": "Experienced full-stack developer with strong technical skills and leadership experience"
}

ANALYSIS GUIDELINES:
1. Extract information carefully from unstructured resume text
2. Calculate experience duration from dates mentioned
3. Identify skills from technical terms and project descriptions
4. Look for achievements, certifications, and education details
5. Assess career progression based on role changes and responsibilities
6. Focus on information relevant to professional/technical roles

Be thorough but conservative - only extract information that is clearly present in the resume.
`;
  }

  private parseCandidateResponse(responseText: string): AnalyzedCandidate {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in candidate analysis response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        skills: {
          technical: Array.isArray(parsed.skills?.technical) ? parsed.skills.technical : [],
          soft: Array.isArray(parsed.skills?.soft) ? parsed.skills.soft : [],
          domain: Array.isArray(parsed.skills?.domain) ? parsed.skills.domain : []
        },
        experience: {
          totalYears: Math.max(0, parseInt(parsed.experience?.totalYears) || 0),
          relevantYears: Math.max(0, parseInt(parsed.experience?.relevantYears) || 0),
          roles: Array.isArray(parsed.experience?.roles) ? parsed.experience.roles.map((role: any) => ({
            title: role.title || '',
            company: role.company || '',
            duration: Math.max(0, parseInt(role.duration) || 0),
            relevance: Math.min(1, Math.max(0, parseFloat(role.relevance) || 0)),
            description: role.description || ''
          })) : [],
          projects: Array.isArray(parsed.experience?.projects) ? parsed.experience.projects.map((project: any) => ({
            name: project.name || '',
            description: project.description || '',
            technologies: Array.isArray(project.technologies) ? project.technologies : [],
            impact: project.impact || ''
          })) : []
        },
        education: {
          level: this.validateEducationLevel(parsed.education?.level),
          field: parsed.education?.field || '',
          institution: parsed.education?.institution || '',
          relevance: Math.min(1, Math.max(0, parseFloat(parsed.education?.relevance) || 0)),
          year: parsed.education?.year ? parseInt(parsed.education.year) : undefined
        },
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications.map((cert: any) => ({
          name: cert.name || '',
          issuer: cert.issuer || '',
          date: cert.date,
          relevance: Math.min(1, Math.max(0, parseFloat(cert.relevance) || 0))
        })) : [],
        achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
        careerProgression: {
          trajectory: this.validateTrajectory(parsed.careerProgression?.trajectory),
          consistency: Math.min(1, Math.max(0, parseFloat(parsed.careerProgression?.consistency) || 0)),
          leadership: Math.min(1, Math.max(0, parseFloat(parsed.careerProgression?.leadership) || 0))
        },
        summary: parsed.summary || ''
      };
    } catch (error) {
      console.error('Failed to parse candidate response:', error);
      throw new Error('Invalid response format from candidate analyzer');
    }
  }

  private validateEducationLevel(level: string): 'high_school' | 'associate' | 'bachelor' | 'master' | 'phd' | 'none' {
    const validLevels = ['high_school', 'associate', 'bachelor', 'master', 'phd', 'none'];
    const normalized = (level || '').toLowerCase();
    return validLevels.includes(normalized) ? normalized as any : 'none';
  }

  private validateTrajectory(trajectory: string): 'growing' | 'stable' | 'declining' | 'changing_career' {
    const validTrajectories = ['growing', 'stable', 'declining', 'changing_career'];
    const normalized = (trajectory || '').toLowerCase();
    return validTrajectories.includes(normalized) ? normalized as any : 'stable';
  }
}
