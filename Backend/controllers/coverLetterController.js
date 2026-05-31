const Resume = require('../models/Resume');
const Session = require('../models/Session');
const { generateVariants } = require('../services/coverLetterGenerator');
const { asyncHandler, sendSuccess } = require('../utils/responseFormatter');
const { NotFoundError } = require('../utils/errorHandler');

/**
 * @desc    Generate a cover letter based on resume and JD
 * @route   POST /api/cover-letter/generate
 * @access  Protected
 */
const createCoverLetter = asyncHandler(async (req, res) => {
  const { resumeId, jobDescription, companyName, tone } = req.body;

  // 1. Fetch the resume
  const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  if (!resume) {
    throw new NotFoundError('Resume');
  }

  // 2. Generate cover letter variants
  const coverLetters = await generateVariants({
    parsedResume: resume.parsedData,
    jobDescription,
    companyName,
    tone: tone || 'professional',
  });

  // 3. Update the active session state if exists
  const activeSession = await Session.findOne({
    userId: req.user._id,
    isActive: true,
  });

  if (activeSession) {
    activeSession.state = 'COVER_LETTER';
    activeSession.conversationHistory.push({
      role: 'user',
      content: `Generate a cover letter for ${companyName} (${tone || 'professional'} tone)`,
    });

    const primaryText = coverLetters[tone || 'professional']?.coverLetter || Object.values(coverLetters)[0]?.coverLetter;
    activeSession.conversationHistory.push({
      role: 'assistant',
      content: `### Generated Cover Letter\n\n\`\`\`\n${primaryText}\n\`\`\``,
      metadata: { coverLetters },
    });

    await activeSession.save();
  }

  sendSuccess(res, { coverLetters });
});

module.exports = {
  createCoverLetter,
};
