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

  // Engagement suggestions
  if (engagement.score < 60) {
    if (!(text.includes('?'))) {
      suggestions.push({
        type: 'improvement',
        category: 'Engagement',
        text: 'Add a question to encourage replies and discussion',
        priority: 'high',
      });
    }
    if (!(/\b(thread|🧵)\b/i.test(text)) && text.length > 200) {
      suggestions.push({
        type: 'tip',
        category: 'Engagement',
        text: 'Consider making this a thread for better engagement',
        priority: 'medium',
      });
    }
  }

  // Red flag warnings
  if (redFlags.score < 70) {
    const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1);
    if (capsRatio > 0.5) {
      suggestions.push({
        type: 'warning',
        category: 'Red Flags',
        text: 'Reduce excessive caps - it appears aggressive and may be flagged',
        priority: 'high',
      });
    }
    const hashtags = text.match(/#\w+/g) || [];
    if (hashtags.length > 5) {
      suggestions.push({
        type: 'warning',
        category: 'Red Flags',
        text: `Remove some hashtags (currently ${hashtags.length}). 2-3 is optimal`,
        priority: 'high',
      });
    }
  }

  // Dwell time suggestions
  if (dwellTime.score < 60) {
    if (text.length < 50) {
      suggestions.push({
        type: 'improvement',
        category: 'Dwell Time',
        text: 'Expand your post - longer content gets more attention (aim for 100-280 chars)',
        priority: 'medium',
      });
    }
    if (!text.includes('\n') && text.length > 100) {
      suggestions.push({
        type: 'tip',
        category: 'Dwell Time',
        text: 'Add line breaks to improve readability',
        priority: 'medium',
      });
    }
  }

  // Author diversity suggestions
  if (authorDiversity.score < 60) {
    suggestions.push({
      type: 'warning',
      category: 'Posting Frequency',
      text: 'You\'ve posted frequently. Space out posts by 3-4 hours for better reach',
      priority: 'high',
    });
  }

  // Filter risk suggestions
  if (filterRisk.score < 70) {
    if (/\b(crypto|nft|giveaway)\b/gi.test(text)) {
      suggestions.push({
        type: 'warning',
        category: 'Filter Risk',
        text: 'Content contains commonly muted terms. Consider rephrasing',
        priority: 'medium',
      });
    }
  }

  // Reach suggestions
  if (reach.score < 60) {
    const hashtags = text.match(/#\w+/g) || [];
    if (hashtags.length === 0) {
      suggestions.push({
        type: 'improvement',
        category: 'Reach',
        text: 'Add 1-3 relevant hashtags to improve discoverability',
        priority: 'medium',
      });
    }
  }

  // Positive reinforcement
  if (suggestions.length === 0) {
    suggestions.push({
      type: 'tip',
      category: 'Great Post!',
      text: 'Your post looks well-optimized for the algorithm. Good job!',
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
