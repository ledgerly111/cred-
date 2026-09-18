import { cleanText, clientIp, isEmail, json, methodNotAllowed, requireSameOrigin, sha256 } from '../_lib/http.js';
import { sendGmail } from '../_lib/gmail.js';
import { escapeHtml, studentAcknowledgementHtml } from '../_lib/email-template.js';

const MAX_BODY_BYTES = 12_000;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 5;

function validate(body) {
  const enquiry = {
    name: cleanText(body.name, 120),
    email: cleanText(body.email, 200).toLowerCase(),
    phone: cleanText(body.phone, 40),
    profile: cleanText(body.profile, 120),
    interest: cleanText(body.interest, 200),
    goals: cleanText(body.goals, 4000),
    consent: body.consent === true,
    website: cleanText(body.website, 200),
    startedAt: Number(body.startedAt),
  };
  const age = Date.now() - enquiry.startedAt;
  if (enquiry.website) return { error: 'Unable to submit this request.' };
  if (!enquiry.name || !isEmail(enquiry.email) || !enquiry.profile || !enquiry.goals || !enquiry.consent) {
    return { error: 'Please complete all required fields.' };
  }
  if (!Number.isFinite(enquiry.startedAt) || age < 2500 || age > 2 * 60 * 60 * 1000) {
    return { error: 'Please refresh the page and try again.' };
  }
  return { enquiry };
}

async function deliverEmails(env, lead) {
  const rows = [
    ['Name', lead.name],
    ['Email', lead.email],
    ['Telephone / WhatsApp', lead.phone || 'Not provided'],
    ['Current stage', lead.profile],
    ['Interested in', lead.interest || 'General education and career guidance'],
    ['Goals', lead.goals],
  ];
  const textRows = rows.map(([label, value]) => `${label}: ${value}`).join('\n');
  const htmlRows = rows.map(([label, value]) => `<tr><th align="left" style="padding:8px 12px 8px 0;vertical-align:top;color:#762b3d">${escapeHtml(label)}</th><td style="padding:8px 0">${escapeHtml(value)}</td></tr>`).join('');

  await sendGmail(env, {
    from: env.CRED_SENDER_EMAIL,
    to: env.CRED_LEADS_EMAIL,
    replyTo: lead.email,
    subject: `New CRED website enquiry — ${lead.name}`,
    text: `A new consultation request was submitted.\n\n${textRows}\n\nLead reference: ${lead.referenceNumber}`,
    html: `<div style="font-family:Arial,sans-serif;color:#361721"><h1 style="color:#762b3d">New website enquiry</h1><table>${htmlRows}</table><p style="color:#7c6970">Lead reference: ${escapeHtml(lead.referenceNumber)}</p></div>`,
  });

  await sendGmail(env, {
    from: env.CRED_SENDER_EMAIL,
    to: lead.email,
    replyTo: env.CRED_LEADS_EMAIL,
    subject: 'We received your CRED consultation request',
    text: `Hello ${lead.name},\n\nThank you for contacting CRED Global Learning. Your consultation request is safely with our team, and an advisor will contact you to understand your goals and help you consider the right pathway.\n\nYour reference number: ${lead.referenceNumber}\n\nCRED Global Learning\nAjman, United Arab Emirates\nhttps://crededu.com`,
    html: studentAcknowledgementHtml(lead),
  });
}

async function reserveReferenceNumber(env) {
  const result = await env.DB.prepare(`UPDATE enquiry_reference_counter
    SET next_reference = next_reference + 1
    WHERE singleton = 1 AND next_reference BETWEEN 1000 AND 9999
    RETURNING next_reference - 1 AS reference_number`).first();
  const referenceNumber = Number(result?.reference_number);
  if (!Number.isInteger(referenceNumber) || referenceNumber < 1000 || referenceNumber > 9999) {
    throw new Error('No four-digit enquiry reference numbers are available');
  }
  return String(referenceNumber).padStart(4, '0');
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (request.method !== 'POST') return methodNotAllowed(['POST']);
  if (!requireSameOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  if (!env.DB) return json({ error: 'Enquiry service is not configured.' }, 503);

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) return json({ error: 'Request is too large.' }, 413);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  const validation = validate(body || {});
  if (validation.error) return json({ error: validation.error }, 400);
  const enquiry = validation.enquiry;
  const ipHash = await sha256(`${clientIp(request)}:${env.RATE_LIMIT_SALT || 'cred-enquiries'}`);
  const cutoff = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
  const recent = await env.DB.prepare('SELECT COUNT(*) AS total FROM enquiry_rate_limits WHERE ip_hash = ? AND created_at >= ?')
    .bind(ipHash, cutoff)
    .first();
  if (Number(recent?.total || 0) >= RATE_LIMIT) {
    return json({ error: 'Too many requests. Please wait and try again.' }, 429, { 'retry-after': '900' });
  }

  let referenceNumber;
  try {
    referenceNumber = await reserveReferenceNumber(env);
  } catch (error) {
    console.error(JSON.stringify({ event: 'enquiry_reference_failed', error: String(error) }));
    return json({ error: 'Enquiry service is temporarily unavailable.' }, 503);
  }

  const lead = {
    id: crypto.randomUUID(),
    referenceNumber,
    ...enquiry,
    source: cleanText(body.source, 120) || 'website-contact',
    createdAt: new Date().toISOString(),
  };
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO enquiries
      (id, reference_number, name, email, phone, profile, interest, goals, source, status, email_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', 'pending', ?)`)
      .bind(lead.id, Number(lead.referenceNumber), lead.name, lead.email, lead.phone, lead.profile, lead.interest, lead.goals, lead.source, lead.createdAt),
    env.DB.prepare('INSERT INTO enquiry_rate_limits (id, ip_hash, created_at) VALUES (?, ?, ?)')
      .bind(crypto.randomUUID(), ipHash, lead.createdAt),
  ]);

  context.waitUntil((async () => {
    try {
      await deliverEmails(env, lead);
      await env.DB.prepare("UPDATE enquiries SET email_status = 'sent', emailed_at = ? WHERE id = ?")
        .bind(new Date().toISOString(), lead.id)
        .run();
    } catch (error) {
      console.error(JSON.stringify({ event: 'enquiry_email_failed', leadId: lead.id, error: String(error) }));
      await env.DB.prepare("UPDATE enquiries SET email_status = 'failed' WHERE id = ?").bind(lead.id).run();
    }
    await env.DB.prepare('DELETE FROM enquiry_rate_limits WHERE created_at < ?')
      .bind(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .run();
  })());

  return json({ ok: true, reference: lead.referenceNumber }, 202);
}
