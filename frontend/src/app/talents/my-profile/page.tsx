'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TalentSidebar from '@/components/TalentSidebar';
import {
  User,
  Briefcase,
  GraduationCap,
  Upload,
  Edit3,
  MapPin,
  Phone,
  Mail,
  Globe,
  Link2,
  ExternalLink,
  FileText,
  Lock
} from 'lucide-react';

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
  createdAt: string;
  updatedAt: string;
}

export default function MyProfile() {
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

      const response = await fetch('/api/talents/my-profile', {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('no_profile');
        } else {
          setError('Failed to fetch profile');
        }
        return;
      }

      const data = await response.json();
      setProfile(data.profile || data);
    } catch {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TalentSidebar />

      <div className="lg:ml-64 pt-14 lg:pt-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Profile</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage your professional information</p>
          </div>
          {profile && (
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/talents/upload-resume')}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Resume</span>
              </button>
              <button
                onClick={() => router.push('/talents/profile')}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/10 hover:bg-primary-700 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          )}
        </header>

        <main className="p-4 sm:p-8 max-w-4xl">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading profile...</p>
            </div>
          ) : error === 'no_profile' ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-12 h-12 text-slate-300" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">No Profile Yet</h2>
              <p className="text-slate-500 mb-8">Start by uploading your resume — our AI will build your profile automatically.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/talents/upload-resume')}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
                >
                  Upload Resume
                </button>
                <button
                  onClick={() => router.push('/talents/profile')}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                  Fill Manually
                </button>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
              <p className="text-red-600 font-bold mb-4">{error}</p>
              <button onClick={() => router.push('/login')} className="px-6 py-2 bg-primary-600 text-white rounded-xl font-bold">
                Sign In
              </button>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Hero Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-black text-3xl shrink-0">
                    {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-black text-slate-900">{profile.firstName} {profile.lastName}</h2>
                    {profile.title && <p className="text-primary-600 font-bold mt-0.5">{profile.title}</p>}
                    {profile.summary && <p className="text-slate-500 text-sm mt-3 leading-relaxed">{profile.summary}</p>}
                    <div className="flex flex-wrap gap-4 mt-4">
                      {profile.email && (
                        <span className="flex items-center text-xs text-slate-500 font-medium">
                          <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{profile.email}
                        </span>
                      )}
                      {profile.phone && (
                        <span className="flex items-center text-xs text-slate-500 font-medium">
                          <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{profile.phone}
                        </span>
                      )}
                      <span className="flex items-center text-xs text-slate-500 font-medium capitalize">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{profile.workType} · {profile.availability}
                      </span>
                    </div>
                    {(profile.portfolio || profile.linkedin || profile.github) && (
                      <div className="flex gap-3 mt-4">
                        {profile.portfolio && (
                          <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 border border-slate-100 transition-all">
                            <Globe className="w-3.5 h-3.5" /><span>Portfolio</span>
                          </a>
                        )}
                        {profile.linkedin && (
                          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 border border-blue-100 transition-all">
                            <Link2 className="w-3.5 h-3.5" /><span>LinkedIn</span>
                          </a>
                        )}
                        {profile.github && (
                          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-all">
                            <ExternalLink className="w-3.5 h-3.5" /><span>GitHub</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Skills & Competencies</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-bold border border-primary-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                  {profile.specialties && profile.specialties.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Specialties</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.specialties.map((s, i) => (
                          <span key={i} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-100">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Experience */}
              {profile.experience && profile.experience.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-5 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-primary-600" />Work Experience
                  </h3>
                  <div className="space-y-5">
                    {profile.experience.map((exp, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Briefcase className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="flex-1 border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                          <h4 className="font-bold text-slate-900">{exp.position}</h4>
                          <p className="text-primary-600 text-sm font-medium">{exp.company}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(exp.startDate).toLocaleDateString('en-US', {month:'short', year:'numeric'})} — {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', {month:'short', year:'numeric'}) : 'Present'}
                          </p>
                          {exp.description && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{exp.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {profile.education && profile.education.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-5 flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2 text-primary-600" />Education
                  </h3>
                  <div className="space-y-5">
                    {profile.education.map((edu, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                          <GraduationCap className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                          <h4 className="font-bold text-slate-900">{edu.degree}</h4>
                          <p className="text-slate-500 text-sm">{edu.field} · {edu.institution}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(edu.startDate).toLocaleDateString('en-US', {month:'short', year:'numeric'})} — {edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', {month:'short', year:'numeric'}) : 'Present'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Password Change */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-5 flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-primary-600" />Security Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Password</p>
                      <p className="text-xs text-slate-500">Change your account password</p>
                    </div>
                    <button
                      onClick={() => router.push('/talents/change-password')}
                      className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Resume */}
              {profile.resumeUrl && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Resume on File</p>
                      <a href={`http://localhost:5000${profile.resumeUrl}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline font-medium">
                        View Resume →
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/talents/upload-resume')}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                  >
                    Update
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
