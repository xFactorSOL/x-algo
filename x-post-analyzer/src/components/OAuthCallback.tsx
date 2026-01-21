import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { 
  exchangeCodeForToken, 
  fetchCurrentUser, 
  fetchUserRecentPosts,
  saveTokens, 
  saveUser, 
  getCodeVerifier,
  clearAuth
} from '../lib/twitter';
import { X_CONFIG } from '../lib/config';

type CallbackStatus = 'processing' | 'success' | 'error';

interface OAuthCallbackProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function OAuthCallback({ onSuccess, onError }: OAuthCallbackProps) {
  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');

        // Check for errors from X
        if (error) {
          throw new Error(`X returned error: ${error}`);
        }

        // Validate code exists
        if (!code) {
          throw new Error('No authorization code received');
        }

        // Validate state (CSRF protection)
        const savedState = sessionStorage.getItem('oauth_state');
        if (state !== savedState) {
          throw new Error('State mismatch - possible CSRF attack');
        }

        // Get code verifier for PKCE
        const codeVerifier = getCodeVerifier();
        if (!codeVerifier) {
          throw new Error('No code verifier found');
        }

        setMessage('Exchanging code for token...');

        // Exchange code for token
        const tokenResponse = await exchangeCodeForToken(
          code,
          X_CONFIG.clientId,
          X_CONFIG.redirectUri,
          codeVerifier
        );

        // Save tokens
        saveTokens(tokenResponse.access_token, tokenResponse.refresh_token);

        setMessage('Fetching your profile...');

        // Fetch user profile
        const user = await fetchCurrentUser(tokenResponse.access_token);

        // Fetch recent posts for diversity calculation
        const recentPosts = await fetchUserRecentPosts(
          tokenResponse.access_token,
          user.id
        );

        // Update user with recent post data
        user.recentPostsCount = recentPosts.count;
        if (recentPosts.lastPostTimestamp) {
          user.lastPostTimestamp = recentPosts.lastPostTimestamp;
        }

        // Save user
        saveUser(user);

        // Clean up
        sessionStorage.removeItem('oauth_state');

        setStatus('success');
        setMessage('Successfully connected!');

        // Redirect to main app after short delay
        setTimeout(() => {
          onSuccess();
        }, 1500);

      } catch (err) {
        console.error('OAuth callback error:', err);
        clearAuth();
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Authentication failed');
        
        setTimeout(() => {
          onError(err instanceof Error ? err.message : 'Authentication failed');
        }, 2000);
      }
    };

    handleCallback();
  }, [onSuccess, onError]);

  return (
    <div className="min-h-screen bg-x-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-8 max-w-md w-full mx-4 text-center"
      >
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 text-x-blue mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold mb-2">Connecting to X</h2>
            <p className="text-x-gray-400">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
            >
              <CheckCircle className="w-16 h-16 text-x-green mx-auto mb-4" />
            </motion.div>
            <h2 className="text-xl font-bold mb-2 text-x-green">Connected!</h2>
            <p className="text-x-gray-400">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
            >
              <XCircle className="w-16 h-16 text-x-red mx-auto mb-4" />
            </motion.div>
            <h2 className="text-xl font-bold mb-2 text-x-red">Connection Failed</h2>
            <p className="text-x-gray-400">{message}</p>
            <p className="text-x-gray-500 text-sm mt-4">Redirecting back...</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
