import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSignature, Copy, CheckCircle2, Download, RefreshCw } from 'lucide-react';
import { generateCoverLetter, getAllResumes } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function CoverLetter() {
  const [formData, setFormData] = useState({
    resumeId: '',
    companyName: '',
    roleTitle: '',
    jobDescription: '',
    tone: 'Professional'
  });
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const { data: resumes } = useQuery({
    queryKey: ['resumes'],
    queryFn: getAllResumes
  });

  const handleGenerate = async () => {
    if (!formData.companyName || !formData.jobDescription || !formData.resumeId) {
      setError('Please fill in all required fields.');
      return;
    }
    setIsGenerating(true);
    setError('');
    try {
      const res = await generateCoverLetter(formData);
      setOutput(res.coverLetter);
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background border-t border-zinc-800/50 flex py-12 px-8 font-body">
      <div className="max-w-[1200px] w-full mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* Left Side: Form */}
        <div className="w-full lg:w-[450px] shrink-0">
          <header className="mb-8">
            <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-3">
              <FileSignature className="text-accent" /> Protocol: CL
            </h1>
            <p className="text-zinc-400 font-mono text-sm">Synthesize highly targeted cover letters mapped directly to the JD.</p>
          </header>

          <div className="space-y-6">
            {error && <div className="text-red-400 text-sm font-mono bg-red-500/10 p-3 rounded border border-red-500/20">{error}</div>}
            
            <div>
              <label className="block text-zinc-300 font-mono text-xs uppercase mb-2">Base Profile (Resume)</label>
              <select 
                value={formData.resumeId} 
                onChange={e => setFormData({...formData, resumeId: e.target.value})}
                className="w-full bg-surface border border-zinc-700 rounded py-2 px-3 text-white focus:border-accent outline-none text-sm"
              >
                <option value="">Select a parsed profile...</option>
                {resumes?.map(r => <option key={r.id} value={r.id}>{r.originalFileName} (Score: {r.scores?.overall})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-mono text-xs uppercase mb-2">Target Company</label>
              <input 
                type="text"
                value={formData.companyName}
                onChange={e => setFormData({...formData, companyName: e.target.value})}
                className="w-full bg-surface border border-zinc-700 rounded py-2 px-3 text-white focus:border-accent outline-none text-sm placeholder:text-zinc-600"
                placeholder="e.g. OpenAI"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-mono text-xs uppercase mb-2">Job Description</label>
              <textarea 
                value={formData.jobDescription}
                onChange={e => setFormData({...formData, jobDescription: e.target.value})}
                className="w-full bg-surface border border-zinc-700 rounded py-2 px-3 text-white focus:border-accent outline-none text-sm min-h-[160px] resize-none placeholder:text-zinc-600"
                placeholder="Paste the full job description here..."
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-mono text-xs uppercase mb-3">Generation Tone</label>
              <div className="flex gap-2">
                {['Professional', 'Bold', 'Concise'].map(tone => (
                  <button 
                    key={tone}
                    onClick={() => setFormData({...formData, tone})}
                    className={`px-4 py-1.5 rounded-full text-xs font-mono border transition
                      ${formData.tone === tone ? 'bg-accent/10 border-accent text-accent font-bold' : 'bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex justify-center items-center gap-2 py-3 bg-accent text-background font-bold text-sm uppercase tracking-wider rounded border border-transparent shadow-[0_0_15px_rgba(110,231,183,0.15)] hover:bg-accent/90 disabled:opacity-50 transition"
            >
              {isGenerating ? <><RefreshCw className="animate-spin" size={16}/> Compiling...</> : 'Synthesize Letter'}
            </button>
          </div>
        </div>

        {/* Right Side: Output */}
        <div className="flex-1 bg-surface border border-zinc-800 rounded-xl p-8 flex flex-col relative min-h-[600px] shadow-2xl">
          <div className="absolute top-0 right-0 p-4 flex gap-2">
            {output && (
              <>
                <button title="Download" className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded transition"><Download size={16} /></button>
                <button onClick={copyToClipboard} title="Copy" className="p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded transition flex items-center gap-2 text-xs font-mono">
                  {copied ? <span className="text-green-400 flex items-center gap-1"><CheckCircle2 size={16}/> Copied</span> : <><Copy size={16} /> Copy</>}
                </button>
              </>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto pr-4">
            <AnimatePresence>
              {!output && !isGenerating && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex flex-col items-center justify-center text-zinc-600">
                  <FileSignature size={48} className="mb-4 opacity-20" />
                  <p className="font-mono text-sm">Output terminal standing by.</p>
                </motion.div>
              )}
              {isGenerating && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex flex-col items-center justify-center text-accent">
                  <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
                  <p className="font-mono text-sm tracking-widest uppercase animate-pulse">Running Neural Pipeline</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {output && !isGenerating && (
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="text-zinc-200 mt-8 whitespace-pre-wrap leading-relaxed text-[15px]">
                {output}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
