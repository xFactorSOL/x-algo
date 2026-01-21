import { AnalysisResult, Suggestion } from '../../types';
import { calculateEngagementScore } from './engagementScore';
import { calculateRedFlagScore } from './redFlagScore';
import { calculateDwellTimeScore } from './dwellTimeScore';
import { calculateAuthorDiversityScore } from './authorDiversityScore';
import { calculateFilterRiskScore } from './filterRiskScore';
import { calculateReachScore } from './reachScore';

export interface AnalysisOptions {
  recentPostCount?: number;
  hoursSinceLastPost?: number;
  followerCount?: number;
}

export function analyzePost(
  text: string,
  options: AnalysisOptions = {}
): AnalysisResult {
  const {
    recentPostCount = 0,
    hoursSinceLastPost = 24,
    followerCount = 1000,
  } = options;

  // Calculate all scores
  const engagement = calculateEngagementScore(text);
  const redFlags = calculateRedFlagScore(text);
  const dwellTime = calculateDwellTimeScore(text);
  const authorDiversity = calculateAuthorDiversityScore(recentPostCount, hoursSinceLastPost);
  const filterRisk = calculateFilterRiskScore(text);
  const reach = calculateReachScore(text, followerCount);

  // Calculate overall score (weighted average)
  const weights = {
    engagement: 0.25,
    redFlags: 0.20,
    dwellTime: 0.15,
    authorDiversity: 0.15,
    filterRisk: 0.10,
    reach: 0.15,
  };

  const overallScore = Math.round(
    engagement.score * weights.engagement +
    redFlags.score * weights.redFlags +
    dwellTime.score * weights.dwellTime +
    authorDiversity.score * weights.authorDiversity +
    filterRisk.score * weights.filterRisk +
    reach.score * weights.reach
  );

  // Generate suggestions
  const suggestions = generateSuggestions(
    text,
    engagement,
    redFlags,
    dwellTime,
    authorDiversity,
    filterRisk,
    reach
  );

  return {
    overallScore,
    overallGrade: getGrade(overallScore),
    engagement,
    redFlags,
    dwellTime,
    authorDiversity,
    filterRisk,
    reach,
    suggestions,
  };
}

