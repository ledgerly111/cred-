const encoder = new TextEncoder();

function base64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlText(value) {
  return base64Url(encoder.encode(value));
}

function safeHeader(value) {
  return String(value).replace(/[\r\n]+/g, ' ').trim();
}

async function getAccessToken(env) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
      refresh_token: env.GOOGLE_OAUTH_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!response.ok) throw new Error(`Google token request failed (${response.status})`);
  const result = await response.json();
  if (!result.access_token) throw new Error('Google token response did not include an access token');
  return result.access_token;
}

function mimeMessage({ from, to, replyTo, subject, text, html }) {
  const boundary = `cred_${crypto.randomUUID().replace(/-/g, '')}`;
  const headers = [
    `From: CRED Global Learning <${safeHeader(from)}>`,
    `To: ${safeHeader(to)}`,
    `Reply-To: ${safeHeader(replyTo)}`,
    `Subject: ${safeHeader(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    text,
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    html,
    `--${boundary}--`,
  ];
  return headers.join('\r\n');
}

export async function sendGmail(env, message) {
  const accessToken = await getAccessToken(env);
  const raw = base64UrlText(mimeMessage(message));
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(env.CRED_SENDER_EMAIL)}/messages/send`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    },
  );
  if (!response.ok) throw new Error(`Gmail send failed (${response.status})`);
  return response.json();
}
