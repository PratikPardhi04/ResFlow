import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, FileText, CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react';
import { useResumeStore } from '../stores/resumeStore';
import { jobAPI } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

function JDMatchPage() {
  const { resumes, fetchResumes } = useResumeStore();
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jdText, setJdText] = useState('');
  
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // Auto-select latest resume if available
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  const handleMatch = async () => {
    if (!selectedResumeId || !jdText.trim()) {
      setError('Please select a resume and paste a job description.');
      return;
    }

    setIsMatching(true);
    setError('');
    
    try {
      const res = await jobAPI.match({
        resumeId: selectedResumeId,
        jobDescription: jdText
      });
      setMatchResult(res.data.matchReport);
    } catch (err) {
      setError(err.message || 'Failed to match JD');
    } finally {
      setIsMatching(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-cyan-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-cyan-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-8 animate-in pb-12">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
          <Target className="w-8 h-8 text-violet-400" /> JD Match Analysis
        </h1>
        <p className="text-gray-400">Compare your resume against a job description to uncover gaps and strengths.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Input Form */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Match Configuration</h2>
            
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Resume</label>
                <div className="relative">
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full bg-dark-200 border border-white/[0.08] rounded-xl pl-4 pr-10 py-3 text-gray-200 appearance-none focus:outline-none focus:border-violet-500/50"
                  >
                    <option value="" disabled>Select a resume...</option>
                    {resumes.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.targetRole || r.originalFileName} ({new Date(r.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Job Description</label>
                <textarea
                  rows={10}
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="input-dark resize-none font-mono text-sm leading-relaxed"
                />
              </div>

              <button
                onClick={handleMatch}
                disabled={isMatching || !selectedResumeId || !jdText.trim()}
                className="w-full btn-primary flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
              >
                {isMatching ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Analyzing Match...</span>
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5" />
                    <span>Analyze Match</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div>
          {matchResult ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Overall Score */}
              <div className="glass-panel p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-mesh opacity-20 pointer-events-none" />
                <h3 className="text-gray-400 font-medium uppercase tracking-wider text-sm mb-2">Overall Match Score</h3>
                <div className={`text-6xl font-black mb-2 ${getScoreColor(matchResult.matchScore.overall)}`}>
                  {matchResult.matchScore.overall}%
                </div>
                
                {/* Breakdown bars */}
                <div className="mt-8 space-y-4 text-left">
                  {Object.entries(matchResult.matchScore.breakdown).map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{label}</span>
                          <span className="font-bold text-gray-200">{value}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={`h-full ${getScoreBg(value)}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gaps & Strengths */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="glass-panel p-6 border-t-4 border-t-rose-500/50">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <h3 className="font-semibold text-white">Critical Gaps</h3>
                  </div>
                  <ul className="space-y-3">
                    {matchResult.gaps.map((gap, i) => (
                      <li key={i} className="text-sm bg-white/[0.02] p-3 rounded-lg border border-white/[0.05]">
                        <p className="font-medium text-rose-300 mb-1">{gap.requirement}</p>
                        <p className="text-gray-400 text-xs">{gap.suggestion}</p>
                      </li>
                    ))}
                    {matchResult.gaps.length === 0 && (
                      <li className="text-sm text-gray-500">No major gaps identified!</li>
                    )}
                  </ul>
                </div>

                <div className="glass-panel p-6 border-t-4 border-t-emerald-500/50">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-semibold text-white">Key Strengths</h3>
                  </div>
                  <ul className="space-y-3">
                    {matchResult.strengths.map((str, i) => (
                      <li key={i} className="text-sm bg-white/[0.02] p-3 rounded-lg border border-white/[0.05]">
                        <p className="font-medium text-emerald-300 mb-1">{str.skill}</p>
                        <p className="text-gray-400 text-xs">{str.evidence}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 glass-panel border-dashed">
              <div className="w-16 h-16 rounded-full bg-dark flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">Ready to Analyze</h3>
              <p className="text-gray-500 text-sm max-w-sm">
                Select a resume and paste a job description to see how well you match and what keywords you're missing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JDMatchPage;
