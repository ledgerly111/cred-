import { clearSessionCookie, requireAdminOrigin } from '../../_lib/admin-session.js';
import { json, methodNotAllowed } from '../../_lib/http.js';

export async function onRequest({ request }) {
  if (request.method !== 'POST') return methodNotAllowed(['POST']);
  const originError = requireAdminOrigin(request);
  if (originError) return originError;
  return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() });
}
