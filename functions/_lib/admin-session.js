import { json, requireSameOrigin } from './http.js';

const COOKIE_NAME = 'cred_admin_session';
const SESSION_SECONDS = 8 * 60 * 60;
const encoder = new TextEncoder();

function base64UrlEncode(value) {
  const bytes = typeof value === 'string' ? encoder.encode(value) : value;
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
  return crypto.subtle.sign('HMAC', key, encoder.encode(value));
}

async function secureEqual(left, right) {
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(left)),
    crypto.subtle.digest('SHA-256', encoder.encode(right)),
  ]);
  const leftBytes = new Uint8Array(leftHash);
  const rightBytes = new Uint8Array(rightHash);
  let difference = leftBytes.length ^ rightBytes.length;
  for (let index = 0; index < Math.max(leftBytes.length, rightBytes.length); index += 1) {
    difference |= (leftBytes[index] || 0) ^ (rightBytes[index] || 0);
  }
  return difference === 0;
}

export async function passwordMatches(candidate, expected) {
  if (!candidate || !expected) return false;
  return secureEqual(candidate, expected);
}

export async function createSessionCookie(secret) {
  const payload = base64UrlEncode(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
    nonce: crypto.randomUUID(),
  }));
  const signature = base64UrlEncode(new Uint8Array(await hmac(secret, payload)));
  return `${COOKIE_NAME}=${payload}.${signature}; Path=/api/admin; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/api/admin; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

export async function requireAdmin(context) {
  const { request, env } = context;
  if (!env.DASHBOARD_SESSION_SECRET) return json({ error: 'Dashboard is not configured.' }, 503);
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (!match) return json({ error: 'Authentication required.' }, 401);

  const [payload, signature] = match[1].split('.');
  if (!payload || !signature) return json({ error: 'Authentication required.' }, 401);
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(env.DASHBOARD_SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const valid = await crypto.subtle.verify('HMAC', key, base64UrlDecode(signature), encoder.encode(payload));
    const session = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
    if (!valid || !Number.isFinite(session.exp) || session.exp <= Date.now() / 1000) {
      return json({ error: 'Session expired.' }, 401);
    }
    return null;
  } catch {
    return json({ error: 'Authentication required.' }, 401);
  }
}

export function requireAdminOrigin(request) {
  return requireSameOrigin(request) ? null : json({ error: 'Invalid request origin.' }, 403);
}
