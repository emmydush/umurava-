'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Clock,
  User,
  Upload,
  LogOut,
  Menu,
  X,
  Zap
} from 'lucide-react';

interface Application {
  _id: string;
  jobId: string;
  status: string;
  createdAt: string;
  appliedAt: string;
  jobTitle?: string;
  companyName?: string;
  recruiterNotes?: string;
  aiReasoning?: {
    overall: string;
    skills: any[];
    experience: {
      relevance: number;
      explanation: string;
    };
    education: {
      explanation: string;
    };
  };
}

interface TalentProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  skills: string[];
  resumeUrl?: string;
  completedScreenings: number;
  averageScore: number;
}

export default function TalentDashboard({ userName }: { userName: string }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  useEffect(() => {
    fetchTalentData();
  }, []);

  const fetchTalentData = async () => {
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

      const [applicationsResponse, profileResponse] = await Promise.all([
        Promise.race([
          axios.get('http://localhost:5000/api/applications/my-applications', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          timeoutPromise
        ]) as Promise<any>,
        Promise.race([
          axios.get('http://localhost:5000/api/talents/profile', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          timeoutPromise
        ]) as Promise<any>
      ]);

      setApplications(applicationsResponse.data.applications || []);
      setProfile(profileResponse.data.profile);
    } catch (error) {
      console.error('Failed to fetch talent data:', error);
      // Still set loading to false so the user can see the page
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
            <NavItem icon={<TrendingUp />} label="My Applications" active onClick={() => {}} />
            <NavItem icon={<User />} label="Profile" onClick={() => window.location.href = '/talents/profile'} />
            <NavItem icon={<FileText />} label="Resume" onClick={() => window.location.href = '/talents/upload-resume'} />
            <NavItem icon={<Calendar />} label="Screenings" onClick={() => {}} />
          </nav>
        </div>

        <div className="mt-auto p-6 pb-12 border-t border-slate-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
              {userName.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{userName}</div>
              <div className="text-xs text-slate-500 capitalize">Talent</div>
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
            <p className="text-slate-500 text-sm mt-1">Track your job applications and screening progress.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => window.location.href = '/jobs'}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/10 hover:bg-primary-700 transition-all active:scale-95"
            >
              <Briefcase className="w-4 h-4" />
              <span>Browse Jobs</span>
            </button>
            <button 
              onClick={() => window.location.href = '/talents/upload-resume'}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Update Resume</span>
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Active Applications" 
            value={applications.filter(a => a.status === 'pending').length.toString()} 
            icon={<Briefcase className="text-blue-600" />} 
            trend="New" 
          />
          <StatCard 
            title="Screenings Completed" 
            value={profile?.completedScreenings?.toString() || '0'} 
            icon={<CheckCircle className="text-green-600" />} 
            trend="Completed" 
          />
          <StatCard 
            title="Average Score" 
            value={`${profile?.averageScore || 0}%`} 
            icon={<TrendingUp className="text-purple-600" />} 
            trend="Performance" 
          />
          <StatCard 
            title="In Progress" 
            value={applications.filter(a => a.status === 'screening').length.toString()} 
            icon={<Clock className="text-orange-600" />} 
            trend="Active" 
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Section - Applications */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">My Applications</h2>
                <button className="text-xs font-bold text-primary-600 hover:underline">View all</button>
              </div>
              <div className="p-0 overflow-x-auto">
                {applications.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p>No applications yet. Start by browsing available jobs.</p>
                    <button 
                      onClick={() => window.location.href = '/jobs'}
                      className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold"
                    >
                      Browse Jobs
                    </button>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-6 py-3">Job Title</th>
                        <th className="px-6 py-3">Company</th>
                        <th className="px-6 py-3 text-center">Status</th>
                        <th className="px-6 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {applications.slice(0, 5).map((application) => (
                        <React.Fragment key={application._id}>
                          <tr 
                            className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                            onClick={() => setExpandedAppId(expandedAppId === application._id ? null : application._id)}
                          >
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900 flex items-center space-x-2">
                                <span>{application.jobTitle || 'Unknown Position'}</span>
                                <div className={`transform transition-transform ${expandedAppId === application._id ? 'rotate-180' : ''}`}>
                                  ▼
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-slate-600">{application.companyName || 'Company'}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <ApplicationStatusBadge status={application.status} />
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs text-slate-400">
                                {new Date(application.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                          </tr>
                          
                          {/* Expanded Details Row */}
                          {expandedAppId === application._id && (
                            <tr className="bg-slate-50/80">
                              <td colSpan={4} className="px-6 py-6 border-b border-t border-slate-100">
                                <div className="max-w-3xl space-y-4 animate-fade-in">
                                  <h4 className="font-bold text-slate-800 flex items-center space-x-2">
                                    <FileText className="w-5 h-5 text-primary-500" />
                                    <span>Application Details</span>
                                  </h4>
                                  
                                  {application.status === 'shortlisted' ? (
                                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                                      <h5 className="font-bold text-green-800 mb-2">Congratulations! You've been shortlisted.</h5>
                                      <p className="text-green-700 text-sm mb-4">
                                        The recruiter will be in touch with you shortly. Please review any instructions left by the recruiter below.
                                      </p>
                                      {application.recruiterNotes ? (
                                        <div className="bg-white p-3 rounded-lg border border-green-100">
                                          <div className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-1">Message from Recruiter</div>
                                          <p className="text-slate-700 text-sm">{application.recruiterNotes}</p>
                                        </div>
                                      ) : (
                                        <p className="text-slate-500 text-sm italic">No specific message was attached.</p>
                                      )}
                                    </div>
                                  ) : application.status === 'rejected' ? (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                                      <h5 className="font-bold text-red-800 mb-2">Application Outcome</h5>
                                      <p className="text-red-700 text-sm mb-4">
                                        Thank you for your application. Unfortunately, we will not be moving forward with your profile at this time.
                                      </p>
                                      
                                      {application.aiReasoning && (
                                        <div className="bg-white p-4 rounded-lg border border-red-100 space-y-3">
                                          <div className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-1">AI Gap Analysis</div>
                                          
                                          {application.aiReasoning.overall && (
                                            <p className="text-slate-700 text-sm pb-2 border-b border-slate-100">{application.aiReasoning.overall}</p>
                                          )}
                                          
                                          {application.aiReasoning.experience && (
                                            <div>
                                              <span className="text-[10px] font-bold uppercase text-slate-500">Experience Analysis</span>
                                              <p className="text-sm text-slate-600 mt-1">{application.aiReasoning.experience.explanation}</p>
                                            </div>
                                          )}
                                          
                                        </div>
                                      )}
                                      
                                      {application.recruiterNotes && (
                                        <div className="mt-4 bg-white p-3 rounded-lg border border-red-100">
                                          <div className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-1">Additional Feedback</div>
                                          <p className="text-slate-700 text-sm">{application.recruiterNotes}</p>
                                        </div>
                                      )}
                                    </div>
                                  ) : application.status === 'under_review' || application.status === 'screening' || application.status === 'pending_score' ? (
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                      <h5 className="font-bold text-blue-800 mb-2">Your application is currently under review</h5>
                                      <p className="text-blue-700 text-sm">
                                        Our AI and recruitment team are currently analyzing your profile against the job requirements. You will be notified once a decision has been made.
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="text-sm text-slate-600">
                                      Your application is in {application.status} status. Check back later for updates.
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Profile Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Profile Summary</h2>
              </div>
              <div className="p-6 space-y-4">
                {profile ? (
                  <>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xl">
                        {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{profile.firstName} {profile.lastName}</div>
                        <div className="text-sm text-slate-500">{profile.email}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Skills</div>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.slice(0, 4).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 text-[10px] font-bold rounded-md">
                              {skill}
                            </span>
                          ))}
                          {profile.skills.length > 4 && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">
                              +{profile.skills.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-slate-100">
                        <button 
                          onClick={() => window.location.href = '/talents/profile'}
                          className="w-full px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all"
                        >
                          Edit Profile
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-slate-400 py-4">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-sm">Complete your profile to get better matches</p>
                    <button 
                      onClick={() => window.location.href = '/talents/profile'}
                      className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold"
                    >
                      Create Profile
                    </button>
                  </div>
                )}
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
        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      </div>
      <div className="text-2xl font-black text-slate-900 mb-1">{value}</div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</div>
    </div>
  );
}

function ApplicationStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending_score: 'bg-slate-100 text-slate-700',
    pending: 'bg-yellow-100 text-yellow-700',
    scored: 'bg-cyan-100 text-cyan-700',
    screening: 'bg-blue-100 text-blue-700',
    under_review: 'bg-purple-100 text-purple-700',
    shortlisted: 'bg-green-100 text-green-700',
    hired: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-700',
  };

  const displayStatus = status === 'pending_score' ? 'scoring' : status.replace('_', ' ');

  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${styles[status] || styles['pending']}`}>
      {displayStatus}
    </span>
  );
}
