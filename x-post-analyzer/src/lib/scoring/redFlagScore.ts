import { ScoreResult, ScoreDetail } from '../../types';

/**
 * Detects content that may trigger negative signals
 * Based on X algorithm's: P(not_interested), P(block_author), P(mute_author), P(report)
 */
export function calculateRedFlagScore(text: string): ScoreResult {
  const details: ScoreDetail[] = [];
  let score = 100; // Start at 100 (no red flags), decrease for issues

  // 1. Excessive caps (shouting)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1);
  if (capsRatio > 0.5 && text.length > 10) {
    const penalty = -20;
    score += penalty;
    details.push({
      factor: 'Excessive Caps',
      impact: 'negative',
      description: `${Math.round(capsRatio * 100)}% caps appears aggressive (${penalty})`,
      weight: penalty
    });
  }

  // 2. Excessive hashtags (spam indicator)
  const hashtags = text.match(/#\w+/g) || [];
  if (hashtags.length > 5) {
    const penalty = -15;
    score += penalty;
    details.push({
      factor: 'Too Many Hashtags',
      impact: 'negative',
      description: `${hashtags.length} hashtags looks spammy (${penalty})`,
      weight: penalty
    });
  } else if (hashtags.length > 3) {
    const penalty = -5;
    score += penalty;
    details.push({
      factor: 'Many Hashtags',
      impact: 'negative',
      description: `${hashtags.length} hashtags may reduce reach (${penalty})`,
      weight: penalty
    });
  }

  // 3. Excessive links
  const links = text.match(/https?:\/\/\S+/g) || [];
  if (links.length > 2) {
    const penalty = -15;
    score += penalty;
    details.push({
      factor: 'Multiple Links',
      impact: 'negative',
      description: `${links.length} links may trigger spam filters (${penalty})`,
      weight: penalty
    });
  }

  // 4. Repeated punctuation (spam/excitement indicator)
  const repeatedPunctuation = text.match(/[!?]{3,}/g) || [];
  if (repeatedPunctuation.length > 0) {
    const penalty = -10;
    score += penalty;
    details.push({
      factor: 'Excessive Punctuation',
      impact: 'negative',
      description: `Multiple !!! or ??? appears unprofessional (${penalty})`,
      weight: penalty
    });
  }

  // 5. Crypto/financial spam patterns
  const cryptoSpam = /\b(guaranteed returns|100x|1000x|get rich|free money|airdrop|giveaway.*follow.*retweet|dm me for|send.*receive)\b/gi;
  if (cryptoSpam.test(text)) {
    const penalty = -25;
    score += penalty;
    details.push({
      factor: 'Spam Pattern',
      impact: 'negative',
      description: `Contains financial spam-like language (${penalty})`,
      weight: penalty
    });
  }

  // 6. Engagement bait patterns
  const engagementBait = /\b(follow for follow|f4f|like for like|l4l|follow back|followback)\b/gi;
  if (engagementBait.test(text)) {
    const penalty = -20;
    score += penalty;
    details.push({
      factor: 'Engagement Bait',
      impact: 'negative',
      description: `Follow-for-follow patterns are penalized (${penalty})`,
      weight: penalty
    });
  }

  // 7. Potentially divisive content (higher block/mute risk)
  const divisivePatterns = /\b(idiots?|morons?|stupid people|you('re| are) wrong|wake up sheeple)\b/gi;
  if (divisivePatterns.test(text)) {
    const penalty = -15;
    score += penalty;
    details.push({
      factor: 'Divisive Language',
      impact: 'negative',
      description: `Insulting language increases block/mute risk (${penalty})`,
      weight: penalty
    });
  }

  // 8. All-emoji posts
  const emojiRatio = (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length / Math.max(text.length, 1);
  if (emojiRatio > 0.5 && text.length > 5) {
    const penalty = -10;
    score += penalty;
    details.push({
      factor: 'Too Many Emojis',
      impact: 'negative',
      description: `Emoji-heavy posts may be seen as low quality (${penalty})`,
      weight: penalty
    });
  }

  // Positive: Clean, professional content
  if (details.length === 0) {
    details.push({
      factor: 'Clean Content',
      impact: 'positive',
      description: 'No spam or red flag patterns detected',
      weight: 0
    });
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    grade: getGrade(score),
    label: 'Red Flag Risk',
    description: 'Risk of triggering block, mute, or report actions',
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
