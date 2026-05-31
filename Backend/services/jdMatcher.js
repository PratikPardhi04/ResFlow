const { chatJSON } = require('./aiEngine');

/**
 * Match a resume against a job description and produce a gap analysis.
 * @param {Object} parsedResume - Structured resume data
 * @param {string} jobDescription - Raw job description text
 * @returns {Promise<Object>} Match report with score, gaps, and suggestions
 */
const matchResumeToJD = async (parsedResume, jobDescription) => {
  const prompt = `You are an expert ATS engineer and recruiter. Analyze how well this resume matches the given job description.

RESUME DATA:
"""
${JSON.stringify(parsedResume, null, 2)}
"""

JOB DESCRIPTION:
"""
${jobDescription}
"""

Perform a thorough analysis and return:

{
  "matchScore": {
    "overall": <0-100>,
    "breakdown": {
      "requiredSkills": <0-100>,
      "experienceLevel": <0-100>,
      "keywordDensity": <0-100>,
      "culturalFit": <0-100>
    }
  },
  "jdAnalysis": {
    "requiredSkills": ["list of required skills from JD"],
    "preferredSkills": ["list of preferred/nice-to-have skills"],
    "seniorityLevel": "entry|junior|mid|senior|lead|principal|executive",
    "companyTone": "startup|corporate|enterprise|nonprofit|government",
    "cultureKeywords": ["keywords indicating company culture"]
  },
  "strengths": [
    {
      "skill": "skill name",
      "evidence": "where it appears in the resume",
      "jdRelevance": "how it maps to the JD requirement"
    }
  ],
  "gaps": [
    {
      "requirement": "what the JD asks for",
      "frequency": <how many times mentioned in JD>,
      "severity": "critical|important|nice-to-have",
      "suggestion": "how to address this gap"
    }
  ],
  "suggestedBullets": [
    {
      "bullet": "A new bullet the user should add (with [placeholder] for their real data)",
      "targetSection": "which experience entry or section to add it to",
      "reason": "why this bullet would help"
    }
  ],
  "summaryRewrite": "A rewritten professional summary tailored to this JD (or null if the current one is already good)",
  "keywordsToAdd": ["list of missing ATS keywords the user should weave into their resume"]
}

Be specific and actionable. Never fabricate experience — only suggest ways to reframe existing experience or add placeholders.`;

  const context = 'You are performing a precision job-match analysis. Be calibrated: 90+ means near-perfect match, 50 means significant gaps.';

  return chatJSON(prompt, context);
};

/**
 * Format match report as readable markdown.
 * @param {Object} matchReport - Report from matchResumeToJD()
 * @returns {string} Formatted markdown
 */
const formatMatchReport = (matchReport) => {
  const { matchScore, strengths, gaps, suggestedBullets, keywordsToAdd } = matchReport;

  let report = `## Job Match Report\n\n`;
  report += `**Match Score: ${matchScore.overall}/100**\n\n`;
  report += `| Category | Score |\n`;
  report += `|----------|-------|\n`;
  report += `| Required Skills | ${matchScore.breakdown.requiredSkills}/100 |\n`;
  report += `| Experience Level | ${matchScore.breakdown.experienceLevel}/100 |\n`;
  report += `| Keyword Density | ${matchScore.breakdown.keywordDensity}/100 |\n`;
  report += `| Cultural Fit | ${matchScore.breakdown.culturalFit}/100 |\n\n`;

  if (strengths && strengths.length > 0) {
    report += `### ✅ Strong Matches\n`;
    strengths.forEach((s) => {
      report += `- **${s.skill}**: ${s.jdRelevance}\n`;
    });
    report += '\n';
  }

  if (gaps && gaps.length > 0) {
    const critical = gaps.filter((g) => g.severity === 'critical');
    const important = gaps.filter((g) => g.severity === 'important');
    const niceToHave = gaps.filter((g) => g.severity === 'nice-to-have');

    if (critical.length > 0) {
      report += `### ❌ Critical Gaps\n`;
      critical.forEach((g) => {
        report += `- **${g.requirement}** (mentioned ${g.frequency}x in JD) — ${g.suggestion}\n`;
      });
      report += '\n';
    }
    if (important.length > 0) {
      report += `### ⚠️ Important Gaps\n`;
      important.forEach((g) => {
        report += `- **${g.requirement}** — ${g.suggestion}\n`;
      });
      report += '\n';
    }
    if (niceToHave.length > 0) {
      report += `### 💡 Nice-to-Have\n`;
      niceToHave.forEach((g) => {
        report += `- ${g.requirement} — ${g.suggestion}\n`;
      });
      report += '\n';
    }
  }

  if (keywordsToAdd && keywordsToAdd.length > 0) {
    report += `### 🔑 Missing Keywords to Add\n`;
    report += keywordsToAdd.map((k) => `\`${k}\``).join(', ') + '\n\n';
  }

  if (suggestedBullets && suggestedBullets.length > 0) {
    report += `### 📝 Suggested Bullets to Add\n`;
    suggestedBullets.forEach((b, i) => {
      report += `${i + 1}. "${b.bullet}"\n   → Add to: ${b.targetSection} | ${b.reason}\n`;
    });
    report += '\n';
  }

  return report;
};

module.exports = {
  matchResumeToJD,
  formatMatchReport,
};
