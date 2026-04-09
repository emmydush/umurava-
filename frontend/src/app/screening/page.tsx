'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Target,
  Zap,
  Play,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Briefcase,
  BarChart3,
  RefreshCw,
  XCircle
} from 'lucide-react';
import RecruiterSidebar from '@/components/RecruiterSidebar';

interface Job {
  _id: string;
  title: string;
  company: string;
  isActive: boolean;
  createdAt: string;
}

interface ScreeningSession {
  _id: string;
  jobId: string;
  status: string;
  totalCandidates: number;
  shortlistedCount: number;
  createdAt: string;
  jobTitle?: string;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    completed:  { label: 'Completed',  cls: 'bg-green-100 text-green-700 border-green-200',   icon: <CheckCircle className="w-3 h-3" /> },
    processing: { label: 'Processing', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    pending:    { label: 'Pending',    cls: 'bg-blue-100 text-blue-700 border-blue-200',       icon: <Clock className="w-3 h-3" /> },
    failed:     { label: 'Failed',     cls: 'bg-red-100 text-red-700 border-red-200',          icon: <XCircle className="w-3 h-3" /> },
  };
  const s = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600 border-slate-200', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-tight border ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  );
}

export default function ScreeningPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ScreeningSession[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [initiating, setInitiating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);


  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setError(null);
    try {
      const [sessionsRes, jobsRes] = await Promise.allSettled([
        axios.get('/api/screening/sessions', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/jobs', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (sessionsRes.status === 'fulfilled') {
        setSessions(sessionsRes.value.data.sessions || []);
      }
      if (jobsRes.status === 'fulfilled') {
        setJobs((jobsRes.value.data.jobs || []).filter((j: Job) => j.isActive));
      }
    } catch (err: any) {
      setError('Failed to load screening data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiate = async (jobId: string, jobTitle: string) => {
    const token = localStorage.getItem('token');
    setInitiating(jobId);
    setError(null);
    setSuccessMsg(null);
    try {
      await axios.post(
        '/api/screening/initiate',
        { jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMsg(`Screening initiated for "${jobTitle}". Results will appear shortly.`);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate screening.');
    } finally {
      setInitiating(null);
    }
  };

  const totalCandidates = sessions.reduce((s, sess) => s + (sess.totalCandidates || 0), 0);
  const totalShortlisted = sessions.reduce((s, sess) => s + (sess.shortlistedCount || 0), 0);
  const completedSessions = sessions.filter(s => s.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <RecruiterSidebar />

      <div className="flex-1 lg:ml-64 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Target className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI Screenings</h1>
                <p className="text-slate-500 text-xs font-medium mt-0.5">Run Gemini AI screening on your job applicants</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Feedback */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center space-x-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl flex items-center space-x-3">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-bold">{successMsg}</span>
            </div>
          )}

          {/* Stats Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Sessions',    value: sessions.length,    icon: <Target className="w-5 h-5 text-primary-600" />,  bg: 'bg-primary-50' },
              { label: 'Completed',         value: completedSessions,  icon: <CheckCircle className="w-5 h-5 text-green-600" />, bg: 'bg-green-50' },
              { label: 'Candidates Scored', value: totalCandidates,    icon: <Users className="w-5 h-5 text-purple-600" />,   bg: 'bg-purple-50' },
              { label: 'Shortlisted',       value: totalShortlisted,   icon: <Zap className="w-5 h-5 text-yellow-600" />,     bg: 'bg-yellow-50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 hover:shadow-md transition-all">
                <div className={`w-10 h-10 ${stat.bg} rounded-2xl flex items-center justify-center mb-3`}>
                  {stat.icon}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">{stat.value}</div>
                <div className="text-[10px] sm:text-xs font-bold text-slate-500 mt-1 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">

            {/* Sessions List */}
            <div className="xl:col-span-3">
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-black text-slate-900">Screening Sessions</h2>
                  <span className="text-xs font-bold text-slate-400">{sessions.length} total</span>
                </div>

                {loading ? (
                  <div className="py-16 flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                    <p className="text-sm font-bold text-slate-400">Loading sessions...</p>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="py-16 text-center px-6">
                    <Target className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="font-bold text-slate-500">No screening sessions yet.</p>
                    <p className="text-sm text-slate-400 mt-1">Initiate your first AI screening from the panel on the right.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {sessions.map((session) => (
                      <div
                        key={session._id}
                        className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                        onClick={() => {
                          const jobId = typeof session.jobId === 'string' ? session.jobId : (session.jobId as any)._id || (session.jobId as any).toString();
                          router.push(`/jobs/${jobId}/candidates`);
                        }}
                      >
                        <div className="flex items-center space-x-4 min-w-0">
                          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4 text-primary-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">
                              {session.jobTitle || `Job ${session.jobId.toString().slice(-6)}`}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <StatusBadge status={session.status} />
                              <span className="text-[10px] text-slate-400 font-medium">
                                {new Date(session.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right hidden sm:block">
                            <div className="text-sm font-black text-slate-900">{session.shortlistedCount}</div>
                            <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Shortlisted</div>
                          </div>
                          <div className="text-right hidden sm:block">
                            <div className="text-sm font-black text-slate-900">{session.totalCandidates}</div>
                            <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Scored</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Initiate Screening Panel */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm sticky top-8">
                <div className="px-6 py-5 border-b border-slate-100 bg-linear-to-r from-primary-600 to-primary-700">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-white fill-current" />
                    <h2 className="font-black text-white">Start AI Screening</h2>
                  </div>
                  <p className="text-primary-200 text-xs mt-1">Select a job to run Gemini AI analysis on all applicants</p>
                </div>

                {loading ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="p-6 text-center">
                    <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-500">No active job postings.</p>
                    <button
                      onClick={() => router.push('/jobs/create')}
                      className="mt-4 px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-all"
                    >
                      Create a Job
                    </button>
                  </div>
                ) : (
                  <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                    {jobs.map((job) => (
                      <div key={job._id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-primary-200 hover:bg-primary-50/30 transition-all">
                        <div className="min-w-0 flex-1 mr-3">
                          <p className="font-bold text-slate-900 text-sm truncate">{job.title}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">{job.company || 'Your Company'}</p>
                        </div>
                        <button
                          onClick={() => handleInitiate(job._id, job.title)}
                          disabled={initiating === job._id}
                          className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-xs font-black rounded-xl hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-60 shadow-sm shadow-primary-500/20"
                        >
                          {initiating === job._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                          Run
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    AI screening uses Gemini to analyse candidate resumes against job requirements and produce ranked shortlists automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
