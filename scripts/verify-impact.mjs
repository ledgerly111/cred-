import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({chromium} = require('playwright')); }
catch { ({chromium} = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
const browser = await chromium.launch({channel:'chrome',headless:true});
const page = await browser.newPage({viewport:{width:1282,height:900}});
const base=process.env.TEST_URL || 'http://localhost:5180';
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const expected=['350+','125+','50+','12+','60%'];
try {
  for(const width of [1282,390,320]) {
    await page.setViewportSize({width,height:900});
    for(const route of ['home','about']) {
      await page.goto(`${base}/#/${route}`);
      await page.locator('.impact-cards').scrollIntoViewIfNeeded();
      await page.waitForTimeout(2500);
      assert.equal(await page.locator('.impact-tile').count(),5);
      assert.deepEqual((await page.locator('.impact-tile > .impact-tile-face > .sr-only').allTextContents()).map(s=>s.trim()),expected);
      assert.equal(await page.locator('.blueprint-art').count(),0);
      if(route==='about')assert.equal(await page.locator('.intro-grid .image-placeholder').count(),0);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      assert.equal(await page.locator('.impact-tile.is-visible').count(),5, `${route} at ${width}px`);
      await page.screenshot({path:`qa/impact-${route}-${width}.png`});
      await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
      await page.waitForTimeout(500);
      if(route==='home')assert.equal(await page.locator('.impact-tile.is-visible').count(),0);
      await page.locator('.impact-cards').scrollIntoViewIfNeeded();
      await page.waitForTimeout(2500);
      assert.equal(await page.locator('.impact-tile.is-visible').count(),5);
    }
  }
  const numbers=new Set();
  for(const route of ['home','about','services','programmes','scholarships','blog']) {
    await page.goto(`${base}/#/${route}`);await page.locator('h1').waitFor();
    for(const n of await page.locator('.placeholder-number').allTextContents())numbers.add(Number(n));
  }
  assert.deepEqual([...numbers].sort((a,b)=>a-b),Array.from({length:17},(_,i)=>i+1));
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(`${base}/#/about`);
  await page.locator('.impact-cards').scrollIntoViewIfNeeded();await page.waitForTimeout(200);
  assert.equal(await page.locator('.impact-tile').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  assert.deepEqual(errors,[]);
  console.log('PASS: exact five figures in both locations, replay on return, desktop/mobile layouts, reduced motion and contiguous image slots 1–17.');
} finally {await browser.close();}
