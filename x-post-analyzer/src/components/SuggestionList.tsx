import { motion } from 'framer-motion';
import { Lightbulb, AlertTriangle, Sparkles } from 'lucide-react';
import { Suggestion } from '../types';

interface SuggestionListProps {
  suggestions: Suggestion[];
}

export default function SuggestionList({ suggestions }: SuggestionListProps) {
  if (suggestions.length === 0) return null;

  const getIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'improvement':
        return Lightbulb;
      case 'warning':
        return AlertTriangle;
      case 'tip':
        return Sparkles;
    }
  };

  const getStyles = (type: Suggestion['type']) => {
    switch (type) {
      case 'improvement':
        return {
          bg: 'bg-x-blue/10',
          border: 'border-x-blue/30',
          icon: 'text-x-blue',
          text: 'text-x-blue',
        };
      case 'warning':
        return {
          bg: 'bg-x-orange/10',
          border: 'border-x-orange/30',
          icon: 'text-x-orange',
          text: 'text-x-orange',
        };
      case 'tip':
        return {
          bg: 'bg-x-green/10',
          border: 'border-x-green/30',
          icon: 'text-x-green',
          text: 'text-x-green',
        };
    }
  };

  const getPriorityBadge = (priority: Suggestion['priority']) => {
    switch (priority) {
      case 'high':
        return <span className="text-[10px] px-1.5 py-0.5 bg-x-red/20 text-x-red rounded">High</span>;
      case 'medium':
        return <span className="text-[10px] px-1.5 py-0.5 bg-x-yellow/20 text-x-yellow rounded">Medium</span>;
      case 'low':
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl overflow-hidden"
    >
      <div className="p-3 border-b border-x-gray-700">
        <h3 className="text-sm font-medium text-x-gray-300 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-x-yellow" />
          Suggestions
        </h3>
      </div>
      <div className="p-3 space-y-2">
        {suggestions.map((suggestion, i) => {
          const Icon = getIcon(suggestion.type);
          const styles = getStyles(suggestion.type);

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-3 rounded-lg border ${styles.bg} ${styles.border}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-4 h-4 mt-0.5 ${styles.icon} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${styles.text}`}>
                      {suggestion.category}
                    </span>
                    {getPriorityBadge(suggestion.priority)}
                  </div>
                  <p className="text-sm text-x-gray-300">{suggestion.text}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
