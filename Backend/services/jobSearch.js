const env = require('../config/env');
const { chatJSON } = require('./aiEngine');

// ─── In-memory Cache ─────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours in ms

const getCacheKey = (query, location) => `${query}:${location || 'any'}`;

const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// ─── Adzuna Job Search ───────────────────────────────────────────

/**
 * Search jobs via Adzuna API.
 * @param {Object} params
 * @param {string} params.query - Job title/keywords
 * @param {string} params.location - Location
 * @param {boolean} params.remote - Remote filter
 * @param {number} params.page - Page number
 * @param {number} params.limit - Results per page
 * @returns {Promise<Array>} Job listings
 */
const searchAdzuna = async ({ query, location = '', remote = false, page = 1, limit = 10 }) => {
  if (!env.ADZUNA_APP_ID || !env.ADZUNA_APP_KEY) {
    return null; // API not configured
  }

  const cacheKey = getCacheKey(`adzuna:${query}:${page}`, location);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const country = 'us'; // default to US
    const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`);
    url.searchParams.set('app_id', env.ADZUNA_APP_ID);
    url.searchParams.set('app_key', env.ADZUNA_APP_KEY);
    url.searchParams.set('what', query);
    url.searchParams.set('results_per_page', limit.toString());
    if (location) url.searchParams.set('where', location);

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error(`Adzuna API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const jobs = (data.results || []).map((job) => ({
      title: job.title,
      company: job.company?.display_name || 'Unknown',
      location: job.location?.display_name || 'Unknown',
      salary: job.salary_min && job.salary_max
        ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max / 1000)}k`
        : job.salary_min
          ? `$${Math.round(job.salary_min / 1000)}k+`
          : 'Not specified',
      description: job.description?.substring(0, 300) || '',
      url: job.redirect_url,
      postedDate: job.created,
      source: 'Adzuna',
    }));

    setCache(cacheKey, jobs);
    return jobs;
  } catch (error) {
    console.error('Adzuna search failed:', error.message);
    return null;
  }
};

// ─── AI-Powered Job Recommendations ─────────────────────────────

/**
 * Generate AI-powered job recommendations based on resume data.
 * @param {Object} parsedResume - Structured resume data
 * @param {string} targetRole - Target role
 * @returns {Promise<Object>} Job recommendations
 */
const getAIRecommendations = async (parsedResume, targetRole = '') => {
  const prompt = `Based on this candidate's profile, generate job search recommendations.

CANDIDATE PROFILE:
- Skills: ${JSON.stringify(parsedResume.skills || {})}
- Experience: ${(parsedResume.experience || []).map((e) => `${e.role} at ${e.company}`).join(', ')}
- Industry: ${parsedResume.industry || 'Unknown'}
- Seniority: ${parsedResume.seniorityLevel || 'Unknown'}
- Target Role: ${targetRole || 'Not specified'}

Return:
{
  "jobTitles": [
    {
      "title": "Specific job title",
      "matchReason": "Why this fits their profile",
      "salaryRange": "Estimated salary range (USD)"
    }
  ],
  "companies": [
    {
      "name": "Company name",
      "reason": "Why this company would be a good fit",
      "size": "startup|mid|enterprise",
      "remotePolicy": "remote|hybrid|onsite|unknown"
    }
  ],
  "jobBoards": [
    {
      "name": "Job board name",
      "url": "URL",
      "reason": "Why this board is relevant"
    }
  ],
  "searchQueries": {
    "linkedin": "Optimized LinkedIn search string",
    "indeed": "Optimized Indeed search string",
    "glassdoor": "Optimized Glassdoor search string"
  }
}

Provide 5 job titles, 5 companies, and 3 job boards. Be specific — no generic suggestions.`;

  return chatJSON(prompt, 'You are a career strategist with deep knowledge of current job markets and hiring trends.');
};

/**
 * Combined job search: live API results + AI recommendations.
 * @param {Object} parsedResume - Structured resume data
 * @param {Object} searchParams - Search parameters
 * @returns {Promise<Object>} Combined results
 */
const searchJobs = async (parsedResume, searchParams = {}) => {
  const { query, location, remote, page, limit } = searchParams;
  const searchQuery = query || parsedResume.targetRole ||
    (parsedResume.experience && parsedResume.experience[0]?.role) || 'software engineer';

  const results = {
    liveJobs: null,
    aiRecommendations: null,
  };

  // Fetch live jobs if APIs are configured
  if (env.ENABLE_LIVE_JOBS) {
    results.liveJobs = await searchAdzuna({
      query: searchQuery,
      location,
      remote,
      page,
      limit,
    });
  }

  // Always provide AI recommendations
  results.aiRecommendations = await getAIRecommendations(parsedResume, searchQuery);

  return results;
};

module.exports = {
  searchAdzuna,
  getAIRecommendations,
  searchJobs,
};
