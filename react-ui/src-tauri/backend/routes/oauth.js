const express = require('express');
const router = express.Router();

// Ensure fetch exists for Node 18 / pkg environments
const fetch = global.fetch || require('node-fetch');

router.post('/token', async (req, res) => {
  const { code, tokenUrl, clientId, clientSecret, redirectUri } = req.body;

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: 'OAuth token request failed',
        details: errorText
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('OAuth token error:', err);
    res.status(500).json({ error: 'Token exchange failed' });
  }
});

module.exports = router;
