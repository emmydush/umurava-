import { GoogleGenAI } from '@google/genai';
import { IJobPosting } from '../types';

export interface ParsedJobDescription {
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniorityLevel: 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | 'executive';
  domain: string;
  idealCandidateSummary: string;
  experience: {
    minimum: number;
    preferred: number;
    unit: 'years';
  };
  education: {
    required: boolean;
    level: 'high_school' | 'associate' | 'bachelor' | 'master' | 'phd' | 'none';
    field?: string;
  };
  responsibilities: string[];
  qualifications: string[];
  cultureFit: {
    workStyle: string[];
    teamEnvironment: string;
    companyValues: string[];
  };
}

export class JDParserService {
  private genAI: GoogleGenAI;

  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }

  async parseJobDescription(jobText: string, jobTitle?: string): Promise<ParsedJobDescription> {
    const prompt = this.buildJDParsingPrompt(jobText, jobTitle);
    
    try {
      const result = await this.genAI.models.generateContent({
        model: 'gemini-pro',
        contents: prompt
      });
      
      if (!result || !result.text) {
        throw new Error('Invalid response from Gemini API');
      }
      
      return this.parseJDResponse(result.text);
    } catch (error) {
      console.error('JD Parser error:', error);
      throw new Error('Failed to parse job description');
    }
  }

  async enhanceJobPosting(jobPosting: IJobPosting): Promise<IJobPosting> {
    // Use jdText if available, otherwise fall back to description
    const textToParse = jobPosting.jdText || jobPosting.description;
    
    const parsedJD = await this.parseJobDescription(textToParse, jobPosting.title);
    
    // Update job posting with parsed data
    const enhancedJob = { ...jobPosting };
    
    // Update skills with parsed required skills
    if (parsedJD.requiredSkills.length > 0) {
      enhancedJob.skills = [...new Set([...jobPosting.skills, ...parsedJD.requiredSkills])];
    }
    
    // Create ideal profile from parsed data
    enhancedJob.idealProfile = {
      experience: `${parsedJD.experience.minimum}+ years${parsedJD.experience.preferred > parsedJD.experience.minimum ? ` (preferably ${parsedJD.experience.preferred}+)` : ''}`,
      education: parsedJD.education.level === 'none' ? 'No specific education requirement' : `${parsedJD.education.level} degree${parsedJD.education.field ? ` in ${parsedJD.education.field}` : ''} required`,
      skills: parsedJD.requiredSkills,
      qualifications: parsedJD.qualifications,
      personalityTraits: parsedJD.cultureFit.workStyle,
      certifications: [] // Could be enhanced to extract certifications from JD
    };
    
    return enhancedJob;
  }

  private buildJDParsingPrompt(jobText: string, jobTitle?: string): string {
    return `
You are an expert job description analyst for Umurava Talent Marketplace. Analyze the following job description and extract structured information that will be used for AI-powered candidate matching.

${jobTitle ? `JOB TITLE: ${jobTitle}` : ''}

JOB DESCRIPTION TEXT:
${jobText}

Please analyze this job description and return a JSON object with the following structure:

{
  "requiredSkills": ["skill1", "skill2", "skill3"],
  "niceToHaveSkills": ["skill1", "skill2"],
  "seniorityLevel": "junior|mid|senior|lead|principal|executive",
  "domain": "industry or domain (e.g., 'fintech', 'healthcare', 'e-commerce')",
  "idealCandidateSummary": "2-3 sentence summary of the ideal candidate",
  "experience": {
    "minimum": 0,
    "preferred": 0,
    "unit": "years"
  },
  "education": {
    "required": true,
    "level": "high_school|associate|bachelor|master|phd|none",
    "field": "field of study if specified"
  },
  "responsibilities": ["responsibility1", "responsibility2"],
  "qualifications": ["qualification1", "qualification2"],
  "cultureFit": {
    "workStyle": ["style1", "style2"],
    "teamEnvironment": "description of team environment",
    "companyValues": ["value1", "value2"]
  }
}

ANALYSIS GUIDELINES:
1. **Required Skills**: Extract hard skills, technologies, and tools that are explicitly required or strongly implied as essential
2. **Nice-to-Have Skills**: Skills mentioned as "plus", "preferred", "bonus", or similar
3. **Seniority Level**: Determine based on title, experience requirements, and responsibility level
4. **Domain**: Identify the industry or business domain
5. **Experience**: Extract minimum and preferred years of experience from the text
6. **Education**: Determine if education is required and what level
7. **Culture Fit**: Extract information about work style, team environment, and company values

Be precise and focus on information that will help match candidates effectively. Only include information explicitly mentioned or strongly implied in the job description.
`;
  }

  private parseJDResponse(responseText: string): ParsedJobDescription {
    try {
      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in JD parsing response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and normalize the response
      return {
        requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
        niceToHaveSkills: Array.isArray(parsed.niceToHaveSkills) ? parsed.niceToHaveSkills : [],
        seniorityLevel: this.validateSeniorityLevel(parsed.seniorityLevel),
        domain: parsed.domain || 'general',
        idealCandidateSummary: parsed.idealCandidateSummary || '',
        experience: {
          minimum: Math.max(0, parseInt(parsed.experience?.minimum) || 0),
          preferred: Math.max(0, parseInt(parsed.experience?.preferred) || 0),
          unit: 'years'
        },
        education: {
          required: Boolean(parsed.education?.required),
          level: this.validateEducationLevel(parsed.education?.level),
          field: parsed.education?.field
        },
        responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities : [],
        qualifications: Array.isArray(parsed.qualifications) ? parsed.qualifications : [],
        cultureFit: {
          workStyle: Array.isArray(parsed.cultureFit?.workStyle) ? parsed.cultureFit.workStyle : [],
          teamEnvironment: parsed.cultureFit?.teamEnvironment || '',
          companyValues: Array.isArray(parsed.cultureFit?.companyValues) ? parsed.cultureFit.companyValues : []
        }
      };
    } catch (error) {
      console.error('Failed to parse JD response:', error);
      throw new Error('Invalid response format from JD parser');
    }
  }

  private validateSeniorityLevel(level: string): 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | 'executive' {
    const validLevels = ['junior', 'mid', 'senior', 'lead', 'principal', 'executive'];
    const normalized = (level || '').toLowerCase();
    return validLevels.includes(normalized) ? normalized as any : 'mid';
  }

  private validateEducationLevel(level: string): 'high_school' | 'associate' | 'bachelor' | 'master' | 'phd' | 'none' {
    const validLevels = ['high_school', 'associate', 'bachelor', 'master', 'phd', 'none'];
    const normalized = (level || '').toLowerCase();
    return validLevels.includes(normalized) ? normalized as any : 'none';
  }
}
