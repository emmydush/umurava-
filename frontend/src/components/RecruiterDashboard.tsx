'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Briefcase, 
  Users, 
  CheckCircle, 
  TrendingUp,
  Clock,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import RecruiterSidebar from './RecruiterSidebar';

interface Job {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  workType: string;
  isActive: boolean;
  createdAt: string;
  applicationsCount?: number;
  pendingApplications?: number;
  scoredApplications?: number;
  shortlistedApplications?: number;
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
  const [authErrorCount, setAuthErrorCount] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const startPolling = () => {
      fetchDashboardData();
      interval = setInterval(fetchDashboardData, 60000); // 60s to prevent rate limiting
    };
    
    if (authErrorCount < 3) {
      startPolling();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [authErrorCount]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      console.log('RecruiterDashboard: Fetching data...');
      console.log('RecruiterDashboard: Token exists:', !!token);
      console.log('RecruiterDashboard: User exists:', !!userStr);
      
      if (!token || !userStr) {
        console.log('RecruiterDashboard: No auth data, showing empty dashboard');
        setJobs([]);
        setSessions([]);
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      console.log('RecruiterDashboard: User role:', user.role);
      
      if (user.role !== 'recruiter' && user.role !== 'admin') {
        console.log('RecruiterDashboard: Invalid role for recruiter dashboard:', user.role);
        setJobs([]);
        setSessions([]);
        setLoading(false);
        return;
      }

      // Simple API call with basic error handling
      try {
        console.log('RecruiterDashboard: Fetching jobs...');
        const jobsResponse = await axios.get('http://localhost:5000/api/jobs', { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });
        
        console.log('RecruiterDashboard: Jobs fetched successfully');
        const jobsData = jobsResponse.data.jobs || [];
        
        // Set jobs without application counts for now
        const jobsWithCounts = jobsData.map((job: Job) => ({
          ...job,
          applicationsCount: 0,
          pendingApplications: 0,
          scoredApplications: 0,
          shortlistedApplications: 0
        }));
        
        setJobs(jobsWithCounts);
        setSessions([]);
        
      } catch (error: any) {
        console.error('RecruiterDashboard: API error:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('RecruiterDashboard: Auth error, clearing data but not redirecting');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        setJobs([]);
        setSessions([]);
      }
      
    } catch (err: any) {
      console.error('RecruiterDashboard: General error:', err);
      setJobs([]);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <RecruiterSidebar />

      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen p-4 sm:p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back, {userName}!</h1>
          <p className="text-slate-500 text-sm mt-1">Here's what's happening with your recruitment funnel today.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard 
            title="Active Jobs" 
            value={jobs.filter(j => j.isActive).length.toString()} 
            icon={<Briefcase className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />} 
          />
          <StatCard 
            title="Candidates" 
            value={sessions.reduce((sum, s) => sum + s.totalCandidates, 0).toString()} 
            icon={<Users className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />} 
          />
          <StatCard 
            title="Shortlisted" 
            value={sessions.reduce((sum, s) => sum + s.shortlistedCount, 0).toString()} 
            icon={<CheckCircle className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" />} 
          />
          <StatCard 
            title="Avg. Quality" 
            value="85%" 
            icon={<TrendingUp className="text-orange-600 w-5 h-5 sm:w-6 sm:h-6" />} 
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="xl:col-span-2 space-y-6 sm:space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-5 sm:px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Recent Job Postings</h2>
                <button className="text-xs font-bold text-primary-600 hover:underline">View all</button>
              </div>
              <div className="p-0">
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
                  <div className="divide-y divide-slate-100">
                    {jobs.slice(0, 5).map((job) => (
                      <div key={job._id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => window.location.href = `/jobs/${job._id}/candidates`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0 pr-4">
                            <h3 className="font-bold text-slate-900 truncate tracking-tight">{job.title}</h3>
                            
                            <div className="flex flex-wrap items-center gap-2 mt-1 mb-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight ${job.isActive ? 'bg-green-100 text-green-700 w-fit' : 'bg-slate-100 text-slate-600 w-fit'}`}>
                                {job.isActive ? 'Active' : 'Closed'}
                              </span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md uppercase font-bold tracking-tight">
                                {job.workType}
                              </span>
                            </div>

                            {/* Metrics visible cleanly on Mobile and Desktop */}
                            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs font-bold font-mono">
                              <span className="flex items-center text-slate-600 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                                <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                {job.applicationsCount || 0} <span className="ml-1 text-[10px] uppercase font-sans text-slate-400 tracking-wider">Total</span>
                              </span>
                              <span className="flex items-center text-yellow-700 bg-yellow-50 border border-yellow-100 px-2 py-1 rounded-lg">
                                <Clock className="w-3.5 h-3.5 mr-1" />
                                {job.pendingApplications || 0} <span className="ml-1 text-[10px] uppercase font-sans tracking-wider">Pend</span>
                              </span>
                              <span className="flex items-center text-green-700 bg-green-50 border border-green-100 px-2 py-1 rounded-lg">
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                {job.shortlistedApplications || 0} <span className="ml-1 text-[10px] uppercase font-sans tracking-wider">Short</span>
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center justify-center p-2 rounded-xl text-slate-400 bg-slate-50 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-5 sm:px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Recent Activity</h2>
              </div>
              <div className="p-5 sm:p-6 space-y-4">
                {sessions.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-4">No recent activity</p>
                ) : (
                  sessions.slice(0, 3).map((session) => (
                    <div key={session._id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 truncate">
                            {session.jobTitle || `Screening ${session._id.slice(-4)}`}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {session.shortlistedCount} shortlisted
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <StatusBadge status={session.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Performance metrics */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-5 sm:px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Performance Metrics</h2>
              </div>
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 font-bold">Time to Hire</span>
                  <span className="text-sm font-black text-green-600 bg-green-50 px-2 py-1 rounded-md">-15%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 font-bold">Quality Match</span>
                  <span className="text-sm font-black text-primary-600 bg-primary-50 px-2 py-1 rounded-md">85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 font-bold">Screen Efficiency</span>
                  <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">92%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className="p-2 sm:p-3 rounded-2xl bg-slate-50 group-hover:bg-white transition-all shadow-sm">
          {icon}
        </div>
        <button className="text-slate-300 hover:text-slate-500">
          <MoreVertical className="w-4 h-4 sm:hidden" />
        </button>
      </div>
      <div className="text-xl sm:text-2xl font-black text-slate-900 mb-1">{value}</div>
      <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-tight sm:tracking-wider truncate">{title}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    completed: 'bg-green-100 text-green-700',
    processing: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-blue-100 text-blue-700',
    shortlisted: 'bg-emerald-100 text-emerald-700',
    hired: 'bg-green-100 text-green-700',
  }[status] || 'bg-slate-100 text-slate-700';

  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight ${styles}`}>
      {status}
    </span>
  );
}
