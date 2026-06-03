import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Copy, Check, ChevronDown, Sparkles } from 'lucide-react';
import { useResumeStore } from '../stores/resumeStore';
import { coverLetterAPI } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

function CoverLetterPage() {
  const { resumes, fetchResumes } = useResumeStore();
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jdText, setJdText] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tone, setTone] = useState('professional');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [letterText, setLetterText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  const handleGenerate = async () => {
    if (!selectedResumeId || !jdText.trim() || !companyName.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      const res = await coverLetterAPI.generate({
        resumeId: selectedResumeId,
        jobDescription: jdText,
        companyName,
        tone
      });
      
      // Get the requested tone or fallback to first available
      const generated = res.data.coverLetters[tone] || Object.values(res.data.coverLetters)[0];
      setLetterText(generated?.coverLetter || '');
    } catch (err) {
      setError(err.message || 'Failed to generate cover letter');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!letterText) return;
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tones = [
    { id: 'professional', label: 'Professional (Traditional)' },
    { id: 'conversational', label: 'Conversational (Modern)' },
    { id: 'enthusiastic', label: 'Enthusiastic (Startup/Creative)' }
  ];

  return (
    <div className="space-y-8 animate-in pb-12">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
          <Mail className="w-8 h-8 text-emerald-400" /> Cover Letter Generator
        </h1>
        <p className="text-gray-400">Generate highly tailored cover letters based on your resume and target job.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Letter Details</h2>
            
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
                    className="w-full bg-dark-200 border border-white/[0.08] rounded-xl pl-4 pr-10 py-3 text-gray-200 appearance-none focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="" disabled>Select a resume...</option>
                    {resumes.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.targetRole || r.originalFileName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Job Description</label>
                <textarea
                  rows={6}
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the JD here to align keywords..."
                  className="input-dark resize-none font-mono text-sm leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tone & Style</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {tones.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                        tone === t.id 
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300' 
                          : 'bg-white/[0.02] border-white/[0.05] text-gray-400 hover:bg-white/[0.05]'
                      }`}
                    >
                      {t.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !selectedResumeId || !jdText.trim() || !companyName.trim()}
                className="w-full btn-primary flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)' }}
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Magic Letter</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Output */}
        <div className="lg:col-span-7">
          <div className="glass-panel h-full min-h-[500px] flex flex-col relative overflow-hidden">
            {letterText ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col h-full"
              >
                <div className="flex items-center justify-between p-4 border-b border-white/[0.06] bg-dark-100/50">
                  <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-400" /> Draft Generated
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-sm text-gray-300 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy text'}
                  </button>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="prose prose-invert prose-sm max-w-none">
                    {letterText.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4 text-gray-300 leading-relaxed font-serif text-[15px]">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                <div className="w-16 h-16 rounded-full bg-dark flex items-center justify-center mb-4 border border-white/[0.05]">
                  <Mail className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">Awaiting Instructions</h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  Fill out the details on the left and click generate. AI will craft a personalized cover letter highlighting your best traits for the job.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoverLetterPage;
