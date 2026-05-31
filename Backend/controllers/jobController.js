const Resume = require('../models/Resume');
const Session = require('../models/Session');
const { matchResumeToJD, formatMatchReport } = require('../services/jdMatcher');
const { searchJobs } = require('../services/jobSearch');
const { asyncHandler, sendSuccess } = require('../utils/responseFormatter');
const { NotFoundError, ValidationError } = require('../utils/errorHandler');

/**
 * @desc    Match a resume against a job description
 * @route   POST /api/jobs/match
 * @access  Protected
 */
const matchResume = asyncHandler(async (req, res) => {
  const { resumeId, jobDescription } = req.body;

  // 1. Fetch the resume
  const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  if (!resume) {
    throw new NotFoundError('Resume');
  }

  // 2. Perform the JD match analysis
  const matchReport = await matchResumeToJD(resume.parsedData, jobDescription);

  // 3. Update the active session with the match score if there's an active session
  const activeSession = await Session.findOne({
    userId: req.user._id,
    isActive: true,
  });

  if (activeSession) {
    activeSession.resumeId = resume._id;
    activeSession.targetJD = jobDescription;
    activeSession.matchScore = {
      overall: matchReport.matchScore.overall,
      breakdown: matchReport.matchScore.breakdown,
      gaps: matchReport.gaps.map((g) => g.requirement),
      strengths: matchReport.strengths.map((s) => s.skill),
    };
    activeSession.state = 'JD_MATCHING';

    // Add match report to conversation history as assistant's response representation
    const formattedReport = formatMatchReport(matchReport);
    activeSession.conversationHistory.push({
      role: 'user',
      content: `Analyze how well my resume matches this job description:\n\n${jobDescription.substring(0, 500)}...`,
    });
    activeSession.conversationHistory.push({
      role: 'assistant',
      content: formattedReport,
      metadata: { matchReport },
    });

    await activeSession.save();
  }

  sendSuccess(res, {
    matchReport,
    markdownReport: formatMatchReport(matchReport),
  });
});

/**
 * @desc    Search jobs (live or AI recommended)
 * @route   GET /api/jobs/search
 * @access  Protected
 */
const findJobs = asyncHandler(async (req, res) => {
  const { query, location, remote, page, limit } = req.query;

  // Find user's latest resume for skills context
  const latestResume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

  if (!latestResume) {
    throw new ValidationError('You need to upload/paste a resume first so we can match jobs to your profile.');
  }

  const results = await searchJobs(latestResume.parsedData, {
    query,
    location,
    remote: remote === 'true',
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 10,
  });

  // Update active session if exists
  const activeSession = await Session.findOne({
    userId: req.user._id,
    isActive: true,
  });

  if (activeSession) {
    activeSession.state = 'JOB_SEARCH';
    activeSession.conversationHistory.push({
      role: 'user',
      content: `Search jobs for ${query || 'my profile'}`,
    });

    let assistantReply = `### Job Recommendations for you:\n\n`;
    if (results.aiRecommendations) {
      assistantReply += `Based on your profile, here are roles we recommend targeting:\n`;
      results.aiRecommendations.jobTitles.forEach((jt) => {
        assistantReply += `- **${jt.title}** (${jt.salaryRange}) — *${jt.matchReason}*\n`;
      });
      assistantReply += `\n**Target Companies:**\n`;
      results.aiRecommendations.companies.forEach((co) => {
        assistantReply += `- **${co.name}** (${co.remotePolicy} | ${co.size}) — *${co.reason}*\n`;
      });
    }

    activeSession.conversationHistory.push({
      role: 'assistant',
      content: assistantReply,
      metadata: { results },
    });

    await activeSession.save();
  }

  sendSuccess(res, results);
});

module.exports = {
  matchResume,
  findJobs,
};
