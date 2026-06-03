import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Target, Mail, Download, Briefcase, GraduationCap, Code } from 'lucide-react';
import { useResumeStore } from '../stores/resumeStore';
import { useChatStore } from '../stores/chatStore';
import ScoreRadial from '../components/ScoreRadial';
import ScoreDimension from '../components/ScoreDimension';
import LoadingSpinner from '../components/LoadingSpinner';

function ResumeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchResume, activeResume: resume, isLoading, error } = useResumeStore();
  const { startNewSession } = useChatStore();

  useEffect(() => {
    if (id) {
      fetchResume(id);
    }
  }, [id, fetchResume]);

  const handleStartChat = async () => {
    await startNewSession(id);
    navigate('/chat');
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading resume data..." />
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="p-8 text-center glass-panel">
        <p className="text-rose-400 mb-4">{error || 'Resume not found'}</p>
        <button onClick={() => navigate('/')} className="btn-secondary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const pd = resume.parsedData || {};
  const scores = resume.scores || {};

  return (
    <div className="space-y-8 animate-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            {pd.name || 'Parsed Resume'}
          </h1>
          <p className="text-gray-400">
            {resume.targetRole ? `Targeting: ${resume.targetRole}` : 'No target role specified'}
            {' • '}
            {resume.industry && <span className="capitalize">{resume.industry}</span>}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button onClick={handleStartChat} className="btn-primary flex-1 md:flex-none flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" /> AI Coach
          </button>
          <button onClick={() => navigate('/match')} className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2">
            <Target className="w-4 h-4" /> Match JD
          </button>
          <button onClick={() => navigate('/cover-letter')} className="btn-secondary flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Parsed Data */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Summary */}
          {pd.summary && (
            <section className="glass-panel p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Professional Summary</h2>
              <p className="text-gray-300 leading-relaxed text-sm">{pd.summary}</p>
            </section>
          )}

          {/* Experience */}
          {pd.experience?.length > 0 && (
            <section className="glass-panel p-6">
              <div className="flex items-center gap-2 mb-6">
                <Briefcase className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-semibold text-white">Experience</h2>
              </div>
              <div className="space-y-8">
                {pd.experience.map((exp, i) => (
                  <div key={i} className="relative pl-6 border-l border-white/[0.1] last:border-0 pb-8 last:pb-0">
                    <div className="absolute w-3 h-3 bg-violet-500 rounded-full -left-[1.5px] top-1.5 shadow-glow-violet" />
                    <div className="mb-3">
                      <h3 className="text-white font-semibold">{exp.role}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="text-violet-300">{exp.company}</span>
                        <span>•</span>
                        <span>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                    </div>
                    {exp.bullets?.length > 0 && (
                      <ul className="list-none space-y-2 text-sm text-gray-300">
                        {exp.bullets.map((b, bi) => (
                          <li key={bi} className="relative pl-4">
                            <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education & Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills */}
            <section className="glass-panel p-6">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Skills</h2>
              </div>
              {pd.skills && Object.entries(pd.skills).map(([category, skills]) => (
                skills?.length > 0 && (
                  <div key={category} className="mb-4 last:mb-0">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.map(s => (
                        <span key={s} className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.1] text-xs text-gray-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </section>

            {/* Education */}
            {pd.education?.length > 0 && (
              <section className="glass-panel p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-white">Education</h2>
                </div>
                <div className="space-y-4">
                  {pd.education.map((edu, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                      <h3 className="text-sm font-semibold text-white">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</h3>
                      <p className="text-xs text-emerald-400 mt-1">{edu.institution}</p>
                      <p className="text-xs text-gray-500 mt-1">{edu.startDate} – {edu.endDate}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Right Column: Score Card */}
        <div className="lg:col-span-1 space-y-6">
          <section className="glass-panel p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-white mb-6">AI Scorecard</h2>
            
            <div className="flex justify-center mb-8">
              <ScoreRadial score={scores.overall || 0} size={160} />
            </div>

            <div className="space-y-6">
              <ScoreDimension 
                dimension="impact" 
                score={scores.impact} 
                issues={scores.issues?.filter(i => i.dimension === 'impact')} 
                delay={0.1}
              />
              <ScoreDimension 
                dimension="ats" 
                score={scores.ats} 
                issues={scores.issues?.filter(i => i.dimension === 'ats')} 
                delay={0.2}
              />
              <ScoreDimension 
                dimension="clarity" 
                score={scores.clarity} 
                issues={scores.issues?.filter(i => i.dimension === 'clarity')} 
                delay={0.3}
              />
              <ScoreDimension 
                dimension="completeness" 
                score={scores.completeness} 
                issues={scores.issues?.filter(i => i.dimension === 'completeness')} 
                delay={0.4}
              />
              <ScoreDimension 
                dimension="formatting" 
                score={scores.formatting} 
                issues={scores.issues?.filter(i => i.dimension === 'formatting')} 
                delay={0.5}
              />
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.1]">
              <button onClick={handleStartChat} className="w-full btn-primary flex items-center justify-center gap-2">
                Improve Score
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ResumeDetailPage;
