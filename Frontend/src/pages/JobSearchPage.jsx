import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Search, Sparkles, Building, ExternalLink } from 'lucide-react';
import { jobAPI } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

function JobSearchPage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [remote, setRemote] = useState(false);
  
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Optional: auto-run search on mount based on profile if we want
  // but let's wait for user input for now to avoid empty requests if no resume.

  const handleSearch = async (e) => {
    e?.preventDefault();
    setIsSearching(true);
    setError('');

    try {
      const res = await jobAPI.search({ query, location, remote });
      setResults(res.data);
    } catch (err) {
      setError(err.message || 'Failed to search jobs. Make sure you have uploaded a resume first.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-8 animate-in pb-12">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-amber-400" /> Intelligent Job Search
        </h1>
        <p className="text-gray-400">Find roles that match your optimized profile, backed by AI recommendations.</p>
      </header>

      {/* Search Bar */}
      <div className="glass-panel p-4 md:p-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Job title, keywords, or company"
              className="input-dark pl-10"
            />
          </div>
          
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, state, or zip code"
              className="input-dark pl-10"
            />
          </div>

          <div className="flex items-center gap-3 md:px-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remote}
                onChange={(e) => setRemote(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500/50 bg-dark"
              />
              <span className="text-sm text-gray-300">Remote Only</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="btn-primary md:w-32 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            {isSearching ? <LoadingSpinner size="sm" /> : 'Search'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Results Area */}
      {results && (
        <div className="space-y-8">
          
          {/* AI Recommendations */}
          {results.aiRecommendations && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-semibold text-white">AI Career Targets</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Titles */}
                <div className="glass-panel p-6 border-t-2 border-t-amber-500/50">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Recommended Titles</h3>
                  <div className="space-y-4">
                    {results.aiRecommendations.jobTitles.map((title, i) => (
                      <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-amber-300">{title.title}</h4>
                          <span className="text-xs font-mono text-gray-500">{title.salaryRange}</span>
                        </div>
                        <p className="text-xs text-gray-400">{title.matchReason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Companies */}
                <div className="glass-panel p-6 border-t-2 border-t-cyan-500/50">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Target Companies</h3>
                  <div className="space-y-4">
                    {results.aiRecommendations.companies.map((company, i) => (
                      <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-cyan-300 flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5" />
                            {company.name}
                          </h4>
                          <span className="text-[10px] uppercase tracking-wider text-gray-500 bg-white/[0.05] px-1.5 py-0.5 rounded">
                            {company.size}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-1">{company.reason}</p>
                        <p className="text-[10px] text-gray-500">{company.remotePolicy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Live Listings */}
          {results.listings && results.listings.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-white mb-4">Live Listings</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {results.listings.map((job) => (
                  <div key={job.id} className="glass-panel-hover p-5 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-white text-lg leading-tight">{job.title}</h3>
                        <p className="text-gray-400 text-sm mt-1 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5" /> {job.company}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                        {job.matchScore}% Match
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                      <span>•</span>
                      <span>{job.salary}</span>
                      <span>•</span>
                      <span>{job.postedAt}</span>
                    </div>

                    <p className="text-sm text-gray-300 line-clamp-2 flex-1 mb-4">
                      {job.snippet}
                    </p>

                    <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between">
                      <div className="flex gap-2">
                        {job.keySkillsMatched?.slice(0, 3).map(s => (
                          <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-white/[0.05] text-gray-400 border border-white/[0.05]">
                            {s}
                          </span>
                        ))}
                      </div>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
                      >
                        Apply <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {results.listings && results.listings.length === 0 && (
            <div className="text-center p-12 glass-panel">
              <p className="text-gray-400">No jobs found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default JobSearchPage;
