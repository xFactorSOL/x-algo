export interface User {
  id: string;
  username: string;
  name: string;
  profileImageUrl: string;
  followersCount: number;
  followingCount: number;
  recentPostsCount: number; // Posts in last 24h for diversity calculation
  lastPostTimestamp?: number;
}

export interface Post {
  id: string;
  text: string;
  authorId: string;
  authorUsername: string;
  authorName: string;
  authorProfileImageUrl?: string;
  authorFollowersCount?: number;
  createdAt: string;
  metrics?: {
    likeCount: number;
    replyCount: number;
    retweetCount: number;
    quoteCount: number;
    impressionCount: number;
  };
  hasMedia?: boolean;
  hasLinks?: boolean;
  hashtags?: string[];
  mentions?: string[];
}

export interface ScoreResult {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  label: string;
  description: string;
  color: string;
  details: ScoreDetail[];
}

export interface ScoreDetail {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  weight: number;
}

export interface AnalysisResult {
  overallScore: number;
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  engagement: ScoreResult;
  redFlags: ScoreResult;
  dwellTime: ScoreResult;
  authorDiversity: ScoreResult;
  filterRisk: ScoreResult;
  reach: ScoreResult;
  suggestions: Suggestion[];
}

export interface Suggestion {
  type: 'improvement' | 'warning' | 'tip';
  category: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}
