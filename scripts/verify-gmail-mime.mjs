import assert from 'node:assert/strict';
import { mimeMessage } from '../functions/_lib/gmail.js';
import { studentAcknowledgementHtml } from '../functions/_lib/email-template.js';

const message = mimeMessage({
  from: 'info@crededu.com',
  to: 'info@crededu.com',
  replyTo: 'student@example.com',
  subject: 'New CRED website enquiry — Test Student',
  text: 'Plain text',
  html: '<p>HTML</p>',
});

const subjectLine = message.split('\r\n').find(line => line.startsWith('Subject: '));
assert.ok(subjectLine, 'MIME message should contain a Subject header');
assert.doesNotMatch(subjectLine, /—/, 'Unicode must not be written raw into the Subject header');

const decoded = subjectLine
  .slice('Subject: '.length)
  .split(' ')
  .map(word => {
    const match = word.match(/^=\?UTF-8\?B\?(.+)\?=$/i);
    assert.ok(match, `Expected an RFC 2047 encoded word, received: ${word}`);
    return Buffer.from(match[1], 'base64').toString('utf8');
  })
  .join('');

assert.equal(decoded, 'New CRED website enquiry — Test Student');
assert.match(message, /Reply-To: student@example\.com/);
assert.match(message, /Content-Type: text\/plain; charset="UTF-8"/);
assert.match(message, /Content-Type: text\/html; charset="UTF-8"/);

const acknowledgement = studentAcknowledgementHtml({
  name: 'Test <Student>',
  referenceNumber: '1283',
});
assert.match(acknowledgement, /CRED Global Learning/);
assert.match(acknowledgement, /cred-email-logo\.png/);
assert.match(acknowledgement, /Your reference number/);
assert.match(acknowledgement, />1283</);
assert.doesNotMatch(acknowledgement, /Test <Student>/);
assert.match(acknowledgement, /Test &lt;Student&gt;/);

console.log('Gmail MIME checks passed.');
