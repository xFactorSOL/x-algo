import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, code_verifier, redirect_uri } = req.body;

  if (!code || !code_verifier || !redirect_uri) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const clientId = process.env.VITE_X_CLIENT_ID;
  const clientSecret = process.env.VITE_X_CLIENT_SECRET;
  
  if (!clientId) {
    return res.status(500).json({ error: 'X Client ID not configured' });
  }

  // Build headers - use Basic auth if we have a client secret (Confidential Client)
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  
  if (clientSecret) {
    // Confidential Client: use Basic auth
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
  }

  try {
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers,
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        ...(clientSecret ? {} : { client_id: clientId }), // Only include client_id in body for public clients
        code_verifier,
      }),
    });

    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('X API error:', data);
      return res.status(tokenResponse.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Token exchange error:', error);
    return res.status(500).json({ error: 'Failed to exchange token' });
  }
}
