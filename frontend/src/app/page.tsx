'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  FileText, 
  TrendingUp, 
  CheckCircle,
  Clock,
  User,
  Upload,
  Zap,
  Search,
  MapPin,
  DollarSign,
  ArrowRight,
  Star,
  Bell,
  Settings,
  LogOut,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import TalentSidebar from '@/components/TalentSidebar';
import { useRouter } from 'next/navigation';

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

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userName, setUserName] = useState('Talent User');
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (user) setUserName(`${user.firstName} ${user.lastName}`);
    fetchApplicationsData();
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu || showNotifications) {
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu, showNotifications]);

  const fetchApplicationsData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 8000)
      );

      const [applicationsResponse, profileResponse] = await Promise.allSettled([
        Promise.race([
          fetch('/api/applications', {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            }
          }).then(res => {
            if (res.status === 401 || res.status === 403) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
              throw new Error('Session expired. Please login again.');
            }
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          }),
          timeoutPromise
        ]) as Promise<any>,
        Promise.race([
          fetch('/api/talents/my-profile', {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            }
          }).then(res => {
            if (res.status === 401 || res.status === 403) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
              throw new Error('Session expired. Please login again.');
            }
            if (res.status === 404) {
              return { profile: null };
            }
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          }),
          timeoutPromise
        ]) as Promise<any>
      ]);

      if (applicationsResponse.status === 'fulfilled') {
        setApplications(applicationsResponse.value.applications || []);
      } else {
        console.error('Failed to fetch applications:', applicationsResponse.reason);
        setApplications([]);
      }

      if (profileResponse.status === 'fulfilled') {
        setProfile(profileResponse.value.profile);
      } else {
        console.error('Failed to fetch profile:', profileResponse.reason);
        setProfile(null);
      }
    } catch (error: any) {
      console.error('Failed to fetch applications data:', error);
      if (!error.message.includes('Session expired')) {
        setApplications([]);
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const mockNotifications: Notification[] = [
        {
          _id: '1',
          title: 'Application Update',
          message: 'Your application status has been updated.',
          type: 'info',
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          actionUrl: '/'
        },
        {
          _id: '2',
          title: 'Screening Complete',
          message: 'Your AI screening has been completed.',
          type: 'success',
          read: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          actionUrl: '/'
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleLogout = () => {
    try {
      console.log('Logging out...');
      
      // Clear all authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Also clear any other potential auth data
      sessionStorage.clear();
      
      // Force redirect to login page
      window.location.replace('/login');
      
      // Fallback if replace doesn't work
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback redirect
      window.location.href = '/login';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <Bell className="w-4 h-4 text-yellow-600" />;
      case 'error': return <Bell className="w-4 h-4 text-red-600" />;
      default: return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // userName is set in useEffect above

  // Application stats
  const stats = [
    { title: 'Active', value: applications.filter(a => a.status === 'pending').length.toString(), icon: <Briefcase className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />, trend: 'New' },
    { title: 'Screenings', value: profile?.completedScreenings?.toString() || '0', icon: <CheckCircle className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" />, trend: 'Done' },
    { title: 'Avg Score', value: `${profile?.averageScore || 0}%`, icon: <TrendingUp className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />, trend: 'Perf' },
    { title: 'In Progress', value: applications.filter(a => ['screening', 'under_review'].includes(a.status)).length.toString(), icon: <Clock className="text-orange-600 w-5 h-5 sm:w-6 sm:h-6" />, trend: 'Active' }
  ];

  const getStatusColor = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-blue-100 text-blue-700 border-blue-200',
      screening: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      under_review: 'bg-purple-100 text-purple-700 border-purple-200',
      accepted: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      pending_score: 'bg-orange-100 text-orange-700 border-orange-200'
    };
    return styles[status] || styles.pending;
  };

  const displayStatus = (status: string) => {
    return status === 'pending_score' ? 'scoring' : status.replace('_', ' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TalentSidebar />
        <div className="lg:ml-64 pt-16 min-h-screen p-4 sm:p-8 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TalentSidebar />

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 h-16">
        <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8 lg:pl-72">
          <div className="flex items-center flex-1">
            <div className="flex items-center space-x-3 mr-6">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Zap className="text-white w-5 h-5 fill-current" />
              </div>
              <span className="text-lg font-bold text-slate-900">Umurava<span className="text-primary-600">AI</span></span>
            </div>
            
            <div className="relative max-w-md flex-1 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search applications..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => {
                            markNotificationAsRead(notification._id);
                            if (notification.actionUrl) {
                              router.push(notification.actionUrl);
                              setShowNotifications(false);
                            }
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900">
                                {notification.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-slate-400 mt-2">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-3 border-t border-slate-100">
                    <button className="w-full text-center text-xs font-bold text-primary-600 hover:underline">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded-xl transition-all"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700">
                  {userName}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{userName}</p>
                        <p className="text-xs text-slate-500">Talent Account</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={() => {
                        router.push('/talents/profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        router.push('/talents/upload-resume');
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Update Resume</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        router.push('/settings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        router.push('/help');
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Help & Support</span>
                    </button>
                    
                    <div className="border-t border-slate-100 my-2"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="lg:ml-64 pt-16">
        <main className="min-h-screen p-4 sm:p-8">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Applications</h1>
              <p className="text-slate-500 text-sm mt-1">Track your job applications and screening progress</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => router.push('/dashboard')}
                className="flex-1 sm:flex-none flex justify-center items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <button 
                onClick={() => router.push('/jobs')}
                className="flex-1 sm:flex-none flex justify-center items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/10 hover:bg-primary-700 transition-all active:scale-95"
              >
                <Briefcase className="w-4 h-4" />
                <span>Browse Jobs</span>
              </button>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 rounded-2xl bg-slate-50 group-hover:bg-white group-hover:scale-110 transition-all shadow-sm">
                    {stat.icon}
                  </div>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full hidden sm:inline-block">
                    {stat.trend}
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">{stat.value}</div>
                  <div className="text-xs font-bold text-slate-500 mt-1">{stat.title}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Applications List */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Recent Applications</h2>
              <span className="text-xs font-bold text-slate-500">
                {applications.length} total
              </span>
            </div>
            
            <div className="p-0">
              {applications.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="mb-4">No applications yet. Start by browsing available jobs.</p>
                  <button 
                    onClick={() => router.push('/jobs')}
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/10 hover:bg-primary-700 transition-all active:scale-95"
                  >
                    Browse Jobs
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {applications.slice(0, 10).map((application) => (
                    <div key={application._id}>
                      <div 
                        className="p-4 sm:px-6 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                        onClick={() => setExpandedAppId(expandedAppId === application._id ? null : application._id)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between sm:justify-start gap-4">
                              <h3 className="font-bold text-slate-900 truncate">
                                {application.jobTitle || 'Unknown Position'}
                              </h3>
                              <div className="sm:hidden shrink-0">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(application.status)}`}>
                                  {displayStatus(application.status)}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-500 truncate mt-0.5">
                              {application.companyName || 'Company'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Applied {new Date(application.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="hidden sm:block">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(application.status)}`}>
                                {displayStatus(application.status)}
                              </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${
                              expandedAppId === application._id ? 'rotate-180' : ''
                            }`} />
                          </div>
                        </div>
                      </div>
                      
                      {expandedAppId === application._id && (
                        <div className="px-4 sm:px-6 py-4 bg-slate-50 border-t border-slate-100">
                          <div className="space-y-4">
                            {application.aiReasoning && (
                              <div>
                                <h4 className="font-bold text-slate-900 mb-2">AI Screening Results</h4>
                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                  <p className="text-sm text-slate-700 mb-3">{application.aiReasoning.overall}</p>
                                  
                                  {application.aiReasoning.experience && (
                                    <div className="mb-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-slate-500">EXPERIENCE RELEVANCE</span>
                                        <span className="text-xs font-bold text-slate-900">{application.aiReasoning.experience.relevance}%</span>
                                      </div>
                                      <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div 
                                          className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                                          style={{ width: `${application.aiReasoning.experience.relevance}%` }}
                                        ></div>
                                      </div>
                                      <p className="text-xs text-slate-600 mt-1">{application.aiReasoning.experience.explanation}</p>
                                    </div>
                                  )}
                                  
                                  {application.aiReasoning.skills && application.aiReasoning.skills.length > 0 && (
                                    <div>
                                      <span className="text-xs font-bold text-slate-500">SKILL MATCH</span>
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {application.aiReasoning.skills.map((skill, index) => (
                                          <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-[10px] font-bold">
                                            {skill.skill || skill}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {application.recruiterNotes && (
                              <div>
                                <h4 className="font-bold text-slate-900 mb-2">Recruiter Notes</h4>
                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                  <p className="text-sm text-slate-700">{application.recruiterNotes}</p>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex gap-3">
                              <button className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
                                View Details
                              </button>
                              <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all">
                                Contact Recruiter
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
