import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function ScoreRadial({ score = 0, size = 180, label = 'Overall' }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  const data = [
    { name: 'score', value: animatedScore },
    { name: 'remaining', value: 100 - animatedScore },
  ];

  const getScoreColor = (s) => {
    if (s >= 80) return { start: '#10b981', end: '#06b6d4' };
    if (s >= 60) return { start: '#06b6d4', end: '#8b5cf6' };
    if (s >= 40) return { start: '#f59e0b', end: '#f97316' };
    return { start: '#f43f5e', end: '#e11d48' };
  };

  const colors = getScoreColor(animatedScore);

  const getGrade = (s) => {
    if (s >= 90) return 'A+';
    if (s >= 80) return 'A';
    if (s >= 70) return 'B+';
    if (s >= 60) return 'B';
    if (s >= 50) return 'C';
    return 'D';
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative flex flex-col items-center"
      style={{ width: size, height: size }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.35}
            outerRadius={size * 0.45}
            startAngle={90}
            endAngle={-270}
            paddingAngle={0}
            dataKey="value"
            strokeWidth={0}
            animationBegin={200}
            animationDuration={1200}
          >
            <Cell fill="url(#scoreGradient)" />
            <Cell fill="rgba(255,255,255,0.04)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={animatedScore}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-3xl font-bold text-white"
        >
          {animatedScore}
        </motion.span>
        <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
        <span
          className="text-sm font-bold mt-0.5"
          style={{ color: colors.start }}
        >
          {getGrade(animatedScore)}
        </span>
      </div>
    </motion.div>
  );
}

export default ScoreRadial;
