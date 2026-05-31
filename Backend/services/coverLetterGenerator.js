const { chat } = require('./aiEngine');

/**
 * Generate a tailored cover letter.
 * @param {Object} options
 * @param {Object} options.parsedResume - Structured resume data
 * @param {string} options.jobDescription - Job description text
 * @param {string} options.companyName - Target company name
 * @param {string} options.tone - 'professional' | 'bold' | 'concise'
 * @returns {Promise<Object>} Generated cover letter with variants
 */
const generateCoverLetter = async ({ parsedResume, jobDescription, companyName, tone = 'professional' }) => {
  const toneGuide = {
    professional: 'Write in a polished, formal tone suitable for enterprise companies and traditional industries. Use measured language, demonstrate gravitas, and maintain professional distance while showing genuine enthusiasm.',
    bold: 'Write in a confident, energetic tone suitable for startups and innovative companies. Be direct, show personality, use punchy sentences, and demonstrate passionate conviction. Avoid being generic.',
    concise: 'Write in a brief, impactful tone. Maximum 200 words. Every sentence must earn its place. Lead with the strongest hook, cut all filler, and end with a clear call to action.',
  };

  const candidateName = parsedResume.name || 'the candidate';
  const skills = parsedResume.skills || {};
  const experience = parsedResume.experience || [];

  const prompt = `Write a tailored cover letter for ${candidateName} applying to ${companyName}.

CANDIDATE PROFILE:
- Name: ${candidateName}
- Key Skills: ${[...(skills.technical || []), ...(skills.domain || [])].join(', ')}
- Recent Role: ${experience[0]?.role || 'N/A'} at ${experience[0]?.company || 'N/A'}
- Industry: ${parsedResume.industry || 'Unknown'}
- Summary: ${parsedResume.summary || 'N/A'}

JOB DESCRIPTION:
"""
${jobDescription}
"""

TONE: ${tone.toUpperCase()}
${toneGuide[tone] || toneGuide.professional}

COVER LETTER STRUCTURE:
1. **Hook** (1-2 sentences): Open with something specific about the company or role that connects to the candidate's experience. Never start with "I am writing to apply..."
2. **Evidence** (1 paragraph): Connect 2-3 specific achievements from the resume to the job requirements. Use metrics where available.
3. **Culture Fit** (1 paragraph): Show understanding of the company's mission/values and how the candidate aligns.
4. **Call to Action** (1-2 sentences): Confident closing that invites next steps.

RULES:
- Never fabricate achievements not in the resume
- Use the candidate's actual experience and skills
- Keep it to one page (250-350 words for professional/bold, under 200 for concise)
- Address it to "Dear Hiring Manager" unless a specific person is mentioned in the JD
- Sign off with the candidate's name

Write the cover letter now.`;

  const coverLetter = await chat(
    [{ role: 'user', content: prompt }],
    {
      systemPromptAddition: 'You are an expert cover letter writer. Write compelling, authentic cover letters that get interviews.',
      temperature: 0.8,
    }
  );

  return {
    coverLetter,
    metadata: {
      companyName,
      tone,
      candidateName,
      generatedAt: new Date().toISOString(),
    },
  };
};

/**
 * Generate multiple tone variants of a cover letter.
 * @param {Object} options - Same as generateCoverLetter
 * @returns {Promise<Object>} Object with cover letters in multiple tones
 */
const generateVariants = async (options) => {
  const tones = ['professional', 'bold', 'concise'];
  const results = {};

  // Generate primary tone first
  results[options.tone || 'professional'] = await generateCoverLetter(options);

  // Generate one alternative tone
  const alternativeTone = tones.find((t) => t !== (options.tone || 'professional'));
  if (alternativeTone) {
    results[alternativeTone] = await generateCoverLetter({ ...options, tone: alternativeTone });
  }

  return results;
};

module.exports = {
  generateCoverLetter,
  generateVariants,
};
