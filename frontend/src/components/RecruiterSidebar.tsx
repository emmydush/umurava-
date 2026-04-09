'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Zap,
  BarChart3,
  Briefcase,
  Users,
  Target,
  FileText,
  LogOut,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import ConfirmDialog from './ConfirmDialog';

export default function RecruiterSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const updateUserName = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserName(`${user.firstName} ${user.lastName}`);
        } catch (e) {
          setUserName('Recruiter');
        }
      }
    };

    updateUserName();

    // Listen for storage changes to update name when profile is updated
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        updateUserName();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check for changes every 2 seconds as a fallback
    const interval = setInterval(updateUserName, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  if (!mounted) return null;

  const logout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const menuItems = [
    { icon: <BarChart3 />, label: "Dashboard", href: "/dashboard" },
    { icon: <Briefcase />, label: "Job Postings", href: "/jobs" },
    { icon: <Users />, label: "Candidates", href: "/candidates" },
    { icon: <Target />, label: "Screenings", href: "/screening" },
    { icon: <FileText />, label: "Reports", href: "/reports" },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Zap className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="text-lg font-bold">Umurava<span className="text-primary-600">AI</span></span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -mr-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-60 animate-fade-in" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar Core */}
      <aside className={`fixed top-0 bottom-0 left-0 w-72 lg:w-64 bg-white border-r border-slate-200 flex flex-col z-70 transition-transform duration-300 ease-spring ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Zap className="text-white w-5 h-5 fill-current" />
              </div>
              <span className="text-xl font-bold">Umurava<span className="text-primary-600">AI</span></span>
            </div>
            {mobileMenuOpen && (
              <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <button 
            onClick={() => { router.push('/jobs/create'); setMobileMenuOpen(false); }}
            className="w-full mb-8 flex items-center justify-center space-x-2 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job</span>
          </button>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button 
                  key={item.label}
                  onClick={() => {
                    router.push(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 font-bold' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span className="w-5 h-5">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                  {isActive && <div className="ml-auto w-1 h-4 bg-primary-600 rounded-full" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 pb-8 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-black">
              {userName.charAt(0) || 'R'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-900 truncate">{userName || 'Recruiter'}</div>
              <div className="text-xs font-bold text-primary-600">Company Account</div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center justify-center space-x-2 text-slate-500 hover:text-red-600 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-100 transition-colors py-2 rounded-xl text-xs font-bold w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={confirmLogout}
        title="Logout Confirmation"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
      />
    </>
  );
}
