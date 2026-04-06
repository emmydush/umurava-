import { JobPosting, TalentProfile, ScreeningResult, ScreeningSession, IScreeningResultDocument } from '../models';
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

      const candidates = await TalentProfile.find({
        workType: { $in: [job.workType, 'both'] }
      });

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

    for (const candidate of candidates) {
      try {
        const analysis = await this.geminiService.analyzeCandidate(job, candidate);
        
        const screeningResult = new ScreeningResult({
          jobId: job._id,
          talentId: candidate._id,
          score: analysis.score,
          ranking: 0,
          reasoning: analysis.reasoning,
          shortlisted: false
        });

        await screeningResult.save();
        results.push(screeningResult);
      } catch (error) {
        console.error(`Error analyzing candidate ${candidate._id}:`, error);
      }
    }

    results.sort((a, b) => b.score - a.score);

    const shortlistCount = Math.min(20, Math.max(10, Math.ceil(results.length * 0.2)));
    
    for (let i = 0; i < results.length; i++) {
      results[i].ranking = i + 1;
      results[i].shortlisted = i < shortlistCount;
      await (results[i] as any).save();
    }

    const shortlistedCandidates = results.slice(0, shortlistCount);
    
    let shortlistExplanation = '';
    try {
      shortlistExplanation = await this.geminiService.generateShortlistExplanation(
        job, 
        shortlistedCandidates.map(result => ({
          ...result,
          firstName: candidates.find(c => c._id.toString() === result.talentId.toString())?.firstName,
          lastName: candidates.find(c => c._id.toString() === result.talentId.toString())?.lastName,
          skills: candidates.find(c => c._id.toString() === result.talentId.toString())?.skills,
          experience: candidates.find(c => c._id.toString() === result.talentId.toString())?.experience
        }))
      );
    } catch (error) {
      console.error('Error generating shortlist explanation:', error);
    }

    await ScreeningSession.findByIdAndUpdate(sessionId, {
      status: 'completed',
      shortlistedCount: shortlistedCandidates.length,
      results: results.map(r => r._id),
      completedAt: new Date()
    });

    console.log(`Screening completed for session ${sessionId}`);
    console.log(`Shortlist explanation: ${shortlistExplanation}`);
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
      const results = await ScreeningResult.find({ 
        jobId, 
        shortlisted: true 
      })
      .populate('talentId')
      .sort({ ranking: 1 })
      .limit(limit);

      return results;
    } catch (error) {
      console.error('Error getting shortlisted candidates:', error);
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
}
