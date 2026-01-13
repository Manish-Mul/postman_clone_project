// export async function startOAuthFlow(auth) {
//   const redirectUri = `${window.location.origin}/oauth-callback`;

//   const url = `${auth.authUrl}?response_type=code` +
//     `&client_id=${encodeURIComponent(auth.clientId)}` +
//     `&redirect_uri=${encodeURIComponent(redirectUri)}` +
//     `&scope=${encodeURIComponent(auth.scopes || '')}`;

//   const popup = window.open(url, 'oauth', 'width=600,height=700');

//   window.addEventListener('message', async (event) => {
//     if (!event.data?.code) return;

//     const res = await fetch(auth.tokenUrl, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       body: new URLSearchParams({
//         grant_type: 'authorization_code',
//         code: event.data.code,
//         client_id: auth.clientId,
//         client_secret: auth.clientSecret,
//         redirect_uri: redirectUri
//       })
//     });

//     const data = await res.json();

//     auth.accessToken = data.access_token;
//     auth.refreshToken = data.refresh_token;

//     popup.close();
//   });
// }
