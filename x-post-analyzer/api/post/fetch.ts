import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const authHeader = req.headers.authorization;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing post ID' });
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization' });
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    // Fetch the tweet with all relevant fields
    const tweetFields = [
      'created_at',
      'public_metrics',
      'entities',
      'author_id',
      'conversation_id',
      'in_reply_to_user_id',
      'referenced_tweets',
      'attachments',
    ].join(',');

    const expansions = ['author_id', 'attachments.media_keys'].join(',');
    const userFields = ['name', 'username', 'profile_image_url', 'public_metrics', 'verified'].join(',');
    const mediaFields = ['type', 'url', 'preview_image_url'].join(',');

    const url = `https://api.twitter.com/2/tweets/${id}?tweet.fields=${tweetFields}&expansions=${expansions}&user.fields=${userFields}&media.fields=${mediaFields}`;

    console.log('Fetching tweet:', id);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    console.log('Tweet fetch response status:', response.status);

    if (!response.ok) {
      console.error('X API error:', data);
      return res.status(response.status).json({ error: data.detail || data.title || 'Failed to fetch post', details: data });
    }

    // Parse the response
    const tweet = data.data;
    const author = data.includes?.users?.[0];
    const media = data.includes?.media || [];

    // Build rich post object
    const post = {
      id: tweet.id,
      text: tweet.text,
      createdAt: tweet.created_at,
      
      // Author info
      author: author ? {
        id: author.id,
        name: author.name,
        username: author.username,
        profileImageUrl: author.profile_image_url,
        verified: author.verified,
        followersCount: author.public_metrics?.followers_count || 0,
        followingCount: author.public_metrics?.following_count || 0,
        tweetCount: author.public_metrics?.tweet_count || 0,
      } : null,

      // Engagement metrics
      metrics: tweet.public_metrics ? {
        likeCount: tweet.public_metrics.like_count || 0,
        retweetCount: tweet.public_metrics.retweet_count || 0,
        replyCount: tweet.public_metrics.reply_count || 0,
        quoteCount: tweet.public_metrics.quote_count || 0,
        impressionCount: tweet.public_metrics.impression_count || 0,
        bookmarkCount: tweet.public_metrics.bookmark_count || 0,
      } : null,

      // Content analysis
      entities: {
        hashtags: tweet.entities?.hashtags?.map((h: { tag: string }) => h.tag) || [],
        mentions: tweet.entities?.mentions?.map((m: { username: string }) => m.username) || [],
        urls: tweet.entities?.urls?.map((u: { expanded_url: string; display_url: string }) => ({
          expanded: u.expanded_url,
          display: u.display_url,
        })) || [],
        cashtags: tweet.entities?.cashtags?.map((c: { tag: string }) => c.tag) || [],
      },

      // Media
      hasMedia: media.length > 0,
      mediaTypes: media.map((m: { type: string }) => m.type),

      // Tweet type
      isReply: !!tweet.in_reply_to_user_id,
      isRetweet: tweet.referenced_tweets?.some((rt: { type: string }) => rt.type === 'retweeted') || false,
      isQuote: tweet.referenced_tweets?.some((rt: { type: string }) => rt.type === 'quoted') || false,
    };

    return res.status(200).json({ post });
  } catch (error) {
    console.error('Post fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch post' });
  }
}
