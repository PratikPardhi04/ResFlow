const { chatJSON } = require('./aiEngine');

/**
 * Rewrite weak resume bullets into impactful ones.
 * @param {string} bullet - The original bullet text
 * @param {Object} context - Context about the role
 * @param {string} context.company - Company name
 * @param {string} context.role - Job title
 * @param {string} context.industry - Industry
 * @returns {Promise<Object>} Before/after comparison with explanation
 */
const rewriteBullet = async (bullet, context = {}) => {
  const { company = '', role = '', industry = '' } = context;

  const prompt = `Rewrite this resume bullet point to be more impactful.

ORIGINAL BULLET: "${bullet}"
COMPANY: ${company || 'Unknown'}
ROLE: ${role || 'Unknown'}
INDUSTRY: ${industry || 'Unknown'}

REWRITING RULES:
1. Start with a STRONG action verb (Led, Built, Increased, Reduced, Delivered, Architected, Spearheaded, Orchestrated)
2. Follow the format: [Action Verb] + [What you did] + [How you did it] + [Result with metric]
3. If the original has no metric, add a PLACEHOLDER metric that the user can fill in: use [X%], [X users], [$Xk], etc.
4. Keep it to 1-2 lines maximum
5. Never fabricate specific numbers — use placeholders
6. Make it ATS-friendly with relevant keywords

Return:
{
  "original": "the original bullet verbatim",
  "rewritten": "the improved bullet",
  "changes": ["list of specific changes made"],
  "missingInfo": "what additional info from the user would make this bullet stronger (or null if complete)"
}`;

  return chatJSON(prompt, 'You are an expert resume bullet writer. Your rewrites should be specific, metric-driven, and use strong action verbs.');
};

/**
 * Batch rewrite multiple bullets.
 * @param {Array} bullets - Array of {bullet, company, role}
 * @param {string} industry - Industry context
 * @returns {Promise<Array>} Array of before/after objects
 */
const rewriteBullets = async (bullets, industry = '') => {
  const prompt = `Rewrite these resume bullet points to be more impactful.

BULLETS TO REWRITE:
${bullets.map((b, i) => `${i + 1}. "${b.bullet}" (${b.company || 'Unknown'} — ${b.role || 'Unknown'})`).join('\n')}

INDUSTRY: ${industry || 'Unknown'}

For EACH bullet, follow this format:
- Start with a STRONG action verb
- Format: [Action Verb] + [What] + [How] + [Result with metric]
- Use [X%], [X users], [$Xk] as placeholders for missing metrics
- Never fabricate specific numbers

Return an array:
[
  {
    "index": 1,
    "original": "original bullet",
    "rewritten": "improved bullet",
    "changes": ["list of changes"]
  }
]`;

  return chatJSON(prompt, 'You are an expert resume bullet writer. Make every bullet count.');
};

module.exports = {
  rewriteBullet,
  rewriteBullets,
};
