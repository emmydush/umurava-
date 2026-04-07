import { GoogleGenAI } from '@google/genai';
import { ParsedJobDescription } from './jdParserService';
import { AnalyzedCandidate } from './candidateAnalyzerService';
import { IParsedCandidateProfile } from '../types';

export interface CandidateScore {
  overallScore: number; // 0-100
  subScores: {
    skillsMatch: {
      score: number; // 0-100
      requiredSkillsMatched: number;
      requiredSkillsTotal: number;
      niceToHaveSkillsMatched: number;
      niceToHaveSkillsTotal: number;
      skillDetails: Array<{
        skill: string;
        type: 'required' | 'nice_to_have';
        matched: boolean;
        relevance: number; // 0-1
      }>;
    };
    experienceFit: {
      score: number; // 0-100
      yearsMatch: number; // 0-1
      relevance: number; // 0-1
      progressionFit: number; // 0-1
      explanation: string;
    };
    domainRelevance: {
      score: number; // 0-100
      domainMatch: number; // 0-1
      industryExperience: number; // 0-1
      explanation: string;
    };
    cultureSignals: {
      score: number; // 0-100
      workStyleFit: number; // 0-1
      leadershipAlignment: number; // 0-1
      teamEnvironmentFit: number; // 0-1
      explanation: string;
    };
  };
  explanation: string; // Natural language explanation
  rankingFactors: {
    strengths: string[];
    weaknesses: string[];
    redFlags: string[];
    standoutQualifications: string[];
  };
  recommendation: 'strong_shortlist' | 'shortlist' | 'consider' | 'reject';
}

export interface RankingResult {
  candidates: Array<{
    candidateId: string;
    candidateName: string;
    score: CandidateScore;
    rank: number;
  }>;
  summary: {
    totalCandidates: number;
    shortlistedCount: number;
    averageScore: number;
    topScore: number;
    scoreDistribution: {
      excellent: number; // 90-100
      good: number; // 75-89
      average: number; // 60-74
      below_average: number; // <60
    };
  };
}

