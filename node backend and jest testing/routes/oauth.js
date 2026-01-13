// const express = require('express');
// const router = express.Router();

// // Node 18+ / Node 22 has global fetch — no import needed

// router.post('/token', async (req, res) => {
//   const { code, tokenUrl, clientId, clientSecret, redirectUri } = req.body;

//   try {
//     const response = await fetch(tokenUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       },
//       body: new URLSearchParams({
//         grant_type: 'authorization_code',
//         code,
//         client_id: clientId,
//         client_secret: clientSecret,
//         redirect_uri: redirectUri
//       })
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       return res.status(response.status).json({
//         error: 'OAuth token request failed',
//         details: errorText
//       });
//     }

//     const data = await response.json();
//     res.json(data);
//   } catch (err) {
//     console.error('OAuth token error:', err);
//     res.status(500).json({ error: 'Token exchange failed' });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();

router.post('/token', async (req, res) => {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error('OAuth token error:', err);
    res.status(500).json({ error: 'OAuth failed' });
  }
});

module.exports = router;

