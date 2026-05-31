import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, AlertTriangle, MessageSquare, ArrowRight } from 'lucide-react';
import { getResumeById } from '../lib/api';

function ScoreCircle({ score, size = 160 }) {
  const radius = (size - 20) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  
  let color = '#f87171'; // red-400
  if (score >= 60) color = '#fbbf24'; // amber-400
  if (score >= 80) color = '#4ade80'; // green-400

  return (
    <div className="relative flex items-center justify-center font-display" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
        <motion.circle 
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth="8" fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-white">{score}</span>
        <span className="text-xs text-zinc-500 font-mono tracking-widest uppercase mt-1">/ 100</span>
      </div>
    </div>
  );
}

function DimensionBar({ label, score, delay }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-zinc-300">{label}</span>
        <span className="text-white">{score}/10</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(score / 10) * 100}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
          className="h-full bg-accentSecondary/80 rounded-full"
        />
      </div>
    </div>
  );
}

function SeverityBadge({ level }) {
  const colors = {
    high: 'bg-red-500/10 text-red-400 border-red-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  const Icons = {
    high: ShieldAlert,
    medium: AlertTriangle,
    low: CheckCircle2,
  };
  const Icon = Icons[level?.toLowerCase()] || ShieldAlert;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono border uppercase tracking-wider ${colors[level?.toLowerCase()] || colors.low}`}>
      <Icon size={12} /> {level}
    </span>
  );
}

export default function ResumeScore() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('issues');
  
  const { data: resume, isLoading } = useQuery({
    queryKey: ['resume', id],
    queryFn: () => getResumeById(id)
  });

  if (isLoading) return <div className="p-20 text-center font-mono text-accent">Loading Analysis...</div>;
  if (!resume) return <div className="p-20 text-center text-red-500">Resume not found</div>;

  const scores = resume.scores || {};
  const issues = scores.issues || [];
  
  // Sort issues by severity
  const severityValue = { high: 3, medium: 2, low: 1 };
  const sortedIssues = [...issues].sort((a,b) => (severityValue[b.severity?.toLowerCase()] || 0) - (severityValue[a.severity?.toLowerCase()] || 0));

  return (
    <div className="min-h-screen bg-background border-t border-zinc-800/50">
      <div className="flex flex-col md:flex-row max-w-[1400px] mx-auto">
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-[340px] p-8 border-r border-zinc-800/50 flex flex-col pt-12">
          <div className="mb-10 text-center">
            <h2 className="text-xl font-display font-medium text-white mb-8">Overall Intelligence</h2>
            <div className="flex justify-center mb-6">
              <ScoreCircle score={scores.overall || 0} />
            </div>
          </div>
          
          <div className="mb-10">
            <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-mono mb-6 pb-2 border-b border-zinc-800">5-Dimensional Breakdown</h3>
            <DimensionBar label="Impact" score={scores.impact || 0} delay={0.1} />
            <DimensionBar label="ATS Compat" score={scores.ats || 0} delay={0.2} />
            <DimensionBar label="Clarity" score={scores.clarity || 0} delay={0.3} />
            <DimensionBar label="Completeness" score={scores.completeness || 0} delay={0.4} />
            <DimensionBar label="Formatting" score={scores.formatting || 0} delay={0.5} />
          </div>

          <button 
            onClick={() => navigate(`/coach/new?resumeId=${id}`)}
            className="w-full py-4 mt-auto border border-accent/30 bg-accent/10 hover:bg-accent hover:text-background text-accent font-bold font-mono transition rounded flex justify-center items-center gap-2 group"
          >
            <MessageSquare size={18} /> 
            Open Career Coach 
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-surface/30">
          <header className="px-8 flex items-end pt-12 pb-4 border-b border-zinc-800/50">
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">{resume.originalFileName || 'Untitled Resume'}</h1>
              <p className="text-sm font-mono text-zinc-400">Analysis completed on {new Date(resume.createdAt).toLocaleDateString()}</p>
            </div>
          </header>

          <div className="px-8 mt-4 flex gap-6 border-b border-zinc-800/50">
            {['issues', 'preview', 'improve'].map(t => (
              <button 
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 font-mono text-sm uppercase tracking-wide relative ${tab === t ? 'text-accent' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {t}
                {tab === t && <motion.div layoutId="score-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
              </button>
            ))}
          </div>

          <div className="p-8 flex-1 overflow-auto">
            {tab === 'issues' && (
              <div className="space-y-4">
                {sortedIssues.length === 0 ? (
                  <p className="text-zinc-400 font-mono text-sm">No issues detected. Perfect score.</p>
                ) : (
                  sortedIssues.map((iss, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-surface border border-zinc-800/80 rounded-lg p-5 flex items-start gap-4 hover:border-zinc-700 transition"
                    >
                      <SeverityBadge level={iss.severity} />
                      <div>
                        <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-1">{iss.dimension}</div>
                        <p className="text-zinc-200 text-sm leading-relaxed">{iss.issue}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
            
            {tab === 'preview' && (
              <div className="max-w-3xl mx-auto bg-white text-black p-10 shadow-2xl rounded-sm min-h-[800px] font-body relative">
                <div className="absolute top-4 right-4 bg-black text-white text-xs px-2 py-1 uppercase tracking-widest font-mono">ATS View</div>
                <h1 className="text-3xl font-bold border-b-2 border-black pb-2 mb-4 uppercase">{resume.parsedData?.name || 'NAME NOT EXTRACTED'}</h1>
                <p className="text-sm border-b border-gray-300 pb-4 mb-6">
                  {resume.parsedData?.contact?.email} • {resume.parsedData?.contact?.phone} • {resume.parsedData?.contact?.location}
                </p>
                <h2 className="text-xl font-bold uppercase tracking-wider mb-2">Experience</h2>
                {resume.parsedData?.experience?.map((exp, i) => (
                  <div key={i} className="mb-4">
                    <div className="flex justify-between font-bold">
                      <span>{exp.role}</span>
                      <span>{exp.startDate} - {exp.endDate || 'Present'}</span>
                    </div>
                    <div className="italic text-sm text-gray-700 mb-2">{exp.company}</div>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {exp.bullets?.map((b, bi) => <li key={bi}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {tab === 'improve' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: "Optimize ATS Match", desc: "Rewrite bullets to hit exact keywords.", trigger: "Optimize for ATS" },
                  { title: "Match a Target Job", desc: "Compare against a specific JD.", trigger: "Match a Job Description" },
                  { title: "Strengthen Impact", desc: "Add quantifiable metrics to roles.", trigger: "Improve my Bullets" }
                ].map((action, i) => (
                  <button 
                    key={i}
                    onClick={() => navigate(`/coach/new?resumeId=${id}&intent=${encodeURIComponent(action.trigger)}`)}
                    className="p-6 bg-surface border border-zinc-800 rounded-xl text-left hover:border-accent hover:bg-accent/5 transition group"
                  >
                    <h3 className="text-lg font-display text-white mb-2 group-hover:text-accent transition">{action.title}</h3>
                    <p className="text-sm text-zinc-500 font-mono mb-4">{action.desc}</p>
                    <span className="text-accent text-xs font-mono tracking-wider flex items-center gap-1">Execute Protocol <ArrowRight size={14}/></span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
