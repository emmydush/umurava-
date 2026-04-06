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
  Globe
} from 'lucide-react';

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

export default function AdminDashboard({ userName }: { userName: string }) {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    activeScreenings: 0,
    systemHealth: 'healthy'
  });
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<SystemActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [statsResponse, usersResponse, activitiesResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/admin/activities', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsResponse.data.stats);
      setUsers(usersResponse.data.users || []);
      setActivities(activitiesResponse.data.activities || []);
    } catch (err: any) {
      console.error('Failed to fetch admin data:', err);
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
            <NavItem icon={<BarChart3 />} label="Overview" active onClick={() => {}} />
            <NavItem icon={<Users />} label="User Management" onClick={() => {}} />
            <NavItem icon={<Briefcase />} label="Job Management" onClick={() => {}} />
            <NavItem icon={<Shield />} label="Security" onClick={() => {}} />
            <NavItem icon={<Database />} label="System Health" onClick={() => {}} />
            <NavItem icon={<Settings />} label="Settings" onClick={() => {}} />
          </nav>
        </div>

        <div className="mt-auto p-6 pb-12 border-t border-slate-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold">
              {userName.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{userName}</div>
              <div className="text-xs text-slate-500 capitalize">Administrator</div>
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">System overview and administration controls.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/10 hover:bg-primary-700 transition-all active:scale-95">
              <Users className="w-4 h-4" />
              <span>Manage Users</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </header>

        {/* System Health Alert */}
        {stats.systemHealth !== 'healthy' && (
          <div className={`mb-6 p-4 rounded-2xl border ${
            stats.systemHealth === 'critical' 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : 'bg-yellow-50 border-yellow-200 text-yellow-700'
          }`}>
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <div className="font-bold">System {stats.systemHealth === 'critical' ? 'Critical' : 'Warning'}</div>
                <div className="text-sm opacity-90">
                  {stats.systemHealth === 'critical' 
                    ? 'Immediate attention required. Multiple systems are experiencing issues.'
                    : 'Some systems require attention. Performance may be degraded.'
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers.toString()} 
            icon={<Users className="text-blue-600" />} 
            trend="+12%" 
          />
          <StatCard 
            title="Active Jobs" 
            value={stats.totalJobs.toString()} 
            icon={<Briefcase className="text-purple-600" />} 
            trend="+5%" 
          />
          <StatCard 
            title="Applications" 
            value={stats.totalApplications.toString()} 
            icon={<CheckCircle className="text-green-600" />} 
            trend="+18%" 
          />
          <StatCard 
            title="Active Screenings" 
            value={stats.activeScreenings.toString()} 
            icon={<Activity className="text-orange-600" />} 
            trend="Live" 
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Section - Users */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Recent Users</h2>
                <button className="text-xs font-bold text-primary-600 hover:underline">View all</button>
              </div>
              <div className="p-0 overflow-x-auto">
                {users.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p>No users found.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Joined</th>
                        <th className="px-6 py-3">Last Login</th>
                        <th className="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.slice(0, 5).map((user) => (
                        <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{user.firstName} {user.lastName}</div>
                                <div className="text-xs text-slate-400">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <RoleBadge role={user.role} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-slate-400">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-slate-400">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                            </div>
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

            {/* System Activity */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">System Activity</h2>
                <button className="text-xs font-bold text-primary-600 hover:underline">View all</button>
              </div>
              <div className="p-6 space-y-4">
                {activities.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-4">No recent activity</p>
                ) : (
                  activities.slice(0, 5).map((activity) => (
                    <div key={activity._id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{activity.description}</div>
                          <div className="text-xs text-slate-400">
                            by {activity.userName || 'Unknown'} • {activity.type}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - System Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">System Health</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">API Status</span>
                  <HealthIndicator status="healthy" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Database</span>
                  <HealthIndicator status="healthy" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">AI Services</span>
                  <HealthIndicator status="healthy" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Storage</span>
                  <HealthIndicator status="warning" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full flex items-center space-x-3 px-4 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all">
                  <Users className="w-5 h-5" />
                  <span>User Management</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">
                  <Database className="w-5 h-5" />
                  <span>Database Backup</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all">
                  <Shield className="w-5 h-5" />
                  <span>Security Audit</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">System Info</h2>
              </div>
              <div className="p-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Version</span>
                  <span className="font-bold text-slate-900">v2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Uptime</span>
                  <span className="font-bold text-slate-900">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Last Backup</span>
                  <span className="font-bold text-slate-900">2 hours ago</span>
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
