export function startOAuth(auth) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: auth.clientId,
    redirect_uri: auth.redirectUri,
    scope: auth.scopes,
    redirect: 'true' // 👈 IMPORTANT
  });

  window.location.href = `${auth.authUrl}?${params.toString()}`;
}

