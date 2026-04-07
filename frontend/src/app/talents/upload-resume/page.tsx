'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TalentSidebar from '@/components/TalentSidebar';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Eye,
  ArrowRight
} from 'lucide-react';

export default function UploadResume() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const isDocx = selectedFile.name.toLowerCase().endsWith('.docx');
    const isDoc = selectedFile.name.toLowerCase().endsWith('.doc');
    if (!allowedTypes.includes(selectedFile.type) && !isDocx && !isDoc) {
      setError('Please upload a PDF or DOCX file');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');
    setParsedData(null);
    setPreviewMode(false);
    setSuccess('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      const fakeEvent = { target: { files: [dropped] } } as any;
      handleFileSelect(fakeEvent);
    }
  };

  const handlePreview = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) { setError('Please login first'); return; }

      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/files/parse-resume', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) { setError(data?.message || 'Failed to parse resume'); return; }

      setParsedData(data?.data);
      setPreviewMode(true);
    } catch {
      setError('Failed to parse resume');
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) { setError('Please login first'); return; }

      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/files/upload-resume', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) { setError(data?.message || 'Failed to upload resume'); return; }

      setSuccess('Resume uploaded and profile updated successfully!');
      setTimeout(() => router.push('/talents/my-profile'), 1500);
    } catch {
      setError('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setError('');
    setSuccess('');
    setParsedData(null);
    setPreviewMode(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TalentSidebar />

      <div className="lg:ml-64 pt-14 lg:pt-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Resume</h1>
          <p className="text-slate-500 text-sm mt-0.5">Upload your resume to automatically update your profile with AI</p>
        </header>

        <main className="p-4 sm:p-8 max-w-3xl">
          {!previewMode ? (
            <div className="space-y-6">
              {/* Upload Area */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`bg-white rounded-3xl border-2 border-dashed p-10 text-center transition-all ${
                  file ? 'border-primary-300 bg-primary-50/30' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {uploading ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Loader2 className="w-16 h-16 text-primary-600 animate-spin" />
                    </div>
                    <p className="font-bold text-slate-900">Gemini AI is analyzing your resume...</p>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Identifying skills & experience</p>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                      <FileText className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={resetForm} className="flex items-center space-x-1 text-xs text-slate-400 hover:text-red-500 transition-colors font-bold">
                      <X className="w-3.5 h-3.5" /><span>Remove</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                      <Upload className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Drag & drop your resume here</p>
                      <p className="text-sm text-slate-400 mt-1">PDF or DOCX, up to 10MB</p>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                    >
                      Browse Files
                    </button>
                  </div>
                )}
              </div>

              {/* Alerts */}
              {error && (
                <div className="flex items-start space-x-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
              {success && (
                <div className="flex items-start space-x-3 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-bold">{success}</p>
                </div>
              )}

              {/* Action Buttons */}
              {file && !uploading && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handlePreview}
                    className="flex-1 flex items-center justify-center space-x-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview Extracted Data</span>
                  </button>
                  <button
                    onClick={handleUpload}
                    className="flex-1 flex items-center justify-center space-x-2 px-5 py-3 bg-primary-600 text-white rounded-2xl font-bold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload & Update Profile</span>
                  </button>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-blue-800 mb-2">How it works</h3>
                <ul className="text-sm text-blue-700 space-y-1.5">
                  <li>• Upload a PDF or DOCX resume (up to 10MB)</li>
                  <li>• Our Gemini AI extracts your skills, experience, and education</li>
                  <li>• Your profile is automatically updated with the extracted data</li>
                  <li>• Use "Preview" first to review what gets extracted</li>
                </ul>
              </div>
            </div>
          ) : (
            /* Preview Mode */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900">Extracted Information Preview</h2>
                <button onClick={resetForm} className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                  ← Back
                </button>
              </div>

              {parsedData && (
                <div className="space-y-4">
                  {parsedData.extractedData?.firstName && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Contact Information</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-slate-400">Name:</span> <span className="font-bold">{parsedData.extractedData.firstName} {parsedData.extractedData.lastName}</span></div>
                        {parsedData.extractedData.email && <div><span className="text-slate-400">Email:</span> <span className="font-bold">{parsedData.extractedData.email}</span></div>}
                        {parsedData.extractedData.phone && <div><span className="text-slate-400">Phone:</span> <span className="font-bold">{parsedData.extractedData.phone}</span></div>}
                      </div>
                    </div>
                  )}
                  {parsedData.extractedData?.skills?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Skills ({parsedData.extractedData.skills.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {parsedData.extractedData.skills.map((skill: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-lg border border-primary-100">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {parsedData.extractedData?.experience?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Work Experience</h4>
                      <div className="space-y-2">
                        {parsedData.extractedData.experience.map((exp: any, i: number) => (
                          <div key={i} className="text-sm">
                            <span className="font-bold text-slate-900">{exp.position}</span>
                            {exp.company && <span className="text-slate-500"> at {exp.company}</span>}
                            {exp.duration && <p className="text-xs text-slate-400">{exp.duration}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={resetForm} className="flex-1 px-5 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                  Choose Different File
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center space-x-2 px-5 py-3 bg-primary-600 text-white rounded-2xl font-bold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95 disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>{uploading ? 'Uploading...' : 'Upload & Update Profile'}</span>
                </button>
              </div>
              {error && (
                <div className="flex items-start space-x-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
