import { motion } from 'framer-motion';

const dimensionConfig = {
  impact: { label: 'Impact', color: '#06b6d4', description: 'Quantifiable achievements' },
  ats: { label: 'ATS', color: '#8b5cf6', description: 'Keyword optimization' },
  clarity: { label: 'Clarity', color: '#10b981', description: 'Readability & structure' },
  completeness: { label: 'Completeness', color: '#f59e0b', description: 'Section coverage' },
  formatting: { label: 'Formatting', color: '#f43f5e', description: 'Visual presentation' },
};

function ScoreDimension({ dimension, score = 0, issues = [], delay = 0 }) {
  const config = dimensionConfig[dimension] || {
    label: dimension,
    color: '#06b6d4',
    description: '',
  };
  const percentage = (score / 10) * 100;

  const severityColors = {
    high: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    low: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-gray-200">{config.label}</span>
          <span className="text-xs text-gray-500 ml-2">{config.description}</span>
        </div>
        <span className="text-sm font-bold" style={{ color: config.color }}>
          {score}/10
        </span>
      </div>

      {/* Progress bar */}
      <div className="score-bar">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: delay + 0.3, ease: 'easeOut' }}
          className="score-bar-fill"
          style={{
            background: `linear-gradient(90deg, ${config.color}, ${config.color}aa)`,
            boxShadow: `0 0 10px ${config.color}40`,
          }}
        />
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {issues.map((issue, i) => (
            <span
              key={i}
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${
                severityColors[issue.severity] || severityColors.low
              }`}
            >
              {issue.issue}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default ScoreDimension;
