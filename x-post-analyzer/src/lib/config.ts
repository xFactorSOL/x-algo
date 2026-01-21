// X API Configuration
// These values come from environment variables set in Vercel

export const X_CONFIG = {
  clientId: import.meta.env.VITE_X_CLIENT_ID || '',
  
  // Auto-detect redirect URI based on current host
  get redirectUri(): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/callback`;
    }
    return import.meta.env.VITE_X_REDIRECT_URI || 'http://localhost:3000/callback';
  },
  
  // Check if real X API is configured
  get isConfigured(): boolean {
    return Boolean(this.clientId && this.clientId.length > 10);
  }
};

// Scopes we request from X API
export const X_SCOPES = [
  'tweet.read',      // Read tweets
  'users.read',      // Read user profile
  'follows.read',    // Read following list
  'offline.access',  // Refresh tokens
];
