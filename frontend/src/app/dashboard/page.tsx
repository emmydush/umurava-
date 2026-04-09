'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
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
import RecruiterSidebar from '@/components/RecruiterSidebar';
import RecruiterDashboard from '@/components/RecruiterDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { useRouter } from 'next/navigation';

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

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState('talent');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userStr);
    setUserName(`${user.firstName} ${user.lastName}`);
    setUserRole(user.role || 'talent');
    fetchDashboardData();
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

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (!token) {
        router.push('/login');
        return;
      }

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 8000)
      );

      const profilePromise = user?.role === 'talent' ? Promise.race([
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
      ]) as Promise<any> : Promise.resolve({ profile: null });

      const [profileResponse, jobsResponse] = await Promise.allSettled([
        profilePromise,
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

      if (profileResponse.status === 'fulfilled') {
        setProfile(profileResponse.value.profile);
      } else {
        console.error('Failed to fetch profile:', profileResponse.reason);
        setProfile(null);
      }

      if (jobsResponse.status === 'fulfilled') {
        setJobs(jobsResponse.value.jobs || []);
      } else {
        console.error('Failed to fetch jobs:', jobsResponse.reason);
        setJobs([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      if (!error.message.includes('Session expired')) {
        setProfile(null);
        setJobs([]);
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
          title: 'Welcome to Dashboard',
          message: 'Your personalized job dashboard is ready.',
          type: 'success',
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: '/dashboard'
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

  // userName and userRole are set in useEffect above

  // Filter and sort jobs
  const filteredJobs = jobs.filter(job => {
    if (!jobSearchQuery) return job.isActive;
    const query = jobSearchQuery.toLowerCase();
    return job.isActive && (
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.skills.some(s => s.toLowerCase().includes(query))
    );
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (profile?.skills) {
      const aRelevance = calculateSkillMatch(a, profile.skills);
      const bRelevance = calculateSkillMatch(b, profile.skills);
      if (aRelevance !== bRelevance) {
        return bRelevance - aRelevance;
      }
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }).slice(0, 6);

  // Static stats for dashboard
  const stats = [
    { title: 'Available Jobs', value: jobs.filter(j => j.isActive).length, icon: <Briefcase className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />, trend: 'Open' },
    { title: 'New This Week', value: jobs.filter(j => j.isActive && new Date(j.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, icon: <TrendingUp className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" />, trend: 'New' },
    { title: 'Your Skills', value: profile?.skills.length || 0, icon: <Star className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />, trend: 'Total' },
    { title: 'Profile Score', value: profile ? '85%' : '0%', icon: <CheckCircle className="text-orange-600 w-5 h-5 sm:w-6 sm:h-6" />, trend: 'Good' }
  ];

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

  // Render appropriate dashboard based on user role
  if (userRole === 'recruiter') {
    return <RecruiterDashboard userName={userName} />;
  }
  
  if (userRole === 'admin') {
    return <AdminDashboard userName={userName} />;
  }
  
  // Default to talent dashboard

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
                placeholder="Search jobs, companies..."
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
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome to Your Dashboard</h1>
              <p className="text-slate-500 text-sm mt-1">Discover opportunities and track your progress</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => router.push('/jobs')}
                className="flex-1 sm:flex-none flex justify-center items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/10 hover:bg-primary-700 transition-all active:scale-95"
              >
                <Briefcase className="w-4 h-4" />
                <span>Browse All Jobs</span>
              </button>
              <button 
                onClick={() => router.push('/')}
                className="flex-1 sm:flex-none flex justify-center items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
              >
                <Clock className="w-4 h-4" />
                <span>My Applications</span>
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
                    onClick={() => router.push('/jobs')}
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
                                  
                                  {profile && skillMatch > 0 && (
                                    <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${getSkillMatchColor(skillMatch)} shrink-0`}>
                                      {Math.round(skillMatch)}%
                                    </div>
                                  )}
                                </div>

                                {job.salary && (
                                  <div className="flex items-center text-slate-600 text-xs font-bold mb-2">
                                    <DollarSign className="w-3 h-3 mr-1 text-green-600" />
                                    {formatSalary(job.salary)}
                                  </div>
                                )}

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
        </main>
      </div>
    </div>
  );
}
