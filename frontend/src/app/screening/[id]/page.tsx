'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';

interface ScreeningResult {
  _id: string;
  jobId: string;
  talentId: string;
  score: number;
  ranking: number;
  shortlisted: boolean;
  reasoning: {
    overall: string;
    skills: Array<{
      skill: string;
      matched: boolean;
      relevance: number;
    }>;
    experience: {
      relevance: number;
      explanation: string;
    };
    education: {
      relevance: number;
      explanation: string;
    };
  };
  talent: {
    firstName: string;
    lastName: string;
    title: string;
    skills: string[];
    email?: string;
  };
}

interface ScreeningSession {
  _id: string;
  jobId: string;
  recruiterId: string;
  totalCandidates: number;
  shortlistedCount: number;
  status: string;
  createdAt: string;
  results: ScreeningResult[];
}

export default function ScreeningResults() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<ScreeningSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScreeningResults();
  }, [params.id]);

  const fetchScreeningResults = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login first');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/screening/results/${params.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSession(response.data.results);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch screening results');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 0.8) return 'text-green-600';
    if (relevance >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading screening results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Screening session not found</div>
      </div>
    );
  }

  const shortlistedCandidates = session.results.filter(result => result.shortlisted);
  const allCandidates = session.results.sort((a, b) => b.score - a.score);

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
              <h1 className="text-2xl font-bold text-gray-900">Screening Results</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                session.status === 'completed' ? 'bg-green-100 text-green-800' :
                session.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {session.status}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Candidates</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{session.totalCandidates}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Shortlisted</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{session.shortlistedCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Shortlist Rate</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {session.totalCandidates > 0 
                ? Math.round((session.shortlistedCount / session.totalCandidates) * 100)
                : 0}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Avg Score</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {session.results.length > 0
                ? Math.round(session.results.reduce((sum, r) => sum + r.score, 0) / session.results.length)
                : 0}
            </p>
          </div>
        </div>

        {/* Shortlisted Candidates */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Shortlisted Candidates ({shortlistedCandidates.length})
            </h2>
          </div>
          <div className="p-6">
            {shortlistedCandidates.length === 0 ? (
              <p className="text-gray-500">No candidates have been shortlisted yet.</p>
            ) : (
              <div className="space-y-6">
                {shortlistedCandidates.map((result) => (
                  <div key={result._id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {result.talent.firstName} {result.talent.lastName}
                        </h3>
                        <p className="text-gray-600">{result.talent.title}</p>
                        {result.talent.email && (
                          <p className="text-sm text-gray-500">{result.talent.email}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(result.score)}`}>
                          Score: {result.score}/100
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Rank #{result.ranking}</p>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.talent.skills.map((skill: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">AI Analysis</h4>
                      <p className="text-sm text-gray-600 mb-3">{result.reasoning.overall}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Skills Analysis */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-600 mb-1">Skills Match</h5>
                          <div className="space-y-1">
                            {result.reasoning.skills.slice(0, 3).map((skill, index) => (
                              <div key={index} className="flex items-center justify-between text-xs">
                                <span className={skill.matched ? 'text-green-600' : 'text-red-600'}>
                                  {skill.matched ? '✓' : '✗'} {skill.skill}
                                </span>
                                <span className={getRelevanceColor(skill.relevance)}>
                                  {Math.round(skill.relevance * 100)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Experience Analysis */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-600 mb-1">Experience</h5>
                          <div className="text-xs">
                            <div className="flex justify-between mb-1">
                              <span>Relevance</span>
                              <span className={getRelevanceColor(result.reasoning.experience.relevance)}>
                                {Math.round(result.reasoning.experience.relevance * 100)}%
                              </span>
                            </div>
                            <p className="text-gray-600">{result.reasoning.experience.explanation}</p>
                          </div>
                        </div>

                        {/* Education Analysis */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-600 mb-1">Education</h5>
                          <div className="text-xs">
                            <div className="flex justify-between mb-1">
                              <span>Relevance</span>
                              <span className={getRelevanceColor(result.reasoning.education.relevance)}>
                                {Math.round(result.reasoning.education.relevance * 100)}%
                              </span>
                            </div>
                            <p className="text-gray-600">{result.reasoning.education.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All Candidates */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              All Candidates ({allCandidates.length})
            </h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Top Skills
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allCandidates.map((result) => (
                    <tr key={result._id} className={result.shortlisted ? 'bg-green-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{result.ranking}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {result.talent.firstName} {result.talent.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{result.talent.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(result.score)}`}>
                          {result.score}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {result.shortlisted ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Shortlisted
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            Not Shortlisted
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {result.talent.skills.slice(0, 3).map((skill: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
