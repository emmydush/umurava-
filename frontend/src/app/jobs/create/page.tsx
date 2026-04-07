'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Zap, ArrowLeft, Send, Loader2 } from 'lucide-react';

export default function CreateJob() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workType: 'fulltime',
    skills: '',
    experience: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/jobs', {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== '')
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create job position.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">Back to Dashboard</span>
        </button>

        <div className="glass-card p-10 shadow-2xl">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Post New Position</h1>
              <p className="text-sm text-slate-500">Define the requirements for your next top talent.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Job Title</label>
              <input
                type="text"
                required
                placeholder="Senior Full Stack Engineer..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Experience Level</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 3-5 years, Senior, Mid-level"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>

               <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Employment Type</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-bold text-slate-700 appearance-none bg-slate-50"
                  value={formData.workType}
                  onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                >
                  <option value="fulltime">Full-Time</option>
                  <option value="freelance">Freelance</option>
                  <option value="both">Both</option>
                </select>
              </div>

               <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, AI, etc."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Job Description</label>
              <textarea
                required
                rows={8}
                placeholder="Paste the full JD details here. Gemini will analyze this to screen candidates..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Trigger Analysis & Post Job</span>
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
