'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function UploadResume() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const allowedTypes = ['application/pdf', 'text/csv', 'application/vnd.ms-excel'];
      if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
        setError('Please upload a PDF or CSV file');
        return;
      }

      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setFile(selectedFile);
      setError('');
      setParsedData(null);
    }
  };

  const handlePreview = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login first');
        return;
      }

      const formData = new FormData();
      formData.append('resume', file);

      const response = await axios.post(
        'http://localhost:5000/api/files/parse-resume',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setParsedData(response.data.data);
      setPreviewMode(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to parse resume');
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
      if (!token) {
        setError('Please login first');
        return;
      }

      const formData = new FormData();
      formData.append('resume', file);

      const response = await axios.post(
        'http://localhost:5000/api/files/upload-resume',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Resume uploaded and profile updated successfully!');
      router.push('/talents/my-profile');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setError('');
    setParsedData(null);
    setPreviewMode(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Upload Resume</h1>
            <p className="text-gray-600 mt-1">
              Upload your resume (PDF or CSV) to automatically update your talent profile
            </p>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {!previewMode ? (
              <div className="space-y-6">
                {/* File Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Select Resume File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {file ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={resetForm}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gray-100 rounded-full">
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Choose File
                          </button>
                          <p className="mt-2 text-xs text-gray-500">
                            PDF or CSV files up to 5MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {file && (
                  <div className="flex space-x-4">
                    <button
                      onClick={handlePreview}
                      disabled={uploading}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                    >
                      {uploading ? 'Parsing...' : 'Preview Extraction'}
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {uploading ? 'Uploading...' : 'Upload & Update Profile'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Preview Mode */
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Extracted Information Preview</h3>
                  <button
                    onClick={resetForm}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    ← Back to Upload
                  </button>
                </div>

                {parsedData && (
                  <div className="space-y-6">
                    {/* Contact Information */}
                    {parsedData.extractedData && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {parsedData.extractedData.firstName && (
                            <div>
                              <span className="text-gray-500">Name:</span>
                              <span className="ml-2 text-gray-900">
                                {parsedData.extractedData.firstName} {parsedData.extractedData.lastName}
                              </span>
                            </div>
                          )}
                          {parsedData.extractedData.email && (
                            <div>
                              <span className="text-gray-500">Email:</span>
                              <span className="ml-2 text-gray-900">{parsedData.extractedData.email}</span>
                            </div>
                          )}
                          {parsedData.extractedData.phone && (
                            <div>
                              <span className="text-gray-500">Phone:</span>
                              <span className="ml-2 text-gray-900">{parsedData.extractedData.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {parsedData.extractedData?.skills && parsedData.extractedData.skills.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Skills ({parsedData.extractedData.skills.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {parsedData.extractedData.skills.map((skill: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {parsedData.extractedData?.experience && parsedData.extractedData.experience.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Work Experience</h4>
                        <div className="space-y-2">
                          {parsedData.extractedData.experience.map((exp: any, index: number) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium text-gray-900">
                                {exp.position} at {exp.company}
                              </div>
                              {exp.duration && (
                                <div className="text-gray-600">{exp.duration}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {parsedData.extractedData?.education && parsedData.extractedData.education.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Education</h4>
                        <div className="space-y-2">
                          {parsedData.extractedData.education.map((edu: any, index: number) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium text-gray-900">
                                {edu.degree} in {edu.field}
                              </div>
                              <div className="text-gray-600">{edu.institution}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resume Text Preview */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Resume Text Preview</h4>
                      <div className="text-sm text-gray-600 max-h-40 overflow-y-auto">
                        {parsedData.text.substring(0, 500)}...
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Choose Different File
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload & Update Profile'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Upload Instructions</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Upload PDF or CSV files containing your resume information</li>
            <li>• Maximum file size: 5MB</li>
            <li>• The system will automatically extract skills, experience, and education</li>
            <li>• Preview the extracted data before updating your profile</li>
            <li>• Your existing profile will be enhanced with the extracted information</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
