'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Zap, ArrowRight, Mail, Lock, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect candidates to profile page
      if (response.data.user.role === 'talent') {
        router.push('/talents/my-profile');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/20 -rotate-3">
            <Zap className="text-white w-7 h-7 fill-current" />
          </div>
        </div>
        <h2 className="text-center text-4xl font-black text-slate-900 tracking-tight">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-slate-500 font-medium tracking-tight">
          Access your Umurava AI recruitment dashboard.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-10 px-8 shadow-2xl border-slate-200/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold animate-fade-in">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-black text-slate-500 uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-black text-slate-500 uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-primary-600 text-white rounded-xl font-black shadow-lg shadow-primary-500/20 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="px-3 bg-white">Fast Access</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setEmail('recruiter@company.com');
                  setPassword('password123');
                }}
                className="flex items-center justify-center py-2.5 px-4 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
              >
                Recruiter
              </button>
              <button
                onClick={() => {
                  setEmail('talent@example.com');
                  setPassword('password123');
                }}
                className="flex items-center justify-center py-2.5 px-4 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
              >
                Talent
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Don't have an account yet?{' '}
            <button 
              onClick={() => router.push('/register')}
              className="text-primary-600 font-bold hover:underline"
            >
              Get started for free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

