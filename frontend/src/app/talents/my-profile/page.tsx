'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface TalentProfile {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  summary?: string;
  skills: string[];
  specialties: string[];
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
  }>;
  workType: string;
  availability: string;
  portfolio?: string;
  linkedin?: string;
  github?: string;
  resumeUrl?: string;
  resumeText?: string;
  createdAt: string;
  updatedAt: string;
}

export default function MyProfile() {
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login first');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        'http://localhost:5000/api/talents/my-profile',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile(response.data.profile);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No talent profile found. Please create one first.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/talents/edit/${profile?._id}`);
  };

  const handleUploadResume = () => {
    router.push('/talents/upload-resume');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={() => router.push('/talents/create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Profile not found</div>
          <button
            onClick={() => router.push('/talents/create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">My Talent Profile</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleUploadResume}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Upload Resume
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Overview */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Profile Overview</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Personal Information</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{profile.email}</dd>
                  </div>
                  {profile.phone && (
                    <div>
                      <dt className="text-sm text-gray-500">Phone</dt>
                      <dd className="text-sm text-gray-900">{profile.phone}</dd>
                    </div>
                  )}
                  {profile.title && (
                    <div>
                      <dt className="text-sm text-gray-500">Professional Title</dt>
                      <dd className="text-sm text-gray-900">{profile.title}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Work Preferences */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Work Preferences</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">Work Type</dt>
                    <dd className="text-sm text-gray-900 capitalize">{profile.workType}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Availability</dt>
                    <dd className="text-sm text-gray-900 capitalize">{profile.availability}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Professional Summary */}
            {profile.summary && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Professional Summary</h3>
                <p className="text-sm text-gray-600">{profile.summary}</p>
              </div>
            )}

            {/* Portfolio Links */}
            {(profile.portfolio || profile.linkedin || profile.github) && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Portfolio Links</h3>
                <div className="flex flex-wrap gap-4">
                  {profile.portfolio && (
                    <a
                      href={profile.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Portfolio
                    </a>
                  )}
                  {profile.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      LinkedIn
                    </a>
                  )}
                  {profile.github && (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Skills & Specialties</h2>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Skills ({profile.skills.length})</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {profile.specialties.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Specialties ({profile.specialties.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map((specialty, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Experience */}
        {profile.experience.length > 0 && (
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Work Experience</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {profile.experience.map((exp, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-sm font-medium text-gray-900">{exp.position}</h3>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(exp.startDate).toLocaleDateString()} - 
                      {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Education */}
        {profile.education.length > 0 && (
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Education</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {profile.education.map((edu, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <h3 className="text-sm font-medium text-gray-900">{edu.degree}</h3>
                    <p className="text-sm text-gray-600">{edu.field} at {edu.institution}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(edu.startDate).toLocaleDateString()} - 
                      {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Resume */}
        {profile.resumeUrl && (
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Resume</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resume uploaded successfully</p>
                  <a
                    href={`http://localhost:5000${profile.resumeUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    View Resume
                  </a>
                </div>
                <button
                  onClick={handleUploadResume}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Update Resume
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Info */}
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p>
            Profile created: {new Date(profile.createdAt).toLocaleDateString()} | 
            Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </main>
    </div>
  );
}
