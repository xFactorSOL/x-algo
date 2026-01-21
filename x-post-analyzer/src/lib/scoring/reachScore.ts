import { ScoreResult, ScoreDetail } from '../../types';

/**
 * Estimates in-network vs out-of-network reach potential
 * Based on X algorithm's Phoenix Retrieval (OON) and Thunder (In-Network) sources
 */
export function calculateReachScore(
  text: string,
  followerCount: number = 1000
): ScoreResult {
  const details: ScoreDetail[] = [];
  let inNetworkScore = 50;
  let outOfNetworkScore = 50;

  // === IN-NETWORK FACTORS ===
  
  // 1. Recency is key for in-network (Thunder prioritizes recent posts)
  // This is always max for new posts
  inNetworkScore += 15;
  details.push({
    factor: 'Recency Boost',
    impact: 'positive',
    description: 'New posts get priority in follower feeds (+15 in-network)',
    weight: 15
  });

  // 2. Replies to followers (conversation context)
  const hasMentions = /@\w+/.test(text);
  if (hasMentions) {
    inNetworkScore += 10;
    details.push({
      factor: 'Conversation',
      impact: 'positive',
      description: 'Mentions boost in-network visibility (+10)',
      weight: 10
    });
  }

  // === OUT-OF-NETWORK FACTORS ===

  // 1. Topic relevance (broader appeal)
  const broadTopics = [
    /\b(ai|artificial intelligence|chatgpt|gpt|machine learning)\b/gi,
    /\b(startup|entrepreneur|business|leadership)\b/gi,
    /\b(breaking|news|announced|released|launched)\b/gi,
    /\b(how to|guide|tutorial|tips|learn)\b/gi,
  ];
  
  let topicMatches = 0;
  broadTopics.forEach(pattern => {
    if (pattern.test(text)) topicMatches++;
  });

  if (topicMatches > 0) {
    const boost = Math.min(topicMatches * 10, 25);
    outOfNetworkScore += boost;
    details.push({
      factor: 'Trending Topics',
      impact: 'positive',
      description: `${topicMatches} popular topic(s) increase discovery (+${boost} OON)`,
      weight: boost
    });
  }

  // 2. Hashtags help discovery (moderate use)
  const hashtags = text.match(/#\w+/g) || [];
  if (hashtags.length >= 1 && hashtags.length <= 3) {
    const boost = 10;
    outOfNetworkScore += boost;
    details.push({
      factor: 'Strategic Hashtags',
      impact: 'positive',
      description: `${hashtags.length} hashtag(s) help discovery (+${boost} OON)`,
      weight: boost
    });
  }

  // 3. Engaging content format (more likely to be retrieved)
  const engagingFormat = [
    /\?/, // Questions
    /\b(thread|🧵)\b/gi, // Threads
    /\b\d+\s*(tips|ways|things|lessons)\b/gi, // Lists
  ];
  
  let formatBonus = 0;
  engagingFormat.forEach(pattern => {
    if (pattern.test(text)) formatBonus += 5;
  });

  if (formatBonus > 0) {
    outOfNetworkScore += formatBonus;
    details.push({
      factor: 'Engaging Format',
      impact: 'positive',
      description: `Content format increases retrieval likelihood (+${formatBonus} OON)`,
      weight: formatBonus
    });
  }

  // 4. Quote tweets extend reach
  // (Can't detect from text alone, but mention the concept)

  // 5. Follower count affects OON retrieval
  if (followerCount > 10000) {
    const boost = 15;
    outOfNetworkScore += boost;
    details.push({
      factor: 'Authority Signal',
      impact: 'positive',
      description: 'Large following increases OON retrieval (+15)',
      weight: boost
    });
  } else if (followerCount > 1000) {
    const boost = 8;
    outOfNetworkScore += boost;
    details.push({
      factor: 'Growing Authority',
      impact: 'positive',
      description: 'Established following helps discovery (+8)',
      weight: boost
    });
  }

  // 6. Personal/niche content stays more in-network
  const personalPatterns = /\b(my|i'm|i am|i've|i have|just|today i)\b/gi;
  const personalCount = (text.match(personalPatterns) || []).length;
  if (personalCount > 3) {
    const penalty = -10;
    outOfNetworkScore += penalty;
    inNetworkScore += 5; // But it resonates with followers
    details.push({
      factor: 'Personal Content',
      impact: 'neutral',
      description: 'Personal posts favor in-network over discovery (+5 IN, -10 OON)',
      weight: 0
    });
  }

  // Calculate combined score (weighted average)
  // OON has higher potential reach but is harder to achieve
  inNetworkScore = Math.max(0, Math.min(100, inNetworkScore));
  outOfNetworkScore = Math.max(0, Math.min(100, outOfNetworkScore));
  
  const combinedScore = Math.round(inNetworkScore * 0.4 + outOfNetworkScore * 0.6);

  // Add summary detail
  details.unshift({
    factor: 'Reach Summary',
    impact: 'neutral',
    description: `In-Network: ${inNetworkScore}% | Out-of-Network: ${outOfNetworkScore}%`,
    weight: 0
  });

  return {
    score: combinedScore,
    grade: getGrade(combinedScore),
    label: 'Reach Potential',
    description: 'Estimated visibility to followers vs new audiences',
    color: getColor(combinedScore),
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
