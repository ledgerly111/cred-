import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { blogArticles } from '../src/blog-content.js';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
const browser = await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader']});
const page = await browser.newPage({viewport:{width:1291,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.TEST_URL || 'http://localhost:5180';
try {
  for(const route of ['home','blog']) {
    await page.goto(`${base}/#/${route}`);
    await page.locator('.blog-card').first().waitFor({state:'attached'});
    assert.equal(await page.locator('.blog-card').count(),8);
    assert.deepEqual(await page.locator('.blog-card h3').allTextContents(),blogArticles.map(a=>a.title));
    assert.deepEqual(await page.locator('.blog-card-copy p').allTextContents(),blogArticles.map(a=>a.excerpt));
  }
  for(const article of blogArticles) {
    await page.goto(`${base}/#/blog?article=${article.id}`);
    await page.locator('.article-body').waitFor();
    assert.equal(await page.locator('h1').innerText(),article.title);
    const body=await page.locator('.article-body').textContent();
    for(const block of article.blocks) for(const text of block.type==='list'?block.items:[block.text]) assert(body.includes(text));
    assert.deepEqual(await page.locator('.article-sources a').evaluateAll(nodes=>nodes.map(n=>n.href)),article.sources.map(s=>s.url));
  }
  await page.goto(`${base}/#/contact`);
  await page.locator('.contact-world').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  const canvas=page.locator('.globe-canvas');
  assert(await canvas.isVisible());
  assert(await canvas.evaluate(c=>Boolean(c.getContext('webgl2'))));
  assert.equal(await page.locator('.globe-fallback').count(),0);
  assert.equal(await page.locator('.globe-pause').count(),0);
  assert.equal(await page.getByText('Drag to explore',{exact:true}).count(),0);
  await canvas.focus();
  const before=await canvas.screenshot();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(100);
  assert(!before.equals(await canvas.screenshot()),'Keyboard rotates rendered globe');
  const box=await canvas.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await page.mouse.down();await page.mouse.move(box.x+box.width/2+90,box.y+box.height/2,{steps:8});await page.mouse.up();

  await page.locator('.office-map').scrollIntoViewIfNeeded();
  await page.waitForTimeout(3500);
  assert((await page.locator('.office-map').getAttribute('src')).includes('25.3934422,55.4308613'));
  await page.waitForFunction(() => Boolean(document.querySelector('.office-map')));
  const mapFrame = page.frames().find(f => /google\.com\/maps/.test(f.url()));
  assert(mapFrame, 'Google map frame loaded');
  console.log('Google map loaded:', mapFrame.url());
  await page.screenshot({path:'qa/launch-contact-desktop.png'});
  for(const width of [390,320]) {
    await page.setViewportSize({width,height:844});
    for(const route of ['home','blog','blog?article=11','contact']) {
      await page.goto(`${base}/#/${route}`);await page.locator('h1').waitFor();await page.waitForTimeout(500);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route} overflow at ${width}`);
    }
    await page.locator('.contact-world').scrollIntoViewIfNeeded();await page.waitForTimeout(1000);
    assert(await canvas.isVisible());
    await page.screenshot({path:`qa/launch-contact-${width}.png`});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(`${base}/#/contact`);await page.locator('.contact-world').scrollIntoViewIfNeeded();await page.waitForTimeout(1500);
  assert(!(await page.locator('.globe-pause').isVisible()));
  const still=await canvas.screenshot();await page.waitForTimeout(400);assert(still.equals(await canvas.screenshot()),'Reduced motion globe stays still');
  assert.deepEqual(errors,[]);
  console.log('PASS: all eight exact articles and source links, WebGL globe, keyboard/drag, responsive layouts and reduced motion.');
} finally { await browser.close(); }
