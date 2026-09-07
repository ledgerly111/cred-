import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
await mkdir('qa', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const base = process.env.TEST_URL || 'http://localhost:5173';
const results = [];
async function route(name) { await page.goto(`${base}/#/${name}`); await page.locator('h1').waitFor(); await page.waitForTimeout(850); }
async function noOverflow(label) { assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${label}: horizontal overflow`); results.push(`${label}: no horizontal overflow`); }
try {
  await route('home');
  await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
  const video = await page.locator('video').evaluate(v => ({ width: v.videoWidth, height: v.videoHeight, muted: v.muted, paused: v.paused, inline: v.playsInline }));
  assert(video.width > 0 && video.muted && video.inline && !video.paused);
  results.push(`Header video plays muted and inline: ${video.width} × ${video.height}`);
  await page.screenshot({ path: 'qa/home-desktop.png' });
  await page.getByRole('button', { name: 'Pause header video' }).click();
  assert(await page.locator('video').evaluate(v => v.paused));
  await page.getByRole('button', { name: 'Play header video' }).click();
  await page.locator('#intro').evaluate(el => window.scrollTo({ top: el.offsetTop, behavior: 'instant' }));
  await page.waitForTimeout(900);
  assert(await page.locator('video').evaluate(v => v.paused));
  results.push('Video pause/play controls and automatic offscreen pause pass');
  await page.screenshot({ path: 'qa/home-intro-desktop.png' });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 650) { scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } });
  await page.waitForTimeout(850);
  await page.screenshot({ path: 'qa/home-full-desktop.png', fullPage: true });
  await noOverflow('Desktop home');
  for (const name of ['about', 'services', 'programmes', 'scholarships', 'blog', 'contact']) {
    await route(name); await noOverflow(`Desktop ${name}`);
    assert.equal(await page.locator('h1').count(), 1);
  }
  await route('services');
  await page.getByRole('button', { name: /Professional qualification guidance/ }).click();
  assert.equal(await page.getByRole('button', { name: /Professional qualification guidance/ }).getAttribute('aria-expanded'), 'true');
  results.push('Service accordion expands the selected service');
  await route('programmes');
  await page.getByRole('button', { name: 'Professional', exact: true }).click();
  assert.equal(await page.locator('.programme-card').count(), 1);
  assert.match(await page.locator('.programme-card h3').innerText(), /Professional qualifications/);
  await page.getByRole('button', { name: 'All pathways', exact: true }).click();
  assert.equal(await page.locator('.programme-card').count(), 6);
  await page.getByRole('button', { name: 'Artificial Intelligence', exact: true }).click();
  await page.getByRole('link', { name: 'Explore my selected subject' }).click();
  await page.locator('form').waitFor();
  assert.equal(await page.locator('input[name="interest"]').inputValue(), 'Artificial Intelligence');
  results.push('Programme filters and subject-to-enquiry handoff pass');
  await page.locator('button[type="submit"]').click();
  assert.equal(await page.locator('form').evaluate(f => f.checkValidity()), false);
  await page.getByLabel('Full name').fill('Website QA');
  await page.getByLabel('Email address').fill('qa@example.com');
  await page.getByLabel('Where are you today?').selectOption('Working professionals');
  await page.getByLabel('Tell us about your goals').fill('Review flexible Artificial Intelligence pathways.');
  await page.getByRole('checkbox').check();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('button[type="submit"]').click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'CRED-consultation-enquiry.txt');
  assert.match(await page.getByRole('status').innerText(), /not been sent/);
  results.push('Required-field validation and honest local enquiry download pass');
  await route('blog');
  await page.getByRole('button', { name: 'Read the guide', exact: true }).first().click();
  assert(await page.locator('dialog').isVisible());
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog').count(), 0);
  results.push('Learning Hub guide dialog opens and closes with Escape');
  await page.setViewportSize({ width: 390, height: 844 });
  for (const name of ['home', 'about', 'services', 'programmes', 'scholarships', 'blog', 'contact']) {
    await route(name); await noOverflow(`Mobile ${name}`);
    if (name === 'home') {
      const matrix = await page.locator('video').evaluate(v => getComputedStyle(v).transform);
      assert.match(matrix, /1\.17/);
      await page.screenshot({ path: 'qa/home-mobile.png' });
    }
    if (name === 'programmes') { await page.locator('.programme-grid').scrollIntoViewIfNeeded(); await page.waitForTimeout(850); await page.screenshot({ path: 'qa/programmes-mobile.png' }); }
  }
  await page.getByRole('button', { name: 'Open navigation' }).click();
  assert(await page.getByRole('navigation', { name: 'Mobile navigation' }).isVisible());
  await page.screenshot({ path: 'qa/menu-mobile.png' });
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('button', { name: 'Open navigation' }).getAttribute('aria-expanded'), 'false');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: /Programmes/ }).click();
  assert.match(page.url(), /programmes/);
  results.push('Mobile navigation, Escape and page selection pass');
  await page.setViewportSize({ width: 320, height: 740 });
  for (const name of ['home', 'programmes', 'contact']) { await route(name); await noOverflow(`Small mobile ${name}`); }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await route('home');
  assert(await page.locator('video').evaluate(v => v.paused));
  assert.equal(await page.locator('.reveal').first().evaluate(el => getComputedStyle(el).opacity), '1');
  results.push('Reduced motion disables autoplay and leaves content visible');
  assert.deepEqual(errors, []);
  results.push('No uncaught browser errors');
  await writeFile('qa/results.json', JSON.stringify({ passed: true, results, video }, null, 2));
  console.log(results.join('\n'));
} finally { await browser.close(); }
