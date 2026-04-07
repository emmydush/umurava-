'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Briefcase, 
  FileText, 
  TrendingUp, 
  User, 
  LogOut,
  Zap,
  Menu,
  X
} from 'lucide-react';

interface TalentSidebarProps {
  /** If not provided, reads from localStorage */
  userName?: string;
}

export default function TalentSidebar({ userName: propUserName }: TalentSidebarProps) {
  const pathname = usePathname();
  const [userName, setUserName] = useState(propUserName || '');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!propUserName) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserName(user.firstName || user.email || 'Talent');
        }
      } catch {
        setUserName('Talent');
      }
    }
  }, [propUserName]);

  const logout = () => {
    try {
      console.log('Logging out from sidebar...');
      
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

  const navItems = [
    { icon: <TrendingUp />, label: 'Dashboard', href: '/dashboard' },
    { icon: <Briefcase />, label: 'My Applications', href: '/' },
    { icon: <Briefcase />, label: 'Browse Jobs', href: '/jobs' },
    { icon: <User />, label: 'My Profile', href: '/talents/my-profile' },
    { icon: <FileText />, label: 'Resume', href: '/talents/upload-resume' },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-10 cursor-pointer" onClick={() => window.location.href = '/'}>
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-md shadow-primary-500/20">
            <Zap className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-bold">Umurava<span className="text-primary-600">AI</span></span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <button
                key={item.href}
                onClick={() => { window.location.href = item.href; setMobileOpen(false); }}
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

      <div className="mt-auto p-6 pb-12 border-t border-slate-100">
        {userName && (
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{userName}</div>
              <div className="text-xs text-slate-500 capitalize">Talent</div>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center space-x-2 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-50 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.href = '/'}>
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <Zap className="text-white w-4 h-4 fill-current" />
          </div>
          <span className="text-lg font-bold">Umurava<span className="text-primary-600">AI</span></span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-white h-full flex flex-col shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
