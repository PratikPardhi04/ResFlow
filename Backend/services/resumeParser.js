const pdfParse = require('pdf-parse');
const fs = require('fs');
const { chatJSON } = require('./aiEngine');

/**
 * Extract text from a PDF file.
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} Extracted text
 */
const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
};

/**
 * Parse raw resume text into structured data using Claude.
 * @param {string} rawText - Raw resume text
 * @returns {Promise<Object>} Structured resume data
 */
const parseResumeText = async (rawText) => {
  const prompt = `Analyze the following resume text and extract ALL information into a structured format.

RESUME TEXT:
"""
${rawText}
"""

Extract and return the following structure:
{
  "name": "Full name of the candidate",
  "contact": {
    "email": "email or null",
    "phone": "phone or null",
    "linkedin": "LinkedIn URL or null",
    "github": "GitHub URL or null",
    "portfolio": "Portfolio URL or null",
    "location": "City, State/Country or null"
  },
  "summary": "Professional summary or objective (if present, otherwise generate a brief one based on the resume)",
  "skills": {
    "technical": ["list of technical/hard skills"],
    "soft": ["list of soft skills mentioned or implied"],
    "domain": ["industry/domain expertise areas"],
    "tools": ["specific tools, platforms, frameworks"],
    "languages": ["programming or spoken languages"]
  },
  "experience": [
    {
      "company": "Company name",
      "role": "Job title",
      "startDate": "Start date (Month Year format)",
      "endDate": "End date or 'Present'",
      "current": true/false,
      "bullets": ["each responsibility/achievement as a separate string"],
      "skills": ["skills used in this role"]
    }
  ],
  "education": [
    {
      "institution": "School/University name",
      "degree": "Degree type (BS, MS, etc.)",
      "field": "Field of study",
      "startDate": "Start date or null",
      "endDate": "End date or 'Expected date'",
      "gpa": "GPA if mentioned, else null"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Brief description",
      "technologies": ["tech used"],
      "url": "URL if mentioned, else null"
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "date": "Date obtained or null",
      "url": "URL if mentioned, else null"
    }
  ],
  "industry": "Primary industry (e.g., 'Software Engineering', 'Marketing', 'Finance')",
  "seniorityLevel": "One of: entry, junior, mid, senior, lead, principal, executive"
}

Be thorough. If a field cannot be determined from the resume, set it to null or an empty array. Do NOT fabricate any information.`;

  const context = 'You are a resume parsing specialist. Extract data faithfully from the resume text. Never invent or assume information not present in the text.';

  return chatJSON(prompt, context);
};

module.exports = {
  extractTextFromPDF,
  parseResumeText,
};
