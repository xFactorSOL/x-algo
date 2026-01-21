import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { 
  saveTokens, 
  saveUser, 
  getCodeVerifier,
  clearAuth
} from '../lib/twitter';
import { X_CONFIG } from '../lib/config';
import { User } from '../types';

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
        const errorDescription = params.get('error_description');

        // Check for errors from X
        if (error) {
          throw new Error(errorDescription || `X returned error: ${error}`);
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

        // Exchange code for token via our API route (avoids CORS)
        const tokenResponse = await fetch('/api/auth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            code_verifier: codeVerifier,
            redirect_uri: X_CONFIG.redirectUri,
          }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
          console.error('Token error:', tokenData);
          throw new Error(tokenData.error_description || tokenData.error || 'Failed to get access token');
        }

        // Save tokens
        saveTokens(tokenData.access_token, tokenData.refresh_token);

        setMessage('Fetching your profile...');

        // Fetch user profile via our API route
        const userResponse = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });

        const userData = await userResponse.json();

        if (!userResponse.ok) {
          throw new Error(userData.error || 'Failed to fetch user profile');
        }

        // Build user object
        const user: User = {
          id: userData.user.id,
          username: userData.user.username,
          name: userData.user.name,
          profileImageUrl: userData.user.profile_image_url || '',
          followersCount: userData.user.public_metrics?.followers_count || 0,
          followingCount: userData.user.public_metrics?.following_count || 0,
          recentPostsCount: userData.recentPostsCount || 0,
          lastPostTimestamp: userData.lastPostTimestamp,
        };

        // Save user
        saveUser(user);

        // Clean up
        sessionStorage.removeItem('oauth_state');
        localStorage.removeItem('x_code_verifier');

        setStatus('success');
        setMessage(`Welcome, ${user.name}!`);

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
        }, 3000);
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
