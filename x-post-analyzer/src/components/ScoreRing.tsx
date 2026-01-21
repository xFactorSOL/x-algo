import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface ScoreRingProps {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  size?: number;
  label?: string;
}

export default function ScoreRing({ score, grade, size = 120, label }: ScoreRingProps) {
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = useMemo(() => {
    if (score >= 85) return '#00ba7c'; // Green
    if (score >= 70) return '#1d9bf0'; // Blue
    if (score >= 55) return '#ffd400'; // Yellow
    if (score >= 40) return '#ff7a00'; // Orange
    return '#f4212e'; // Red
  }, [score]);

  const glowClass = useMemo(() => {
    if (score >= 85) return 'glow-green';
    if (score >= 70) return 'glow-blue';
    if (score >= 55) return 'glow-yellow';
    if (score >= 40) return 'glow-orange';
    return 'glow-red';
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${glowClass} rounded-full`}>
        <svg
          width={size}
          height={size}
          className="score-ring"
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#333639"
            strokeWidth={strokeWidth}
          />
          {/* Animated score ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold"
            style={{ color }}
          >
            {grade}
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-x-gray-400"
          >
            {score}%
          </motion.span>
        </div>
      </div>
      {label && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 text-sm font-medium text-x-gray-300"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}
