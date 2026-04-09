import { JobPosting, TalentProfile, ScreeningResult, ScreeningSession, IScreeningResultDocument, Application } from '../models';
import { GeminiService } from './geminiService';
import { IScreeningSession, IScreeningResult } from '../types';

export class ScreeningService {
  private geminiService = new GeminiService();

  async initiateScreening(jobId: string, recruiterId: string): Promise<any> {
    try {
      const job = await JobPosting.findById(jobId);
      if (!job) {
        throw new Error('Job posting not found');
      }

      const applications = await Application.find({ jobId }).populate('candidateId');
      
      if (applications.length === 0) {
        throw new Error('No candidates have applied for this job yet.');
      }

      // Extract talent profiles from applications
      const candidates = applications
        .map(app => app.candidateId)
        .filter(candidate => candidate !== null);

      const session = new ScreeningSession({
        jobId,
        recruiterId,
        totalCandidates: candidates.length,
        shortlistedCount: 0,
        status: 'processing',
        results: []
      });

      await session.save();

      this.processScreening(session._id.toString(), job, candidates)
        .catch(error => {
          console.error('Screening process error:', error);
          ScreeningSession.findByIdAndUpdate(session._id, { 
            status: 'failed' 
          }).catch(console.error);
        });

      return session;
    } catch (error) {
      console.error('Error initiating screening:', error);
      throw error;
    }
  }

  private async processScreening(
    sessionId: string, 
    job: any, 
    candidates: any[]
  ): Promise<void> {
    const results: any[] = [];
    const BATCH_SIZE = 5; // Batch size to stay within rate limits
    const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds delay between batches

    for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
      const batch = candidates.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (candidate) => {
        try {
          // CHECK CACHE: See if this candidate was already screened for this job and their profile hasn't changed.
          const cachedResult = await ScreeningResult.findOne({
            jobId: job._id,
            talentId: candidate._id,
            talentProfileUpdatedAt: { $gte: candidate.updatedAt }
          });

          if (cachedResult) {
            console.log(`Using cached result for candidate ${candidate._id}`);
            return cachedResult;
          }

          // Not in cache or stale: Call Gemini
          const analysis = await this.geminiService.analyzeCandidate(job, candidate);
          
          const screeningResult = new ScreeningResult({
            jobId: job._id,
            talentId: candidate._id,
            score: analysis.score,
            ranking: i + 1, // Start with a valid ranking to pass validation (will be updated after sorting)
            reasoning: analysis.reasoning,
            shortlisted: false,
            talentProfileUpdatedAt: candidate.updatedAt
          });

          await screeningResult.save();
          return screeningResult;
        } catch (error) {
          console.error(`Error analyzing candidate ${candidate._id}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(r => r !== null));

      // Wait between batches to respect rate limits if not the last batch
      if (i + BATCH_SIZE < candidates.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    // Rest of the logic: Sort, rank, and shortlist...
    results.sort((a, b) => b.score - a.score);

    const shortlistCount = Math.min(20, Math.max(10, Math.ceil(results.length * 0.2)));
    
    for (let i = 0; i < results.length; i++) {
      results[i].ranking = i + 1;
      results[i].shortlisted = i < shortlistCount;
      await (results[i] as any).save();
    }

    const shortlistedCandidates = results.slice(0, shortlistCount);
    
    // Generate explanation for the entire shortlist
    try {
      const shortlistExplanation = await this.geminiService.generateShortlistExplanation(
        job, 
        shortlistedCandidates.map(result => {
          const candidate = candidates.find(c => c._id.toString() === result.talentId.toString());
          return {
            ...result.toObject(),
            firstName: candidate?.firstName,
            lastName: candidate?.lastName,
            skills: candidate?.skills,
            experience: candidate?.experience
          };
        })
      );

      await ScreeningSession.findByIdAndUpdate(sessionId, {
        status: 'completed',
        shortlistedCount: shortlistedCandidates.length,
        results: results.map(r => r._id),
        shortlistExplanation,
        completedAt: new Date()
      });
    } catch (error) {
      console.error('Error generating shortlist explanation:', error);
      await ScreeningSession.findByIdAndUpdate(sessionId, {
        status: 'completed',
        shortlistedCount: shortlistedCandidates.length,
        results: results.map(r => r._id),
        completedAt: new Date()
      });
    }

    console.log(`Screening completed for session ${sessionId}`);
  }

  async getScreeningResults(sessionId: string, userId: string): Promise<any> {
    try {
      const session = await ScreeningSession.findById(sessionId)
        .populate('jobId')
        .populate('recruiterId')
        .populate({
          path: 'results',
          populate: {
            path: 'talentId',
            model: 'TalentProfile'
          }
        });

      if (!session) {
        throw new Error('Screening session not found');
      }

      if ((session.recruiterId as any)._id?.toString() !== userId) {
        throw new Error('Unauthorized access to screening results');
      }

      return session;
    } catch (error) {
      console.error('Error getting screening results:', error);
      throw error;
    }
  }

  async getShortlistedCandidates(jobId: string, limit: number = 20): Promise<IScreeningResultDocument[]> {
    try {
      console.log(`Fetching shortlisted candidates for jobId: ${jobId}, limit: ${limit}`);
      
      const results = await ScreeningResult.find({ 
        jobId, 
        shortlisted: true 
      })
      .populate('talentId')
      .sort({ ranking: 1 })
      .limit(limit);

      console.log(`Found ${results.length} shortlisted candidates for jobId: ${jobId}`);
      
      // Log each result to debug population issues
      results.forEach((result, index) => {
        console.log(`Result ${index + 1}:`, {
          _id: result._id,
          score: result.score,
          ranking: result.ranking,
          talentId: result.talentId,
          hasTalentData: !!(result.talentId as any)?.firstName
        });
      });

      return results;
    } catch (error: any) {
      console.error('Error getting shortlisted candidates:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        jobId,
        limit
      });
      throw error;
    }
  }

  async getAllScreeningSessions(recruiterId: string): Promise<any[]> {
    try {
      const sessions = await ScreeningSession.find({ recruiterId })
        .populate('jobId', 'title description')
        .sort({ createdAt: -1 });

      return sessions;
    } catch (error) {
      console.error('Error getting screening sessions:', error);
      throw error;
    }
  }

  async exportShortlistToCSV(jobId: string): Promise<string> {
    const candidates = await this.getShortlistedCandidates(jobId);
    
    const headers = ['Ranking', 'Name', 'Email', 'Match Score', 'Key Skills', 'Experience Level', 'AI Rationale'];
    const rows = candidates.map(c => {
      const profile = (c.talentId as any);
      if (!profile) return null;
      
      return [
        c.ranking.toString(),
        `${profile.firstName || ''} ${profile.lastName || ''}`,
        profile.email || 'N/A',
        `${c.score}%`,
        Array.isArray(profile.skills) ? profile.skills.slice(0, 5).join('; ') : '',
        profile.title || 'N/A',
        (c.reasoning?.overall || '').replace(/"/g, '""')
      ].map(field => `"${field}"`).join(',');
    }).filter(row => row !== null);

    return [headers.join(','), ...rows].join('\n');
  }
}
