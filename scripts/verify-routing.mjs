import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }

const base = process.env.TEST_URL || 'http://localhost:5190';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));

try {
  for (const route of ['/', '/about', '/services', '/programmes', '/scholarships', '/blog', '/contact', '/dashboard']) {
    const response = await page.goto(`${base}${route}`);
    assert.equal(response.status(), 200, `Direct request ${route}`);
    await page.locator('h1').first().waitFor();
    assert.equal(new URL(page.url()).hash, '', `No fragment on ${route}`);
    assert.equal(await page.locator('a[href^="#/"]').count(), 0, `No hash route links on ${route}`);
  }

  await page.goto(`${base}/#/contact?interest=Scholarships`);
  await page.waitForURL(`${base}/contact?interest=Scholarships`);
  assert.equal(await page.locator('input[name="interest"]').inputValue(), 'Scholarships');

  await page.goto(`${base}/`);
  await page.locator('.top-navigation a[href="/about"]').click();
  await page.waitForURL(`${base}/about`);
  await page.goBack();
  await page.waitForURL(`${base}/`);
  await page.goForward();
  await page.waitForURL(`${base}/about`);

  await page.goto(`${base}/blog?article=11`);
  await page.locator('.article-body').waitFor();
  assert.equal(new URL(page.url()).hash, '');
  assert.equal(await page.locator('a[href^="#/"]').count(), 0, 'No old hash route links in articles');
  assert.deepEqual(errors, []);
  console.log('PASS: clean direct routes, old bookmarks, query strings, navigation, and browser history.');
} finally {
  await browser.close();
}