function generateSuggestions(
  text: string,
  engagement: ReturnType<typeof calculateEngagementScore>,
  redFlags: ReturnType<typeof calculateRedFlagScore>,
  dwellTime: ReturnType<typeof calculateDwellTimeScore>,
  authorDiversity: ReturnType<typeof calculateAuthorDiversityScore>,
  filterRisk: ReturnType<typeof calculateFilterRiskScore>,
  reach: ReturnType<typeof calculateReachScore>
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Strip URLs to analyze actual content
  const textWithoutUrls = text.replace(/https?:\/\/[^\s]+/g, '').trim();
  const urls = text.match(/https?:\/\/[^\s]+/g) || [];
  const isOnlyLink = urls.length > 0 && textWithoutUrls.length < 10;
  const isMostlyLink = urls.length > 0 && textWithoutUrls.length < 50;

  // CRITICAL: Detect garbage content first
  if (isOnlyLink) {
    suggestions.push({
      type: 'warning',
      category: '⛔ Critical Issue',
      text: 'This is just a link with no context. X heavily demotes link-only posts. Add commentary, opinion, or value.',
      priority: 'high',
    });
    suggestions.push({
      type: 'improvement',
      category: 'Algorithm Tip',
      text: 'The algorithm weights replies at 13.5x - add a question or hot take to spark discussion',
      priority: 'high',
    });
    suggestions.push({
      type: 'improvement',
      category: 'Reach',
      text: 'External links reduce reach by ~80%. Consider: screenshot + context, or quote the key point',
      priority: 'high',
    });
    return suggestions;
  }

  if (isMostlyLink) {
    suggestions.push({
      type: 'warning',
      category: '⚠️ Low Value',
      text: 'Post is mostly a link with minimal context. Add your take, a question, or key insight from the content.',
      priority: 'high',
    });
  }

  // Check for actual content quality
  const hasQuestion = text.includes('?');
  const hasOpinion = /\b(i think|i believe|unpopular opinion|hot take|my take|imo|imho)\b/gi.test(text);
  const hasValue = textWithoutUrls.length >= 100;
  const hasEngagementHook = /\b(what do you think|thoughts\??|agree\??|disagree\??|change my mind)\b/gi.test(text);

  // No question = missing the biggest algorithm boost
  if (!hasQuestion) {
    suggestions.push({
      type: 'improvement',
      category: 'Engagement (13.5x weight)',
      text: 'No question detected. Questions drive replies - the highest weighted signal in the algorithm.',
      priority: 'high',
    });
  }

  // Short content warning
  if (textWithoutUrls.length < 50 && textWithoutUrls.length > 0) {
    suggestions.push({
      type: 'warning',
      category: 'Content Length',
      text: `Only ${textWithoutUrls.length} chars of actual content. Aim for 100-280 for optimal dwell time.`,
      priority: 'high',
    });
  }

  // External links warning
  if (urls.length > 0) {
    suggestions.push({
      type: 'warning',
      category: 'External Link Detected',
      text: 'Links to external sites reduce reach. X wants users to stay on platform. Add substantial native content.',
      priority: 'medium',
    });
  }

  // No opinion/personality
  if (!hasOpinion && !hasEngagementHook && textWithoutUrls.length > 20) {
    suggestions.push({
      type: 'tip',
      category: 'Personality',
      text: 'Add your opinion or perspective. Personal takes outperform neutral sharing.',
      priority: 'medium',
    });
  }

  // Excessive caps
  const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.replace(/\s/g, '').length, 1);
  if (capsRatio > 0.5 && text.length > 20) {
    suggestions.push({
      type: 'warning',
      category: 'Formatting',
      text: 'Too many caps looks spammy. The algorithm may flag this.',
      priority: 'high',
    });
  }

  // Hashtag analysis
  const hashtags = text.match(/#\w+/g) || [];
  if (hashtags.length > 3) {
    suggestions.push({
      type: 'warning',
      category: 'Hashtags',
      text: `${hashtags.length} hashtags is too many. 1-3 is optimal. More looks spammy.`,
      priority: 'high',
    });
  }

  // Author diversity warning
  if (authorDiversity.score < 60) {
    suggestions.push({
      type: 'warning',
      category: 'Posting Frequency',
      text: 'You\'ve posted recently. AuthorDiversityDropper limits same-author posts. Wait 3-4 hours.',
      priority: 'high',
    });
  }

  // Filter risk
  if (filterRisk.score < 70) {
    const mutedTerms = ['crypto', 'nft', 'web3', 'airdrop', 'giveaway', 'dm me'];
    const found = mutedTerms.filter(term => text.toLowerCase().includes(term));
    if (found.length > 0) {
      suggestions.push({
        type: 'warning',
        category: 'Muted Terms',
        text: `Contains commonly muted terms: ${found.join(', ')}. Many users filter these.`,
        priority: 'high',
      });
    }
  }

  // Positive suggestions only if actually deserved
  const overallQuality = engagement.score + dwellTime.score + reach.score;
  if (suggestions.length === 0 && overallQuality > 180 && hasQuestion && hasValue) {
    suggestions.push({
      type: 'tip',
      category: '✓ Strong Post',
      text: 'Good structure: has a question, substantial content, and engagement hooks.',
      priority: 'low',
    });
  } else if (suggestions.length === 0) {
    // Default - there's always room to improve
    if (!hasQuestion) {
      suggestions.push({
        type: 'tip',
        category: 'Optimization',
        text: 'Consider adding a question to maximize the 13.5x reply weight.',
        priority: 'medium',
      });
    }
    if (!hasEngagementHook) {
      suggestions.push({
        type: 'tip',
        category: 'Optimization',
        text: 'Add a call-to-action like "thoughts?" or "what do you think?" to boost engagement.',
        priority: 'medium',
      });
    }
  }

  // Always have at least one suggestion
  if (suggestions.length === 0) {
    suggestions.push({
      type: 'tip',
      category: 'Good Start',
      text: 'Solid foundation. Consider adding a question or controversial take to maximize algorithm score.',
      priority: 'low',
    });
  }

  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export {
  calculateEngagementScore,
  calculateRedFlagScore,
  calculateDwellTimeScore,
  calculateAuthorDiversityScore,
  calculateFilterRiskScore,
  calculateReachScore,
};
