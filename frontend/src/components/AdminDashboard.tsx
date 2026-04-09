'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Briefcase, 
  Shield, 
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  Activity,
  Database,
  Globe,
  Search,
  ChevronRight
} from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

interface SystemStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  activeScreenings: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
}

interface SystemActivity {
  _id: string;
  type: string;
  description: string;
  userId: string;
  createdAt: string;
  userName?: string;
}

type ViewType = 'overview' | 'users' | 'jobs' | 'analytics' | 'settings';

interface Job {
  _id: string;
  title: string;
  company: string;
  isActive: boolean;
  createdAt: string;
  recruiterId: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AdminDashboard({ userName }: { userName: string }) {
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    activeScreenings: 0,
    systemHealth: 'healthy'
  });
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activities, setActivities] = useState<SystemActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [activeView]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      if (activeView === 'overview') {
        const [statsRes, usersRes, activitiesRes] = await Promise.all([
          axios.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/admin/activities', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setStats(statsRes.data.stats);
        setUsers(usersRes.data.users || []);
        setActivities(activitiesRes.data.activities || []);
      } else if (activeView === 'users') {
        const res = await axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data.users || []);
      } else if (activeView === 'jobs') {
        const res = await axios.get('/api/admin/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobs(res.data.jobs || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      setActionLoading(userId);
      const token = localStorage.getItem('token');
      await axios.put(`/api/admin/users/${userId}/role`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Failed to update role:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? All related data will be removed.')) return;
    try {
      setActionLoading(userId);
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleJob = async (jobId: string, currentStatus: boolean) => {
    try {
      setActionLoading(jobId);
      const token = localStorage.getItem('token');
      await axios.put(`/api/admin/jobs/${jobId}/status`, 
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobs(prev => prev.map(j => j._id === jobId ? { ...j, isActive: !currentStatus } : j));
    } catch (err) {
      console.error('Failed to toggle job status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
    try {
      setActionLoading(jobId);
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(prev => prev.filter(j => j._id !== jobId));
    } catch (err) {
      console.error('Failed to delete job:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const logout = () => setShowLogoutDialog(true);
  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const filteredUsers = users.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-50">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-10">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold">Umurava<span className="text-primary-600">Admin</span></span>
          </div>

          <nav className="space-y-1">
            <NavItem icon={<BarChart3 />} label="Overview" active={activeView === 'overview'} onClick={() => setActiveView('overview')} />
            <NavItem icon={<Users />} label="Users" active={activeView === 'users'} onClick={() => setActiveView('users')} />
            <NavItem icon={<Briefcase />} label="Jobs" active={activeView === 'jobs'} onClick={() => setActiveView('jobs')} />
            <NavItem icon={<TrendingUp />} label="Analytics" active={activeView === 'analytics'} onClick={() => setActiveView('analytics')} />
            <NavItem icon={<Settings />} label="Settings" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
          </nav>
        </div>

        <div className="mt-auto p-6 pb-12 border-t border-slate-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
              {userName.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 truncate max-w-30">{userName}</div>
              <div className="text-xs text-slate-500">Super Admin</div>
            </div>
          </div>
          <button onClick={logout} className="flex items-center space-x-2 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium w-full">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 min-h-screen p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {activeView === 'overview' && 'System statistics and recent activity.'}
              {activeView === 'users' && 'Manage user accounts and roles.'}
              {activeView === 'jobs' && 'Monitor and manage job postings.'}
            </p>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {activeView === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Users" value={stats.totalUsers.toString()} icon={<Users className="text-blue-600" />} trend="All time" />
                  <StatCard title="Active Jobs" value={stats.totalJobs.toString()} icon={<Briefcase className="text-purple-600" />} trend="Current" />
                  <StatCard title="Applications" value={stats.totalApplications.toString()} icon={<BarChart3 className="text-green-600" />} trend="Received" />
                  <StatCard title="Live Screenings" value={stats.activeScreenings.toString()} icon={<Activity className="text-orange-600" />} trend="Now" />
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <RecentUsersList users={users.slice(0, 5)} onViewAll={() => setActiveView('users')} />
                  <ActivityList activities={activities.slice(0, 8)} />
                </div>
              </div>
            )}

            {activeView === 'users' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center space-x-4 flex-1 max-w-md">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search users by name or email..." 
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map(user => (
                        <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-xs border border-primary-100">
                                {user.firstName[0]}{user.lastName[0]}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{user.firstName} {user.lastName}</div>
                                <div className="text-xs text-slate-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              value={user.role} 
                              onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                              disabled={actionLoading === user._id}
                              className="bg-white border border-slate-200 rounded-lg text-xs px-2 py-1 outline-none focus:ring-2 focus:ring-primary-500/20"
                            >
                              <option value="talent">Talent</option>
                              <option value="recruiter">Recruiter</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">Active</span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button 
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeView === 'jobs' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search jobs..." 
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Job Details</th>
                        <th className="px-6 py-4">Recruiter</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredJobs.map(job => (
                        <tr key={job._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-bold text-slate-900">{job.title}</div>
                              <div className="text-xs text-slate-400">{job.company}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-medium text-slate-600">
                              {job.recruiterId ? `${job.recruiterId.firstName} ${job.recruiterId.lastName}` : 'System'}
                            </div>
                            <div className="text-[10px] text-slate-400">{job.recruiterId?.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => handleToggleJob(job._id, job.isActive)}
                              disabled={actionLoading === job._id}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                                job.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {job.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button 
                              onClick={() => handleDeleteJob(job._id)}
                              className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={confirmLogout}
        title="Logout Confirmation"
        message="Are you sure you want to logout? You will need to sign in again to access admin tools."
        confirmText="Logout"
        cancelText="Cancel"
      />
    </div>
  );
}

function RecentUsersList({ users, onViewAll }: { users: User[], onViewAll: () => void }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-bold text-slate-900">Recent Registrations</h2>
        <button onClick={onViewAll} className="text-xs font-bold text-primary-600 hover:underline">View all</button>
      </div>
      <div className="flex-1">
        {users.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No users found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {users.map((user) => (
              <div key={user._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </div>
                </div>
                <RoleBadge role={user.role} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityList({ activities }: { activities: SystemActivity[] }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="font-bold text-slate-900">System Activity</h2>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[400px] p-6 space-y-4">
        {activities.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-4">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div key={activity._id} className="flex items-start space-x-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 line-clamp-1">{activity.description}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {activity.userName || 'System'} • {new Date(activity.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
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

function RoleBadge({ role }: { role: string }) {
  const styles = {
    admin: 'bg-red-100 text-red-700',
    recruiter: 'bg-blue-100 text-blue-700',
    talent: 'bg-green-100 text-green-700',
  }[role] || 'bg-slate-100 text-slate-700';

  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${styles}`}>
      {role}
    </span>
  );
}

function HealthIndicator({ status }: { status: 'healthy' | 'warning' | 'critical' }) {
  const colors = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${colors[status]} ${status === 'healthy' ? 'animate-pulse' : ''}`}></div>
      <span className="text-xs font-bold capitalize">{status}</span>
    </div>
  );
}
