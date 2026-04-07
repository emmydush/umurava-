'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { 
  Zap, 
  ArrowLeft, 
  Filter, 
  Search, 
  ChevronDown, 
  Download,
  AlertCircle,
  Loader2
} from 'lucide-react';
import CandidateCard from '@/components/CandidateCard';
import { RootState } from '@/store';
import { 
  setCandidates, 
  updateCandidateStatus, 
  setFilters, 
  setLoading, 
  setError 
} from '@/store/candidateSlice';

export default function CandidateRankedView() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { candidates, filters, loading, error } = useSelector((state: RootState) => state.candidate);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for demonstration - in production, this would be an API call
  useEffect(() => {
    const fetchCandidates = async () => {
      dispatch(setLoading(true));
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await axios.get(`http://localhost:5000/api/screening/shortlisted/${id}?limit=20`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const shortlist = response.data.candidates || [];
        const mappedCandidates = shortlist.map((result: any) => {
          const talent = result.talentId || {};
          const skillScores = Array.isArray(result.reasoning?.skills) ? result.reasoning.skills.map((item: any) => Number(item.relevance || 0)) : [];
          const skillsAverage = skillScores.length > 0
            ? Math.round(skillScores.reduce((sum: number, value: number) => sum + value, 0) / skillScores.length * 100)
            : 0;

          return {
            _id: result._id,
            name: `${talent.firstName || 'Candidate'} ${talent.lastName || ''}`.trim(),
            matchScore: result.score || 0,
            scoreBreakdown: {
              skills: skillsAverage || Math.round((result.score || 0) * 0.7),
              experience: Math.round((result.reasoning?.experience?.relevance || 0) * 100),
              education: Math.round((result.reasoning?.education?.relevance || 0) * 100)
            },
            rationale: result.reasoning?.overall || 'No detailed explanation available.',
            status: 'pending' as const,
            experienceLevel: talent.title || 'N/A',
            skills: talent.skills || []
          };
        });

        dispatch(setCandidates(mappedCandidates));
      } catch (err: any) {
        console.error('Failed to retrieve candidate rankings:', err);
        dispatch(setError(err.response?.data?.message || 'Failed to retrieve candidate rankings.'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (id) {
      fetchCandidates();
    }
  }, [dispatch, id]);

  const filteredCandidates = candidates.filter(c => {
    const matchesScore = c.matchScore >= filters.scoreThreshold;
    const matchesSkill = filters.skillFilter === '' || 
      c.skills.some(s => s.toLowerCase().includes(filters.skillFilter.toLowerCase()));
    const matchesExp = filters.experienceFilter === 'all' || 
      c.experienceLevel.toLowerCase().includes(filters.experienceFilter.toLowerCase());
    
    return matchesScore && matchesSkill && matchesExp;
  });

  const handleAccept = (candidateId: string) => {
    dispatch(updateCandidateStatus({ id: candidateId, status: 'accepted' }));
  };

  const handleReject = (candidateId: string) => {
    dispatch(updateCandidateStatus({ id: candidateId, status: 'rejected' }));
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios({
        url: `http://localhost:5000/api/screening/export/${id}`,
        method: 'GET',
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `shortlist_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export CSV:', err);
      dispatch(setError('Failed to download the shortlist export.'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <button 
              onClick={() => router.back()}
              className="flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold">Back to Positions</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Zap className="text-white w-5 h-5 fill-current" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">AI Talent Ranking</h1>
            </div>
            <p className="mt-2 text-slate-500 text-sm font-medium">Analyzing 15+ candidates based on your Job Description.</p>
          </div>

          <div className="flex items-center space-x-3">
             <button 
                onClick={handleExportCSV}
                className="flex items-center space-x-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
             >
                <Download className="w-4 h-4" />
                <span>Export Report</span>
             </button>
             <button className="flex items-center space-x-2 px-5 py-3 bg-primary-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all active:scale-95">
                <span>Hire Top Match</span>
             </button>
          </div>
        </div>

        {/* Global Alert */}
        <div className="mb-8 p-4 bg-primary-900 text-white rounded-3xl flex items-center justify-between shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/30 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
           <div className="flex items-center space-x-4 relative z-10">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                 <AlertCircle className="w-5 h-5 text-primary-200" />
              </div>
              <div>
                 <div className="text-sm font-black tracking-tight">GEMINI AI ANALYSIS COMPLETE</div>
                 <div className="text-xs text-primary-200/80 font-medium">We identified 3 top-tier matches exceeding your 80% threshold.</div>
              </div>
           </div>
           <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative z-10">
              Refresh Analysis
           </button>
        </div>

        {/* Filters & Control Bar */}
        <div className="glass-card mb-8 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl">
           <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
              <div className="relative flex-1 group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                 <input 
                    type="text"
                    placeholder="Search by skill (React, Python...)"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    value={filters.skillFilter}
                    onChange={(e) => dispatch(setFilters({ skillFilter: e.target.value }))}
                 />
              </div>

              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
                  showFilters ? 'bg-primary-50 text-primary-600 border border-primary-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Advanced Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
           </div>

           <div className="flex items-center space-x-6 text-sm font-bold text-slate-500 bg-slate-50 p-2 rounded-2xl border border-slate-100">
              <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center space-x-2">
                 <span className="text-primary-600 font-black">{filteredCandidates.length}</span>
                 <span className="uppercase text-[10px] tracking-widest">Matches</span>
              </div>
              <div className="pr-2">
                 <span className="uppercase text-[9px] tracking-widest block opacity-60">Sort by</span>
                 <select className="bg-transparent text-slate-900 border-none p-0 focus:ring-0 cursor-pointer">
                    <option>Match Score (Desc)</option>
                    <option>Experience</option>
                    <option>Recent Added</option>
                 </select>
              </div>
           </div>
        </div>

        {showFilters && (
           <div className="glass-card mb-8 p-8 animate-slide-up shadow-2xl border-primary-100/50 bg-primary-50/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Match Score Threshold</label>
                       <span className="text-sm font-black text-primary-600 bg-white border border-primary-200 px-3 py-1 rounded-xl shadow-sm">{filters.scoreThreshold}%</span>
                    </div>
                    <input 
                       type="range"
                       min="0"
                       max="100"
                       step="5"
                       className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                       value={filters.scoreThreshold}
                       onChange={(e) => dispatch(setFilters({ scoreThreshold: parseInt(e.target.value) }))}
                    />
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <span>Minimum Value</span>
                       <span>Exclusive Only</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Experience Seniority</label>
                    <div className="flex flex-wrap gap-2">
                       {['all', 'Entry', 'Mid-Level', 'Senior'].map((level) => (
                          <button 
                            key={level}
                            onClick={() => dispatch(setFilters({ experienceFilter: level }))}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
                              filters.experienceFilter === level 
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                                : 'bg-white border border-slate-200 text-slate-500 hover:border-primary-500 hover:text-primary-600'
                            }`}
                          >
                             {level}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* Results List */}
        <div className="space-y-6">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center text-center space-y-4">
               <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
               <p className="text-lg font-bold text-slate-900 tracking-tight">AI Engine Calculating Rankings...</p>
               <p className="text-slate-400 text-sm max-w-xs font-medium">Benchmarking resumes against the required job description competency matrix.</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="py-24 text-center glass-card">
               <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-xl font-bold text-slate-900">No matches found for current filters.</p>
               <p className="text-slate-400 mt-2">Try adjusting the match threshold or removing skill filters.</p>
            </div>
          ) : (
            filteredCandidates.map((candidate) => (
              <CandidateCard 
                key={candidate._id}
                id={candidate._id}
                name={candidate.name}
                matchScore={candidate.matchScore}
                scoreBreakdown={candidate.scoreBreakdown}
                rationale={candidate.rationale}
                status={candidate.status}
                experienceLevel={candidate.experienceLevel}
                skills={candidate.skills}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
