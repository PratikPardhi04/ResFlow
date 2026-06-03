import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FileText, ChevronRight, TrendingUp, Briefcase, MessageSquare, Target } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useResumeStore } from '../stores/resumeStore';
import FileUpload from '../components/FileUpload';
import LoadingSpinner from '../components/LoadingSpinner';

const quickActions = [
  { icon: MessageSquare, label: 'Chat with AI Coach', desc: 'Optimize your resume interactively', path: '/chat', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: Target, label: 'Match Job Description', desc: 'Find gaps before applying', path: '/match', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: FileText, label: 'Generate Cover Letter', desc: 'Tailored letters in seconds', path: '/cover-letter', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Briefcase, label: 'Search Jobs', desc: 'AI-recommended roles for you', path: '/jobs', color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

function DashboardPage() {
  const { user } = useAuthStore();
  const { resumes, fetchResumes, uploadResume, isUploading, isLoading } = useResumeStore();
  const navigate = useNavigate();
  const [targetRole, setTargetRole] = useState('');

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleUpload = async (file) => {
    if (!file) return;
    const newResume = await uploadResume(file, targetRole);
    if (newResume) {
      navigate(`/resume/${newResume.id}`);
    }
  };

  const getScoreGrade = (score) => {
    if (!score) return { text: 'N/A', color: 'text-gray-400' };
    if (score >= 80) return { text: 'Excellent', color: 'text-emerald-400' };
    if (score >= 60) return { text: 'Good', color: 'text-cyan-400' };
    if (score >= 40) return { text: 'Fair', color: 'text-amber-400' };
    return { text: 'Needs Work', color: 'text-rose-400' };
  };

  return (
    <div className="space-y-8 animate-in">
      {/* Welcome Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Let's get you ready for your next big career move.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Actions & Upload */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-panel-hover p-4 flex items-start gap-4 text-left group"
                  >
                    <div className={`p-3 rounded-xl ${action.bg} transition-colors group-hover:scale-110 duration-300`}>
                      <Icon className={`w-6 h-6 ${action.color}`} />
                    </div>
                    <div>
                      <h3 className="text-gray-200 font-medium mb-1 group-hover:text-white transition-colors">{action.label}</h3>
                      <p className="text-sm text-gray-500">{action.desc}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Upload New Resume */}
          <section className="glass-panel p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-white mb-2">Analyze a New Resume</h2>
            <p className="text-gray-400 text-sm mb-6">Upload a PDF or paste text to get an instant AI scorecard.</p>
            
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Role (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="input-dark"
                disabled={isUploading}
              />
            </div>

            <FileUpload onFileSelect={handleUpload} isUploading={isUploading} />
          </section>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-1">
          <section className="glass-panel p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Resumes</h2>
              <TrendingUp className="w-5 h-5 text-gray-500" />
            </div>

            <div className="flex-1">
              {isLoading ? (
                <div className="h-40 flex items-center justify-center">
                  <LoadingSpinner size="md" />
                </div>
              ) : resumes.length > 0 ? (
                <div className="space-y-3">
                  {resumes.map((resume, i) => {
                    const grade = getScoreGrade(resume.scores?.overall);
                    return (
                      <motion.div
                        key={resume.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => navigate(`/resume/${resume.id}`)}
                        className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.06] cursor-pointer transition-all group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-4 h-4 flex-shrink-0 text-cyan-400" />
                            <span className="text-sm font-medium text-gray-200 truncate">
                              {resume.targetRole || resume.originalFileName}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors flex-shrink-0" />
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            {new Date(resume.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400">Score:</span>
                            <span className={`font-bold ${grade.color}`}>
                              {resume.scores?.overall || 0}/100
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white/[0.02] rounded-xl border border-dashed border-white/[0.1]">
                  <div className="w-12 h-12 rounded-full bg-dark flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-gray-300 font-medium mb-1">No resumes yet</p>
                  <p className="text-sm text-gray-500">Upload your first resume to get started</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
