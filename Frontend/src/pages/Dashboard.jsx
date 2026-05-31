import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, ArrowRight, MessageSquare } from 'lucide-react';
import { getAllResumes } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

function ResumeCard({ resume }) {
  const score = resume.scores?.overall || 0;
  const navigate = useNavigate();
  
  let scoreColor = 'text-red-400 bg-red-400/10 border-red-400/30';
  if (score >= 60) scoreColor = 'text-amber-400 bg-amber-400/10 border-amber-400/30';
  if (score >= 80) scoreColor = 'text-green-400 bg-green-400/10 border-green-400/30';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-surface border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
            <FileText className="text-accent" size={24} />
          </div>
          <div>
            <h3 className="text-white font-medium truncate max-w-[180px]">{resume.originalFileName}</h3>
            <p className="text-xs text-zinc-500 font-mono mt-1">
              {new Date(resume.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-mono border ${scoreColor}`}>
          Score: {score}
        </div>
      </div>
      
      <div className="flex gap-2 mt-6">
        <button 
          onClick={() => navigate(`/resume/${resume.id}`)}
          className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs text-white font-medium rounded transition"
        >
          View Analysis
        </button>
        <button 
          onClick={() => navigate(`/coach/new?resumeId=${resume.id}`)}
          className="flex-1 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/20 text-accent text-xs font-medium rounded transition flex items-center justify-center gap-1"
        >
          <MessageSquare size={14} /> Coach
        </button>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const { data: resumes, isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: getAllResumes
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-end border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">Welcome, {user?.name || 'Candidate'}</h1>
            <p className="font-mono text-sm text-zinc-400">Manage your profiles and analytics</p>
          </div>
          <div className="flex gap-4">
            <button onClick={logout} className="text-sm font-mono text-zinc-500 hover:text-white transition">
              [ Logout ]
            </button>
            <Link 
              to="/resume/new"
              className="flex items-center gap-2 bg-accent text-background px-4 py-2 font-bold rounded shadow-[0_0_15px_rgba(110,231,183,0.2)] hover:bg-accent/90 transition"
            >
              <Plus size={18} /> Upload Resume
            </Link>
          </div>
        </header>

        {isLoading ? (
          <div className="text-accent font-mono">Loading telemetry...</div>
        ) : !resumes || resumes.length === 0 ? (
          <div className="border border-dashed border-zinc-800 rounded-xl p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-4">
              <FileText className="text-zinc-600" size={32} />
            </div>
            <h3 className="text-xl font-display text-white mb-2">No Profiles Found</h3>
            <p className="text-zinc-400 mb-6 max-w-sm mx-auto">
              Initiate your career trajectory by uploading your first document for critical analysis.
            </p>
            <Link 
              to="/resume/new"
              className="inline-flex items-center gap-2 text-accent border border-accent/50 px-6 py-2 rounded font-mono hover:bg-accent/10 transition"
            >
              Start Analysis <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 ml:grid-cols-3 gap-6">
            {resumes.map(r => (
              <ResumeCard key={r.id} resume={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
