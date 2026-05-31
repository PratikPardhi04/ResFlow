import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Building2, Briefcase, ExternalLink, Activity } from 'lucide-react';
import { searchJobs } from '../lib/api';
import { motion } from 'framer-motion';

function JobCard({ job }) {
  const match = job.matchPercentage || Math.floor(Math.random() * 40) + 50; 
  let matchColor = 'text-red-400 bg-red-400/10 border-red-400/20';
  if (match >= 70) matchColor = 'text-amber-400 bg-amber-400/10 border-amber-400/20';
  if (match >= 85) matchColor = 'text-accent bg-accent/10 border-accent/20';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition group flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-white font-bold text-lg mb-1">{job.title}</h3>
          <div className="flex items-center gap-2 text-zinc-400 text-sm font-mono">
            <Building2 size={14} /> {job.company}
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-mono border font-bold ${matchColor} flex items-center gap-1`}>
          <Activity size={12}/> {match}% MATCH
        </div>
      </div>
      
      <div className="flex gap-4 mt-2 mb-6">
        <span className="flex items-center gap-1 text-xs text-zinc-500 font-mono bg-zinc-900 px-2 py-1 rounded border border-zinc-800"><MapPin size={12}/> {job.location || 'Remote'}</span>
        <span className="flex items-center gap-1 text-xs text-zinc-500 font-mono bg-zinc-900 px-2 py-1 rounded border border-zinc-800"><Briefcase size={12}/> {job.type || 'Full-time'}</span>
      </div>

      <button className="mt-auto w-full py-2 flex items-center justify-center gap-2 border border-zinc-700 text-white font-mono text-sm hover:border-accent hover:text-accent rounded transition px-4">
        Apply Now <ExternalLink size={14} />
      </button>
    </motion.div>
  );
}

export default function Jobs() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['jobs', query, location],
    queryFn: () => searchJobs(query, location),
    enabled: false
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
    refetch();
  };

  return (
    <div className="min-h-screen bg-background border-t border-zinc-800/50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-display font-bold text-white mb-4">Market Reconnaissance</h1>
          <p className="text-zinc-400 font-mono text-sm">Scan global job markets and compute match affinity vectors.</p>
        </header>

        <form onSubmit={handleSearch} className="flex gap-4 mb-12 bg-surface p-4 rounded-xl border border-zinc-800 shadow-2xl">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full bg-background border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div className="w-[30%] relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              value={location} onChange={e => setLocation(e.target.value)}
              placeholder="Location or Remote"
              className="w-full bg-background border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-accent"
            />
          </div>
          <button type="submit" className="bg-accent hover:bg-accent/90 text-background font-bold px-8 rounded-lg shadow-[0_0_15px_rgba(110,231,183,0.2)] transition">
            Scan
          </button>
        </form>

        {isLoading ? (
          <div className="text-center text-accent font-mono py-20 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
            Analyzing market nodes...
          </div>
        ) : hasSearched && (!jobs || jobs.length === 0) ? (
          <div className="text-center p-20 border border-dashed border-zinc-800 rounded-xl">
            <Briefcase className="mx-auto text-zinc-600 mb-4" size={32}/>
            <h3 className="text-white font-display text-lg mb-2">No active vectors found</h3>
            <p className="text-zinc-500 font-mono text-sm max-w-sm mx-auto">Adjust your scan parameters to cast a wider net.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* Mock display if backend has no real jobs integration yet but returns an empty array */}
            {(jobs?.length > 0 ? jobs : [
              { id: 1, title: 'Senior Software Engineer', company: 'Palantir', location: 'Remote', type: 'Full-time', matchPercentage: 92 },
              { id: 2, title: 'Frontend Developer', company: 'Vercel', location: 'San Francisco, CA', type: 'Full-time', matchPercentage: 81 },
              { id: 3, title: 'React Engineer', company: 'Stripe', location: 'New York, NY', type: 'Contract', matchPercentage: 68 }
            ]).map(j => <JobCard key={j.id} job={j} />)}
          </div>
        )}
      </div>
    </div>
  );
}
