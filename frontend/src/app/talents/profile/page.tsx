'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TalentSidebar from '@/components/TalentSidebar';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Plus, 
  Trash2, 
  Save, 
  Globe, 
  Link2, 
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    summary: '',
    skills: '',
    specialties: '',
    workType: 'fulltime',
    availability: 'immediate',
    portfolio: '',
    linkedin: '',
    github: '',
    experience: [] as any[],
    education: [] as any[]
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/talents/my-profile', {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No profile yet, just use defaults
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      const profile = data.profile || data;

      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        title: profile.title || '',
        summary: profile.summary || '',
        skills: profile.skills ? profile.skills.join(', ') : '',
        specialties: profile.specialties ? profile.specialties.join(', ') : '',
        workType: profile.workType || 'fulltime',
        availability: profile.availability || 'immediate',
        portfolio: profile.portfolio || '',
        linkedin: profile.linkedin || '',
        github: profile.github || '',
        experience: profile.experience || [],
        education: profile.education || []
      });
    } catch (err) {
      setError('Failed to load profile. You can start fresh or try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field: 'experience' | 'education', index: number, key: string, value: string) => {
    const newArray = [...formData[field]];
    newArray[index][key] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'experience' | 'education') => {
    if (field === 'experience') {
      setFormData(prev => ({
        ...prev,
        experience: [...prev.experience, { company: '', position: '', startDate: '', endDate: '', description: '' }]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, { institution: '', degree: '', field: '', startDate: '', endDate: '' }]
      }));
    }
  };

  const removeArrayItem = (field: 'experience' | 'education', index: number) => {
    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
      };

      const response = await fetch('/api/talents/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      // Update localStorage with the new user data so navigation reflects changes
      const updatedProfile = await response.json();
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currentUser,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        email: updatedProfile.email
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      router.push('/talents/my-profile');
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TalentSidebar />
        <div className="lg:ml-64 pt-14 lg:pt-0 flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <TalentSidebar />
      <div className="lg:ml-64 pt-14 lg:pt-0">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-5 flex items-center justify-between sticky top-0 z-10 lg:top-0 lg:pt-5 pt-20">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Profile</h1>
            <p className="text-slate-500 text-sm mt-0.5">Let employers know what makes you great.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/talents/my-profile')}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all hidden sm:block"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-8 max-w-4xl mx-auto mt-4">
          {error && (
            <div className="mb-6 flex items-start space-x-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Basic Info */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-6 text-slate-900">
                <User className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-black tracking-tight">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">First Name</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Last Name</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email <span className="text-red-400">*</span></label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Phone</label>
                  <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" />
                </div>
              </div>
            </section>

            {/* 2. Professional Summary */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-6 text-slate-900">
                <Briefcase className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-black tracking-tight">Professional Snapshot</h2>
              </div>
              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Professional Title</label>
                  <input required name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Senior Frontend Engineer" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Summary / Bio</label>
                  <textarea required name="summary" value={formData.summary} onChange={handleInputChange} rows={4} placeholder="Tell employers about your background and what you can do..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none resize-none" />
                </div>
              </div>
            </section>

            {/* 3. Availability */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-6 text-slate-900">
                <Globe className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-black tracking-tight">Preferences & Links</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Desired Work Type</label>
                  <select name="workType" value={formData.workType} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none">
                    <option value="fulltime">Full-time</option>
                    <option value="freelance">Freelance/Contract</option>
                    <option value="both">Open to Both</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Availability</label>
                  <select name="availability" value={formData.availability} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none">
                    <option value="immediate">Immediately</option>
                    <option value="2weeks">Within 2 weeks</option>
                    <option value="1month">1 Month notice</option>
                    <option value="passive">Passively looking</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center"><Globe className="w-3 h-3 mr-1" /> Portfolio URL</label>
                  <input type="url" name="portfolio" value={formData.portfolio} onChange={handleInputChange} placeholder="https://..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center"><Link2 className="w-3 h-3 mr-1" /> LinkedIn</label>
                  <input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center"><ExternalLink className="w-3 h-3 mr-1" /> GitHub</label>
                  <input type="url" name="github" value={formData.github} onChange={handleInputChange} placeholder="https://github.com/..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" />
                </div>
              </div>
            </section>

            {/* 4. Skills */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
               <h2 className="text-lg font-black tracking-tight mb-5">Skills & Competencies</h2>
               <div className="space-y-5">
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Primary Skills (Comma separated)</label>
                     <input name="skills" value={formData.skills} onChange={handleInputChange} placeholder="e.g. React, TypeScript, Node.js" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Specialties</label>
                     <input name="specialties" value={formData.specialties} onChange={handleInputChange} placeholder="e.g. Frontend Architecture, Performance Optimization" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" />
                  </div>
               </div>
            </section>

            {/* 5. Experience */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center space-x-2 text-slate-900">
                   <Briefcase className="w-5 h-5 text-primary-600" />
                   <h2 className="text-lg font-black tracking-tight">Work Experience</h2>
                 </div>
                 <button type="button" onClick={() => addArrayItem('experience')} className="text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors">
                   <Plus className="w-3.5 h-3.5 mr-1" /> Add Role
                 </button>
              </div>

              {formData.experience.length === 0 ? (
                 <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <p className="text-slate-400 text-sm font-medium">No experience added yet.</p>
                 </div>
              ) : (
                <div className="space-y-6">
                  {formData.experience.map((exp, index) => (
                    <div key={index} className="relative bg-slate-50 border border-slate-200 rounded-2xl p-5 group">
                      <button type="button" onClick={() => removeArrayItem('experience', index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-1 bg-white rounded-lg border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                         <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Company</label>
                           <input value={exp.company} onChange={e => handleArrayChange('experience', index, 'company', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" placeholder="Company name" />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Position / Title</label>
                           <input value={exp.position} onChange={e => handleArrayChange('experience', index, 'position', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" placeholder="e.g. Software Engineer" />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Start Date</label>
                           <input type="date" value={exp.startDate ? exp.startDate.split('T')[0] : ''} onChange={e => handleArrayChange('experience', index, 'startDate', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">End Date (Leave blank if present)</label>
                           <input type="date" value={exp.endDate ? exp.endDate.split('T')[0] : ''} onChange={e => handleArrayChange('experience', index, 'endDate', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
                        </div>
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-500 mb-1 block">Description</label>
                         <textarea rows={3} value={exp.description} onChange={e => handleArrayChange('experience', index, 'description', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm resize-none" placeholder="What did you do..." />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 6. Education */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center space-x-2 text-slate-900">
                   <GraduationCap className="w-5 h-5 text-primary-600" />
                   <h2 className="text-lg font-black tracking-tight">Education</h2>
                 </div>
                 <button type="button" onClick={() => addArrayItem('education')} className="text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors">
                   <Plus className="w-3.5 h-3.5 mr-1" /> Add Education
                 </button>
              </div>

              {formData.education.length === 0 ? (
                 <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <p className="text-slate-400 text-sm font-medium">No education added yet.</p>
                 </div>
              ) : (
                <div className="space-y-6">
                  {formData.education.map((edu, index) => (
                    <div key={index} className="relative bg-slate-50 border border-slate-200 rounded-2xl p-5 group">
                      <button type="button" onClick={() => removeArrayItem('education', index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-1 bg-white rounded-lg border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                         <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Institution / School</label>
                           <input value={edu.institution} onChange={e => handleArrayChange('education', index, 'institution', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" placeholder="University name" />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Degree</label>
                           <input value={edu.degree} onChange={e => handleArrayChange('education', index, 'degree', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" placeholder="e.g. Bachelor of Science" />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Field of Study</label>
                           <input value={edu.field} onChange={e => handleArrayChange('education', index, 'field', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" placeholder="e.g. Computer Science" />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Start Date</label>
                           <input type="date" value={edu.startDate ? edu.startDate.split('T')[0] : ''} onChange={e => handleArrayChange('education', index, 'startDate', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">End Date</label>
                           <input type="date" value={edu.endDate ? edu.endDate.split('T')[0] : ''} onChange={e => handleArrayChange('education', index, 'endDate', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </form>
        </main>
      </div>
    </div>
  );
}
