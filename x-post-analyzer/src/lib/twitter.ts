import { User, Post } from '../types';

// X API Configuration
// Users need to set up their own X Developer App and provide credentials
const X_API_BASE = 'https://api.twitter.com/2';

export interface XAuthConfig {
  clientId: string;
  redirectUri: string;
}

export interface XTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

/**
 * Generate OAuth 2.0 PKCE challenge for X authentication
 */
export function generatePKCEChallenge(): { verifier: string; challenge: string } {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const verifier = base64URLEncode(array);
  
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
    .then(hash => ({
      verifier,
      challenge: base64URLEncode(new Uint8Array(hash))
    })) as unknown as { verifier: string; challenge: string };
}

function base64URLEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Build X OAuth authorization URL
 */
export function buildAuthUrl(
  clientId: string,
  redirectUri: string,
  codeChallenge: string,
  state: string
): string {
  const scopes = [
    'tweet.read',
    'users.read',
    'follows.read',
    'offline.access'
  ].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  redirectUri: string,
  codeVerifier: string
): Promise<XTokenResponse> {
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  return response.json();
}

/**
 * Fetch authenticated user's profile
 */
export async function fetchCurrentUser(accessToken: string): Promise<User> {
  const response = await fetch(`${X_API_BASE}/users/me?user.fields=profile_image_url,public_metrics`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  const data = await response.json();
  const user = data.data;

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    profileImageUrl: user.profile_image_url || '',
    followersCount: user.public_metrics?.followers_count || 0,
    followingCount: user.public_metrics?.following_count || 0,
    recentPostsCount: 0, // Will be fetched separately
    lastPostTimestamp: undefined,
  };
}

/**
 * Fetch user's recent posts to calculate diversity score
 */
export async function fetchUserRecentPosts(
  accessToken: string,
  userId: string
): Promise<{ count: number; lastPostTimestamp?: number }> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const params = new URLSearchParams({
    'start_time': oneDayAgo,
    'max_results': '100',
    'tweet.fields': 'created_at',
  });

  const response = await fetch(`${X_API_BASE}/users/${userId}/tweets?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error('Failed to fetch recent posts');
    return { count: 0 };
  }

  const data = await response.json();
  const tweets = data.data || [];

  let lastPostTimestamp: number | undefined;
  if (tweets.length > 0) {
    lastPostTimestamp = new Date(tweets[0].created_at).getTime();
  }

  return {
    count: tweets.length,
    lastPostTimestamp,
  };
}

/**
 * Fetch a specific post by ID (extracted from URL)
 */
export async function fetchPostById(
  accessToken: string,
  postId: string
): Promise<Post | null> {
  const params = new URLSearchParams({
    'tweet.fields': 'created_at,public_metrics,entities,author_id',
    'expansions': 'author_id',
    'user.fields': 'name,username,profile_image_url,public_metrics',
  });

  const response = await fetch(`${X_API_BASE}/tweets/${postId}?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error('Failed to fetch post');
    return null;
  }

  const data = await response.json();
  const tweet = data.data;
  const author = data.includes?.users?.[0];

  if (!tweet) return null;

  return {
    id: tweet.id,
    text: tweet.text,
    authorId: tweet.author_id,
    authorUsername: author?.username || '',
    authorName: author?.name || '',
    authorProfileImageUrl: author?.profile_image_url,
    authorFollowersCount: author?.public_metrics?.followers_count,
    createdAt: tweet.created_at,
    metrics: tweet.public_metrics ? {
      likeCount: tweet.public_metrics.like_count,
      replyCount: tweet.public_metrics.reply_count,
      retweetCount: tweet.public_metrics.retweet_count,
      quoteCount: tweet.public_metrics.quote_count,
      impressionCount: tweet.public_metrics.impression_count || 0,
    } : undefined,
    hasMedia: tweet.entities?.urls?.some((u: { expanded_url: string }) => 
      u.expanded_url?.includes('pic.twitter.com') || 
      u.expanded_url?.includes('video.twimg.com')
    ),
    hasLinks: tweet.entities?.urls?.length > 0,
    hashtags: tweet.entities?.hashtags?.map((h: { tag: string }) => h.tag) || [],
    mentions: tweet.entities?.mentions?.map((m: { username: string }) => m.username) || [],
  };
}

/**
 * Extract post ID from X URL
 */
export function extractPostId(url: string): string | null {
  // Handle various X/Twitter URL formats
  const patterns = [
    /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
    /\/status\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  // If it's just a number, assume it's a post ID
  if (/^\d+$/.test(url.trim())) {
    return url.trim();
  }

  return null;
}

// Storage helpers
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'x_access_token',
  REFRESH_TOKEN: 'x_refresh_token',
  USER: 'x_user',
  CODE_VERIFIER: 'x_code_verifier',
};

export function saveTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function saveUser(user: User): void {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function getStoredUser(): User | null {
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  return stored ? JSON.parse(stored) : null;
}

export function saveCodeVerifier(verifier: string): void {
  localStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, verifier);
}

export function getCodeVerifier(): string | null {
  return localStorage.getItem(STORAGE_KEYS.CODE_VERIFIER);
}

export function clearAuth(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
