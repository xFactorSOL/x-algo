import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  PenLine, 
  LogOut, 
  User as UserIcon,
  ChevronRight,
  Zap
} from 'lucide-react';
import { User, AuthState, AnalysisResult } from './types';
import { analyzePost, AnalysisOptions } from './lib/scoring';
import { 
  getStoredToken, 
  getStoredUser, 
  saveUser, 
  saveTokens, 
  clearAuth,
  extractPostId,
  buildAuthUrl,
  saveCodeVerifier
} from './lib/twitter';
import { X_CONFIG } from './lib/config';
import ScoreCard from './components/ScoreCard';
import ScoreRing from './components/ScoreRing';
import PostComposer from './components/PostComposer';
import PostAnalyzer from './components/PostAnalyzer';
import SuggestionList from './components/SuggestionList';
import OAuthCallback from './components/OAuthCallback';

type Tab = 'composer' | 'analyzer';

function App() {
  // Check if we're on the OAuth callback page
  const isCallbackPage = window.location.pathname === '/callback';
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    loading: true,
    error: null,
  });
  const [activeTab, setActiveTab] = useState<Tab>('composer');
  const [postText, setPostText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [urlAnalysisResult, setUrlAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisOptions, setAnalysisOptions] = useState<AnalysisOptions>({
    recentPostCount: 0,
    hoursSinceLastPost: 24,
    followerCount: 1000,
  });

  // Check for stored auth on mount
  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();
    
    if (token && user) {
      setAuthState({
        isAuthenticated: true,
        user,
        accessToken: token,
        loading: false,
        error: null,
      });
      setAnalysisOptions(prev => ({
        ...prev,
        followerCount: user.followersCount || 1000,
        recentPostCount: user.recentPostsCount || 0,
      }));
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Real-time analysis for composer
  useEffect(() => {
    if (postText.trim()) {
      const result = analyzePost(postText, analysisOptions);
      setAnalysisResult(result);
    } else {
      setAnalysisResult(null);
    }
  }, [postText, analysisOptions]);

  // Start real OAuth flow or use demo
  const handleLogin = useCallback(async () => {
    // Check if real X API is configured
    if (X_CONFIG.isConfigured) {
      // Real OAuth flow
      setAuthState(prev => ({ ...prev, loading: true }));
      
      try {
        // Generate PKCE challenge
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const verifier = btoa(String.fromCharCode(...array))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
        
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const challenge = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
        
        // Save verifier for token exchange
        saveCodeVerifier(verifier);
        
        // Generate state for CSRF protection
        const state = crypto.randomUUID();
        sessionStorage.setItem('oauth_state', state);
        
        // Build and redirect to X auth URL
        const authUrl = buildAuthUrl(
          X_CONFIG.clientId,
          X_CONFIG.redirectUri,
          challenge,
          state
        );
        
        window.location.href = authUrl;
      } catch (error) {
        console.error('OAuth error:', error);
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to start authentication' 
        }));
      }
    } else {
      // Demo mode - simulate OAuth flow
      setAuthState(prev => ({ ...prev, loading: true }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const demoUser: User = {
        id: '123456789',
        username: 'demo_user',
        name: 'Demo User',
        profileImageUrl: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png',
        followersCount: 5420,
        followingCount: 890,
        recentPostsCount: 3,
        lastPostTimestamp: Date.now() - 4 * 60 * 60 * 1000,
      };

      saveTokens('demo_token');
      saveUser(demoUser);

      setAuthState({
        isAuthenticated: true,
        user: demoUser,
        accessToken: 'demo_token',
        loading: false,
        error: null,
      });

      setAnalysisOptions({
        followerCount: demoUser.followersCount,
        recentPostCount: demoUser.recentPostsCount,
        hoursSinceLastPost: 4,
      });
    }
  }, []);

  const handleLogout = useCallback(() => {
    clearAuth();
    setAuthState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      loading: false,
      error: null,
    });
    setAnalysisOptions({
      recentPostCount: 0,
      hoursSinceLastPost: 24,
      followerCount: 1000,
    });
  }, []);

  const handleAnalyzeUrl = useCallback(async () => {
    if (!urlInput.trim()) return;

    setIsAnalyzing(true);
    setUrlAnalysisResult(null);

    // Simulate fetching post (in real implementation, use X API)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demo, validate URL format (real implementation would fetch from API)
    if (!extractPostId(urlInput)) {
      console.log('Invalid URL format, using demo data');
    }
    
    // Demo: analyze the URL as if it contains sample text
    const sampleTexts = [
      "Just shipped a major update! 🚀\n\nHere's what's new:\n• Faster performance\n• New dark mode\n• Bug fixes\n\nWhat feature would you like to see next?",
      "Unpopular opinion: the best code is the code you don't write.\n\nSimplicity > Complexity\n\nAgree or disagree?",
      "BREAKING: We just hit 10,000 users! 🎉\n\nThank you all for the support. This is just the beginning.\n\nThread on what we learned 🧵",
    ];
    
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    const result = analyzePost(randomText, analysisOptions);
    
    setUrlAnalysisResult(result);
    setIsAnalyzing(false);
  }, [urlInput, analysisOptions]);

  // Handle OAuth callback
  const handleOAuthSuccess = useCallback(() => {
    window.location.href = '/';
  }, []);

  const handleOAuthError = useCallback((error: string) => {
    console.error('OAuth error:', error);
    window.location.href = '/';
  }, []);

  // If we're on the callback page, show the OAuth handler
  if (isCallbackPage) {
    return <OAuthCallback onSuccess={handleOAuthSuccess} onError={handleOAuthError} />;
  }

  if (authState.loading) {
    return (
      <div className="min-h-screen bg-x-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-x-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-x-gray-400">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-x-black">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-x-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="w-8 h-8 text-x-blue" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold gradient-text">X Post Analyzer</h1>
                <p className="text-xs text-x-gray-400">Optimize for the algorithm</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {authState.isAuthenticated && authState.user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{authState.user.name}</p>
                    <p className="text-xs text-x-gray-400">@{authState.user.username}</p>
                  </div>
                  <img
                    src={authState.user.profileImageUrl}
                    alt={authState.user.name}
                    className="w-10 h-10 rounded-full border-2 border-x-gray-600"
                  />
                  <button
                    onClick={handleLogout}
                    className="p-2 text-x-gray-400 hover:text-x-gray-100 hover:bg-x-gray-800 rounded-full transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-4 py-2 bg-x-blue hover:bg-x-blue-hover text-white font-semibold rounded-full transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>{X_CONFIG.isConfigured ? 'Connect X Account' : 'Try Demo'}</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!authState.isAuthenticated ? (
          // Landing / Login State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 bg-gradient-to-br from-x-blue to-x-purple rounded-3xl mx-auto mb-8 flex items-center justify-center"
            >
              <Zap className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-4xl font-bold mb-4">
              Optimize Your Posts for the <span className="gradient-text">X Algorithm</span>
            </h2>
            <p className="text-x-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Get real-time scoring based on the actual X algorithm. Analyze engagement potential, 
              dwell time, reach, and more before you post.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className="flex items-center gap-2 px-8 py-4 bg-x-blue hover:bg-x-blue-hover text-white font-bold text-lg rounded-full transition-colors"
              >
                <UserIcon className="w-5 h-5" />
                <span>{X_CONFIG.isConfigured ? 'Connect Your X Account' : 'Try Demo Mode'}</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
              {!X_CONFIG.isConfigured && (
                <p className="text-x-yellow text-sm mt-2">
                  ⚠️ X API not configured - using demo mode. See README to enable real login.
                </p>
              )}
            </div>
            <p className="text-x-gray-500 text-sm mt-4">
              We use OAuth 2.0 and never store your password
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              {[
                { icon: PenLine, title: 'Draft Analyzer', desc: 'Get live feedback as you compose' },
                { icon: Search, title: 'Post Scanner', desc: 'Analyze any existing X post' },
                { icon: Sparkles, title: 'Algorithm Insights', desc: '6 scoring dimensions from the real algorithm' },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="glass rounded-2xl p-6 card-hover"
                >
                  <feature.icon className="w-10 h-10 text-x-blue mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-x-gray-400 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          // Authenticated Dashboard
          <div>
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8">
              {[
                { id: 'composer' as Tab, label: 'Draft Composer', icon: PenLine },
                { id: 'analyzer' as Tab, label: 'Post Analyzer', icon: Search },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-x-blue text-white'
                      : 'bg-x-gray-800 text-x-gray-300 hover:bg-x-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'composer' ? (
                <motion.div
                  key="composer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                  {/* Left: Composer */}
                  <div>
                    <PostComposer
                      value={postText}
                      onChange={setPostText}
                      user={authState.user}
                    />
                    {analysisResult && (
                      <div className="mt-6">
                        <SuggestionList suggestions={analysisResult.suggestions} />
                      </div>
                    )}
                  </div>

                  {/* Right: Live Scores */}
                  <div>
                    {analysisResult ? (
                      <div className="space-y-6">
                        {/* Overall Score */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="glass rounded-2xl p-6 text-center"
                        >
                          <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-x-green rounded-full live-pulse" />
                            <span className="text-sm text-x-gray-400">Live Analysis</span>
                          </div>
                          <ScoreRing
                            score={analysisResult.overallScore}
                            grade={analysisResult.overallGrade}
                            size={160}
                            label="Overall Score"
                          />
                        </motion.div>

                        {/* Score Cards Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <ScoreCard result={analysisResult.engagement} delay={0.1} />
                          <ScoreCard result={analysisResult.redFlags} delay={0.2} />
                          <ScoreCard result={analysisResult.dwellTime} delay={0.3} />
                          <ScoreCard result={analysisResult.authorDiversity} delay={0.4} />
                          <ScoreCard result={analysisResult.filterRisk} delay={0.5} />
                          <ScoreCard result={analysisResult.reach} delay={0.6} />
                        </div>
                      </div>
                    ) : (
                      <div className="glass rounded-2xl p-12 text-center">
                        <PenLine className="w-16 h-16 text-x-gray-600 mx-auto mb-4" />
                        <p className="text-x-gray-400">Start typing to see live analysis</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="analyzer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                  {/* Left: URL Input */}
                  <div>
                    <PostAnalyzer
                      urlInput={urlInput}
                      onUrlChange={setUrlInput}
                      onAnalyze={handleAnalyzeUrl}
                      isAnalyzing={isAnalyzing}
                    />
                    {urlAnalysisResult && (
                      <div className="mt-6">
                        <SuggestionList suggestions={urlAnalysisResult.suggestions} />
                      </div>
                    )}
                  </div>

                  {/* Right: Analysis Results */}
                  <div>
                    {isAnalyzing ? (
                      <div className="glass rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 border-4 border-x-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-x-gray-400">Analyzing post...</p>
                      </div>
                    ) : urlAnalysisResult ? (
                      <div className="space-y-6">
                        {/* Overall Score */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="glass rounded-2xl p-6 text-center"
                        >
                          <ScoreRing
                            score={urlAnalysisResult.overallScore}
                            grade={urlAnalysisResult.overallGrade}
                            size={160}
                            label="Overall Score"
                          />
                        </motion.div>

                        {/* Score Cards Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <ScoreCard result={urlAnalysisResult.engagement} delay={0.1} />
                          <ScoreCard result={urlAnalysisResult.redFlags} delay={0.2} />
                          <ScoreCard result={urlAnalysisResult.dwellTime} delay={0.3} />
                          <ScoreCard result={urlAnalysisResult.authorDiversity} delay={0.4} />
                          <ScoreCard result={urlAnalysisResult.filterRisk} delay={0.5} />
                          <ScoreCard result={urlAnalysisResult.reach} delay={0.6} />
                        </div>
                      </div>
                    ) : (
                      <div className="glass rounded-2xl p-12 text-center">
                        <Search className="w-16 h-16 text-x-gray-600 mx-auto mb-4" />
                        <p className="text-x-gray-400">Enter a post URL to analyze</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-x-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-x-gray-500 text-sm">
            Built with insights from the X Algorithm • Scoring is heuristic-based and for educational purposes
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
