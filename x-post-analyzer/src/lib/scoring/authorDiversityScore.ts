import { ScoreResult, ScoreDetail } from '../../types';

/**
 * Calculates author diversity impact
 * Based on X algorithm's AuthorDiversityScorer which applies exponential decay
 * Formula: multiplier = (1 - floor) * decay^position + floor
 * Default: decay=0.5, floor=0.1
 */

const DECAY_FACTOR = 0.5;
const FLOOR = 0.1;

export function calculateAuthorDiversityScore(
  recentPostCount: number = 0,
  hoursSinceLastPost: number = 24
): ScoreResult {
  const details: ScoreDetail[] = [];
  let score = 100; // Start at 100 (no penalty)

  // Calculate effective position (how many posts in recent window)
  const postsIn24Hours = recentPostCount;

  if (postsIn24Hours === 0) {
    details.push({
      factor: 'First Post',
      impact: 'positive',
      description: 'No recent posts - maximum visibility (+0)',
      weight: 0
    });
  } else {
    // Apply exponential decay formula from X algorithm
    // Each additional post reduces the multiplier
    const multiplier = (1 - FLOOR) * Math.pow(DECAY_FACTOR, postsIn24Hours) + FLOOR;
    const penalty = Math.round((1 - multiplier) * 50); // Convert to score penalty
    
    score -= penalty;
    
    if (postsIn24Hours <= 3) {
      details.push({
        factor: 'Moderate Posting',
        impact: 'neutral',
        description: `${postsIn24Hours} recent post(s) - ${Math.round(multiplier * 100)}% visibility (-${penalty})`,
        weight: -penalty
      });
    } else if (postsIn24Hours <= 6) {
      details.push({
        factor: 'Frequent Posting',
        impact: 'negative',
        description: `${postsIn24Hours} recent posts significantly reduces reach (-${penalty})`,
        weight: -penalty
      });
    } else {
      details.push({
        factor: 'Over-Posting',
        impact: 'negative',
        description: `${postsIn24Hours} posts in 24h - severe diversity penalty (-${penalty})`,
        weight: -penalty
      });
    }
  }

  // Time since last post bonus
  if (hoursSinceLastPost >= 4 && hoursSinceLastPost < 24) {
    const boost = Math.min(Math.round(hoursSinceLastPost / 2), 10);
    score += boost;
    details.push({
      factor: 'Post Spacing',
      impact: 'positive',
      description: `${hoursSinceLastPost}h since last post - good spacing (+${boost})`,
      weight: boost
    });
  } else if (hoursSinceLastPost >= 24) {
    const boost = 15;
    score += boost;
    details.push({
      factor: 'Fresh Return',
      impact: 'positive',
      description: '24h+ break resets diversity penalty (+15)',
      weight: boost
    });
  } else if (hoursSinceLastPost < 1) {
    const penalty = -10;
    score += penalty;
    details.push({
      factor: 'Rapid Posting',
      impact: 'negative',
      description: 'Posting within 1 hour of last post (-10)',
      weight: penalty
    });
  }

  // Optimal posting cadence recommendation
  if (postsIn24Hours > 10) {
    details.push({
      factor: 'Recommendation',
      impact: 'neutral',
      description: 'Consider spacing posts 3-4 hours apart for better reach',
      weight: 0
    });
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    grade: getGrade(score),
    label: 'Author Diversity',
    description: 'Impact of your posting frequency on visibility',
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
