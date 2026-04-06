'use client';

import { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Zap,
  Target,
  GraduationCap,
  Hammer,
  AlertCircle
} from 'lucide-react';

interface ScoreBreakdown {
  skills: number;
  experience: number;
  education: number;
}

interface CandidateProps {
  id: string;
  name: string;
  matchScore: number;
  scoreBreakdown: ScoreBreakdown;
  rationale: string;
  status: 'pending' | 'accepted' | 'rejected';
  experienceLevel: string;
  skills: string[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export default function CandidateCard({
  id,
  name,
  matchScore,
  scoreBreakdown,
  rationale,
  status,
  experienceLevel,
  skills,
  onAccept,
  onReject,
}: CandidateProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`glass-card overflow-hidden shadow-xl border-l-4 transition-all duration-300 ${
      status === 'accepted' ? 'border-l-green-500 bg-green-50/20' : 
      status === 'rejected' ? 'border-l-red-500 bg-red-50/20' : 
      'border-l-primary-500 bg-white'
    }`}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{name}</h3>
              <div className="flex items-center mt-1 space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>{experienceLevel}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="truncate max-w-[200px]">{skills.slice(0, 4).join(', ')}{skills.length > 4 ? '...' : ''}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-12">
            <div className={`flex flex-col items-center border p-3 rounded-2xl min-w-[80px] ${getScoreColor(matchScore)} shadow-sm`}>
              <span className="text-2xl font-black">{matchScore}%</span>
              <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-1">Match Score</span>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={() => onReject(id)}
                className={`p-3 rounded-xl border border-slate-200 transition-all active:scale-95 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 ${status === 'rejected' ? 'bg-red-500 text-white border-red-500' : ''}`}
              >
                <XCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onAccept(id)}
                className={`p-3 rounded-xl border border-slate-200 transition-all active:scale-95 text-slate-400 hover:text-green-500 hover:bg-green-50 hover:border-green-100 ${status === 'accepted' ? 'bg-green-500 text-white border-green-500' : ''}`}
              >
                <CheckCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScoreProgressBar label="SKILLS MATCH" score={scoreBreakdown.skills} icon={<Hammer className="w-3 h-3" />} color={getProgressBarColor(scoreBreakdown.skills)} />
          <ScoreProgressBar label="EXPERIENCE DEPTH" score={scoreBreakdown.experience} icon={<Zap className="w-3 h-3" />} color={getProgressBarColor(scoreBreakdown.experience)} />
          <ScoreProgressBar label="ACADEMIC BACKGROUND" score={scoreBreakdown.education} icon={<GraduationCap className="w-3 h-3" />} color={getProgressBarColor(scoreBreakdown.education)} />
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-xs font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest group"
          >
            <AlertCircle className="w-4 h-4" />
            <span>AI Explainability Panel: Why shortlisted?</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />}
          </button>

          {isExpanded && (
             <div className="mt-4 p-5 bg-primary-50/30 rounded-2xl border border-primary-100 animate-fade-in">
               <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  <Zap className="w-4 h-4 text-primary-600 inline mr-2 -mt-1" />
                  {rationale}
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreProgressBar({ label, score, icon, color }: { label: string, score: number, icon: React.ReactNode, color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {icon}
            <span>{label}</span>
        </div>
        <span className="text-[10px] font-black text-slate-800">{score}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
}
