'use client';

import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Users,
  Eye,
  ChevronRight,
  MoreVertical,
  Clock,
  MapPin
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import RecruiterSidebar from './RecruiterSidebar';

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
  applicationsCount?: number;
}

export default function RecruiterJobsView() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchQuery, showActiveOnly]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = !showActiveOnly || job.isActive;
      return matchesSearch && matchesStatus;
    });

    setFilteredJobs(filtered);
  };

  const handleCreateJob = () => {
    router.push('/jobs/create');
  };

  const handleEditJob = (jobId: string) => {
    router.push(`/jobs/${jobId}/edit`);
  };

  const handleViewCandidates = (jobId: string) => {
    router.push(`/jobs/${jobId}/candidates`);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setJobs(jobs.filter(job => job._id !== jobId));
      } else {
        alert('Failed to delete job posting');
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
      alert('Failed to delete job posting');
    }
  };

  const formatSalary = (salary?: { min: number; max: number; currency: string }) => {
    if (!salary) return 'Salary not specified';
    const { min, max, currency } = salary;
    if (min === max) return `${currency} ${min.toLocaleString()}`;
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <RecruiterSidebar />
        <div className="lg:ml-64 pt-14 lg:pt-0 min-h-screen p-8 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <RecruiterSidebar />

      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Job Postings</h1>
              <p className="text-slate-500 text-sm mt-1">Manage your job listings and track applications</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search job postings..."
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={handleCreateJob}
                className="flex items-center space-x-2 px-6 py-2.5 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create Job</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mt-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="w-4 h-4 text-primary-600 bg-slate-100 border-slate-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-bold text-slate-700">Active jobs only</span>
            </label>
            <div className="text-sm font-bold text-slate-500">
              <span className="text-slate-900">{filteredJobs.length}</span> job{filteredJobs.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {filteredJobs.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Job Title</th>
                      <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Company</th>
                      <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Work Type</th>
                      <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Location</th>
                      <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Applications</th>
                      <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Created</th>
                      <th className="text-right px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredJobs.map((job) => (
                      <tr key={job._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-bold text-slate-900">{job.title}</div>
                            {job.experience && (
                              <div className="text-xs text-slate-500 mt-1">{job.experience}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-900">{job.company}</div>
                          {job.department && (
                            <div className="text-xs text-slate-500">{job.department}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded-md">
                            {job.workType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-slate-700">
                            <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                            {job.location || 'Remote'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm font-bold text-slate-900">
                            <Users className="w-4 h-4 mr-1 text-slate-400" />
                            {job.applicationsCount || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-md ${
                            job.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {job.isActive ? 'Active' : 'Closed'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-700">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewCandidates(job._id)}
                              className="p-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                              title="View Candidates"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditJob(job._id)}
                              className="p-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                              title="Edit Job"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job._id)}
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Job"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-600 mb-2">No job postings found</h3>
              <p className="text-slate-400 mb-6">Get started by creating your first job posting</p>
              <button
                onClick={handleCreateJob}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create Job Posting</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
