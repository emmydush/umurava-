import { JDParserService, ParsedJobDescription } from './jdParserService';
import { CandidateAnalyzerService, AnalyzedCandidate } from './candidateAnalyzerService';
import { ScoringEngineService, CandidateScore, RankingResult } from './scoringEngineService';
import { IJobPosting, ITalentProfile, IApplication, IParsedCandidateProfile } from '../types';
import { JobPosting, TalentProfile, Application as ApplicationModel, ScreeningResult } from '../models';

export interface PipelineInput {
  jobId: string;
  candidateIds?: string[]; // Optional - if not provided, process all candidates for the job
  maxResults?: number; // Default: 20
}

export interface PipelineResult {
  jobId: string;
  jobTitle: string;
  totalCandidates: number;
  processedCandidates: number;
  ranking: RankingResult;
  processingTime: number; // in milliseconds
  timestamp: Date;
  errors?: string[];
}

export interface CandidateProcessingResult {
  candidateId: string;
  candidateName: string;
  analyzedCandidate: AnalyzedCandidate;
  parsedCandidateProfile: IParsedCandidateProfile | null;
  score: CandidateScore;
  processingTime: number;
  error?: string;
}

export class AIPipelineService {
  private jdParser: JDParserService;
  private candidateAnalyzer: CandidateAnalyzerService;
  private scoringEngine: ScoringEngineService;

  constructor() {
    this.jdParser = new JDParserService();
    this.candidateAnalyzer = new CandidateAnalyzerService();
    this.scoringEngine = new ScoringEngineService();
  }

  async processJobApplications(input: PipelineInput): Promise<PipelineResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // Step 1: Get job posting
      const jobPosting = await JobPosting.findById(input.jobId);
      if (!jobPosting) {
        throw new Error(`Job posting not found: ${input.jobId}`);
      }

      // Step 2: Parse job description to get ideal profile or use stored extracted requirements
      const jobPostingObject = jobPosting.toObject();
      let enhancedJob;
      if (jobPostingObject.extractedRequirements) {
        const extracted = jobPostingObject.extractedRequirements;
        enhancedJob = {
          ...jobPostingObject,
          idealProfile: {
            experience: `${extracted.experience.minimum}+ years${extracted.experience.preferred > extracted.experience.minimum ? ` (preferably ${extracted.experience.preferred}+)` : ''}`,
            education: extracted.education.level === 'none'
              ? 'No specific education requirement'
              : `${extracted.education.level} degree${extracted.education.field ? ` in ${extracted.education.field}` : ''} required`,
            skills: extracted.requiredSkills,
            qualifications: extracted.qualifications,
            personalityTraits: extracted.cultureFit.workStyle,
            certifications: []
          }
        };
      } else {
        enhancedJob = await this.jdParser.enhanceJobPosting({
          ...jobPostingObject,
          _id: jobPosting._id.toString()
        });
      }

      // Create parsedJD from enhanced job
      const parsedJD = enhancedJob.idealProfile ? 
        this.createParsedJDFromIdealProfile(enhancedJob.idealProfile) : 
        this.createFallbackParsedJD({
          ...jobPosting.toObject(),
          _id: jobPosting._id.toString()
        });
      
      // Step 3: Get candidates to process
      const candidates = await this.getCandidatesForJob(input.jobId, input.candidateIds);
      
      if (candidates.length === 0) {
        throw new Error('No candidates found for this job');
      }

      // Step 4: Process each candidate through the pipeline
      const processingResults: CandidateProcessingResult[] = [];
      
      for (const candidate of candidates) {
        try {
          const parsedCandidateProfile = await this.candidateAnalyzer.normalizeCandidateProfile(
            candidate,
            candidate.resumeFile ? `uploads/${candidate.resumeFile.filename}` : undefined,
            candidate.resumeFile ? candidate.resumeFile.originalName : undefined
          );

          const result = await this.processSingleCandidate(
            candidate,
            parsedCandidateProfile,
            parsedJD
          );
          processingResults.push(result);
        } catch (error) {
          const errorMessage = `Failed to process candidate ${candidate._id!}: ${error}`;
          console.error(errorMessage);
          errors.push(errorMessage);
          
          // Add failed candidate with error
          processingResults.push({
            candidateId: candidate._id!.toString(),
            candidateName: `${candidate.firstName} ${candidate.lastName}`,
            analyzedCandidate: {} as AnalyzedCandidate,
            parsedCandidateProfile: null,
            score: {} as CandidateScore,
            processingTime: 0,
            error: errorMessage
          });
        }
      }

