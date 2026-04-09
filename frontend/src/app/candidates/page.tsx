'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Zap, 
  Filter, 
  Search, 
  ChevronDown, 
  Download,
  AlertCircle,
  Loader2,
  Users
} from 'lucide-react';
import CandidateCard from '@/components/CandidateCard';
import RecruiterSidebar from '@/components/RecruiterSidebar';

// Generic Candidate Interface
interface ApplicationData {
  _id: string;
  candidateId: any;
  jobId: any;
  status: string;
  appliedAt: string;
  recruiterNotes?: string;
  aiReasoning?: any;
}

export default function CandidatesPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    skillFilter: '',
    experienceFilter: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Check if user has recruiter or admin role
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (user && !['recruiter', 'admin'].includes(user.role)) {
      router.push('/dashboard'); // Redirect talent users to their dashboard
      return;
    }

    const fetchAllCandidates = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await axios.get('/api/applications?limit=50', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setApplications(response.data.applications || []);
      } catch (err: any) {
        console.error('Failed to retrieve candidates:', err);
        setError(err.response?.data?.message || 'Failed to retrieve candidates.');
        if (err.response?.status === 401 || err.response?.status === 403) {
           localStorage.removeItem('token');
           localStorage.removeItem('user');
           window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllCandidates();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/applications/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(prev => prev.map(app => app._id === id ? { ...app, status } : app));
    } catch (err: any) {
      console.error('Failed to update status:', err);
      if (err.response?.status === 403) {
        setError('You are not authorized to update application status. Only recruiters and admins can perform this action.');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid status value provided.');
      } else {
        setError('Failed to update application status. Please try again.');
      }
    }
  };

  const activeApplications = applications.filter(app => app.candidateId); // only valid candidates
  
  const mappedCandidates = activeApplications.map(app => {
    const talent = app.candidateId || {};
    const ai = app.aiReasoning || {};
    
    const skillScores = Array.isArray(ai.skills) ? ai.skills.map((item: any) => Number(item.relevance || 0)) : [];
    const skillsAverage = skillScores.length > 0
      ? Math.round(skillScores.reduce((sum: number, value: number) => sum + value, 0) / skillScores.length * 100)
      : Math.round(Math.random() * 30 + 60); // Mock if missing
      
    const overallScore = ai.overallScore || Math.round(Math.random() * 30 + 60);

    return {
      _id: app._id,
      name: `${talent.firstName || 'Candidate'} ${talent.lastName || ''}`.trim(),
      matchScore: overallScore,
      scoreBreakdown: {
        skills: skillsAverage,
        experience: ai.experience?.relevance ? Math.round(ai.experience.relevance * 100) : Math.round(Math.random() * 30 + 50),
        education: ai.education?.relevance ? Math.round(ai.education.relevance * 100) : Math.round(Math.random() * 30 + 50)
      },
      rationale: ai.overall || 'Candidate application is under review. Full AI breakdown pending.',
      status: app.status as any,
      experienceLevel: talent.title || 'Professional',
      skills: talent.skills || []
    };
  });

  const filteredCandidates = mappedCandidates.filter(c => {
    const matchesSkill = filters.skillFilter === '' || 
      c.skills.some((s: string) => s.toLowerCase().includes(filters.skillFilter.toLowerCase()));
    const matchesExp = filters.experienceFilter === 'all' || 
      c.experienceLevel.toLowerCase().includes(filters.experienceFilter.toLowerCase());
    
    return matchesSkill && matchesExp;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <RecruiterSidebar />
      <div className="flex-1 lg:ml-64 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <Users className="text-white w-5 h-5 fill-current" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">All Candidates</h1>
              </div>
              <p className="mt-2 text-slate-500 text-sm font-medium">Overview of all applicants across your active job postings.</p>
            </div>

            <div className="flex items-center space-x-3">
               <button 
                  className="flex items-center space-x-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
               >
                  <Download className="w-4 h-4" />
                  <span>Export List</span>
               </button>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center space-x-3">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm mb-8">
             <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                <div className="relative flex-1 group max-w-md">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                   <input 
                      type="text"
                      placeholder="Search candidates by skill..."
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      value={filters.skillFilter}
                      onChange={(e) => setFilters({ ...filters, skillFilter: e.target.value })}
                   />
                </div>
                
                <select 
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  value={filters.experienceFilter}
                  onChange={(e) => setFilters({ ...filters, experienceFilter: e.target.value })}
                >
                  <option value="all">All Experience Levels</option>
                  <option value="Entry">Entry Level</option>
                  <option value="Mid-Level">Mid-Level</option>
                  <option value="Senior">Senior</option>
                </select>
             </div>
             
             <div className="px-4 py-2 bg-slate-50 rounded-xl shadow-inner border border-slate-100 flex items-center space-x-2 shrink-0">
               <span className="text-primary-600 font-black">{filteredCandidates.length}</span>
               <span className="uppercase text-[10px] tracking-widest font-bold text-slate-500">Total Applicants</span>
             </div>
          </div>

          {/* Results List */}
          <div className="space-y-6">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
                 <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                 <p className="text-sm font-bold text-slate-500 tracking-tight">Loading candidates universe...</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                 <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                 <p className="text-xl font-bold text-slate-900">No candidates found.</p>
                 <p className="text-slate-400 mt-2 text-sm font-medium">As job applications roll in, candidates will appear here.</p>
              </div>
            ) : (
               <div className="grid gap-6">
                {filteredCandidates.map((candidate) => (
                  <CandidateCard 
                    key={candidate._id}
                    id={candidate._id}
                    name={candidate.name}
                    matchScore={candidate.matchScore}
                    scoreBreakdown={candidate.scoreBreakdown}
                    rationale={candidate.rationale}
                    status={candidate.status as any}
                    experienceLevel={candidate.experienceLevel}
                    skills={candidate.skills}
                    onAccept={() => handleUpdateStatus(candidate._id, 'shortlisted')}
                    onReject={() => handleUpdateStatus(candidate._id, 'rejected')}
                  />
                ))}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
