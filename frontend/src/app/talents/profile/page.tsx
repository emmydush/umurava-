'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  User, 
  Briefcase, 
  GraduationCap, 
  Hammer, 
  Upload,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function CandidateProfile() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    experience: '',
    education: '',
    skills: '',
    linkedin: '',
    github: ''
  });

  const handleUpload = async () => {
    setIsUploading(true);
    // Simulation of AI resume parsing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsUploading(false);
    setUploadSuccess(true);
    
    // Auto-fill mock data to show AI parsing behavior
    setFormData({
      ...formData,
      bio: 'Full Stack Engineer with 5 years experience in building high-scale fintech applications.',
      skills: 'React, Node.js, GraphQL, PostgreSQL, Docker, AWS',
      experience: 'Senior Software Engineer at PayStack (2020-2024). Lead developer for Core API infrastructure.',
      education: 'B.Sc. Computer Science, University of Lagos.'
    });
  };

  const steps = [
    { id: 1, label: 'RESUME ANALYTICS', icon: <Upload className="w-4 h-4" /> },
    { id: 2, label: 'PROFILE BUILDER', icon: <User className="w-4 h-4" /> },
    { id: 3, label: 'COMPETENCY VERIFICATION', icon: <Zap className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 md:py-20 overflow-x-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary-500/5 to-transparent -z-10 pointer-events-none"></div>

      <div className="max-w-4xl w-full">
        <div className="flex justify-center mb-10">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 rotate-3">
              <Zap className="text-white w-6 h-6 fill-current" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">Umurava<span className="text-primary-600">AI</span></span>
          </div>
        </div>

        <div className="mb-12 flex justify-between items-center relative px-2 max-w-2xl mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                activeStep >= step.id ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20 scale-110' : 'bg-white border-slate-200 text-slate-400'
              }`}>
                 {activeStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.icon}
              </div>
              <span className={`mt-3 text-[10px] font-black uppercase tracking-widest ${activeStep >= step.id ? 'text-primary-600' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="glass-card shadow-2xl p-10 md:p-14 mb-10 border-slate-200/50">
          {activeStep === 1 && (
            <div className="animate-fade-in">
              <div className="text-center max-w-xl mx-auto mb-12">
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Start with AI Resume Parsing</h2>
                 <p className="text-slate-500 font-medium leading-relaxed">
                    Upload your resume and our Gemini AI engine will handle the heavy lifting. We'll automatically identify your core skills, experience level, and achievements.
                 </p>
              </div>

              <div className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
                uploadSuccess ? 'border-green-300 bg-green-50/20' : 'border-slate-200 hover:border-primary-400 bg-slate-50/50'
              }`}>
                {isUploading ? (
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                       <Loader2 className="w-20 h-20 text-primary-600 animate-spin" />
                       <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary-400 animate-pulse" />
                    </div>
                    <div>
                       <p className="text-xl font-bold text-slate-900">GEMINI AI IS ANALYZING...</p>
                       <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">Identifying core competencies & experience history</p>
                    </div>
                  </div>
                ) : uploadSuccess ? (
                  <div className="flex flex-col items-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                       <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                       <p className="text-xl font-bold text-green-700">RESUME ANALYSIS SUCCESSFUL!</p>
                       <p className="text-sm font-medium text-slate-500 mt-1">We've extracted 12 skills and 3 prior roles into your profile.</p>
                       <button 
                        onClick={() => setActiveStep(2)}
                        className="mt-8 px-10 py-4 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition-all flex items-center justify-center space-x-2 mx-auto active:scale-95"
                       >
                          <span>Review Extracted Profile</span>
                          <ArrowRight className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-primary-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                       <Upload className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Drag and drop your resume</h3>
                    <p className="text-sm text-slate-400 font-medium mb-8 uppercase tracking-widest">PDF, DOCX up to 10MB</p>
                    
                    <button 
                      onClick={handleUpload}
                      className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold shadow-sm hover:border-primary-500 transition-all"
                    >
                      Browse Files
                    </button>
                  </>
                )}
              </div>
              
              <div className="mt-12 text-center">
                 <button 
                   onClick={() => setActiveStep(2)}
                   className="text-xs font-black text-slate-400 hover:text-primary-600 uppercase tracking-widest transition-all"
                 >
                    Skip to manual entry 
                 </button>
              </div>
            </div>
          )}

          {activeStep === 2 && (
             <div className="animate-slide-up space-y-10">
               <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8">
                  <div>
                     <h2 className="text-2xl font-black text-slate-900 tracking-tight">Profile Intelligence</h2>
                     <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mt-1">Refine your AI-extracted identity</p>
                  </div>
                  <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100">
                     <Zap className="w-3.5 h-3.5 mr-2" />
                     <span className="text-[10px] font-black tracking-wider uppercase">AI Enhancement Enabled</span>
                  </div>
               </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <div className="flex items-center space-x-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                        <Hammer className="w-4 h-4" />
                        <span>Core Competencies</span>
                     </div>
                     <textarea 
                        rows={4}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none shadow-sm"
                        placeholder="Comma separated list (e.g. React, Python, Project Management)"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                     />
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center space-x-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                        <Briefcase className="w-4 h-4" />
                        <span>Experience Snapshot</span>
                     </div>
                     <textarea 
                        rows={4}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none shadow-sm"
                        placeholder="Paste summaries of recent roles..."
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                     />
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center space-x-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                      <GraduationCap className="w-4 h-4" />
                      <span>Academic Background</span>
                   </div>
                   <input 
                      type="text"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                      placeholder="University, Degree & Honors"
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                   />
                </div>

                <div className="bg-primary-900 rounded-3xl p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                   <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary-600/20 blur-2xl rounded-full translate-x-1/4 translate-y-1/4"></div>
                   <div>
                      <h4 className="text-lg font-black tracking-tight mb-2">Ready for Verification?</h4>
                      <p className="text-sm text-primary-200/80 font-medium">Umurava AI will now test your skills against the profile you've built.</p>
                   </div>
                   <button 
                     onClick={() => router.push('/')}
                     className="px-8 py-3 bg-white text-primary-900 rounded-xl font-black text-sm shadow-xl shadow-black/20 whitespace-nowrap active:scale-95 group"
                   >
                      Complete Profile
                      <ArrowRight className="w-4 h-4 inline ml-2 group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
             </div>
          )}
        </div>

        <div className="text-center px-4">
           <p className="text-xs text-slate-400 font-bold max-w-lg mx-auto uppercase tracking-widest leading-loose">
              By completing your profile, you authorize Umurava AI to rank your profile for open positions based on our proprietary matching algorithms.
           </p>
        </div>
      </div>
    </div>
  );
}
