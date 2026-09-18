import { requireAdmin, requireAdminOrigin } from '../../_lib/admin-session.js';
import { json, methodNotAllowed } from '../../_lib/http.js';

const STATUSES = new Set(['new', 'contacted', 'qualified', 'closed']);

export async function onRequest(context) {
  const { request, env } = context;
  if (!['GET', 'PATCH'].includes(request.method)) return methodNotAllowed(['GET', 'PATCH']);
  if (!env.DB) return json({ error: 'Lead database is not configured.' }, 503);
  const authError = await requireAdmin(context);
  if (authError) return authError;

  if (request.method === 'PATCH') {
    const originError = requireAdminOrigin(request);
    if (originError) return originError;
  }

  if (request.method === 'GET') {
    const result = await env.DB.prepare(`SELECT id, reference_number AS referenceNumber, name, email, phone, profile, interest, goals, source,
      status, email_status AS emailStatus, created_at AS createdAt, emailed_at AS emailedAt
      FROM enquiries ORDER BY created_at DESC LIMIT 250`).all();
    return json({ leads: result.results || [] });
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid request.' }, 400); }
  if (!body.id || !STATUSES.has(body.status)) return json({ error: 'Invalid lead update.' }, 400);
  const result = await env.DB.prepare('UPDATE enquiries SET status = ?, updated_at = ? WHERE id = ?')
    .bind(body.status, new Date().toISOString(), body.id)
    .run();
  if (!result.meta?.changes) return json({ error: 'Lead not found.' }, 404);
  return json({ ok: true });
}
