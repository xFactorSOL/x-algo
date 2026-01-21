import { ScoreResult, ScoreDetail } from '../../types';

/**
 * Analyzes content for dwell time optimization
 * Based on X algorithm's: P(dwell) and continuous dwell_time prediction
 */
export function calculateDwellTimeScore(text: string): ScoreResult {
  const details: ScoreDetail[] = [];
  let score = 50; // Base score

  const charCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const lineCount = text.split('\n').filter(l => l.trim().length > 0).length;

  // 1. Optimal length analysis (sweet spot: 100-280 characters)
  if (charCount >= 100 && charCount <= 280) {
    const boost = 15;
    score += boost;
    details.push({
      factor: 'Optimal Length',
      impact: 'positive',
      description: `${charCount} characters is in the sweet spot (+${boost})`,
      weight: boost
    });
  } else if (charCount < 50) {
    const penalty = -15;
    score += penalty;
    details.push({
      factor: 'Too Short',
      impact: 'negative',
      description: `${charCount} characters may not hold attention (${penalty})`,
      weight: penalty
    });
  } else if (charCount > 280) {
    // Longer posts can still be good if well-structured
    const boost = charCount > 500 ? 5 : 10;
    score += boost;
    details.push({
      factor: 'Extended Content',
      impact: 'positive',
      description: `Long-form content gets more dwell time (+${boost})`,
      weight: boost
    });
  }

  // 2. Line breaks improve readability and dwell
  if (lineCount > 1) {
    const boost = Math.min(lineCount * 3, 12);
    score += boost;
    details.push({
      factor: 'Line Breaks',
      impact: 'positive',
      description: `${lineCount} lines improve readability (+${boost})`,
      weight: boost
    });
  }

  // 3. Hook analysis (first line strength)
  const firstLine = text.split('\n')[0].trim();
  const hookPatterns = [
    /^(here's|here is|this is|breaking|just|wow|wait|stop|attention)/i,
    /^[A-Z][^.!?]*[?]/, // Opens with a question
    /^\d+/, // Opens with a number
    /^["'"']/, // Opens with a quote
  ];
  
  const hasStrongHook = hookPatterns.some(p => p.test(firstLine));
  if (hasStrongHook && firstLine.length > 10) {
    const boost = 10;
    score += boost;
    details.push({
      factor: 'Strong Hook',
      impact: 'positive',
      description: 'Opening line captures attention (+10)',
      weight: boost
    });
  }

  // 4. Readability (average word length)
  const avgWordLength = charCount / Math.max(wordCount, 1);
  if (avgWordLength >= 4 && avgWordLength <= 6) {
    const boost = 8;
    score += boost;
    details.push({
      factor: 'Good Readability',
      impact: 'positive',
      description: 'Easy to read vocabulary (+8)',
      weight: boost
    });
  } else if (avgWordLength > 8) {
    const penalty = -5;
    score += penalty;
    details.push({
      factor: 'Complex Words',
      impact: 'negative',
      description: 'Complex vocabulary may reduce dwell (-5)',
      weight: penalty
    });
  }

  // 5. Curiosity gap / cliffhangers
  const curiosityPatterns = [
    /\b(but|however|here's the thing|here's why|the result|what happened next)\b/gi,
    /\.\.\.$/, // Ends with ellipsis
    /👇|⬇️|↓/, // Points to more content
  ];
  
  const hasCuriosityGap = curiosityPatterns.some(p => p.test(text));
  if (hasCuriosityGap) {
    const boost = 8;
    score += boost;
    details.push({
      factor: 'Curiosity Gap',
      impact: 'positive',
      description: 'Creates anticipation for more (+8)',
      weight: boost
    });
  }

  // 6. Emojis in moderation improve scanning
  const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
  if (emojiCount >= 1 && emojiCount <= 3) {
    const boost = 5;
    score += boost;
    details.push({
      factor: 'Strategic Emojis',
      impact: 'positive',
      description: `${emojiCount} emoji(s) add visual interest (+${boost})`,
      weight: boost
    });
  }

  // 7. Quote or data points
  const hasQuote = /["'"'][^"'"']{10,}["'"']/.test(text);
  const hasStats = /\b\d+%|\b\d+x\b|\$\d+/.test(text);
  if (hasQuote || hasStats) {
    const boost = 7;
    score += boost;
    details.push({
      factor: 'Data/Quotes',
      impact: 'positive',
      description: 'Concrete data increases credibility (+7)',
      weight: boost
    });
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    grade: getGrade(score),
    label: 'Dwell Time',
    description: 'How long users will spend reading your post',
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
