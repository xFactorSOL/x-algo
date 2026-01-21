/**
 * X Algorithm Weights - Based on the open-source X algorithm
 * Source: https://github.com/twitter/the-algorithm
 * 
 * These weights represent how X's ranking algorithm scores different engagement signals.
 * Higher weights = more impact on "For You" timeline visibility
 */

export const ENGAGEMENT_WEIGHTS = {
  // Replies have the HIGHEST weight in the algorithm
  // This is why controversial/discussion-provoking posts do well
  reply: 13.5,
  
  // Profile clicks indicate strong interest
  profileClick: 12.0,
  
  // URL clicks show content value
  urlClick: 1.1,
  
  // Retweets/Reposts help distribution
  retweet: 1.0,
  
  // Likes/Favorites are common but lower weight
  favorite: 0.5,
  
  // Video engagement (varies by completion)
  videoPlayback50: 0.005,
  videoQualityView: 0.14,
  
  // Follows from content (currently disabled in production)
  follow: 0,
};

/**
 * Negative signals that reduce ranking
 */
export const NEGATIVE_WEIGHTS = {
  // These heavily penalize content
  report: -369.0,
  
  // User doesn't want to see this
  dontLike: -74.0,
  
  // Muting indicates annoyance
  mute: -74.0,
  
  // Blocking is severe negative signal
  block: -74.0,
  
  // Unfollowing after seeing content
  unfollow: -74.0,
};

/**
 * Author diversity penalty
 * If you've posted too much recently, your posts get demoted
 */
export const AUTHOR_DIVERSITY = {
  // Maximum posts in timeline from same author
  maxPostsFromSameAuthor: 2,
  
  // Penalty multiplier for excessive posting
  penaltyMultiplier: 0.5,
  
  // Optimal hours between posts
  optimalHoursBetweenPosts: 4,
};

/**
 * Content type boosts
 */
export const CONTENT_BOOSTS = {
  // Images typically get 2x engagement
  hasImage: 2.0,
  
  // Video content boost
  hasVideo: 2.0,
  
  // Threads get engagement boost
  isThread: 1.5,
  
  // Quote tweets show high engagement
  isQuote: 1.5,
  
  // Replies to others (lower distribution)
  isReply: 0.6,
};

/**
 * Filter risks - content that may be filtered or demoted
 */
export const FILTER_RISKS = {
  // Commonly muted terms
  mutedTermRisk: [
    'crypto', 'nft', 'web3', 'blockchain', 'airdrop', 'giveaway',
    'dm me', 'link in bio', 'drop your', 'follow me', 'f4f',
    'binance', 'coinbase', 'solana', 'bitcoin', 'ethereum',
    'trading', 'forex', 'investment', 'passive income',
  ],
  
  // Spam patterns
  spamPatterns: [
    /\$\w+/g, // Cashtags (often spam)
    /(follow|retweet|like).*(win|giveaway)/gi,
    /dm\s*(me|for)/gi,
    /🔥{3,}/g, // Excessive emojis
    /💰{2,}/g,
    /🚀{3,}/g,
  ],
  
  // Excessive hashtags threshold
  maxOptimalHashtags: 3,
  
  // External links can reduce reach
  externalLinkPenalty: 0.8,
};

/**
 * Optimal content characteristics
 */
export const OPTIMAL_CONTENT = {
  // Character count ranges
  minLength: 50,
  optimalMinLength: 100,
  optimalMaxLength: 280,
  maxLength: 500, // Before engagement drops
  
  // Line breaks for readability
  optimalLineBreaks: 2,
  maxLineBreaks: 6,
  
  // Hashtag sweet spot
  optimalHashtags: { min: 1, max: 3 },
  
  // Mention limits
  optimalMentions: { min: 0, max: 2 },
  
  // Question marks (engagement)
  questionBoost: 1.3,
};
