import { ScoreResult, ScoreDetail } from '../../types';

/**
 * Analyzes risk of being filtered out
 * Based on X algorithm filters: Age, Duplicates, MutedKeyword, VF (visibility filtering)
 */

// Common muted keyword patterns
const COMMONLY_MUTED_PATTERNS = [
  /\b(crypto|nft|web3|blockchain|token)\b/gi,
  /\b(forex|trading signals|investment advice)\b/gi,
  /\b(dm me|link in bio|check bio)\b/gi,
  /\b(onlyfans|of link|fansly)\b/gi,
  /\b(giveaway|contest|raffle)\b/gi,
];

export function calculateFilterRiskScore(text: string): ScoreResult {
  const details: ScoreDetail[] = [];
  let score = 100; // Start at 100 (low risk), decrease for issues

  // 1. Commonly muted keyword patterns
  let mutedKeywordMatches = 0;
  COMMONLY_MUTED_PATTERNS.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) mutedKeywordMatches += matches.length;
  });

  if (mutedKeywordMatches > 0) {
    const penalty = Math.min(mutedKeywordMatches * 10, 30);
    score -= penalty;
    details.push({
      factor: 'Commonly Muted Terms',
      impact: 'negative',
      description: `Contains ${mutedKeywordMatches} term(s) users often mute (-${penalty})`,
      weight: -penalty
    });
  }

  // 2. Excessive hashtags (filter trigger)
  const hashtags = text.match(/#\w+/g) || [];
  if (hashtags.length > 10) {
    const penalty = 25;
    score -= penalty;
    details.push({
      factor: 'Hashtag Spam',
      impact: 'negative',
      description: `${hashtags.length} hashtags may trigger spam filters (-${penalty})`,
      weight: -penalty
    });
  }

  // 3. Link shorteners (often filtered)
  const shortenerPatterns = /\b(bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|buff\.ly)\b/gi;
  if (shortenerPatterns.test(text)) {
    const penalty = 15;
    score -= penalty;
    details.push({
      factor: 'Link Shorteners',
      impact: 'negative',
      description: 'Shortened links may be flagged as suspicious (-15)',
      weight: -penalty
    });
  }

  // 4. Duplicate content indicators
  const duplicatePatterns = [
    /copy.*paste/gi,
    /\[thread\].*\[thread\]/gi,
  ];
  const hasDuplicateIndicators = duplicatePatterns.some(p => p.test(text));
  if (hasDuplicateIndicators) {
    const penalty = 10;
    score -= penalty;
    details.push({
      factor: 'Duplicate Risk',
      impact: 'negative',
      description: 'Content may be flagged as duplicate (-10)',
      weight: -penalty
    });
  }

  // 5. Potential VF (Visibility Filtering) triggers
  const vfTriggerPatterns = [
    /\b(kill|death threat|bomb|attack)\b/gi, // Violence indicators
    /\b(nude|naked|xxx|porn)\b/gi, // Adult content
  ];
  
  let vfTriggers = 0;
  vfTriggerPatterns.forEach(pattern => {
    if (pattern.test(text)) vfTriggers++;
  });

  if (vfTriggers > 0) {
    const penalty = vfTriggers * 20;
    score -= penalty;
    details.push({
      factor: 'Content Warning',
      impact: 'negative',
      description: `Contains ${vfTriggers} term(s) that may trigger visibility restrictions (-${penalty})`,
      weight: -penalty
    });
  }

  // 6. Pure promotional content
  const promoPatterns = [
    /\b(buy now|shop now|order now|limited time|discount code|promo code|use code)\b/gi,
    /\b(sale|% off|free shipping)\b/gi,
  ];
  
  let promoCount = 0;
  promoPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) promoCount += matches.length;
  });

  if (promoCount > 2) {
    const penalty = 15;
    score -= penalty;
    details.push({
      factor: 'Heavy Promotion',
      impact: 'negative',
      description: 'Overly promotional content gets reduced reach (-15)',
      weight: -penalty
    });
  }

  // 7. External platform mentions
  const platformPatterns = /\b(youtube|instagram|tiktok|facebook|telegram|discord)\b/gi;
  const platformMatches = text.match(platformPatterns) || [];
  if (platformMatches.length > 1) {
    const penalty = 10;
    score -= penalty;
    details.push({
      factor: 'External Platforms',
      impact: 'negative',
      description: 'Multiple external platform mentions may reduce reach (-10)',
      weight: -penalty
    });
  }

  // Positive: Clean content
  if (details.length === 0) {
    details.push({
      factor: 'Low Filter Risk',
      impact: 'positive',
      description: 'No common filter triggers detected',
      weight: 0
    });
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    grade: getGrade(score),
    label: 'Filter Risk',
    description: 'Risk of being filtered or having reduced visibility',
    color: getColor(score),
    details
  };
}

function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function getColor(score: number): string {
  if (score >= 85) return '#00ba7c';
  if (score >= 70) return '#1d9bf0';
  if (score >= 55) return '#ffd400';
  if (score >= 40) return '#ff7a00';
  return '#f4212e';
}
