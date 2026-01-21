import { motion } from 'framer-motion';
import { Image, Smile, MapPin, Calendar } from 'lucide-react';
import { User } from '../types';

interface PostComposerProps {
  value: string;
  onChange: (value: string) => void;
  user: User | null;
}

const MAX_LENGTH = 280;

export default function PostComposer({ value, onChange, user }: PostComposerProps) {
  const charCount = value.length;
  const charPercentage = (charCount / MAX_LENGTH) * 100;
  const isOverLimit = charCount > MAX_LENGTH;
  const isNearLimit = charCount >= MAX_LENGTH * 0.9;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-x-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-x-green rounded-full live-pulse" />
          <span className="text-sm font-medium text-x-gray-300">Live Draft Preview</span>
        </div>
      </div>

      {/* Composer Area */}
      <div className="p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={user?.profileImageUrl || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'}
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
          </div>

          {/* Input area */}
          <div className="flex-1 min-w-0">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="What's happening?"
              className="w-full bg-transparent text-xl text-x-gray-100 placeholder-x-gray-500 resize-none border-none outline-none min-h-[120px]"
              style={{ lineHeight: '1.5' }}
            />

            {/* Media buttons row */}
            <div className="flex items-center justify-between pt-3 border-t border-x-gray-700 mt-3">
              <div className="flex gap-1">
                {[
                  { icon: Image, label: 'Media' },
                  { icon: Smile, label: 'Emoji' },
                  { icon: MapPin, label: 'Location' },
                  { icon: Calendar, label: 'Schedule' },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    className="p-2 text-x-blue hover:bg-x-blue/10 rounded-full transition-colors"
                    title={btn.label}
                  >
                    <btn.icon className="w-5 h-5" />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {/* Character counter */}
                {charCount > 0 && (
                  <div className="flex items-center gap-2">
                    {/* Circular progress */}
                    <svg className="w-6 h-6 -rotate-90">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="#333639"
                        strokeWidth="2"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke={isOverLimit ? '#f4212e' : isNearLimit ? '#ffd400' : '#1d9bf0'}
                        strokeWidth="2"
                        strokeDasharray={`${Math.min(charPercentage, 100) * 0.628} 62.8`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span
                      className={`text-sm font-medium ${
                        isOverLimit ? 'text-x-red' : isNearLimit ? 'text-x-yellow' : 'text-x-gray-400'
                      }`}
                    >
                      {MAX_LENGTH - charCount}
                    </span>
                  </div>
                )}

                {/* Divider */}
                <div className="w-px h-6 bg-x-gray-700" />

                {/* Post button (disabled, for visual only) */}
                <button
                  disabled
                  className="px-5 py-2 bg-x-blue/50 text-white font-bold rounded-full cursor-not-allowed"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="px-4 pb-4">
        <div className="bg-x-gray-800/50 rounded-xl p-3">
          <p className="text-xs text-x-gray-400">
            💡 <span className="font-medium">Pro tip:</span> Posts between 100-280 characters tend to get higher engagement. 
            Questions and calls-to-action boost replies.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
