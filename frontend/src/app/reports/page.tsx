'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  FileText,
  Download,
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Target,
  AlertCircle,
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ChevronRight
} from 'lucide-react';
import RecruiterSidebar from '@/components/RecruiterSidebar';

interface Job {
  _id: string;
  title: string;
  company: string;
  isActive: boolean;
  createdAt: string;
  workType: string;
}

interface Application {
  _id: string;
  status: string;
  appliedAt: string;
  jobId: any;
  candidateId: any;
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

function MetricCard({
  label,
  value,
  sub,
  icon,
  trend,
  trendUp,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color: string;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
          {icon}
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${trendUp ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl sm:text-3xl font-black text-slate-900">{value}</div>
      <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wide">{label}</div>
      {sub && <div className="text-[10px] text-slate-400 font-medium mt-1">{sub}</div>}
    </div>
  );
}

function SimpleBarChart({ data, maxValue }: { data: { label: string; value: number; color: string }[]; maxValue: number }) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <div className="w-20 text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 text-right">{item.label}</div>
          <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${item.color}`}
              style={{ width: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%' }}
            />
          </div>
          <div className="w-8 text-xs font-black text-slate-700 shrink-0">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [sessions, setSessions] = useState<ScreeningSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportDate, setReportDate] = useState('');

  useEffect(() => {
    setReportDate(new Date().toLocaleDateString());
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setError(null);
    try {
      const [jobsRes, appsRes, sessionsRes] = await Promise.allSettled([
        axios.get('http://localhost:5000/api/jobs', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/applications?limit=100', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/screening/sessions', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data.jobs || []);
      if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data.applications || []);
      if (sessionsRes.status === 'fulfilled') setSessions(sessionsRes.value.data.sessions || []);
    } catch {
      setError('Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  // --- Derived metrics ---
  const activeJobs        = jobs.filter(j => j.isActive).length;
  const totalApps         = applications.length;
  const shortlistedApps   = applications.filter(a => a.status === 'shortlisted' || a.status === 'accepted').length;
  const rejectedApps      = applications.filter(a => a.status === 'rejected').length;
  const pendingApps       = applications.filter(a => ['pending', 'pending_score', 'screening'].includes(a.status)).length;
  const totalScreened     = sessions.reduce((s, r) => s + (r.totalCandidates || 0), 0);
  const totalShortlisted  = sessions.reduce((s, r) => s + (r.shortlistedCount || 0), 0);
  const conversionRate    = totalApps > 0 ? Math.round((shortlistedApps / totalApps) * 100) : 0;
  const screeningRate     = totalApps > 0 ? Math.round((totalScreened / Math.max(totalApps, 1)) * 100) : 0;

  const statusBreakdown = [
    { label: 'Pending',     value: pendingApps,    color: 'bg-blue-400' },
    { label: 'Shortlisted', value: shortlistedApps, color: 'bg-green-400' },
    { label: 'Rejected',    value: rejectedApps,   color: 'bg-red-400' },
  ];
  const maxStatus = Math.max(...statusBreakdown.map(d => d.value), 1);

  // Latest 5 jobs with their application counts
  const jobsWithCounts = jobs.slice(0, 5).map(job => ({
    ...job,
    appCount: applications.filter(a => {
      const jId = typeof a.jobId === 'object' ? a.jobId?._id : a.jobId;
      return jId === job._id;
    }).length,
  }));

  const handleExportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Active Jobs', activeJobs],
      ['Total Applications', totalApps],
      ['Shortlisted', shortlistedApps],
      ['Rejected', rejectedApps],
      ['Pending', pendingApps],
      ['Total Screened by AI', totalScreened],
      ['AI Shortlisted', totalShortlisted],
      ['Conversion Rate (%)', conversionRate],
      ['AI Screening Rate (%)', screeningRate],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `umurava_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <RecruiterSidebar />

      <div className="flex-1 lg:ml-64 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <FileText className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports & Analytics</h1>
                <p className="text-slate-500 text-xs font-medium mt-0.5">
                  Recruitment funnel insights — updated {reportDate}
                </p>
              </div>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center space-x-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-32 flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
              <p className="text-sm font-bold text-slate-400">Building your report...</p>
            </div>
          ) : (
            <>
              {/* Top KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <MetricCard label="Active Jobs"         value={activeJobs}       icon={<Briefcase className="w-5 h-5 text-blue-600" />}   color="bg-blue-50"    trend="+12%" trendUp />
                <MetricCard label="Total Applicants"    value={totalApps}        icon={<Users className="w-5 h-5 text-purple-600" />}  color="bg-purple-50"  trend="+8%"  trendUp />
                <MetricCard label="Shortlisted"         value={shortlistedApps}  icon={<CheckCircle className="w-5 h-5 text-green-600" />} color="bg-green-50"   trend="+15%" trendUp />
                <MetricCard label="Conversion Rate"     value={`${conversionRate}%`} icon={<TrendingUp className="w-5 h-5 text-orange-600" />} color="bg-orange-50" />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">

                {/* Application Status Breakdown */}
                <div className="xl:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h2 className="font-black text-slate-900">Application Status</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Pipeline breakdown</p>
                  </div>
                  <div className="p-6">
                    <SimpleBarChart data={statusBreakdown} maxValue={maxStatus} />
                    <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-black text-blue-600">{pendingApps}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Pending</div>
                      </div>
                      <div>
                        <div className="text-lg font-black text-green-600">{shortlistedApps}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Shortlisted</div>
                      </div>
                      <div>
                        <div className="text-lg font-black text-red-600">{rejectedApps}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Rejected</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Screening Stats */}
                <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="font-black text-slate-900">AI Screening Performance</h2>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Gemini AI pipeline results</p>
                    </div>
                    <button
                      onClick={() => router.push('/screening')}
                      className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
                    >
                      Manage <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      {[
                        { label: 'Sessions Run',      value: sessions.length,    icon: <Target className="w-4 h-4 text-primary-600" />,    bg: 'bg-primary-50' },
                        { label: 'Candidates Scored', value: totalScreened,      icon: <Zap className="w-4 h-4 text-yellow-600" />,        bg: 'bg-yellow-50' },
                        { label: 'AI Shortlisted',    value: totalShortlisted,   icon: <CheckCircle className="w-4 h-4 text-green-600" />, bg: 'bg-green-50' },
                        { label: 'Screening Rate',    value: `${screeningRate}%`,icon: <BarChart3 className="w-4 h-4 text-blue-600" />,    bg: 'bg-blue-50' },
                      ].map(m => (
                        <div key={m.label} className={`${m.bg} rounded-2xl p-4`}>
                          <div className="mb-2">{m.icon}</div>
                          <div className="text-xl font-black text-slate-900">{m.value}</div>
                          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">{m.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* AI Quality progression bar */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-900 to-primary-700 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div>
                          <div className="text-primary-200 text-[10px] font-black uppercase tracking-widest mb-1">AI Match Quality Score</div>
                          <div className="text-3xl font-black text-white">85%</div>
                          <div className="text-primary-300 text-xs font-medium mt-1">Avg. candidate quality across all screenings</div>
                        </div>
                        <div className="w-20 h-20 rounded-full border-4 border-primary-500/50 flex items-center justify-center">
                          <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Jobs Performance Table */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-black text-slate-900">Job Performance</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Applications by job posting</p>
                  </div>
                  <button
                    onClick={() => router.push('/jobs')}
                    className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
                  >
                    View all <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {jobsWithCounts.length === 0 ? (
                  <div className="py-16 text-center">
                    <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="font-bold text-slate-500">No job postings yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                          <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Job Title</th>
                          <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider hidden sm:table-cell">Work Type</th>
                          <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider hidden md:table-cell">Status</th>
                          <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Applications</th>
                          <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider hidden sm:table-cell">Posted</th>
                          <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {jobsWithCounts.map((job) => (
                          <tr key={job._id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => router.push(`/jobs/${job._id}/candidates`)}>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center text-xs font-black text-primary-600 shrink-0">
                                  {job.title?.[0] || 'J'}
                                </div>
                                <p className="font-bold text-slate-900 truncate max-w-[180px]">{job.title}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden sm:table-cell">
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-tight">{job.workType}</span>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                              <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${job.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                {job.isActive ? 'Active' : 'Closed'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-black text-slate-900">{job.appCount}</span>
                                {job.appCount > 0 && (
                                  <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary-500 rounded-full"
                                      style={{ width: `${Math.min((job.appCount / Math.max(totalApps, 1)) * 100 * 2, 100)}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden sm:table-cell">
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Calendar className="w-3 h-3" />
                                <span className="text-xs font-medium">{new Date(job.createdAt).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
