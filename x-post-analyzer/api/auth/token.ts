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

  // Try both naming conventions (VITE_ for consistency, non-VITE for serverless)
  const clientId = process.env.VITE_X_CLIENT_ID || process.env.X_CLIENT_ID;
  const clientSecret = process.env.VITE_X_CLIENT_SECRET || process.env.X_CLIENT_SECRET;
  
  // Debug logging
  console.log('Token exchange attempt:', {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    clientIdLength: clientId?.length,
    clientSecretLength: clientSecret?.length,
    redirect_uri,
  });

  if (!clientId) {
    return res.status(500).json({ error: 'X Client ID not configured' });
  }

  // Build request body
  const bodyParams: Record<string, string> = {
    grant_type: 'authorization_code',
    code,
    redirect_uri,
    code_verifier,
  };

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  
  if (clientSecret) {
    // Confidential Client: use Basic auth
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
    console.log('Using Confidential Client flow with Basic auth');
  } else {
    // Public Client: include client_id in body
    bodyParams.client_id = clientId;
    console.log('Using Public Client flow');
  }

  try {
    console.log('Sending token request to X API...');
    
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers,
      body: new URLSearchParams(bodyParams).toString(),
    });

    const data = await tokenResponse.json();

    console.log('X API response status:', tokenResponse.status);
    console.log('X API response:', JSON.stringify(data));

    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Token exchange error:', error);
    return res.status(500).json({ error: 'Failed to exchange token' });
  }
}
