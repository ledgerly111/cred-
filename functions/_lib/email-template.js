export function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]);
}

export function studentAcknowledgementHtml({ name, referenceNumber }) {
  const safeName = escapeHtml(name);
  const safeReference = escapeHtml(referenceNumber);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>We received your CRED consultation request</title>
  </head>
  <body style="margin:0;padding:0;background:#eee5e2;color:#361721;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Your consultation request is safely with the CRED team. Reference ${safeReference}.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#eee5e2;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;background:#fffaf7;border:1px solid #ddcfcb;">
            <tr><td style="height:7px;background:#fa7857;font-size:0;line-height:0;">&nbsp;</td></tr>
            <tr>
              <td style="padding:28px 34px 30px;background:#37121e;">
                <img src="https://crededu.com/cred-email-logo.png" width="214" alt="CRED Global Learning" style="display:block;width:214px;max-width:72%;height:auto;border:0;margin:0 0 34px;">
                <p style="margin:0 0 14px;color:#fa7857;font-size:12px;line-height:18px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">Consultation request received</p>
                <h1 style="margin:0;color:#f5eeeb;font-size:38px;line-height:44px;font-weight:500;letter-spacing:-1.5px;">Your next chapter<br>starts with clarity.</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 34px 16px;">
                <p style="margin:0 0 18px;color:#361721;font-size:19px;line-height:30px;">Hello ${safeName},</p>
                <p style="margin:0;color:#68555e;font-size:16px;line-height:27px;">Thank you for contacting CRED Global Learning. Your consultation request is safely with our team, and an advisor will contact you to understand your goals and help you consider the right pathway.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 34px 14px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f5eeeb;border-left:7px solid #fa7857;">
                  <tr>
                    <td style="padding:23px 24px;">
                      <p style="margin:0 0 7px;color:#762b3d;font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.8px;text-transform:uppercase;">Your reference number</p>
                      <p style="margin:0;color:#37121e;font-size:40px;line-height:44px;font-weight:bold;letter-spacing:5px;">${safeReference}</p>
                      <p style="margin:9px 0 0;color:#7c6970;font-size:13px;line-height:20px;">Keep this number if you contact our team about your request.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 34px 12px;">
                <p style="margin:0 0 18px;color:#361721;font-size:19px;line-height:26px;font-weight:bold;">What happens next</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;">
                  <tr>
                    <td width="42" valign="top" style="padding:0 12px 17px 0;color:#fa7857;font-size:13px;line-height:24px;font-weight:bold;">01</td>
                    <td valign="top" style="padding:0 0 17px;color:#68555e;font-size:15px;line-height:24px;border-bottom:1px solid #e5d8d4;">A CRED advisor reviews the information you shared.</td>
                  </tr>
                  <tr>
                    <td width="42" valign="top" style="padding:17px 12px 17px 0;color:#fa7857;font-size:13px;line-height:24px;font-weight:bold;">02</td>
                    <td valign="top" style="padding:17px 0;color:#68555e;font-size:15px;line-height:24px;border-bottom:1px solid #e5d8d4;">We contact you to discuss your background, ambitions and preferred direction.</td>
                  </tr>
                  <tr>
                    <td width="42" valign="top" style="padding:17px 12px 0 0;color:#fa7857;font-size:13px;line-height:24px;font-weight:bold;">03</td>
                    <td valign="top" style="padding:17px 0 0;color:#68555e;font-size:15px;line-height:24px;">You receive clear guidance on suitable qualifications and next steps.</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 34px 38px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="background:#fa7857;">
                      <a href="https://crededu.com/#/home" style="display:inline-block;padding:15px 22px;color:#37121e;font-size:14px;line-height:18px;font-weight:bold;text-decoration:none;">Explore CRED&nbsp;&nbsp;↗</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:22px 0 0;color:#7c6970;font-size:13px;line-height:21px;">You can reply directly to this email if you need to add anything to your request.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:23px 34px;background:#37121e;color:#cdbec3;font-size:11px;line-height:18px;">
                <strong style="color:#f5eeeb;">CRED Global Learning</strong><br>
                Ajman, United Arab Emirates&nbsp;&nbsp;·&nbsp;&nbsp;crededu.com
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
