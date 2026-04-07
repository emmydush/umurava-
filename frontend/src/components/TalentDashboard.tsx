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
  ChevronDown,
  Search,
  MapPin,
  DollarSign,
  ArrowRight,
  Star,
  Bell,
  Settings,
  LogOut,
  HelpCircle,
  Moon,
  Sun
} from 'lucide-react';
import TalentSidebar from './TalentSidebar';
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

interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  skills: string[];
  workType: string;
  location?: string;
  salary?: { min: number; max: number; currency: string };
  experience?: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
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

export default function TalentDashboard({ userName }: { userName: string }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchTalentData();
    fetchNotifications();
  }, []);

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu || showNotifications) {
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu, showNotifications]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Mock notifications for now - in real app, this would be an API call
      const mockNotifications: Notification[] = [
        {
          _id: '1',
          title: 'Application Received',
          message: 'Your application for Data Analyst at Umurava has been received.',
          type: 'success',
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          actionUrl: '/applications'
        },
        {
          _id: '2',
          title: 'New Job Match',
          message: 'A new job matching your skills has been posted.',
          type: 'info',
          read: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          actionUrl: '/jobs'
        },
        {
          _id: '3',
          title: 'Profile Incomplete',
          message: 'Complete your profile to increase job match visibility.',
          type: 'warning',
          read: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          actionUrl: '/talents/profile'
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
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

  const fetchTalentData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 8000)
      );

      const [applicationsResponse, profileResponse, jobsResponse] = await Promise.allSettled([
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
        ]) as Promise<any>,
        Promise.race([
          fetch('/api/jobs', {
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
        ]) as Promise<any>
      ]);

      // Handle applications response
      if (applicationsResponse.status === 'fulfilled') {
        setApplications(applicationsResponse.value.applications || []);
      } else {
        console.error('Failed to fetch applications:', applicationsResponse.reason);
        setApplications([]);
      }

      // Handle profile response
      if (profileResponse.status === 'fulfilled') {
        setProfile(profileResponse.value.profile);
      } else {
        console.error('Failed to fetch profile:', profileResponse.reason);
        setProfile(null);
      }

      // Handle jobs response
      if (jobsResponse.status === 'fulfilled') {
        setJobs(jobsResponse.value.jobs || []);
      } else {
        console.error('Failed to fetch jobs:', jobsResponse.reason);
        setJobs([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch talent data:', error);
      if (!error.message.includes('Session expired')) {
        setApplications([]);
        setProfile(null);
        setJobs([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateSkillMatch = (job: Job, userSkills: string[] = []): number => {
    if (!userSkills.length) return 0;
    
    const jobSkillsLower = job.skills.map(s => s.toLowerCase());
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    
    const matchingSkills = jobSkillsLower.filter(skill => 
      userSkillsLower.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
    );
    
    return (matchingSkills.length / Math.max(job.skills.length, 1)) * 100;
  };

  const getSkillMatchColor = (match: number) => {
    if (match >= 70) return 'text-green-600 bg-green-100';
    if (match >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-slate-600 bg-slate-100';
  };

  const formatSalary = (salary?: { min: number; max: number; currency: string }) => {
    if (!salary) return 'Salary not specified';
    const { min, max, currency } = salary;
    if (min === max) return `${currency} ${min.toLocaleString()}`;
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => {
    if (!jobSearchQuery) return job.isActive;
    const query = jobSearchQuery.toLowerCase();
    return job.isActive && (
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.skills.some(s => s.toLowerCase().includes(query))
    );
  });

  // Sort jobs by relevance to user skills, then by date
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (profile?.skills) {
      const aRelevance = calculateSkillMatch(a, profile.skills);
      const bRelevance = calculateSkillMatch(b, profile.skills);
      if (aRelevance !== bRelevance) {
        return bRelevance - aRelevance;
      }
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }).slice(0, 6); // Show only 6 most relevant jobs on dashboard

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TalentSidebar />

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 h-16">
        <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8 lg:pl-72">
          {/* Left side - Logo and Search */}
          <div className="flex items-center flex-1">
            <div className="flex items-center space-x-3 mr-6">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Zap className="text-white w-5 h-5 fill-current" />
              </div>
              <span className="text-lg font-bold text-slate-900">Umurava<span className="text-primary-600">AI</span></span>
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-md flex-1 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search jobs, companies..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
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

              {/* Notifications Dropdown */}
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

            {/* Profile Menu */}
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

              {/* Profile Dropdown */}
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
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back, {userName}!</h1>
              <p className="text-slate-500 text-sm mt-1">Track your job applications and screening progress.</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => window.location.href = '/jobs'}
                className="flex-1 sm:flex-none flex justify-center items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/10 hover:bg-primary-700 transition-all active:scale-95"
              >
                <Briefcase className="w-4 h-4" />
                <span>Browse Jobs</span>
              </button>
              <button 
                onClick={() => window.location.href = '/talents/upload-resume'}
                className="flex-1 sm:flex-none flex justify-center items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Update Resume</span>
              </button>
            </div>
          </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard 
            title="Active" 
            value={applications.filter(a => a.status === 'pending').length.toString()} 
            icon={<Briefcase className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />} 
            trend="New" 
          />
          <StatCard 
            title="Screenings" 
            value={profile?.completedScreenings?.toString() || '0'} 
            icon={<CheckCircle className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" />} 
            trend="Done" 
          />
          <StatCard 
            title="Avg Score" 
            value={`${profile?.averageScore || 0}%`} 
            icon={<TrendingUp className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />} 
            trend="Perf" 
          />
          <StatCard 
            title="In Progress" 
            value={applications.filter(a => ['screening', 'under_review'].includes(a.status)).length.toString()} 
            icon={<Clock className="text-orange-600 w-5 h-5 sm:w-6 sm:h-6" />} 
            trend="Active" 
          />
        </div>

        {/* Recommended Jobs Section */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Recommended Jobs</h2>
                <p className="text-xs text-slate-500 mt-1">Personalized matches based on your skills</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search jobs..."
                    className="pl-10 pr-3 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all w-48"
                    value={jobSearchQuery}
                    onChange={(e) => setJobSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => window.location.href = '/jobs'}
                  className="text-xs font-bold text-primary-600 hover:underline"
                >
                  View all
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {sortedJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500">No jobs found matching your criteria</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sortedJobs.map((job) => {
                    const skillMatch = profile ? calculateSkillMatch(job, profile.skills) : 0;
                    
                    return (
                      <div 
                        key={job._id} 
                        className="border border-slate-200 rounded-2xl p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => router.push(`/jobs/${job._id}`)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-sm font-black text-primary-600 border border-primary-100 group-hover:scale-110 transition-transform shrink-0">
                              {(job.company)?.[0] || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors text-sm">
                                    {job.title}
                                  </h3>
                                  <div className="flex items-center gap-x-3 gap-y-1 mt-1">
                                    <span className="text-primary-600 font-bold text-xs">{job.company}</span>
                                    <span className="flex items-center text-slate-400 text-xs">
                                      <MapPin className="w-3 h-3 mr-1" />{job.location || 'Remote'}
                                    </span>
                                    <span className="flex items-center text-slate-400 text-xs">
                                      <Clock className="w-3 h-3 mr-1" />{job.workType}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Skill match indicator */}
                                {profile && skillMatch > 0 && (
                                  <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${getSkillMatchColor(skillMatch)} shrink-0`}>
                                    {Math.round(skillMatch)}%
                                  </div>
                                )}
                              </div>

                              {/* Salary */}
                              {job.salary && (
                                <div className="flex items-center text-slate-600 text-xs font-bold mb-2">
                                  <DollarSign className="w-3 h-3 mr-1 text-green-600" />
                                  {formatSalary(job.salary)}
                                </div>
                              )}

                              {/* Skills */}
                              <div className="flex flex-wrap gap-1">
                                {job.skills.slice(0, 4).map((skill, index) => {
                                  const hasSkill = profile?.skills.some(userSkill => 
                                    userSkill.toLowerCase() === skill.toLowerCase()
                                  );
                                  
                                  return (
                                    <span 
                                      key={index} 
                                      className={`px-2 py-1 rounded-lg text-[9px] font-bold border ${
                                        hasSkill 
                                          ? 'bg-green-50 text-green-700 border-green-200' 
                                          : 'bg-slate-50 text-slate-600 border-slate-200'
                                      }`}
                                    >
                                      {skill}
                                      {hasSkill && <Star className="w-3 h-3 ml-1 inline" />}
                                    </span>
                                  );
                                })}
                                {job.skills.length > 4 && (
                                  <span className="px-2 py-1 text-slate-400 text-[9px] font-bold">
                                    +{job.skills.length - 4}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-primary-600 hover:text-white transition-all shrink-0">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Section - Applications */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">My Applications</h2>
                <button className="text-xs font-bold text-primary-600 hover:underline">View all</button>
              </div>
              
              <div className="p-0">
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
                  <div className="divide-y divide-slate-100">
                    {/* Mobile Card View + Desktop Table View using flex/grid */}
                    {applications.slice(0, 5).map((application) => (
                      <React.Fragment key={application._id}>
                        {/* Summary Row */}
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
                                {/* Show status badge next to title on mobile, show on end on desktop */}
                                <div className="sm:hidden shrink-0">
                                  <ApplicationStatusBadge status={application.status} />
                                </div>
                              </div>
                              <p className="text-sm text-slate-500 truncate mt-0.5">
                                {application.companyName || 'Company'}
                              </p>
                              <div className="text-xs text-slate-400 mt-1 sm:hidden flex items-center space-x-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{new Date(application.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <div className="hidden sm:flex items-center gap-6 shrink-0">
                              <ApplicationStatusBadge status={application.status} />
                              <div className="text-xs text-slate-400 w-24 text-right">
                                {new Date(application.createdAt).toLocaleDateString()}
                              </div>
                              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedAppId === application._id ? 'rotate-180' : ''}`} />
                            </div>
                            
                            {/* Mobile expand icon */}
                            <div className="sm:hidden absolute right-4 mt-8 opacity-50">
                              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedAppId === application._id ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedAppId === application._id && (
                          <div className="px-4 sm:px-6 py-6 bg-slate-50/80 border-t border-slate-100">
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
                              ) : ['under_review', 'screening', 'pending_score'].includes(application.status) ? (
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                  <h5 className="font-bold text-blue-800 mb-2">Your application is currently under review</h5>
                                  <p className="text-blue-700 text-sm">
                                    Our AI and recruitment team are currently analyzing your profile. You will be notified once a decision has been made.
                                  </p>
                                </div>
                              ) : (
                                <div className="p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-600">
                                  Your application is in {application.status} status. Check back later for updates.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Profile Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm lg:sticky lg:top-6">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Profile Summary</h2>
              </div>
              <div className="p-6 space-y-4">
                {profile ? (
                  <>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-black text-xl shrink-0">
                        {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{profile.firstName} {profile.lastName}</div>
                        <div className="text-sm text-slate-500">{profile.email}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-2">
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
                      
                      <div className="pt-4 border-t border-slate-100">
                        <button 
                          onClick={() => window.location.href = '/talents/my-profile'}
                          className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all active:scale-95 mb-2"
                        >
                          View Full Profile
                        </button>
                        <button 
                          onClick={() => window.location.href = '/talents/profile'}
                          className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
                        >
                          Edit Details
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-slate-400 py-4">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-sm mb-4">Complete your profile to get better matches</p>
                    <button 
                      onClick={() => window.location.href = '/talents/profile'}
                      className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all"
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
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className="p-2 sm:p-3 rounded-2xl bg-slate-50 group-hover:bg-white group-hover:scale-110 transition-all shadow-sm">
          {icon}
        </div>
        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full hidden sm:inline-block">
          {trend}
        </span>
      </div>
      <div className="text-xl sm:text-2xl font-black text-slate-900 mb-1">{value}</div>
      <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-tight sm:tracking-wider truncate">{title}</div>
    </div>
  );
}

function ApplicationStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending_score: 'bg-slate-100 text-slate-700 border-slate-200',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    scored: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    screening: 'bg-blue-50 text-blue-700 border-blue-200',
    under_review: 'bg-purple-50 text-purple-700 border-purple-200',
    shortlisted: 'bg-green-50 text-green-700 border-green-200',
    hired: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };

  const displayStatus = status === 'pending_score' ? 'scoring' : status.replace('_', ' ');

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${styles[status] || styles['pending']}`}>
      {displayStatus}
    </span>
  );
}
