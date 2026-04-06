import { GoogleGenAI } from '@google/genai';
import { ITalentProfile, IJobPosting } from '../types';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export class GeminiService {
  async analyzeCandidate(job: IJobPosting, candidate: ITalentProfile): Promise<{
    score: number;
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
  }> {
    const prompt = this.buildAnalysisPrompt(job, candidate);
    
    try {
      const result = await genAI.models.generateContent({
        model: 'gemini-pro-latest', // Updated to use the correct model name
        contents: prompt
      });
      
      if (!result || !result.text) {
        throw new Error('Invalid response from Gemini API');
      }
      
      const text = result.text;
      
      return this.parseAnalysisResponse(text);
    } catch (error: any) {
      console.error('Gemini API error:', error);
      
      // Handle quota errors gracefully
      if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        console.log('⚠️ Gemini API quota exceeded. Falling back to mock analysis.');
        return this.getMockAnalysis(job, candidate);
      }
      
      throw new Error('Failed to analyze candidate');
    }
  }

  // Mock analysis for when quota is exceeded
  private getMockAnalysis(job: IJobPosting, candidate: ITalentProfile) {
    const matchingSkills = job.skills.filter(skill => 
      candidate.skills.some(candidateSkill => 
        candidateSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    const skillScore = (matchingSkills.length / job.skills.length) * 40;
    const experienceScore = candidate.experience.length > 0 ? 30 : 15;
    const educationScore = candidate.education.length > 0 ? 20 : 10;
    const baseScore = 10;
    
    const totalScore = Math.min(100, Math.round(skillScore + experienceScore + educationScore + baseScore));
    
    return {
      score: totalScore,
      reasoning: {
        overall: `Candidate shows ${matchingSkills.length > 0 ? 'good' : 'limited'} match with job requirements. ${totalScore > 70 ? 'Recommended for consideration.' : 'May require additional evaluation.'}`,
        skills: job.skills.map(skill => ({
          skill,
          matched: matchingSkills.includes(skill),
          relevance: matchingSkills.includes(skill) ? 0.8 : 0.2
        })),
        experience: {
          relevance: candidate.experience.length > 0 ? 0.7 : 0.3,
          explanation: candidate.experience.length > 0 
            ? 'Candidate has relevant work experience' 
            : 'Limited work experience information'
        },
        education: {
          relevance: candidate.education.length > 0 ? 0.6 : 0.4,
          explanation: candidate.education.length > 0 
            ? 'Candidate has educational background' 
            : 'Limited education information'
        }
      }
    };
  }

  private buildAnalysisPrompt(job: IJobPosting, candidate: ITalentProfile): string {
    return `
You are an expert AI talent evaluator for Umurava Talent Marketplace. Analyze the candidate against the job requirements and provide a detailed assessment.

JOB REQUIREMENTS:
Title: ${job.title}
Description: ${job.description}
Required Skills: ${job.skills.join(', ')}
Required Experience: ${job.experience}
Responsibilities: ${job.responsibilities.join(', ')}
Requirements: ${job.requirements.join(', ')}
Work Type: ${job.workType}

CANDIDATE PROFILE:
Name: ${candidate.firstName} ${candidate.lastName}
Title: ${candidate.title}
Summary: ${candidate.summary}
Skills: ${candidate.skills.join(', ')}
Specialties: ${candidate.specialties.join(', ')}
Work Type: ${candidate.workType}
Availability: ${candidate.availability}

EXPERIENCE:
${candidate.experience.map(exp => `- ${exp.position} at ${exp.company}: ${exp.description}`).join('\n')}

EDUCATION:
${candidate.education.map(edu => `- ${edu.degree} in ${edu.field} from ${edu.institution}`).join('\n')}

RESUME TEXT:
${candidate.resumeText || 'No resume text provided'}

Please provide a JSON response with the following structure:
{
  "score": 0-100,
  "reasoning": {
    "overall": "Overall assessment of candidate fit",
    "skills": [
      {
        "skill": "skill name",
        "matched": true/false,
        "relevance": 0.0-1.0
      }
    ],
    "experience": {
      "relevance": 0.0-1.0,
      "explanation": "Explanation of experience relevance"
    },
    "education": {
      "relevance": 0.0-1.0,
      "explanation": "Explanation of education relevance"
    }
  }
}

Be thorough, objective, and focus on matching the candidate's actual capabilities with the job requirements. 

### BIAS MITIGATION GUIDELINES:
1. Ignore personal information such as gender, ethnicity, age, and socioeconomic status.
2. Focus exclusively on technical skills, professional achievements, and relevant education.
3. Do not favor candidates based on prestigious institutions or specific geographic locations unless explicitly required by the job (e.g., local presence requirements).
4. Evaluate candidates from diverse backgrounds fairly, prioritizing their potential and documented contributions.
5. Provide a justified scoring rationale based only on professional merit.

Consider both hard skills and soft skills evident from their experience and education.
`;
  }

  private parseAnalysisResponse(text: string): {
    score: number;
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
  } {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      throw new Error('Invalid response format from AI');
    }
  }

  async generateShortlistExplanation(job: IJobPosting, shortlistedCandidates: any[]): Promise<string> {
    const prompt = `
Generate a summary explaining why these candidates were shortlisted for the position.

JOB: ${job.title}
COMPANY REQUIREMENTS: ${job.description}

SHORTLISTED CANDIDATES:
${shortlistedCandidates.map((candidate, index) => 
  `${index + 1}. ${candidate.firstName} ${candidate.lastName} - Score: ${candidate.score}
   Key Skills: ${candidate.skills.slice(0, 3).join(', ')}
   Experience: ${candidate.experience[0]?.position || 'N/A'} at ${candidate.experience[0]?.company || 'N/A'}`
).join('\n\n')}

Provide a concise summary (2-3 paragraphs) explaining the overall quality of the shortlist and why these candidates stand out.
`;

    try {
      const result = await genAI.models.generateContent({
        model: 'gemini-pro-latest', // Updated to use the correct model name
        contents: prompt
      });
      
      if (!result || !result.text) {
        throw new Error('Invalid response from Gemini API');
      }
      
      return result.text;
    } catch (error: any) {
      console.error('Error generating shortlist explanation:', error);
      
      // Handle quota errors gracefully
      if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        return `Generated summary for ${shortlistedCandidates.length} shortlisted candidates. These candidates have been selected based on their strong alignment with job requirements, relevant skills, and experience. Each candidate demonstrates potential for success in this role.`;
      }
      
      return 'Unable to generate explanation at this time.';
    }
  }
}
