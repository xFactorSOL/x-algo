import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ScoreResult } from '../types';

interface ScoreCardProps {
  result: ScoreResult;
  delay?: number;
}

export default function ScoreCard({ result, delay = 0 }: ScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-xl overflow-hidden card-hover"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Mini score indicator */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg"
            style={{ backgroundColor: `${result.color}20`, color: result.color }}
          >
            {result.grade}
          </div>
          <div className="text-left">
            <p className="font-medium text-sm">{result.label}</p>
            <p className="text-xs text-x-gray-400">{result.score}%</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-x-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-x-gray-400" />
        )}
      </button>

      {/* Score bar */}
      <div className="px-4 pb-2">
        <div className="h-1.5 bg-x-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${result.score}%` }}
            transition={{ duration: 0.8, delay: delay + 0.2, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: result.color }}
          />
        </div>
      </div>

      {/* Expanded details */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 space-y-2 border-t border-x-gray-700 pt-3 mt-2">
          <p className="text-xs text-x-gray-400 mb-3">{result.description}</p>
          {result.details.map((detail, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 text-xs p-2 rounded-lg ${
                detail.impact === 'positive'
                  ? 'bg-x-green/10 text-x-green'
                  : detail.impact === 'negative'
                  ? 'bg-x-red/10 text-x-red'
                  : 'bg-x-gray-700/50 text-x-gray-300'
              }`}
            >
              <span className="mt-0.5">
                {detail.impact === 'positive' ? '✓' : detail.impact === 'negative' ? '✗' : '•'}
              </span>
              <div>
                <span className="font-medium">{detail.factor}:</span>{' '}
                <span className="opacity-90">{detail.description}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
