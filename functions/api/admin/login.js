import { createSessionCookie, passwordMatches } from '../../_lib/admin-session.js';
import { clientIp, json, methodNotAllowed, requireSameOrigin, sha256 } from '../../_lib/http.js';

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LIMIT = 10;

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return methodNotAllowed(['POST']);
  if (!requireSameOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  if (!env.DASHBOARD_PASSWORD || !env.DASHBOARD_SESSION_SECRET) {
    return json({ error: 'Dashboard is not configured.' }, 503);
  }
  if (!env.DB) return json({ error: 'Dashboard database is not configured.' }, 503);
  const ipHash = await sha256(`${clientIp(request)}:${env.RATE_LIMIT_SALT || 'cred-dashboard'}`);
  const cutoff = new Date(Date.now() - LOGIN_WINDOW_MS).toISOString();
  const recent = await env.DB.prepare('SELECT COUNT(*) AS total FROM dashboard_login_attempts WHERE ip_hash = ? AND created_at >= ?')
    .bind(ipHash, cutoff)
    .first();
  if (Number(recent?.total || 0) >= LOGIN_LIMIT) {
    return json({ error: 'Too many sign-in attempts. Please wait and try again.' }, 429, { 'retry-after': '900' });
  }
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid request.' }, 400); }
  if (!await passwordMatches(String(body.password || ''), env.DASHBOARD_PASSWORD)) {
    await env.DB.prepare('INSERT INTO dashboard_login_attempts (id, ip_hash, created_at) VALUES (?, ?, ?)')
      .bind(crypto.randomUUID(), ipHash, new Date().toISOString())
      .run();
    return json({ error: 'Incorrect password.' }, 401);
  }
  await env.DB.prepare('DELETE FROM dashboard_login_attempts WHERE ip_hash = ? OR created_at < ?')
    .bind(ipHash, new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .run();
  const cookie = await createSessionCookie(env.DASHBOARD_SESSION_SECRET);
  return json({ ok: true }, 200, { 'set-cookie': cookie });
}
