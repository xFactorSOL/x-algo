import { motion } from 'framer-motion';
import { Link, Search, ArrowRight, ExternalLink } from 'lucide-react';

interface PostAnalyzerProps {
  urlInput: string;
  onUrlChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export default function PostAnalyzer({
  urlInput,
  onUrlChange,
  onAnalyze,
  isAnalyzing,
}: PostAnalyzerProps) {
  const isValidUrl = urlInput.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidUrl && !isAnalyzing) {
      onAnalyze();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-x-gray-700">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-x-blue" />
          <span className="text-sm font-medium text-x-gray-300">Analyze Existing Post</span>
        </div>
      </div>

      {/* URL Input */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Link className="w-5 h-5 text-x-gray-500" />
          </div>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="Paste X post URL (e.g., https://x.com/user/status/123...)"
            className="w-full pl-12 pr-4 py-4 bg-x-gray-800 border border-x-gray-600 rounded-xl text-x-gray-100 placeholder-x-gray-500 focus:outline-none focus:border-x-blue transition-colors"
          />
        </div>

        <motion.button
          type="submit"
          disabled={!isValidUrl || isAnalyzing}
          whileHover={isValidUrl && !isAnalyzing ? { scale: 1.02 } : undefined}
          whileTap={isValidUrl && !isAnalyzing ? { scale: 0.98 } : undefined}
          className={`w-full mt-4 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            isValidUrl && !isAnalyzing
              ? 'bg-x-blue hover:bg-x-blue-hover text-white'
              : 'bg-x-gray-700 text-x-gray-500 cursor-not-allowed'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Analyze Post</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </form>

      {/* Example URLs */}
      <div className="px-4 pb-4">
        <p className="text-xs text-x-gray-500 mb-2">Try these example formats:</p>
        <div className="space-y-2">
          {[
            'https://x.com/username/status/1234567890',
            'https://twitter.com/username/status/1234567890',
          ].map((example) => (
            <button
              key={example}
              onClick={() => onUrlChange(example)}
              className="flex items-center gap-2 text-xs text-x-gray-400 hover:text-x-blue transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="font-mono">{example}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Info box */}
      <div className="px-4 pb-4">
        <div className="bg-x-gray-800/50 rounded-xl p-3">
          <p className="text-xs text-x-gray-400">
            🔐 <span className="font-medium">Note:</span> To analyze posts, ensure your X account is connected. 
            We use the official X API to fetch post data securely.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
