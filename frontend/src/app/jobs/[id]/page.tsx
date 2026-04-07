'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar,
  User,
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle
} from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  experience: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  location: string;
  workType: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  recruiterId: string;
}

export default function JobDetails() {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params.id) {
      fetchJob(params.id as string);
    }
  }, [params.id]);

  const fetchJob = async (jobId: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
      setJob(response.data.job);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to apply for this job');
        setApplying(false);
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/applications',
        {
          jobId: job?._id,
          coverNote: coverNote.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Job not found</div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Your application has been successfully submitted. You'll be notified of the result once the review process is complete.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-slate-600 hover:text-slate-900 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </button>
            <h1 className="text-xl font-bold text-slate-900">Job Details</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location || 'Remote'}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {job.workType}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {job.experience}
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  job.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {job.isActive ? 'Active' : 'Closed'}
                </div>
              </div>

              {job.salary && (
                <div className="flex items-center text-gray-700 mb-4">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} {job.salary.currency}
                  </span>
                </div>
              )}

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                <div className="text-gray-700 whitespace-pre-wrap">{job.description}</div>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Responsibilities</h3>
                <ul className="space-y-2">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-gray-700">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Application Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Apply for this Position</h2>
              
              {!job.isActive ? (
                <div className="text-center py-8">
                  <div className="text-red-600 font-medium mb-2">Position Closed</div>
                  <p className="text-gray-600 text-sm">This job is no longer accepting applications.</p>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Note (Optional)
                    </label>
                    <textarea
                      rows={4}
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      placeholder="Tell us why you're interested in this position..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={applying}
                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="w-4 h-4 mr-1" />
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-400">
                  By applying, you confirm that you have read and agree to our terms and conditions.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
