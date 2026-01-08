export function extractPathParams(url = "") {
  const matches = url.match(/{([^}]+)}/g) || [];
  return matches.map(m => m.replace(/[{}]/g, ""));
}

export function buildUrl(url, pathParamsArr = [], queryParamsArr = []) {
  let finalUrl = url;

  pathParamsArr.forEach(({ key, value }) => {
    finalUrl = finalUrl.replace(`{${key}}`, encodeURIComponent(value));
  });

  const query = queryParamsArr
    .filter(p => p.key)
    .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join('&');

  if (query) finalUrl += (finalUrl.includes('?') ? '&' : '?') + query;

  return finalUrl;
}
