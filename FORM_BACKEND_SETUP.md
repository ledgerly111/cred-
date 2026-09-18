# CRED enquiry backend activation

The repository now contains the complete website-side implementation. Production activation requires a Cloudflare D1 binding and Google Workspace credentials stored as Cloudflare secrets. Do not commit credentials or the Google private key.

## What the integration does

- Every programme, scholarship and consultation call to action reaches the shared consultation form.
- A successful form submission is saved to D1 before any email is attempted.
- `info@crededu.com` receives the complete lead notification. The student's submitted email is set as `Reply-To`.
- The student receives an automatic acknowledgement from `info@crededu.com`.
- Failed email attempts remain visible in the dashboard with `email_status = failed`; the lead is not lost.
- Spam controls include same-origin enforcement, strict field limits, a honeypot, minimum completion time, hashed-IP rate limiting and dashboard login throttling.
- The private lead dashboard is available at `/#/dashboard` after activation.

## 1. Create and migrate the D1 database

Create a D1 database named `cred-leads`, apply `migrations/0001_enquiries.sql`, and bind it to the existing Cloudflare Pages project with the variable name:

```text
DB
```

The production and preview environments need separate bindings if both should accept enquiries.

## 2. Authorize Google Workspace sending

In a Google Cloud project owned by CRED:

1. Enable the Gmail API.
2. Configure an internal Google Auth application owned by CRED.
3. Create a Web OAuth client whose redirect URI is Google's OAuth Playground.
4. Authorize `info@crededu.com` with this single scope:

```text
https://www.googleapis.com/auth/gmail.send
```

5. Exchange the authorization code for a refresh token and store all three OAuth values as encrypted Cloudflare secrets.

This allows the backend to send as `info@crededu.com` without storing Diana's password. The OAuth application is internal to CRED and cannot be authorized by accounts outside the organization.

## 3. Add Cloudflare Pages secrets

Add these as encrypted production secrets under the Pages project's **Settings → Variables and Secrets**:

```text
CRED_SENDER_EMAIL=info@crededu.com
CRED_LEADS_EMAIL=info@crededu.com
GOOGLE_OAUTH_CLIENT_ID=<Google OAuth client ID>
GOOGLE_OAUTH_CLIENT_SECRET=<Google OAuth client secret>
GOOGLE_OAUTH_REFRESH_TOKEN=<refresh token issued to info@crededu.com>
DASHBOARD_PASSWORD=<a unique strong password shared only with CRED>
DASHBOARD_SESSION_SECRET=<at least 32 cryptographically random bytes>
RATE_LIMIT_SALT=<at least 32 cryptographically random bytes>
```

Redeploy the Pages project after adding the D1 binding and secrets.

## 4. Verify production

1. Submit one genuine test enquiry from the live website.
2. Confirm that the browser shows a reference number.
3. Confirm the lead appears at `https://crededu.com/#/dashboard`.
4. Confirm `info@crededu.com` receives the lead notification.
5. Confirm the test student's inbox receives the acknowledgement.
6. Reply to the notification and confirm the reply is addressed to the student.
7. Check Google Admin email logs and the Spam folder if either message is missing.

Google Workspace and the domain should have valid MX, SPF, DKIM and DMARC records before live testing.