export class ScoringEngineService {
  private genAI: GoogleGenAI;

  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }

  async scoreCandidate(
    jobDescription: ParsedJobDescription,
    candidate: AnalyzedCandidate,
    candidateEvidence: IParsedCandidateProfile | null,
    candidateName: string
  ): Promise<CandidateScore> {
    const prompt = this.buildScoringPrompt(jobDescription, candidate, candidateEvidence, candidateName);
    
    try {
      const result = await this.genAI.models.generateContent({
        model: 'gemini-pro',
        contents: prompt
      });
      
      if (!result || !result.text) {
        throw new Error('Invalid response from Gemini API');
      }
      
      return this.parseScoreResponse(result.text);
    } catch (error) {
      console.error('Scoring engine error:', error);
      throw new Error('Failed to score candidate');
    }
  }

  async rankCandidates(
    jobDescription: ParsedJobDescription,
    candidates: Array<{ candidate: AnalyzedCandidate; parsedProfile: IParsedCandidateProfile | null; name: string; id: string }>
  ): Promise<RankingResult> {
    // Score all candidates
    const scoredCandidates = await Promise.all(
      candidates.map(async ({ candidate, parsedProfile, name, id }) => {
        const score = await this.scoreCandidate(jobDescription, candidate, parsedProfile, name);
        return {
          candidateId: id,
          candidateName: name,
          score,
          rank: 0 // Will be set after sorting
        };
      })
    );

    // Sort by score (descending) and assign ranks
    scoredCandidates.sort((a, b) => b.score.overallScore - a.score.overallScore);
    scoredCandidates.forEach((candidate, index) => {
      candidate.rank = index + 1;
    });

    // Calculate summary statistics
    const scores = scoredCandidates.map(c => c.score.overallScore);
    const summary = this.calculateSummary(scores, scoredCandidates);

    return {
      candidates: scoredCandidates,
      summary
    };
  }

  private buildScoringPrompt(
    jobDescription: ParsedJobDescription,
    candidate: AnalyzedCandidate,
    candidateEvidence: IParsedCandidateProfile | null,
    candidateName: string
  ): string {
    const evidenceSection = candidateEvidence ? `
CANDIDATE EVIDENCE (Parsed Profile):
- Source: ${candidateEvidence.source}
- Skills: ${candidateEvidence.skills.join(', ')}
- Years of Experience: ${candidateEvidence.yearsExp}
- Titles: ${candidateEvidence.titles.join(', ')}
- Experience entries: ${JSON.stringify(candidateEvidence.experience.slice(0, 3))}
- Education entries: ${JSON.stringify(candidateEvidence.education.slice(0, 3))}
- Contact: ${JSON.stringify(candidateEvidence.contact)}
- Last Updated: ${candidateEvidence.lastUpdated.toISOString()}
` : '';

    return `
You are an expert AI-powered talent evaluator for Umurava Talent Marketplace. Your task is to score and rank a candidate against a job description using detailed sub-scores and provide comprehensive reasoning.

JOB DESCRIPTION (Ideal Profile):
- Required Skills: ${jobDescription.requiredSkills.join(', ')}
- Nice-to-Have Skills: ${jobDescription.niceToHaveSkills.join(', ')}
- Seniority Level: ${jobDescription.seniorityLevel}
- Domain: ${jobDescription.domain}
- Experience Required: ${jobDescription.experience.minimum}+ years (preferably ${jobDescription.experience.preferred}+)
- Education: ${jobDescription.education.level}${jobDescription.education.field ? ` in ${jobDescription.education.field}` : ''}
- Ideal Candidate Summary: ${jobDescription.idealCandidateSummary}
- Responsibilities: ${jobDescription.responsibilities.join(', ')}
- Qualifications: ${jobDescription.qualifications.join(', ')}
- Culture Fit: ${JSON.stringify(jobDescription.cultureFit)}
${evidenceSection}
CANDIDATE PROFILE:
Name: ${candidateName}

Skills:
- Technical: ${candidate.skills.technical.join(', ')}
- Soft: ${candidate.skills.soft.join(', ')}
- Domain: ${candidate.skills.domain.join(', ')}

Experience:
- Total Years: ${candidate.experience.totalYears}
- Relevant Years: ${candidate.experience.relevantYears}
- Roles: ${JSON.stringify(candidate.experience.roles.slice(0, 3))}
- Projects: ${JSON.stringify(candidate.experience.projects.slice(0, 2))}

Education:
- Level: ${candidate.education.level} in ${candidate.education.field}
- Institution: ${candidate.education.institution}
- Relevance: ${candidate.education.relevance}

Career Progression:
- Trajectory: ${candidate.careerProgression.trajectory}
- Consistency: ${candidate.careerProgression.consistency}
- Leadership: ${candidate.careerProgression.leadership}

Summary: ${candidate.summary}

Please provide a comprehensive evaluation in JSON format:

{
  "overallScore": 85,
  "subScores": {
    "skillsMatch": {
      "score": 90,
      "requiredSkillsMatched": 7,
      "requiredSkillsTotal": 8,
      "niceToHaveSkillsMatched": 3,
      "niceToHaveSkillsTotal": 5,
      "skillDetails": [
        {
          "skill": "React",
          "type": "required",
          "matched": true,
          "relevance": 0.9
        }
      ]
    },
    "experienceFit": {
      "score": 80,
      "yearsMatch": 0.8,
      "relevance": 0.85,
      "progressionFit": 0.75,
      "explanation": "Candidate has sufficient experience with relevant progression"
    },
    "domainRelevance": {
      "score": 75,
      "domainMatch": 0.7,
      "industryExperience": 0.8,
      "explanation": "Good domain alignment with industry experience"
    },
    "cultureSignals": {
      "score": 85,
      "workStyleFit": 0.8,
      "leadershipAlignment": 0.7,
      "teamEnvironmentFit": 0.9,
      "explanation": "Strong cultural fit with team environment"
    }
  },
  "explanation": "Strong candidate with 7/8 required skills matched, 4 years of relevant experience in fintech, and excellent cultural alignment",
  "rankingFactors": {
    "strengths": ["Strong technical skills", "Relevant experience", "Leadership potential"],
    "weaknesses": ["Limited experience with specific technology", "No certifications"],
    "redFlags": [],
    "standoutQualifications": ["Led team of 5 developers", "Published technical papers"]
  },
  "recommendation": "strong_shortlist"
}

SCORING CRITERIA:
1. **Skills Match (40% weight)**: Compare candidate skills against required and nice-to-have skills
2. **Experience Fit (30% weight)**: Evaluate years of experience, relevance, and career progression
3. **Domain Relevance (15% weight)**: Assess domain expertise and industry alignment
4. **Culture Signals (15% weight)**: Evaluate work style, leadership, and team environment fit

RECOMMENDATION LEVELS:
- strong_shortlist: 85-100 (Exceptional fit, high priority)
- shortlist: 70-84 (Good fit, should be interviewed)
- consider: 55-69 (Potential fit, may need review)
- reject: 0-54 (Not suitable for this role)

Be thorough, objective, and provide specific evidence for your scoring. Focus on matching the candidate's actual capabilities with the job requirements.
`;
  }

  private parseScoreResponse(responseText: string): CandidateScore {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in scoring response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        overallScore: Math.min(100, Math.max(0, parseInt(parsed.overallScore) || 0)),
        subScores: {
          skillsMatch: {
            score: Math.min(100, Math.max(0, parseInt(parsed.subScores?.skillsMatch?.score) || 0)),
            requiredSkillsMatched: Math.max(0, parseInt(parsed.subScores?.skillsMatch?.requiredSkillsMatched) || 0),
            requiredSkillsTotal: Math.max(0, parseInt(parsed.subScores?.skillsMatch?.requiredSkillsTotal) || 0),
            niceToHaveSkillsMatched: Math.max(0, parseInt(parsed.subScores?.skillsMatch?.niceToHaveSkillsMatched) || 0),
            niceToHaveSkillsTotal: Math.max(0, parseInt(parsed.subScores?.skillsMatch?.niceToHaveSkillsTotal) || 0),
            skillDetails: Array.isArray(parsed.subScores?.skillsMatch?.skillDetails) 
              ? parsed.subScores.skillsMatch.skillDetails.map((detail: any) => ({
                  skill: detail.skill || '',
                  type: detail.type || 'required',
                  matched: Boolean(detail.matched),
                  relevance: Math.min(1, Math.max(0, parseFloat(detail.relevance) || 0))
                }))
              : []
          },
          experienceFit: {
            score: Math.min(100, Math.max(0, parseInt(parsed.subScores?.experienceFit?.score) || 0)),
            yearsMatch: Math.min(1, Math.max(0, parseFloat(parsed.subScores?.experienceFit?.yearsMatch) || 0)),
            relevance: Math.min(1, Math.max(0, parseFloat(parsed.subScores?.experienceFit?.relevance) || 0)),
            progressionFit: Math.min(1, Math.max(0, parseFloat(parsed.subScores?.experienceFit?.progressionFit) || 0)),
            explanation: parsed.subScores?.experienceFit?.explanation || ''
          },
          domainRelevance: {
            score: Math.min(100, Math.max(0, parseInt(parsed.subScores?.domainRelevance?.score) || 0)),
            domainMatch: Math.min(1, Math.max(0, parseFloat(parsed.subScores?.domainRelevance?.domainMatch) || 0)),
            industryExperience: Math.min(1, Math.max(0, parseFloat(parsed.subScores?.domainRelevance?.industryExperience) || 0)),
            explanation: parsed.subScores?.domainRelevance?.explanation || ''
          },
          cultureSignals: {
            score: Math.min(100, Math.max(0, parseInt(parsed.subScores?.cultureSignals?.score) || 0)),
            workStyleFit: Math.min(1, Math.max(0, parseFloat(parsed.subScores?.cultureSignals?.workStyleFit) || 0)),
            leadershipAlignment: Math.min(1, Math.max(0, parseFloat(parsed.subScores?.cultureSignals?.leadershipAlignment) || 0)),
            teamEnvironmentFit: Math.min(1, Math.max(0, parseFloat(parsed.subScores?.cultureSignals?.teamEnvironmentFit) || 0)),
            explanation: parsed.subScores?.cultureSignals?.explanation || ''
          }
        },
        explanation: parsed.explanation || '',
        rankingFactors: {
          strengths: Array.isArray(parsed.rankingFactors?.strengths) ? parsed.rankingFactors.strengths : [],
          weaknesses: Array.isArray(parsed.rankingFactors?.weaknesses) ? parsed.rankingFactors.weaknesses : [],
          redFlags: Array.isArray(parsed.rankingFactors?.redFlags) ? parsed.rankingFactors.redFlags : [],
          standoutQualifications: Array.isArray(parsed.rankingFactors?.standoutQualifications) ? parsed.rankingFactors.standoutQualifications : []
        },
        recommendation: this.validateRecommendation(parsed.recommendation)
      };
    } catch (error) {
      console.error('Failed to parse score response:', error);
      throw new Error('Invalid response format from scoring engine');
    }
  }

  private validateRecommendation(recommendation: string): 'strong_shortlist' | 'shortlist' | 'consider' | 'reject' {
    const validRecommendations = ['strong_shortlist', 'shortlist', 'consider', 'reject'];
    const normalized = (recommendation || '').toLowerCase();
    return validRecommendations.includes(normalized) ? normalized as any : 'consider';
  }

  private calculateSummary(scores: number[], candidates: any[]) {
    const totalCandidates = candidates.length;
    const shortlistedCount = candidates.filter(c => 
      c.score.recommendation === 'strong_shortlist' || c.score.recommendation === 'shortlist'
    ).length;
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const topScore = Math.max(...scores);

    const scoreDistribution = {
      excellent: scores.filter(s => s >= 90).length,
      good: scores.filter(s => s >= 75 && s < 90).length,
      average: scores.filter(s => s >= 60 && s < 75).length,
      below_average: scores.filter(s => s < 60).length
    };

    return {
      totalCandidates,
      shortlistedCount,
      averageScore,
      topScore,
      scoreDistribution
    };
  }
}
