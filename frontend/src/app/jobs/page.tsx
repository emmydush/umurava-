'use client';

import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  ChevronRight,
  TrendingUp,
  DollarSign,
  Star,
  Users,
  ArrowUpDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import TalentSidebar from '@/components/TalentSidebar';

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
}

interface TalentProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  skills: string[];
  title?: string;
}

type SortOption = 'newest' | 'oldest' | 'most_relevant' | 'salary_high' | 'salary_low';
type FilterType = 'all' | 'full-time' | 'part-time' | 'contract' | 'remote';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [userProfile, setUserProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchJobsAndProfile();
  }, []);

  useEffect(() => {
    applyFiltersAndSorting();
  }, [jobs, searchQuery, filterType, sortBy, userProfile]);

  const fetchJobsAndProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch jobs
      const jobsResponse = await fetch('/api/jobs', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      // Fetch user profile for skill matching
      const profileResponse = await fetch('/api/talents/my-profile', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobs(jobsData.jobs || []);
      }

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserProfile(profileData.profile);
      } else if (profileResponse.status === 404) {
        // Profile doesn't exist, that's okay
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSkillMatch = (job: Job, userSkills: string[] = []): number => {
    if (!userSkills.length) return 0;
    
    const jobSkillsLower = job.skills.map(s => s.toLowerCase());
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    
    const matchingSkills = jobSkillsLower.filter(skill => 
      userSkillsLower.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
    );
    
    return (matchingSkills.length / Math.max(job.skills.length, 1)) * 100;
  };

  const applyFiltersAndSorting = () => {
    let filtered = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (job.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === 'all' || job.workType?.toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesType && job.isActive;
    });

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most_relevant':
          const aRelevance = calculateSkillMatch(a, userProfile?.skills);
          const bRelevance = calculateSkillMatch(b, userProfile?.skills);
          return bRelevance - aRelevance;
        case 'salary_high':
          if (!a.salary?.max || !b.salary?.max) return 0;
          return b.salary.max - a.salary.max;
        case 'salary_low':
          if (!a.salary?.min || !b.salary?.min) return 0;
          return a.salary.min - b.salary.min;
        default:
          return 0;
      }
    });

    setFilteredJobs(filtered);
  };

  const getSkillMatchColor = (match: number) => {
    if (match >= 70) return 'text-green-600 bg-green-100';
    if (match >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-slate-600 bg-slate-100';
  };

  const formatSalary = (salary?: { min: number; max: number; currency: string }) => {
    if (!salary) return 'Salary not specified';
    const { min, max, currency } = salary;
    if (min === max) return `${currency} ${min.toLocaleString()}`;
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TalentSidebar />

      {/* Page content */}
      <div className="lg:ml-64 pt-14 lg:pt-0">
        
        {/* Enhanced header with search and filters */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-5">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Discover Opportunities</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {userProfile ? 
                  `Personalized job matches based on your ${userProfile.skills.length} skills` : 
                  'Find your next opportunity from top companies'
                }
              </p>
            </div>
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search jobs, skills, companies..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filter and sort controls */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-700 transition-all"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {(filterType !== 'all' || searchQuery) && (
                  <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                )}
              </button>
              
              <div className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-sm font-bold text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most_relevant">Most Relevant to You</option>
                  <option value="salary_high">Highest Salary</option>
                  <option value="salary_low">Lowest Salary</option>
                </select>
              </div>
            </div>

            <div className="text-sm font-bold text-slate-500">
              <span className="text-slate-900">{filteredJobs.length}</span> jobs found
            </div>
          </div>
        </header>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">Work Type</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All Types' },
                    { value: 'full-time', label: 'Full-time' },
                    { value: 'part-time', label: 'Part-time' },
                    { value: 'contract', label: 'Contract' },
                    { value: 'remote', label: 'Remote' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFilterType(type.value as FilterType)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        filterType === type.value 
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="p-4 sm:p-8">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Finding perfect matches...</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="space-y-6">
              {/* User skills reminder */}
              {userProfile && userProfile.skills.length > 0 && (
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-primary-900 mb-1">Your Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.skills.slice(0, 8).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-primary-600 text-white rounded-lg text-[10px] font-bold">
                            {skill}
                          </span>
                        ))}
                        {userProfile.skills.length > 8 && (
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-[10px] font-bold">
                            +{userProfile.skills.length - 8}
                          </span>
                        )}
                      </div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary-600" />
                  </div>
                </div>
              )}

              {/* Job cards */}
              <div className="grid gap-6">
                {filteredJobs.map((job) => {
                  const skillMatch = userProfile ? calculateSkillMatch(job, userProfile.skills) : 0;
                  
                  return (
                    <div 
                      key={job._id} 
                      className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-500/5 transition-all cursor-pointer group"
                      onClick={() => router.push(`/jobs/${job._id}`)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center text-xl font-black text-primary-600 border border-primary-100 group-hover:scale-110 transition-transform shrink-0">
                            {(job.company)?.[0] || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <h2 className="text-lg font-black text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">
                                  {job.title}
                                </h2>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                                  <span className="text-primary-600 font-bold text-sm">{job.company}</span>
                                  <span className="flex items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <MapPin className="w-3 h-3 mr-1" />{job.location || 'Remote'}
                                  </span>
                                  <span className="flex items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <Clock className="w-3 h-3 mr-1" />{job.workType}
                                  </span>
                                  {job.experience && (
                                    <span className="flex items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                                      <Briefcase className="w-3 h-3 mr-1" />{job.experience}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Skill match indicator */}
                              {userProfile && skillMatch > 0 && (
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${getSkillMatchColor(skillMatch)}`}>
                                  {Math.round(skillMatch)}% Match
                                </div>
                              )}
                            </div>

                            {/* Salary */}
                            {job.salary && (
                              <div className="flex items-center text-slate-700 text-sm font-bold mb-3">
                                <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                                {formatSalary(job.salary)}
                              </div>
                            )}

                            {/* Skills */}
                            <div className="flex flex-wrap gap-2">
                              {job.skills.slice(0, 8).map((skill, index) => {
                                const hasSkill = userProfile?.skills.some(userSkill => 
                                  userSkill.toLowerCase() === skill.toLowerCase()
                                );
                                
                                return (
                                  <span 
                                    key={index} 
                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight border ${
                                      hasSkill 
                                        ? 'bg-green-100 text-green-700 border-green-200' 
                                        : 'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}
                                  >
                                    {skill}
                                    {hasSkill && <Star className="w-3 h-3 ml-1 inline" />}
                                  </span>
                                );
                              })}
                              {job.skills.length > 8 && (
                                <span className="px-3 py-1 text-slate-400 text-[10px] font-bold uppercase tracking-tight">
                                  +{job.skills.length - 8} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary-600 hover:text-white transition-all shrink-0">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-600">No jobs found</h3>
              <p className="text-slate-400 mt-2">Try adjusting your search or filters to find more opportunities.</p>
              <div className="flex gap-3 justify-center mt-6">
                <button 
                  onClick={() => { setSearchQuery(''); setFilterType('all'); }}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all"
                >
                  Clear All Filters
                </button>
                {userProfile && (
                  <button 
                    onClick={() => setSortBy('most_relevant')}
                    className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
                  >
                    Show Most Relevant
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
