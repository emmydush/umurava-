'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Briefcase, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Zap, 
  Shield, 
  Globe,
  Plus,
  FileText,
  Upload,
  BarChart3,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  workType: string;
  isActive: boolean;
  createdAt: string;
}

interface ScreeningSession {
  _id: string;
  jobId: string;
  recruiterId: string;
  totalCandidates: number;
  shortlistedCount: number;
  status: string;
  createdAt: string;
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sessions, setSessions] = useState<ScreeningSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      setIsLoggedIn(true);
      try {
        const user = JSON.parse(userStr);
        setUserName(user.firstName || 'User');
      } catch (e) {
        setUserName('User');
      }
      fetchDashboardData(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async (token: string) => {
    try {
      const [jobsResponse, sessionsResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/screening/sessions', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setJobs(jobsResponse.data.jobs || []);
      setSessions(sessionsResponse.data.sessions || []);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
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
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <div className="mt-4 text-primary-600 font-medium animate-pulse">Loading experience...</div>
        </div>
      </div>
    );
  }

  // --- Landing Page for Unauthenticated Users ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen overflow-x-hidden">
        {/* Navigation */}
        <nav className="fixed w-full z-50 glass-card mx-auto mt-4 px-6 py-3 max-w-6xl left-0 right-0 border-none rounded-2xl shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-primary-600 to-accent rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">Umurava<span className="text-primary-600">AI</span></span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium hover:text-primary-600 transition-colors">Features</a>
            <a href="#about" className="text-sm font-medium hover:text-primary-600 transition-colors">About</a>
            <button 
              onClick={() => window.location.href = '/login'}
              className="text-sm font-semibold hover:text-primary-600 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => window.location.href = '/register'}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all active:scale-95"
            >
              Get Started
            </button>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 md:pt-48 md:pb-32 flex flex-col items-center text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary-500/5 to-transparent -z-10 pointer-events-none"></div>
          
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-bold mb-6 animate-fade-in border border-primary-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            <span>POWERED BY ADVANCED AI</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight animate-slide-up max-w-4xl tracking-tight">
            The Future of <span className="gradient-text">Talent Screening</span> is Here
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed animate-slide-up delay-100 px-4">
            Umurava AI automates the entire recruitment funnel. From resume parsing to interactive technical screenings, we help you hire the top 1% faster than ever.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-slide-up delay-200">
            <button 
              onClick={() => window.location.href = '/register'}
              className="group px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-primary-500/30 hover:bg-primary-700 hover:-translate-y-1 transition-all flex items-center justify-center"
            >
              Start Free Trial 
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => window.location.href = '/login'}
              className="px-8 py-4 glass-card font-bold text-lg hover:bg-white/60 hover:-translate-y-1 transition-all"
            >
              View Demo
            </button>
          </div>

          <div className="mt-20 w-full max-w-5xl px-4 animate-fade-in delay-300">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative glass-card border-slate-200/50 overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" 
                  alt="Umurava Dashboard" 
                  className="w-full h-auto object-cover opacity-90"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-primary-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
            <div>
              <div className="text-4xl md:text-5xl font-black mb-2 gradient-text">10k+</div>
              <div className="text-primary-200/60 font-medium text-sm md:text-base">Talents Screened</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black mb-2 gradient-text">85%</div>
              <div className="text-primary-200/60 font-medium text-sm md:text-base">Time Saved</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black mb-2 gradient-text">500+</div>
              <div className="text-primary-200/60 font-medium text-sm md:text-base">Hiring Partners</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black mb-2 gradient-text">Top 1%</div>
              <div className="text-primary-200/60 font-medium text-sm md:text-base">Quality Retention</div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Zap className="text-primary-600 w-5 h-5 fill-current" />
              <span className="text-lg font-bold">Umurava<span className="text-primary-600">AI</span></span>
            </div>
            <div className="text-slate-400 text-sm">
              © 2026 Umurava AI. All rights reserved. Built for the modern workspace.
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // --- Dashboard for Authenticated Users ---
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-20">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-10">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold">Umurava<span className="text-primary-600">AI</span></span>
          </div>

          <nav className="space-y-1">
            <NavItem icon={<BarChart3 />} label="Analytics" active onClick={() => {}} />
            <NavItem icon={<Briefcase />} label="Job Postings" onClick={() => window.location.href = '/jobs'} />
            <NavItem icon={<Users />} label="Talents" onClick={() => window.location.href = '/talents'} />
            <NavItem icon={<CheckCircle />} label="Screening" onClick={() => {}} />
            <NavItem icon={<FileText />} label="Reports" onClick={() => {}} />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
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
            title="Candidates" 
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
            icon={<Zap className="text-orange-600" />} 
            trend="+2%" 
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Section - Jobs */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Recent Job Postings</h2>
                <a href="/jobs" className="text-xs font-bold text-primary-600 hover:underline">View all</a>
              </div>
              <div className="p-0 overflow-x-auto">
                {jobs.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p>No jobs posted yet. Start by creating a new position.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-6 py-3">Job Title</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3 text-center">Status</th>
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
          </div>

          {/* Sidebar - Sessions */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Active Screenings</h2>
              </div>
              <div className="p-6 space-y-4">
                {sessions.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-4">No active sessions</p>
                ) : (
                  sessions.slice(0, 4).map((session) => (
                    <div key={session._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-bold text-slate-900">Session ID: {session._id.slice(-8)}</div>
                          <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                            {new Date(session.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <StatusBadge status={session.status} />
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="text-[10px] font-bold text-slate-500">
                            {session.shortlistedCount} / {session.totalCandidates} shortlists
                         </div>
                         <button className="text-primary-600 text-[10px] font-black uppercase hover:underline">
                            Details
                         </button>
                      </div>
                      <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary-500 h-full transition-all duration-500" 
                          style={{ width: `${(session.shortlistedCount / session.totalCandidates) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Helper Components ---

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

