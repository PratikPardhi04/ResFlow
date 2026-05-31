const { chatJSON } = require('./aiEngine');

/**
 * Score a parsed resume across 5 dimensions.
 * @param {Object} parsedData - Structured resume data from resumeParser
 * @param {string} targetRole - Optional target role for context
 * @returns {Promise<Object>} Score card with dimension scores, issues, and overall score
 */
const scoreResume = async (parsedData, targetRole = '') => {
  const roleContext = targetRole ? `The candidate is targeting a role as: ${targetRole}` : '';

  const prompt = `You are a senior recruiter and ATS engineer. Score this resume across 5 dimensions.

${roleContext}

PARSED RESUME DATA:
"""
${JSON.stringify(parsedData, null, 2)}
"""

Score each dimension from 0-10 and identify specific issues.

SCORING CRITERIA:

1. IMPACT (weight: 30%): Do the bullets show measurable results? Look for:
   - Quantified achievements (%, $, #)
   - Strong action verbs (Led, Built, Increased, Reduced, Delivered)
   - Business outcomes, not just task descriptions
   - Absence of "Responsible for..." patterns

2. ATS COMPATIBILITY (weight: 25%): Will ATS software parse this well? Look for:
   - Standard section headers present
   - Missing industry-critical keywords
   - Skills section completeness
   - Proper date formats

3. CLARITY (weight: 20%): Is it easy to scan and understand? Look for:
   - Concise bullets (1-2 lines each)
   - Professional summary quality
   - Jargon appropriateness
   - Logical flow and readability

4. COMPLETENESS (weight: 15%): Is everything important included? Look for:
   - Contact info completeness (email, phone, LinkedIn)
   - All relevant sections present
   - Education details
   - Skills coverage

5. FORMATTING (weight: 10%): Is the structure professional? Look for:
   - Consistent date formats
   - Appropriate bullet count per role (3-6)
   - Resume length appropriateness
   - Section ordering

Return this exact JSON structure:
{
  "impact": <0-10>,
  "ats": <0-10>,
  "clarity": <0-10>,
  "completeness": <0-10>,
  "formatting": <0-10>,
  "overall": <0-100 calculated as weighted score>,
  "issues": [
    {
      "dimension": "impact|ats|clarity|completeness|formatting",
      "issue": "Specific, actionable description of the problem",
      "severity": "low|medium|high"
    }
  ],
  "summary": "2-3 sentence executive summary of the resume's strengths and weaknesses",
  "topPriority": "The single most impactful thing the candidate should fix first"
}

Be honest and specific. No generic advice. Every issue must point to something concrete in the resume.`;

  const context = 'You are scoring resumes with the precision of an ATS system and the insight of a FAANG recruiter. Be calibrated — a 10/10 is exceptional, a 5/10 is average.';

  const scores = await chatJSON(prompt, context);

  // Validate and normalize
  const validated = {
    impact: Math.min(10, Math.max(0, scores.impact || 0)),
    ats: Math.min(10, Math.max(0, scores.ats || 0)),
    clarity: Math.min(10, Math.max(0, scores.clarity || 0)),
    completeness: Math.min(10, Math.max(0, scores.completeness || 0)),
    formatting: Math.min(10, Math.max(0, scores.formatting || 0)),
    overall: Math.min(100, Math.max(0, scores.overall || 0)),
    issues: (scores.issues || []).map((issue) => ({
      dimension: issue.dimension,
      issue: issue.issue,
      severity: issue.severity || 'medium',
    })),
    summary: scores.summary || '',
    topPriority: scores.topPriority || '',
  };

  return validated;
};

/**
 * Generate a formatted score card string for display.
 * @param {Object} scores - Score object from scoreResume()
 * @returns {string} Formatted score card
 */
const formatScoreCard = (scores) => {
  const getLabel = (overall) => {
    if (overall >= 90) return '🟢 Excellent';
    if (overall >= 75) return '🟡 Good — Minor improvements needed';
    if (overall >= 60) return '🟠 Needs Work';
    if (overall >= 40) return '🔴 Significant Issues';
    return '⛔ Major Overhaul Needed';
  };

  const highIssues = scores.issues.filter((i) => i.severity === 'high');
  const medIssues = scores.issues.filter((i) => i.severity === 'medium');

  let card = `## Resume Score Card\n\n`;
  card += `| Dimension | Score | Weight |\n`;
  card += `|-----------|-------|--------|\n`;
  card += `| Impact | ${scores.impact}/10 | 30% |\n`;
  card += `| ATS Compatibility | ${scores.ats}/10 | 25% |\n`;
  card += `| Clarity | ${scores.clarity}/10 | 20% |\n`;
  card += `| Completeness | ${scores.completeness}/10 | 15% |\n`;
  card += `| Formatting | ${scores.formatting}/10 | 10% |\n\n`;
  card += `**Overall: ${scores.overall}/100 — ${getLabel(scores.overall)}**\n\n`;

  if (scores.summary) {
    card += `${scores.summary}\n\n`;
  }

  if (scores.topPriority) {
    card += `**🎯 Top Priority:** ${scores.topPriority}\n\n`;
  }

  if (highIssues.length > 0) {
    card += `### ❌ Critical Issues\n`;
    highIssues.forEach((i) => {
      card += `- **[${i.dimension.toUpperCase()}]** ${i.issue}\n`;
    });
    card += '\n';
  }

  if (medIssues.length > 0) {
    card += `### ⚠️ Areas for Improvement\n`;
    medIssues.forEach((i) => {
      card += `- **[${i.dimension.toUpperCase()}]** ${i.issue}\n`;
    });
    card += '\n';
  }

  return card;
};

module.exports = {
  scoreResume,
  formatScoreCard,
};
