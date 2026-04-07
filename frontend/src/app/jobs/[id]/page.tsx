'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar,
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle,
  Zap,
  AlertCircle
} from 'lucide-react';
import TalentSidebar from '@/components/TalentSidebar';

interface Job {
  _id: string;
  title: string;
  company?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  experience: string;
  salary?: { min: number; max: number; currency: string };
  location: string;
  workType: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
}

export default function JobDetails() {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (params.id) fetchJob(params.id as string);
  }, [params.id]);

  const fetchJob = async (jobId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/jobs/${jobId}`, {
        headers: token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.status === 401 || response.status === 403) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setJob(data.job);
    } catch (err: any) {
      if (!err.message.includes('Session expired')) {
        setError('Failed to fetch job details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) { setError('Please login to apply for this job'); setApplying(false); return; }
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ jobId: job?._id, coverNote: coverNote.trim() })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        let errorMessage = data.message || `HTTP error! status: ${response.status}`;
        
        // Provide more helpful error messages
        if (data.message?.includes('Talent profile not found')) {
          errorMessage = 'Please create your talent profile before applying for jobs.';
        } else if (data.message?.includes('already applied')) {
          errorMessage = 'You have already applied for this position.';
        } else if (response.status === 401) {
          errorMessage = 'Your session has expired. Please login again.';
        } else if (response.status === 403) {
          errorMessage = 'You are not authorized to perform this action.';
        }
        
        throw new Error(errorMessage);
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TalentSidebar />

      <div className="lg:ml-64 pt-14 lg:pt-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center space-x-4">
          <button
            onClick={() => router.push('/jobs')}
            className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-900 transition-colors text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Jobs</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center">
              <Zap className="text-white w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-bold text-slate-900 text-sm">Job Details</span>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading job...</p>
          </div>
        ) : !job ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4 px-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-xl font-black text-slate-700">{error || 'Job not found'}</h2>
            <button onClick={() => router.push('/jobs')} className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold">
              Browse Jobs
            </button>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 px-4 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Application Submitted!</h2>
              <p className="text-slate-500 max-w-sm">
                Great move! You'll be notified once the recruiter reviews your profile.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => router.push('/')} className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all">
                View My Applications
              </button>
              <button onClick={() => router.push('/jobs')} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all">
                Browse More Jobs
              </button>
            </div>
          </div>
        ) : (
          <main className="p-4 sm:p-8">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Job Details */}
              <div className="lg:col-span-2 space-y-5">
                {/* Hero card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-2xl font-black text-primary-600 border border-primary-100 shrink-0">
                      {(job.company || job.title)?.[0] || 'J'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight">
                          {job.title}
                        </h1>
                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                          job.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {job.isActive ? 'Active' : 'Closed'}
                        </span>
                      </div>
                      {job.company && <p className="text-primary-600 font-bold mt-1">{job.company}</p>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-5">
                    <div className="flex items-center text-slate-500 text-sm font-medium">
                      <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />{job.location || 'Remote'}
                    </div>
                    <div className="flex items-center text-slate-500 text-sm font-medium">
                      <Briefcase className="w-4 h-4 mr-1.5 text-slate-400" />{job.workType}
                    </div>
                    {job.experience && (
                      <div className="flex items-center text-slate-500 text-sm font-medium">
                        <Clock className="w-4 h-4 mr-1.5 text-slate-400" />{job.experience}
                      </div>
                    )}
                    {job.salary && (
                      <div className="flex items-center text-slate-500 text-sm font-medium">
                        <DollarSign className="w-4 h-4 mr-1 text-slate-400" />
                        {job.salary.min.toLocaleString()}–{job.salary.max.toLocaleString()} {job.salary.currency}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Description</h3>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
                  </div>
                </div>

                {/* Skills */}
                {job.skills?.length > 0 && (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, i) => (
                        <span key={i} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-bold border border-primary-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {job.requirements?.length > 0 && (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Requirements</h3>
                    <ul className="space-y-2">
                      {job.requirements.map((req, i) => (
                        <li key={i} className="flex items-start space-x-2 text-sm text-slate-600">
                          <span className="text-primary-500 mt-1 shrink-0">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Responsibilities */}
                {job.responsibilities?.length > 0 && (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Responsibilities</h3>
                    <ul className="space-y-2">
                      {job.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start space-x-2 text-sm text-slate-600">
                          <span className="text-primary-500 mt-1 shrink-0">•</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Application Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm lg:sticky lg:top-6">
                  <h2 className="font-black text-slate-900 mb-4">Apply for this Role</h2>
                  
                  {!job.isActive ? (
                    <div className="py-8 text-center">
                      <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                      </div>
                      <p className="font-bold text-red-600 text-sm">Position Closed</p>
                      <p className="text-slate-500 text-xs mt-1">No longer accepting applications.</p>
                    </div>
                  ) : !isLoggedIn ? (
                    <div className="py-6 text-center space-y-4">
                      <p className="text-sm text-slate-500">Sign in to apply for this position</p>
                      <button onClick={() => router.push('/login')} className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all">
                        Sign In to Apply
                      </button>
                      <button onClick={() => router.push('/register')} className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm">
                        Create Account
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApply} className="space-y-4">
                      {error && (
                        <div className="flex flex-col space-y-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                          </div>
                          {error.includes('create your talent profile') && (
                            <button 
                              onClick={() => router.push('/talents/profile')}
                              className="w-full py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all text-xs"
                            >
                              Create My Profile
                            </button>
                          )}
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                          Cover Note <span className="text-slate-300 normal-case font-medium tracking-normal">(Optional)</span>
                        </label>
                        <textarea
                          rows={5}
                          value={coverNote}
                          onChange={(e) => setCoverNote(e.target.value)}
                          placeholder="Tell us why you're a great fit for this role..."
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={applying}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-primary-600 text-white rounded-2xl font-black hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95 disabled:opacity-60"
                      >
                        {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>{applying ? 'Submitting...' : 'Submit Application'}</span>
                      </button>
                    </form>
                  )}

                  <div className="mt-5 pt-5 border-t border-slate-100 flex items-center text-xs text-slate-400 space-x-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
