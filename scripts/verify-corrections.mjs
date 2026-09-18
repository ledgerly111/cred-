import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
await mkdir('qa', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1282, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const results = [];
const base = process.env.TEST_URL || 'http://localhost:5173';
async function route(name) { await page.goto(`${base}/#/${name}`); await page.locator('h1').waitFor(); await page.waitForTimeout(1000); }
try {
  await route('home');
  assert.equal(await page.locator('.quick-card').count(), 4);
  assert.equal(await page.locator('.hero-actions .button').count(), 1);
  assert.equal(await page.locator('.video-control').count(), 0);
  assert(await page.locator('.header-consultation').isVisible());
  const sections = await page.locator('main > section').evaluateAll(nodes => nodes.map(n => n.className));
  assert.match(sections[1], /quick-access/);
  assert(sections.findIndex(c => c.includes('programmes-preview')) < sections.findIndex(c => c.includes('blueprint-section')));
  results.push('Homepage quick access, one hero button, reordered programme and blueprint sections');
  await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
  assert(await page.locator('video').evaluate(v => v.muted && v.playsInline && !v.paused));
  await page.screenshot({ path: 'qa/corrections-home-desktop.png' });
  const helper = page.locator('.whatsapp-helper');
  assert.equal(await page.locator('.image-caption').count(), 0, 'Image caption overlays should not be rendered');
  assert.equal(await page.getByText('QUALIFICATIONS WITH A CAREER PURPOSE.', { exact: true }).count(), 0, 'Footer tagline should not be rendered');
  const href = new URL(await helper.getAttribute('href'));
  assert.equal(href.pathname, '/971508532770');
  assert.match(href.searchParams.get('text'), /free consultation/);
  await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'instant' }));
  assert.equal(await helper.getAttribute('aria-hidden'), 'true');
  await helper.waitFor({ state: 'hidden' });
  await helper.waitFor({ state: 'visible' });
  assert.equal(await helper.getAttribute('aria-hidden'), 'false');
  results.push('WhatsApp target and prefill; helper hides during scrolling and returns after idle');
  for (const width of [1282, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const name of ['home', 'about', 'services', 'programmes', 'scholarships', 'blog', 'contact']) {
      await route(name);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width}px ${name}: horizontal overflow`);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('.page-banner .eyebrow').count(), 0);
      await helper.waitFor({ state: 'visible' });
      assert(await helper.isVisible());
      if (name === 'contact') assert(await page.getByRole('heading', { name: 'Book a Free Consultation', exact: true }).isVisible());
    }
    results.push(`All seven pages: ${width}px, no overflow, accessible helper, no page-banner label`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await route('home');
  const helperBox = await helper.boundingBox();
  const dockBox = await page.locator('.mobile-dock').boundingBox();
  assert(helperBox.y + helperBox.height < dockBox.y, 'WhatsApp button overlaps dock');
  await page.screenshot({ path: 'qa/corrections-home-mobile.png' });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  assert.equal(await helper.getAttribute('aria-hidden'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await helper.getAttribute('aria-hidden'), 'false');
  await route('programmes');
  await page.getByRole('button', { name: 'Professional', exact: true }).click();
  assert.equal(await page.locator('.programme-card').count(), 1);
  await page.getByRole('button', { name: 'Artificial Intelligence', exact: true }).click();
  await page.getByRole('link', { name: 'Explore my selected subject' }).click();
  assert.equal(await page.locator('input[name="interest"]').inputValue(), 'Artificial Intelligence');
  await page.locator('button[type="submit"]').click();
  assert.equal(await page.locator('form').evaluate(f => f.checkValidity()), false);
  await page.getByLabel('Full name').fill('QA Learner');
  await page.getByLabel('Email address').fill('qa@example.com');
  await page.getByLabel('Where are you today?').selectOption('Working professionals');
  await page.getByLabel('Tell us about your goals').fill('Explore flexible education & career progression.');
  await page.getByRole('checkbox').check();
  let submittedEnquiry;
  await page.route('**/api/enquiries', async route => {
    submittedEnquiry = route.request().postDataJSON();
    await route.fulfill({
      status: 202,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, reference: '11111111-1111-4111-8111-111111111111' }),
    });
  });
  await page.locator('button[type="submit"]').click();
  await page.getByRole('status').waitFor();
  assert.equal(submittedEnquiry.name, 'QA Learner');
  assert.equal(submittedEnquiry.interest, 'Artificial Intelligence');
  assert.match(submittedEnquiry.goals, /education & career/);
  assert.match(await page.getByRole('status').innerText(), /request has been received/);
  results.push('Mobile navigation, dock clearance, programme filters and enquiry submission handoff');
  await route('blog');
  await page.getByRole('link', { name: 'Read more', exact: true }).first().click();
  assert.match(page.url(), /article=11/);
  await page.locator('.article-body').waitFor({ state: 'visible' });
  await page.getByRole('link', { name: '← Back to Blogs' }).click();
  await page.locator('.blog-card').first().waitFor({ state: 'visible' });
  assert.equal(await page.locator('.blog-card').count(), 8);
  await route('scholarships');
  assert.equal(await page.getByText('Availability, eligibility, deadlines and awards are subject to the relevant institution or scholarship provider. Guidance does not guarantee a scholarship.', { exact: true }).count(), 0);
  await page.getByRole('button', { name: /Working Professional Scholarship/ }).click();
  assert.equal(await page.getByRole('button', { name: /Working Professional Scholarship/ }).getAttribute('aria-expanded'), 'true');
  await page.setViewportSize({ width: 1282, height: 900 });
  await route('about');
  await page.locator('.mission-grid').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1300);
  assert(await page.getByText('Our Mission', { exact: true }).isVisible());
  assert(await page.getByText('Our Vision', { exact: true }).isVisible());
  assert(await page.locator('.mission-grid .micro-label').first().evaluate(e => parseFloat(getComputedStyle(e).fontSize) >= 30));
  await page.screenshot({ path: 'qa/corrections-mission-vision.png' });
  await route('blog');
  await page.locator('.blog-list').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1300);
  await page.screenshot({ path: 'qa/corrections-blog.png' });
  await route('contact');
  await page.locator('.contact-grid').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1300);
  await page.screenshot({ path: 'qa/corrections-contact.png' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await route('home');
  await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
  assert(await page.locator('video').evaluate(v => !v.paused && v.loop && !v.controls));
  assert.deepEqual(errors, []);
  results.push('Linked blog articles, visible Mission/Vision, scholarship copy removal, reduced motion, no browser errors');
  await writeFile('qa/correction-results.json', JSON.stringify(results, null, 2));
  console.log(results.join('\n'));
} finally { await browser.close(); }
