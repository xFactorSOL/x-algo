import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Heart, 
  Repeat2, 
  UserPlus,
  Link as LinkIcon,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock,
  Hash,
  AtSign,
  Image,
  Type,
  TrendingUp,
  TrendingDown,
  Minus,
  Info
} from 'lucide-react';
import { useState } from 'react';
import { 
  ENGAGEMENT_WEIGHTS, 
  NEGATIVE_WEIGHTS, 
  CONTENT_BOOSTS,
  FILTER_RISKS,
  OPTIMAL_CONTENT,
  AUTHOR_DIVERSITY
} from '../lib/scoring/algorithmWeights';

interface DeepAnalysisProps {
  text: string;
  recentPostCount?: number;
  hoursSinceLastPost?: number;
}

interface FactorAnalysis {
  name: string;
  score: number;
  maxScore: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  algorithmNote: string;
  icon: React.ElementType;
}

export default function DeepAnalysis({ 
  text, 
  recentPostCount = 0, 
  hoursSinceLastPost = 24 
}: DeepAnalysisProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('engagement');

  // Perform deep analysis
  const analysis = analyzeText(text, recentPostCount, hoursSinceLastPost);

  const sections = [
    {
      id: 'engagement',
      title: 'Engagement Prediction',
      subtitle: 'How the algorithm predicts user interactions',
      factors: analysis.engagementFactors,
      score: analysis.engagementScore,
      algorithmRef: 'Heavy Ranker Model predicts P(engagement) for each signal',
    },
    {
      id: 'content',
      title: 'Content Signals',
      subtitle: 'Post structure and formatting analysis',
      factors: analysis.contentFactors,
      score: analysis.contentScore,
      algorithmRef: 'Content features extracted by TweetTextFeatureExtractor',
    },
    {
      id: 'risk',
      title: 'Filter & Risk Analysis',
      subtitle: 'Factors that may limit distribution',
      factors: analysis.riskFactors,
      score: analysis.riskScore,
      algorithmRef: 'VisibilityLibrary filters and SafetyModelScorer checks',
    },
    {
      id: 'diversity',
      title: 'Author Diversity',
      subtitle: 'Posting frequency impact',
      factors: analysis.diversityFactors,
      score: analysis.diversityScore,
      algorithmRef: 'AuthorDiversityDropper limits same-author posts',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Algorithm Weight Reference */}
      <div className="glass rounded-xl p-4 border border-x-blue/30">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-x-blue flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white text-sm">X Algorithm Weights (from source)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-x-blue" />
                <span className="text-x-gray-400">Replies:</span>
                <span className="text-white font-mono">{ENGAGEMENT_WEIGHTS.reply}x</span>
              </div>
              <div className="flex items-center gap-1">
                <UserPlus className="w-3 h-3 text-purple-400" />
                <span className="text-x-gray-400">Profile Click:</span>
                <span className="text-white font-mono">{ENGAGEMENT_WEIGHTS.profileClick}x</span>
              </div>
              <div className="flex items-center gap-1">
                <LinkIcon className="w-3 h-3 text-green-400" />
                <span className="text-x-gray-400">URL Click:</span>
                <span className="text-white font-mono">{ENGAGEMENT_WEIGHTS.urlClick}x</span>
              </div>
              <div className="flex items-center gap-1">
                <Repeat2 className="w-3 h-3 text-x-green" />
                <span className="text-x-gray-400">Repost:</span>
                <span className="text-white font-mono">{ENGAGEMENT_WEIGHTS.retweet}x</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-pink-500" />
                <span className="text-x-gray-400">Like:</span>
                <span className="text-white font-mono">{ENGAGEMENT_WEIGHTS.favorite}x</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-500" />
                <span className="text-x-gray-400">Report:</span>
                <span className="text-white font-mono">{NEGATIVE_WEIGHTS.report}x</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Sections */}
      {sections.map((section) => (
        <div key={section.id} className="glass rounded-xl overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
            className="w-full p-4 flex items-center justify-between hover:bg-x-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ScoreBadge score={section.score} />
              <div className="text-left">
                <h3 className="font-semibold text-white">{section.title}</h3>
                <p className="text-xs text-x-gray-400">{section.subtitle}</p>
              </div>
            </div>
            {expandedSection === section.id ? (
              <ChevronUp className="w-5 h-5 text-x-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-x-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {expandedSection === section.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">
                  {/* Algorithm Reference */}
                  <div className="text-xs text-x-gray-500 bg-x-gray-800/50 rounded-lg px-3 py-2 font-mono">
                    📚 {section.algorithmRef}
                  </div>

                  {/* Factors */}
                  {section.factors.map((factor, i) => (
                    <FactorRow key={i} factor={factor} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Overall Algorithm Score Breakdown */}
      <div className="glass rounded-xl p-4">
        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-x-yellow" />
          Algorithm Score Formula
        </h4>
        <div className="bg-x-gray-800/50 rounded-lg p-3 font-mono text-xs text-x-gray-300">
          <div className="space-y-1">
            <div>score = Σ (P(engagement) × weight)</div>
            <div className="text-x-gray-500">where engagement ∈ {'{reply, repost, like, click, ...}'}</div>
            <div className="mt-2 pt-2 border-t border-x-gray-700">
              <span className="text-x-blue">Your predicted score factors:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>Reply potential: <span className="text-x-green">{analysis.replyPotential.toFixed(1)}%</span></div>
              <div>Repost potential: <span className="text-x-green">{analysis.repostPotential.toFixed(1)}%</span></div>
              <div>Like potential: <span className="text-x-green">{analysis.likePotential.toFixed(1)}%</span></div>
              <div>Click potential: <span className="text-x-green">{analysis.clickPotential.toFixed(1)}%</span></div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-x-green' : score >= 60 ? 'bg-x-blue' : score >= 40 ? 'bg-x-yellow' : 'bg-red-500';
  return (
    <div className={`${color} text-white text-xs font-bold px-2 py-1 rounded-full min-w-[2.5rem] text-center`}>
      {Math.round(score)}
    </div>
  );
}

function FactorRow({ factor }: { factor: FactorAnalysis }) {
  const Icon = factor.icon;
  const impactColor = factor.impact === 'positive' ? 'text-x-green' : factor.impact === 'negative' ? 'text-red-500' : 'text-x-gray-400';
  const ImpactIcon = factor.impact === 'positive' ? TrendingUp : factor.impact === 'negative' ? TrendingDown : Minus;

  return (
    <div className="flex items-start gap-3 p-3 bg-x-gray-800/30 rounded-lg">
      <div className={`p-2 rounded-lg ${factor.impact === 'positive' ? 'bg-x-green/20' : factor.impact === 'negative' ? 'bg-red-500/20' : 'bg-x-gray-700'}`}>
        <Icon className={`w-4 h-4 ${impactColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium text-white text-sm">{factor.name}</span>
          <div className="flex items-center gap-1">
            <ImpactIcon className={`w-3 h-3 ${impactColor}`} />
            <span className={`text-xs font-mono ${impactColor}`}>
              {factor.impact === 'positive' ? '+' : factor.impact === 'negative' ? '' : ''}{factor.score}
            </span>
          </div>
        </div>
        <p className="text-xs text-x-gray-400 mt-1">{factor.description}</p>
        <p className="text-xs text-x-gray-500 mt-1 italic">💡 {factor.algorithmNote}</p>
      </div>
    </div>
  );
}

// Deep analysis function
function analyzeText(text: string, recentPostCount: number, hoursSinceLastPost: number) {
  const engagementFactors: FactorAnalysis[] = [];
  const contentFactors: FactorAnalysis[] = [];
  const riskFactors: FactorAnalysis[] = [];
  const diversityFactors: FactorAnalysis[] = [];

  // === ENGAGEMENT ANALYSIS ===
  
  // Questions (Reply potential)
  const questionCount = (text.match(/\?/g) || []).length;
  if (questionCount > 0) {
    engagementFactors.push({
      name: 'Questions Detected',
      score: Math.min(questionCount * 15, 30),
      maxScore: 30,
      impact: 'positive',
      description: `${questionCount} question(s) dramatically increase reply probability`,
      algorithmNote: `Replies have ${ENGAGEMENT_WEIGHTS.reply}x weight - highest in the algorithm`,
      icon: MessageCircle,
    });
  } else {
    engagementFactors.push({
      name: 'No Questions',
      score: -10,
      maxScore: 30,
      impact: 'negative',
      description: 'Posts without questions get fewer replies',
      algorithmNote: 'Adding a question can significantly boost your algorithm score',
      icon: MessageCircle,
    });
  }

  // Controversial/Opinion content
  const opinionPatterns = /\b(unpopular opinion|hot take|controversial|agree or disagree|am i wrong|change my mind)\b/gi;
  const opinionMatches = text.match(opinionPatterns) || [];
  if (opinionMatches.length > 0) {
    engagementFactors.push({
      name: 'Opinion/Debate Content',
      score: 20,
      maxScore: 20,
      impact: 'positive',
      description: 'Controversial framing drives replies and quote tweets',
      algorithmNote: 'Debate content maximizes the 13.5x reply weight',
      icon: Zap,
    });
  }

  // Call-to-action
  const ctaPatterns = /\b(share|repost|thoughts\??|what do you think|tell me|let me know|reply|comment)\b/gi;
  const ctaMatches = text.match(ctaPatterns) || [];
  if (ctaMatches.length > 0) {
    engagementFactors.push({
      name: 'Call-to-Action',
      score: Math.min(ctaMatches.length * 8, 15),
      maxScore: 15,
      impact: 'positive',
      description: `${ctaMatches.length} engagement prompt(s) found`,
      algorithmNote: 'Direct asks increase P(reply) in the model',
      icon: UserPlus,
    });
  }

  // Thread indicator
  const threadPattern = /\b(thread|🧵|1\/|a thread)\b/gi;
  if (threadPattern.test(text)) {
    engagementFactors.push({
      name: 'Thread Format',
      score: 15,
      maxScore: 15,
      impact: 'positive',
      description: 'Thread indicator suggests extended content',
      algorithmNote: 'Threads get ~50% more engagement than single posts',
      icon: Type,
    });
  }

  // === CONTENT ANALYSIS ===

  // Text length
  const length = text.length;
  if (length < OPTIMAL_CONTENT.minLength) {
    contentFactors.push({
      name: 'Post Too Short',
      score: -15,
      maxScore: 20,
      impact: 'negative',
      description: `${length} chars - add more context (aim for ${OPTIMAL_CONTENT.optimalMinLength}+)`,
      algorithmNote: 'Short posts have lower dwell time, reducing algorithm score',
      icon: Type,
    });
  } else if (length >= OPTIMAL_CONTENT.optimalMinLength && length <= OPTIMAL_CONTENT.optimalMaxLength) {
    contentFactors.push({
      name: 'Optimal Length',
      score: 20,
      maxScore: 20,
      impact: 'positive',
      description: `${length} chars - perfect range for engagement`,
      algorithmNote: '100-280 chars is the sweet spot for dwell time',
      icon: Type,
    });
  } else if (length > OPTIMAL_CONTENT.maxLength) {
    contentFactors.push({
      name: 'Post Length',
      score: 10,
      maxScore: 20,
      impact: 'neutral',
      description: `${length} chars - long posts can work but may lose attention`,
      algorithmNote: 'Consider breaking into a thread for better engagement',
      icon: Type,
    });
  } else {
    contentFactors.push({
      name: 'Post Length',
      score: 15,
      maxScore: 20,
      impact: 'positive',
      description: `${length} chars - good length`,
      algorithmNote: 'This length provides good dwell time',
      icon: Type,
    });
  }

  // Line breaks
  const lineBreaks = (text.match(/\n/g) || []).length;
  if (lineBreaks >= OPTIMAL_CONTENT.optimalLineBreaks && lineBreaks <= OPTIMAL_CONTENT.maxLineBreaks) {
    contentFactors.push({
      name: 'Good Formatting',
      score: 10,
      maxScore: 10,
      impact: 'positive',
      description: `${lineBreaks} line breaks improve readability`,
      algorithmNote: 'Formatted posts increase dwell time',
      icon: Type,
    });
  } else if (lineBreaks === 0 && length > 100) {
    contentFactors.push({
      name: 'No Line Breaks',
      score: -5,
      maxScore: 10,
      impact: 'negative',
      description: 'Wall of text - add line breaks for readability',
      algorithmNote: 'Poor formatting reduces dwell time',
      icon: Type,
    });
  }

  // Hashtags
  const hashtags = text.match(/#\w+/g) || [];
  if (hashtags.length === 0) {
    contentFactors.push({
      name: 'No Hashtags',
      score: 0,
      maxScore: 10,
      impact: 'neutral',
      description: 'Hashtags help discoverability but aren\'t required',
      algorithmNote: 'Hashtags affect out-of-network reach',
      icon: Hash,
    });
  } else if (hashtags.length >= 1 && hashtags.length <= 3) {
    contentFactors.push({
      name: 'Optimal Hashtags',
      score: 10,
      maxScore: 10,
      impact: 'positive',
      description: `${hashtags.length} hashtag(s) - perfect for discovery`,
      algorithmNote: '1-3 hashtags maximize reach without spam signals',
      icon: Hash,
    });
  } else {
    contentFactors.push({
      name: 'Too Many Hashtags',
      score: -10,
      maxScore: 10,
      impact: 'negative',
      description: `${hashtags.length} hashtags - reduce to 1-3`,
      algorithmNote: 'Excessive hashtags trigger spam filters',
      icon: Hash,
    });
  }

  // Mentions
  const mentions = text.match(/@\w+/g) || [];
  if (mentions.length > 0 && mentions.length <= 2) {
    contentFactors.push({
      name: 'Mentions',
      score: 5,
      maxScore: 10,
      impact: 'positive',
      description: `${mentions.length} mention(s) can boost visibility`,
      algorithmNote: 'Mentions increase chance of engagement',
      icon: AtSign,
    });
  } else if (mentions.length > 3) {
    contentFactors.push({
      name: 'Too Many Mentions',
      score: -10,
      maxScore: 10,
      impact: 'negative',
      description: `${mentions.length} mentions looks spammy`,
      algorithmNote: 'Excessive mentions reduce distribution',
      icon: AtSign,
    });
  }

  // Emojis
  const emojis = text.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu) || [];
  if (emojis.length >= 1 && emojis.length <= 5) {
    contentFactors.push({
      name: 'Emoji Usage',
      score: 5,
      maxScore: 10,
      impact: 'positive',
      description: `${emojis.length} emoji(s) add visual interest`,
      algorithmNote: 'Moderate emoji use increases engagement',
      icon: Heart,
    });
  } else if (emojis.length > 8) {
    contentFactors.push({
      name: 'Excessive Emojis',
      score: -5,
      maxScore: 10,
      impact: 'negative',
      description: `${emojis.length} emojis may appear unprofessional`,
      algorithmNote: 'Too many emojis can trigger spam detection',
      icon: Heart,
    });
  }

  // === RISK ANALYSIS ===

  // Check for commonly muted terms
  const mutedTermsFound = FILTER_RISKS.mutedTermRisk.filter(term => 
    text.toLowerCase().includes(term.toLowerCase())
  );
  if (mutedTermsFound.length > 0) {
    riskFactors.push({
      name: 'Muted Terms Detected',
      score: -20 * mutedTermsFound.length,
      maxScore: 0,
      impact: 'negative',
      description: `Found: ${mutedTermsFound.slice(0, 3).join(', ')}${mutedTermsFound.length > 3 ? '...' : ''}`,
      algorithmNote: 'These terms are commonly muted by users, reducing reach',
      icon: AlertTriangle,
    });
  } else {
    riskFactors.push({
      name: 'No Muted Terms',
      score: 15,
      maxScore: 15,
      impact: 'positive',
      description: 'Post avoids commonly filtered terms',
      algorithmNote: 'Clean content gets full distribution',
      icon: CheckCircle,
    });
  }

  // Spam patterns
  let spamPatternCount = 0;
  FILTER_RISKS.spamPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) spamPatternCount += matches.length;
  });
  if (spamPatternCount > 0) {
    riskFactors.push({
      name: 'Spam Patterns',
      score: -15 * spamPatternCount,
      maxScore: 0,
      impact: 'negative',
      description: `${spamPatternCount} spam-like pattern(s) detected`,
      algorithmNote: 'SafetyModelScorer may flag this content',
      icon: XCircle,
    });
  }

  // External links
  const urls = text.match(/https?:\/\/[^\s]+/g) || [];
  if (urls.length > 0) {
    riskFactors.push({
      name: 'External Links',
      score: -10,
      maxScore: 0,
      impact: 'negative',
      description: `${urls.length} link(s) may reduce organic reach`,
      algorithmNote: 'X deprioritizes posts that send users off-platform',
      icon: LinkIcon,
    });
  }

  // Caps lock abuse
  const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.replace(/\s/g, '').length, 1);
  if (capsRatio > 0.5 && text.length > 20) {
    riskFactors.push({
      name: 'Excessive Caps',
      score: -15,
      maxScore: 0,
      impact: 'negative',
      description: `${Math.round(capsRatio * 100)}% caps - appears aggressive`,
      algorithmNote: 'All-caps content gets lower quality scores',
      icon: AlertTriangle,
    });
  }

  // === DIVERSITY ANALYSIS ===

  if (recentPostCount > AUTHOR_DIVERSITY.maxPostsFromSameAuthor) {
    diversityFactors.push({
      name: 'High Post Frequency',
      score: -20,
      maxScore: 0,
      impact: 'negative',
      description: `${recentPostCount} recent posts may saturate your followers' feeds`,
      algorithmNote: 'AuthorDiversityDropper limits same-author posts in timeline',
      icon: Clock,
    });
  } else {
    diversityFactors.push({
      name: 'Good Post Spacing',
      score: 15,
      maxScore: 15,
      impact: 'positive',
      description: 'Posting frequency is healthy',
      algorithmNote: 'Your posts won\'t be filtered for over-posting',
      icon: CheckCircle,
    });
  }

  if (hoursSinceLastPost < AUTHOR_DIVERSITY.optimalHoursBetweenPosts) {
    diversityFactors.push({
      name: 'Recent Post',
      score: -10,
      maxScore: 0,
      impact: 'negative',
      description: `Posted ${hoursSinceLastPost.toFixed(1)}h ago - wait ${AUTHOR_DIVERSITY.optimalHoursBetweenPosts}h for optimal reach`,
      algorithmNote: 'Spacing posts by 4+ hours improves individual post performance',
      icon: Clock,
    });
  }

  // Calculate scores
  const engagementScore = Math.max(0, Math.min(100, 50 + engagementFactors.reduce((sum, f) => sum + f.score, 0)));
  const contentScore = Math.max(0, Math.min(100, 50 + contentFactors.reduce((sum, f) => sum + f.score, 0)));
  const riskScore = Math.max(0, Math.min(100, 80 + riskFactors.reduce((sum, f) => sum + f.score, 0)));
  const diversityScore = Math.max(0, Math.min(100, 70 + diversityFactors.reduce((sum, f) => sum + f.score, 0)));

  // Predict engagement probabilities (simplified model)
  const replyPotential = Math.min(100, 20 + questionCount * 15 + opinionMatches.length * 10);
  const repostPotential = Math.min(100, 15 + (length > 100 ? 10 : 0) + (threadPattern.test(text) ? 15 : 0));
  const likePotential = Math.min(100, 30 + emojis.length * 2 + (length > 50 ? 10 : 0));
  const clickPotential = Math.min(100, 20 + mentions.length * 5 + (urls.length > 0 ? 20 : 0));

  return {
    engagementFactors,
    contentFactors,
    riskFactors,
    diversityFactors,
    engagementScore,
    contentScore,
    riskScore,
    diversityScore,
    replyPotential,
    repostPotential,
    likePotential,
    clickPotential,
  };
}
