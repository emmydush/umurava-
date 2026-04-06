'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Briefcase, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Zap, 
  Plus,
  FileText,
  Upload,
  BarChart3,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  workType: string;
  isActive: boolean;
  createdAt: string;
  applicationsCount?: number;
}

interface ScreeningSession {
  _id: string;
  jobId: string;
  recruiterId: string;
  totalCandidates: number;
  shortlistedCount: number;
  status: string;
  createdAt: string;
  jobTitle?: string;
}

export default function RecruiterDashboard({ userName }: { userName: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sessions, setSessions] = useState<ScreeningSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 8000)
      );

      const [jobsResponse, sessionsResponse] = await Promise.all([
        Promise.race([
          axios.get('http://localhost:5000/api/jobs', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          timeoutPromise
        ]) as Promise<any>,
        Promise.race([
          axios.get('http://localhost:5000/api/screening/sessions', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          timeoutPromise
        ]) as Promise<any>
      ]);

      setJobs(jobsResponse.data.jobs || []);
      setSessions(sessionsResponse.data.sessions || []);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-50">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-10">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold">Umurava<span className="text-primary-600">AI</span></span>
          </div>

          <nav className="space-y-1">
            <NavItem icon={<BarChart3 />} label="Analytics" active onClick={() => {}} />
            <NavItem icon={<Briefcase />} label="Job Postings" onClick={() => window.location.href = '/'} />
            <NavItem icon={<Users />} label="Candidates" onClick={() => window.location.href = '/jobs/demo-job-id/candidates'} />
            <NavItem icon={<Target />} label="Screenings" onClick={() => {}} />
            <NavItem icon={<FileText />} label="Reports" onClick={() => {}} />
          </nav>
        </div>

        <div className="mt-auto p-6 pb-12 border-t border-slate-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
              {userName.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{userName}</div>
              <div className="text-xs text-slate-500 capitalize">Recruiter</div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center space-x-2 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-64 min-h-screen p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back, {userName}!</h1>
            <p className="text-slate-500 text-sm mt-1">Here's what's happening with your recruitment funnel today.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => window.location.href = '/jobs/create'}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/10 hover:bg-primary-700 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Job</span>
            </button>
            <button 
              onClick={() => window.location.href = '/talents/upload-resume'}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Resume</span>
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Active Jobs" 
            value={jobs.filter(j => j.isActive).length.toString()} 
            icon={<Briefcase className="text-blue-600" />} 
            trend="+12%" 
          />
          <StatCard 
            title="Total Candidates" 
            value={sessions.reduce((sum, s) => sum + s.totalCandidates, 0).toString()} 
            icon={<Users className="text-purple-600" />} 
            trend="+5%" 
          />
          <StatCard 
            title="Shortlisted" 
            value={sessions.reduce((sum, s) => sum + s.shortlistedCount, 0).toString()} 
            icon={<CheckCircle className="text-green-600" />} 
            trend="+18%" 
          />
          <StatCard 
            title="Avg. Score" 
            value="78%" 
            icon={<TrendingUp className="text-orange-600" />} 
            trend="+2%" 
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Section - Jobs */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Recent Job Postings</h2>
                <button className="text-xs font-bold text-primary-600 hover:underline">View all</button>
              </div>
              <div className="p-0 overflow-x-auto">
                {jobs.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p>No jobs posted yet. Start by creating a new position.</p>
                    <button 
                      onClick={() => window.location.href = '/jobs/create'}
                      className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold"
                    >
                      Create First Job
                    </button>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-6 py-3">Job Title</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3 text-center">Status</th>
                        <th className="px-6 py-3 text-center">Candidates</th>
                        <th className="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {jobs.slice(0, 5).map((job) => (
                        <tr key={job._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{job.title}</div>
                            <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[250px]">{job.description}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase tracking-tight">
                              {job.workType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex h-2 w-2 rounded-full ${job.isActive ? 'bg-green-500' : 'bg-slate-300'} mr-2`}></span>
                            <span className="text-xs font-medium text-slate-600 capitalize">{job.isActive ? 'Active' : 'Closed'}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-bold text-slate-900">{job.applicationsCount || 0}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-primary-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Recent Activity</h2>
              </div>
              <div className="p-6 space-y-4">
                {sessions.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-4">No recent activity</p>
                ) : (
                  sessions.slice(0, 3).map((session) => (
                    <div key={session._id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {session.jobTitle || `Screening Session ${session._id.slice(-8)}`}
                          </div>
                          <div className="text-xs text-slate-400">
                            {session.shortlistedCount} of {session.totalCandidates} candidates shortlisted
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={session.status} />
                        <div className="text-xs text-slate-400 mt-1">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <button 
                  onClick={() => window.location.href = '/jobs/create'}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create New Job</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/talents/upload-resume'}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Resumes</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/screening'}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                  <Target className="w-5 h-5" />
                  <span>Start Screening</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Performance Metrics</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Time to Hire</span>
                  <span className="text-sm font-bold text-green-600">-15%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Quality Score</span>
                  <span className="text-sm font-bold text-primary-600">85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Screening Efficiency</span>
                  <span className="text-sm font-bold text-blue-600">92%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-primary-50 text-primary-600 font-bold' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
      }`}
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="text-sm">{label}</span>
      {active && <div className="ml-auto w-1 h-4 bg-primary-600 rounded-full"></div>}
    </button>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-white group-hover:scale-110 transition-all shadow-sm">
          {icon}
        </div>
        <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      </div>
      <div className="text-2xl font-black text-slate-900 mb-1">{value}</div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    completed: 'bg-green-100 text-green-700',
    processing: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-blue-100 text-blue-700',
    failed: 'bg-red-100 text-red-700',
  }[status] || 'bg-slate-100 text-slate-700';

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ${styles}`}>
      {status}
    </span>
  );
}
