import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    // Fetch user profile
    const userResponse = await fetch(
      'https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error('X API error:', userData);
      return res.status(userResponse.status).json(userData);
    }

    // Fetch recent tweets for diversity calculation
    const userId = userData.data?.id;
    let recentPostsCount = 0;
    let lastPostTimestamp: number | undefined;

    if (userId) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const tweetsResponse = await fetch(
        `https://api.twitter.com/2/users/${userId}/tweets?start_time=${oneDayAgo}&max_results=100&tweet.fields=created_at`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (tweetsResponse.ok) {
        const tweetsData = await tweetsResponse.json();
        const tweets = tweetsData.data || [];
        recentPostsCount = tweets.length;
        
        if (tweets.length > 0) {
          lastPostTimestamp = new Date(tweets[0].created_at).getTime();
        }
      }
    }

    return res.status(200).json({
      user: userData.data,
      recentPostsCount,
      lastPostTimestamp,
    });
  } catch (error) {
    console.error('User fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch user data' });
  }
}
