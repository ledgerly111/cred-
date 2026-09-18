# CRED website mail workflow

This file explains the production enquiry system for `crededu.com`. It is written so that a future developer or AI agent can maintain the workflow without needing the original setup conversation.

Do not commit passwords, OAuth tokens, API secrets, Google client JSON files, or the dashboard password to this repository.

## Current production architecture

```text
Student submits the consultation form on crededu.com
                         |
                         v
Cloudflare Pages Function: POST /api/enquiries
             |                           |
             v                           v
Cloudflare D1: cred-leads          Gmail API via OAuth
stores the submission              sends two messages
                                             |
                         +-------------------+-------------------+
                         |                                       |
                         v                                       v
             info@crededu.com receives               Student receives an
             the complete lead                       acknowledgement
             Reply-To = student email                Reply-To = info@crededu.com
```

The public site is `https://crededu.com`. The Cloudflare Pages deployment is backed by the `cred-eck` Pages project, and the public domain is routed to it through the `cred-hostinger-router` Cloudflare Worker. GitHub `main` is the production source branch.

Google Workspace hosts the mailbox. Cloudflare runs the website endpoint and D1 database. The website does **not** store Diana's Google password and does **not** use SMTP. It obtains a short-lived Gmail API access token using a Google OAuth refresh token kept as an encrypted Cloudflare secret.

## What happens after a submission

1. The browser validates the required fields.
2. The Pages Function validates the request again.
3. Spam controls reject a filled honeypot, unrealistically fast submissions, invalid origins, oversized fields, and excessive requests from the same hashed IP.
4. The lead is inserted into D1 with `email_status = pending`.
5. The API immediately returns HTTP `202` and a unique reference to the website.
6. A background task sends the internal notification and student acknowledgement through the Gmail API.
7. D1 changes the row to `email_status = sent`. If sending fails, it becomes `failed`; the lead remains saved.

Relevant source files:

- `functions/api/enquiries.js` — validation, rate limiting, D1 insert, and both messages.
- `functions/_lib/gmail.js` — Google OAuth token exchange and MIME/Gmail API sending.
- `functions/_lib/http.js` — trusted-origin and request helpers.
- `migrations/0001_enquiries.sql` — D1 schema.
- `functions/api/admin/` — dashboard login, logout, and lead API.
- `src/DashboardPage.jsx` — private lead dashboard UI.
- `FORM_BACKEND_SETUP.md` — first-time activation checklist.

## Production resources and configuration

Cloudflare must have a D1 binding named `DB` connected to the `cred-leads` database. These values must exist as encrypted production secrets/variables for the Pages project:

```text
CRED_SENDER_EMAIL
CRED_LEADS_EMAIL
GOOGLE_OAUTH_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET
GOOGLE_OAUTH_REFRESH_TOKEN
DASHBOARD_PASSWORD
DASHBOARD_SESSION_SECRET
RATE_LIMIT_SALT
```

Current intended email values:

```text
CRED_SENDER_EMAIL=info@crededu.com
CRED_LEADS_EMAIL=info@crededu.com
```

The three Google OAuth values authorize only Gmail sending for the Workspace account. They are required by the current implementation. A general Cloudflare API token is not used to send messages. Cloudflare/Wrangler authentication is only needed when a maintainer changes deployment configuration or secrets.

Required Google OAuth scope:

```text
https://www.googleapis.com/auth/gmail.send
```

## Dashboard

Open:

```text
https://crededu.com/#/dashboard
```

The dashboard reads leads from D1 after password authentication. Its password is the value of the encrypted `DASHBOARD_PASSWORD` secret. Do not put that password in this file, an issue, or a commit.

The dashboard is the fallback record of submissions. A Gmail delivery problem should not erase a lead.

## Local verification

Install dependencies and run the checks:

```sh
npm install
npm run build
npm run test:enquiries
npm run test:mail
```

`test:mail` verifies that non-ASCII subjects use RFC 2047 UTF-8 encoding. This prevents an em dash such as `—` from appearing in Gmail as `Ã¢Â€Â”`.

Run the frontend locally with:

```sh
npm run dev
```

Vite alone does not emulate the production Pages Function or D1 binding. Use production or a correctly configured Wrangler Pages environment for an actual form-to-email test.

## Safe live test

Use a real address controlled by the tester. Do not use a fake address because repeated bounces can damage sender reputation.

1. Open `https://crededu.com/#/contact`.
2. Submit a clearly labelled test enquiry.
3. Record the reference displayed by the website.
4. Confirm the row appears in `https://crededu.com/#/dashboard`.
5. Confirm `info@crededu.com` receives `New CRED website enquiry — <name>`.
6. Confirm the test student's mailbox receives `We received your CRED consultation request`.
7. Open the internal notification and verify that Reply directs a response to the student's address.
8. Compare the reference in the form result, dashboard, and acknowledgement.

The production workflow was live-tested on 18 September 2026. Both messages arrived in `info@crededu.com` during a controlled self-addressed test. The verified reference was `0cd2073a-d4ca-4b4a-8c10-53b70c850b19`.

## Common future problems

### The form shows an error before a reference appears