      // Step 5: Rank candidates
      const successfulResults = processingResults.filter(r => !r.error);
      const candidatesForRanking = successfulResults.map(result => ({
        candidate: result.analyzedCandidate,
        parsedProfile: result.parsedCandidateProfile,
        name: result.candidateName,
        id: result.candidateId
      }));

      const ranking = await this.scoringEngine.rankCandidates(parsedJD, candidatesForRanking);

      // Step 6: Update applications with scores and rankings
      await this.updateApplicationScores(input.jobId, successfulResults, ranking.candidates);

      // Step 7: Update screening results
      await this.updateScreeningResults(input.jobId, ranking);

      const processingTime = Date.now() - startTime;

      return {
        jobId: input.jobId,
        jobTitle: jobPosting.title,
        totalCandidates: candidates.length,
        processedCandidates: successfulResults.length,
        ranking,
        processingTime,
        timestamp: new Date(),
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('AI Pipeline processing failed:', error);
      throw new Error(`Pipeline processing failed: ${error}`);
    }
  }

  async processSingleCandidate(
    candidate: ITalentProfile,
    parsedCandidateProfile: IParsedCandidateProfile | null,
    parsedJD: ParsedJobDescription
  ): Promise<CandidateProcessingResult> {
    const startTime = Date.now();

    try {
      // Step 1: Analyze candidate
      let analyzedCandidate: AnalyzedCandidate;
      
      if (candidate.resumeFile) {
        // If candidate has resume file, parse from file
        analyzedCandidate = await this.candidateAnalyzer.analyzeCandidateFromSource(
          candidate,
          `uploads/${candidate.resumeFile.filename}`,
          candidate.resumeFile.originalName
        );
      } else {
        // Analyze from structured profile
        analyzedCandidate = await this.candidateAnalyzer.analyzePlatformProfile(candidate);
      }

      // Step 2: Score candidate
      const score = await this.scoringEngine.scoreCandidate(
        parsedJD,
        analyzedCandidate,
        parsedCandidateProfile,
        `${candidate.firstName} ${candidate.lastName}`
      );

      const processingTime = Date.now() - startTime;

      return {
        candidateId: candidate._id!.toString(),
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        analyzedCandidate,
        parsedCandidateProfile,
        score,
        processingTime
      };

    } catch (error) {
      throw new Error(`Candidate processing failed: ${error}`);
    }
  }

  private async getCandidatesForJob(jobId: string, candidateIds?: string[]): Promise<ITalentProfile[]> {
    if (candidateIds && candidateIds.length > 0) {
      // Get specific candidates
      return await TalentProfile.find({ '_id': { $in: candidateIds } });
    } else {
      // Get all candidates who have applied for this job
      const applications = await ApplicationModel.find({ jobId }).select('candidateId');
      const candidateIdsFromApps = applications.map(app => app.candidateId);
      
      if (candidateIdsFromApps.length === 0) {
        return [];
      }

      return await TalentProfile.find({ '_id': { $in: candidateIdsFromApps } });
    }
  }

  private createFallbackParsedJD(jobPosting: IJobPosting): ParsedJobDescription {
    return {
      requiredSkills: jobPosting.skills || [],
      niceToHaveSkills: [],
      seniorityLevel: 'mid',
      domain: 'general',
      idealCandidateSummary: jobPosting.description || '',
      experience: {
        minimum: 0,
        preferred: 0,
        unit: 'years'
      },
      education: {
        required: false,
        level: 'none',
        field: ''
      },
      responsibilities: jobPosting.responsibilities || [],
      qualifications: jobPosting.requirements || [],
      cultureFit: {
        workStyle: [],
        teamEnvironment: '',
        companyValues: []
      }
    };
  }

  private createParsedJDFromIdealProfile(idealProfile: any): ParsedJobDescription {
    return {
      requiredSkills: idealProfile.skills || [],
      niceToHaveSkills: [],
      seniorityLevel: 'mid',
      domain: 'general',
      idealCandidateSummary: idealProfile.experience || '',
      experience: {
        minimum: 0,
        preferred: 0,
        unit: 'years'
      },
      education: {
        required: false,
        level: 'none',
        field: idealProfile.education || ''
      },
      responsibilities: [],
      qualifications: idealProfile.qualifications || [],
      cultureFit: {
        workStyle: idealProfile.personalityTraits || [],
        teamEnvironment: '',
        companyValues: []
      }
    };
  }

  private async updateApplicationScores(
    jobId: string,
    processingResults: CandidateProcessingResult[],
    rankedCandidates: any[]
  ): Promise<void> {
    const shortlistCount = Math.min(20, Math.max(10, Math.ceil(rankedCandidates.length * 0.2)));

    for (const result of processingResults) {
      const rankedCandidate = rankedCandidates.find(c => c.candidateId === result.candidateId);
      if (rankedCandidate) {
        await ApplicationModel.findOneAndUpdate(
          { jobId, candidateId: result.candidateId },
          {
            $set: {
              aiScore: rankedCandidate.score.overallScore,
              aiRanking: rankedCandidate.rank,
              aiReasoning: {
                overall: rankedCandidate.score.explanation,
                skills: rankedCandidate.score.subScores.skillsMatch.skillDetails,
                experience: {
                  relevance: rankedCandidate.score.subScores.experienceFit.relevance,
                  explanation: rankedCandidate.score.subScores.experienceFit.explanation
                },
                education: {
                  relevance: 0.8, // Default if not specifically scored
                  explanation: 'Education assessed during scoring process'
                }
              },
              status: 'scored',
              inShortlist: rankedCandidate.rank <= shortlistCount,
              lastUpdated: new Date()
            }
          }
        );
      }
    }
  }

  private async updateScreeningResults(jobId: string, ranking: RankingResult): Promise<void> {
    // Clear existing screening results for this job
    await ScreeningResult.deleteMany({ jobId });

    // Create new screening results
    const screeningResults = ranking.candidates
      .filter(candidate => 
        candidate.score.recommendation === 'strong_shortlist' || 
        candidate.score.recommendation === 'shortlist'
      )
      .map(candidate => ({
        jobId,
        talentId: candidate.candidateId,
        score: candidate.score.overallScore,
        ranking: candidate.rank,
        reasoning: {
          overall: candidate.score.explanation,
          skills: candidate.score.subScores.skillsMatch.skillDetails,
          experience: {
            relevance: candidate.score.subScores.experienceFit.relevance,
            explanation: candidate.score.subScores.experienceFit.explanation
          },
          education: {
            relevance: 0.8,
            explanation: 'Education assessed during scoring process'
          }
        },
        shortlisted: candidate.score.recommendation === 'strong_shortlist'
      }));

    if (screeningResults.length > 0) {
      await ScreeningResult.insertMany(screeningResults);
    }
  }

  async getPipelineStatus(jobId: string): Promise<{
    hasResults: boolean;
    lastProcessed?: Date;
    candidateCount: number;
    averageScore?: number;
    topCandidates?: Array<{
      candidateId: string;
      candidateName: string;
      score: number;
      rank: number;
    }>;
  }> {
    try {
      const applications = await ApplicationModel.find({ jobId });
      const scoredApplications = applications.filter(app => app.aiScore !== undefined);

      if (scoredApplications.length === 0) {
        return {
          hasResults: false,
          candidateCount: applications.length
        };
      }

      const topCandidates = await ApplicationModel.find({ jobId })
        .sort({ aiRanking: 1 })
        .limit(5)
        .populate('candidateId', 'firstName lastName')
        .select('aiScore aiRanking candidateId');

      const averageScore = scoredApplications.reduce((sum, app) => sum + (app.aiScore || 0), 0) / scoredApplications.length;

      return {
        hasResults: true,
        lastProcessed: scoredApplications[0]?.lastUpdated,
        candidateCount: applications.length,
        averageScore,
        topCandidates: topCandidates.map(app => ({
          candidateId: (app.candidateId as any)._id?.toString() || (app.candidateId as any).toString(),
          candidateName: `${(app.candidateId as any).firstName} ${(app.candidateId as any).lastName}`,
          score: app.aiScore || 0,
          rank: app.aiRanking || 0
        }))
      };
    } catch (error) {
      console.error('Error getting pipeline status:', error);
      throw new Error('Failed to get pipeline status');
    }
  }
}
