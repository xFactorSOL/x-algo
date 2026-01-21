# X Post Analyzer

A beautiful web application that analyzes X (Twitter) posts using insights from the actual X algorithm. Get real-time feedback on engagement potential, dwell time optimization, and reach before you post.

🚀 **[Live Demo](https://your-app.vercel.app)** *(Update after deployment)*

## Features

### 🎯 Two Main Components

1. **Draft Composer** - Write your post and get live, real-time scoring as you type
2. **Post Analyzer** - Analyze any existing X post by pasting its URL

### 📊 6 Scoring Dimensions

Based on the actual X algorithm, each post is scored across these dimensions:

| Score | What It Measures |
|-------|------------------|
| **Engagement Potential** | Likelihood of likes, replies, reposts, and shares |
| **Red Flag Risk** | Risk of triggering block, mute, or report actions |
| **Dwell Time** | How long users will spend reading your post |
| **Author Diversity** | Impact of your posting frequency on visibility |
| **Filter Risk** | Risk of being filtered or having reduced visibility |
| **Reach Potential** | Estimated visibility to followers vs new audiences |

### ✨ Key Features

- 🔄 **Live Analysis** - Scores update in real-time as you type
- 🎨 **Beautiful Dark UI** - X-inspired design with smooth animations
- 💡 **Smart Suggestions** - Actionable tips to improve your posts
- 📱 **Responsive** - Works on desktop and mobile
- 🔐 **X OAuth** - Connect your X account for personalized analysis

## How It Works

The scoring engine uses heuristics derived from studying the actual X algorithm codebase:

### Engagement Score
- Detects questions (boost replies)
- Identifies calls-to-action
- Recognizes emotional/opinion language
- Analyzes thread and list formats

### Red Flag Detection
- Excessive caps (shouting)
- Too many hashtags (spam indicator)
- Engagement bait patterns
- Divisive language

### Dwell Time Optimization
- Optimal post length (100-280 chars sweet spot)
- Line breaks and readability
- Hook strength (first line)
- Curiosity gaps

### Author Diversity
- Applies exponential decay for frequent posters
- Formula: `multiplier = (1 - 0.1) * 0.5^position + 0.1`
- Rewards spacing posts 3-4 hours apart

### Filter Risk
- Commonly muted keyword patterns
- Link shorteners (often filtered)
- External platform mentions
- Heavy promotional content

### Reach Potential
- In-network score (followers)
- Out-of-network score (discovery)
- Topic relevance for broader appeal
- Hashtag strategy

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/x-post-analyzer.git
cd x-post-analyzer

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

### Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Vercel auto-detects Vite and deploys

### X API Integration

To enable real X authentication (instead of demo mode):

#### Step 1: Create X Developer App
1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Create a new Project and App
3. Enable **OAuth 2.0** in User Authentication Settings
4. Set **Type of App** to `Web App`

#### Step 2: Configure Callback URLs
In the X Developer Portal, add your callback URL:
```
https://your-app.vercel.app/callback
```

#### Step 3: Add Environment Variable in Vercel
In your Vercel project settings, add:
```
VITE_X_CLIENT_ID=your_client_id_here
```

That's it! The app auto-detects when credentials are configured and enables real OAuth.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

## Project Structure

```
x-post-analyzer/
├── src/
│   ├── components/       # React components
│   │   ├── PostComposer.tsx
│   │   ├── PostAnalyzer.tsx
│   │   ├── ScoreCard.tsx
│   │   ├── ScoreRing.tsx
│   │   └── SuggestionList.tsx
│   ├── lib/
│   │   ├── scoring/      # Scoring engine
│   │   │   ├── engagementScore.ts
│   │   │   ├── redFlagScore.ts
│   │   │   ├── dwellTimeScore.ts
│   │   │   ├── authorDiversityScore.ts
│   │   │   ├── filterRiskScore.ts
│   │   │   └── reachScore.ts
│   │   └── twitter.ts    # X API utilities
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main app component
│   └── index.css         # Global styles
└── package.json
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Disclaimer

This tool provides heuristic-based scoring for educational purposes. Actual X algorithm behavior may vary and changes over time. This is not affiliated with or endorsed by X Corp.
