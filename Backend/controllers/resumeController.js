const Resume = require('../models/Resume');
const { extractTextFromPDF, parseResumeText } = require('../services/resumeParser');
const { scoreResume, formatScoreCard } = require('../services/resumeScorer');
const { asyncHandler, sendSuccess, sendCreated } = require('../utils/responseFormatter');
const { NotFoundError, ValidationError } = require('../utils/errorHandler');

/**
 * @desc    Upload and parse a resume (PDF)
 * @route   POST /api/resume/upload
 * @access  Protected
 */
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ValidationError('No file uploaded. Please upload a PDF or DOCX file.');
  }

  const { targetRole } = req.body;

  // 1. Extract text from PDF
  let rawText;
  try {
    rawText = await extractTextFromPDF(req.file.path);
  } catch (error) {
    throw new ValidationError('Failed to extract text from the uploaded file. Please ensure it is a valid PDF.');
  }

  if (!rawText || rawText.trim().length < 50) {
    throw new ValidationError('The uploaded file contains too little text. Please upload a resume with more content.');
  }

  // 2. Parse resume text with AI
  const parsedData = await parseResumeText(rawText);

  // 3. Score the resume
  const scores = await scoreResume(parsedData, targetRole);

  // 4. Save to database
  const resume = await Resume.create({
    userId: req.user._id,
    originalFileName: req.file.originalname,
    fileUrl: req.file.path,
    rawText,
    parsedData,
    industry: parsedData.industry,
    seniorityLevel: parsedData.seniorityLevel,
    targetRole: targetRole || parsedData.targetRole || '',
    scores,
    versions: [
      {
        versionNumber: 1,
        parsedData,
        scores,
        changes: ['Initial upload and analysis'],
      },
    ],
    currentVersion: 1,
  });

  // 5. Return score card
  sendCreated(res, {
    resume: resume.toJSON(),
    scoreCard: formatScoreCard(scores),
  });
});

/**
 * @desc    Parse resume from pasted text
 * @route   POST /api/resume/parse-text
 * @access  Protected
 */
const parseTextResume = asyncHandler(async (req, res) => {
  const { resumeText, targetRole } = req.body;

  // 1. Parse resume text with AI
  const parsedData = await parseResumeText(resumeText);

  // 2. Score the resume
  const scores = await scoreResume(parsedData, targetRole);

  // 3. Save to database
  const resume = await Resume.create({
    userId: req.user._id,
    originalFileName: 'pasted-resume.txt',
    rawText: resumeText,
    parsedData,
    industry: parsedData.industry,
    seniorityLevel: parsedData.seniorityLevel,
    targetRole: targetRole || '',
    scores,
    versions: [
      {
        versionNumber: 1,
        parsedData,
        scores,
        changes: ['Initial text paste and analysis'],
      },
    ],
    currentVersion: 1,
  });

  sendCreated(res, {
    resume: resume.toJSON(),
    scoreCard: formatScoreCard(scores),
  });
});

/**
 * @desc    Get a resume by ID
 * @route   GET /api/resume/:id
 * @access  Protected
 */
const getResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!resume) {
    throw new NotFoundError('Resume');
  }

  sendSuccess(res, { resume: resume.toJSON() });
});

/**
 * @desc    Get score card for a resume
 * @route   GET /api/resume/:id/score
 * @access  Protected
 */
const getScoreCard = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).select('scores');

  if (!resume) {
    throw new NotFoundError('Resume');
  }

  sendSuccess(res, {
    scores: resume.scores,
    scoreCard: formatScoreCard(resume.scores),
  });
});

/**
 * @desc    Get all resumes for current user
 * @route   GET /api/resume
 * @access  Protected
 */
const getMyResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ userId: req.user._id })
    .select('originalFileName targetRole scores.overall industry seniorityLevel createdAt')
    .sort({ createdAt: -1 });

  sendSuccess(res, { resumes });
});

module.exports = {
  uploadResume,
  parseTextResume,
  getResume,
  getScoreCard,
  getMyResumes,
};