- Confirm `https://crededu.com/api/enquiries` is served by the Pages Functions deployment.
- Check that the public-domain routing Worker still targets the active `cred-eck.pages.dev` deployment.
- Confirm the request `Origin` is one of the trusted production hosts in `functions/_lib/http.js`.
- Confirm the `DB` binding exists in the production Pages environment.
- Review the Pages Function logs for the exact HTTP status.

### A reference appears, but no email arrives

The lead was probably stored successfully and email delivery failed afterward.

- Check the lead's `email_status` in the dashboard or D1.
- Check Gmail Spam and All Mail.
- Check Google Admin Console email logs.
- Check Cloudflare Pages Function logs for `enquiry_email_failed` and the lead ID.
- Confirm all five mail-related secrets still exist and are spelled exactly as shown above.
- Confirm `info@crededu.com` is active and licensed in Google Workspace.
- Confirm the Gmail API remains enabled in the Google Cloud project.
- Confirm the OAuth client still exists and the refresh token has not been revoked.

### Google returns `invalid_grant`

The refresh token is expired or revoked. Common causes include removing the app's access, deleting/recreating the OAuth client, changing Workspace policy, or leaving a test-mode OAuth consent configuration that expires tokens.

Fix:

1. Sign in as `info@crededu.com`.
2. Re-authorize the existing CRED-owned OAuth client with only `gmail.send`.
3. Generate a new refresh token.
4. Replace only `GOOGLE_OAUTH_REFRESH_TOKEN` in Cloudflare production secrets.
5. Redeploy and perform one labelled live test.

Never paste the refresh token into chat, GitHub, a README, or client-side code.

### Google returns `invalid_client`

The OAuth client ID/secret is missing, incorrect, deleted, or belongs to a different Google Cloud project. Replace the matching client ID and secret together in encrypted Cloudflare secrets, then redeploy.

### Gmail returns `401` or `403`

- Confirm the Gmail API is enabled.
- Confirm the authorized account is `info@crededu.com`.
- Confirm the scope is exactly `https://www.googleapis.com/auth/gmail.send`.
- Check Google Workspace API controls for a policy blocking the OAuth app.
- Do not solve this by giving the website the mailbox password.

### Messages arrive in Spam or fail DMARC

Check the DNS zone currently authoritative for `crededu.com`:

- Google Workspace MX records must be intact.
- The SPF record must authorize the actual sender.
- Google DKIM signing must be enabled and its DNS record valid.
- DMARC should exist and be reviewed before making enforcement stricter.

Do not replace MX records merely to fix website hosting. Website A/CNAME records and email MX/TXT records serve different purposes.

### Duplicate or abusive submissions

The current limit is five accepted submissions per hashed IP in 15 minutes. The system also uses a hidden honeypot and a minimum completion time. For stronger protection, add Cloudflare Turnstile to both the form and server-side verification; do not rely on a client-only CAPTCHA check.

### The dashboard rejects the correct password

- Confirm `DASHBOARD_PASSWORD` and `DASHBOARD_SESSION_SECRET` exist in the production environment.
- Secret changes require a fresh deployment.
- Ten failed attempts from one IP within 15 minutes trigger temporary throttling.
- Never hardcode the password into React or any public file.

### The website works but a new GitHub change is not live

1. Confirm the commit is present on GitHub `main`.
2. Check the Cloudflare Pages deployment for that commit.
3. Confirm the deployment succeeded and the Functions bundle was included.
4. Test the `pages.dev` deployment and then the public domain.
5. If `pages.dev` works but the public domain does not, inspect `cred-hostinger-router` and its routes.

## Changing the recipient or sender

To change where internal leads go, update `CRED_LEADS_EMAIL`. To change the authenticated sender, the new address must be a valid Google Workspace mailbox or authorized send-as identity, and the OAuth authorization and `CRED_SENDER_EMAIL` must match it.

Changing these values does not require editing the form. Replace the Cloudflare secret/variable, redeploy, and run the complete live test.

## Recovery and security rules for a future maintainer

- Read this file and inspect the current code before changing DNS or recreating resources.
- Preserve the `cred-leads` D1 database; it contains the submission history.
- Export/backup D1 before destructive schema work.
- Rotate a secret if it is ever exposed, then remove it from local files and Git history where applicable.
- Use least-privilege OAuth (`gmail.send` only).
- Never give an AI agent unrestricted Google, Cloudflare, or domain credentials when a narrowly scoped token or supervised browser session is enough.
- Never claim that email works from a build alone. Verify the form response, D1 row, internal notification, and student acknowledgement separately.
- Do not delete or replace Google Workspace MX, SPF, DKIM, or DMARC records while changing website hosting.

## Deployment handoff checklist

Before calling a mail change complete, record all of these separately:

- Local mail MIME test passed.
- Enquiry API test passed.
- Production build passed.
- Commit hash pushed to GitHub `main`.
- Cloudflare Pages deployment for that commit succeeded.
- Live form returned a reference.
- D1 stored the matching lead.
- Internal notification arrived at `info@crededu.com`.
- Student acknowledgement arrived.
- Reply-To opened the student's address.

If only some checks were completed, state exactly which checks remain instead of saying the workflow is fully verified.
