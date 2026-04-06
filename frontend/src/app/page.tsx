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
import TalentDashboard from '@/components/TalentDashboard';
import RecruiterDashboard from '@/components/RecruiterDashboard';
import AdminDashboard from '@/components/AdminDashboard';

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
  const [userRole, setUserRole] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      setIsLoggedIn(true);
      try {
        const user = JSON.parse(userStr);
        setUserName(user.firstName || 'User');
        setUserRole(user.role || 'talent');
      } catch (e) {
        setUserName('User');
        setUserRole('talent');
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
      // If unauthorized or forbidden, clear token and refresh
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
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
        <nav className="fixed w-full z-40 glass-card mx-auto mt-4 px-6 py-3 max-w-6xl left-1/2 transform -translate-x-1/2 border-none rounded-2xl shadow-xl flex items-center justify-between">
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
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
          
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
  if (isLoggedIn) {
    // Route based on user role
    switch (userRole) {
      case 'talent':
        return <TalentDashboard userName={userName} />;
      case 'recruiter':
        return <RecruiterDashboard userName={userName} />;
      case 'admin':
        return <AdminDashboard userName={userName} />;
      default:
        return <TalentDashboard userName={userName} />;
    }
  }
}

