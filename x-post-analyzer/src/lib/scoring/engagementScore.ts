import { ScoreResult, ScoreDetail } from '../../types';

/**
 * Analyzes post content for engagement potential
 * Based on X algorithm's prediction of: P(favorite), P(reply), P(repost), P(quote), P(share)
 */
export function calculateEngagementScore(text: string): ScoreResult {
  const details: ScoreDetail[] = [];
  let score = 50; // Base score

  // 1. Questions boost replies
  const questionCount = (text.match(/\?/g) || []).length;
  if (questionCount > 0) {
    const boost = Math.min(questionCount * 8, 20);
    score += boost;
    details.push({
      factor: 'Questions',
      impact: 'positive',
      description: `${questionCount} question(s) encourage replies (+${boost})`,
      weight: boost
    });
  }

  // 2. Call-to-actions boost engagement
  const ctaPatterns = [
    /\b(share|repost|rt|spread)\b/gi,
    /\b(what do you think|thoughts\??|agree\??|disagree\??)\b/gi,
    /\b(reply|comment|let me know|tell me)\b/gi,
    /\b(follow|subscribe)\b/gi,
    /\b(like if|rt if|repost if)\b/gi,
  ];
  
  let ctaCount = 0;
  ctaPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) ctaCount += matches.length;
  });
  
  if (ctaCount > 0) {
    const boost = Math.min(ctaCount * 5, 15);
    score += boost;
    details.push({
      factor: 'Call-to-Action',
      impact: 'positive',
      description: `Contains engagement prompts (+${boost})`,
      weight: boost
    });
  }

  // 3. Emotional/opinion content drives engagement
  const emotionalPatterns = [
    /\b(love|hate|amazing|terrible|incredible|awful|best|worst)\b/gi,
    /\b(unpopular opinion|hot take|controversial)\b/gi,
    /\b(breaking|urgent|important|must see)\b/gi,
  ];
  
  let emotionalCount = 0;
  emotionalPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) emotionalCount += matches.length;
  });
  
  if (emotionalCount > 0) {
    const boost = Math.min(emotionalCount * 6, 15);
    score += boost;
    details.push({
      factor: 'Emotional Language',
      impact: 'positive',
      description: `Strong emotional words boost engagement (+${boost})`,
      weight: boost
    });
  }

  // 4. Mentions can boost reach
  const mentions = text.match(/@\w+/g) || [];
  if (mentions.length > 0 && mentions.length <= 3) {
    const boost = mentions.length * 3;
    score += boost;
    details.push({
      factor: 'Mentions',
      impact: 'positive',
      description: `${mentions.length} mention(s) can increase visibility (+${boost})`,
      weight: boost
    });
  } else if (mentions.length > 3) {
    const penalty = -5;
    score += penalty;
    details.push({
      factor: 'Too Many Mentions',
      impact: 'negative',
      description: `${mentions.length} mentions may appear spammy (${penalty})`,
      weight: penalty
    });
  }

  // 5. Thread indicators
  const threadIndicators = /\b(thread|🧵|1\/|1\)|a thread)\b/gi;
  if (threadIndicators.test(text)) {
    score += 10;
    details.push({
      factor: 'Thread Format',
      impact: 'positive',
      description: 'Threads get higher engagement (+10)',
      weight: 10
    });
  }

  // 6. Numbers and lists perform well
  const hasNumbers = /\b\d+\s*(ways|tips|things|reasons|steps|lessons)\b/gi.test(text);
  if (hasNumbers) {
    score += 8;
    details.push({
      factor: 'List Format',
      impact: 'positive',
      description: 'Numbered lists attract attention (+8)',
      weight: 8
    });
  }

  // 7. First-person storytelling
  const storyIndicators = /\b(i learned|i realized|i discovered|story time|true story|my experience)\b/gi;
  if (storyIndicators.test(text)) {
    score += 7;
    details.push({
      factor: 'Personal Story',
      impact: 'positive',
      description: 'Personal narratives drive engagement (+7)',
      weight: 7
    });
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    grade: getGrade(score),
    label: 'Engagement Potential',
    description: 'Likelihood of likes, replies, reposts, and shares',
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
  if (score >= 85) return '#00ba7c'; // Green
  if (score >= 70) return '#1d9bf0'; // Blue
  if (score >= 55) return '#ffd400'; // Yellow
  if (score >= 40) return '#ff7a00'; // Orange
  return '#f4212e'; // Red
}
