const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
};

const TRUSTED_SITE_HOSTS = new Set(['crededu.com', 'www.crededu.com', 'site.crededu.com']);

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...headers },
  });
}

export function methodNotAllowed(allowed) {
  return json({ error: 'Method not allowed.' }, 405, { allow: allowed.join(', ') });
}

export function requireSameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    if (originUrl.host === requestUrl.host) return true;

    // The public domain is routed to the Pages deployment by a Cloudflare
    // Worker, so the Function can see the internal pages.dev host while the
    // browser correctly reports crededu.com as its origin.
    return originUrl.protocol === 'https:'
      && TRUSTED_SITE_HOSTS.has(originUrl.hostname)
      && (TRUSTED_SITE_HOSTS.has(requestUrl.hostname) || requestUrl.hostname.endsWith('.pages.dev'));
  } catch {
    return false;
  }
}

export function cleanText(value, maxLength) {
  return typeof value === 'string'
    ? value.replace(/\0/g, '').trim().slice(0, maxLength)
    : '';
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 200;
}

export function clientIp(request) {
  return request.headers.get('CF-Connecting-IP') || 'unknown';
}

export async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
