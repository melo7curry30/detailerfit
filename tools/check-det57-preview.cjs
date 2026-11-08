'use strict';
/* DET-57 read-only preview acceptance. No affiliate navigation, no real analytics sends. */
const { chromium, webkit } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const base = process.env.DET57_PREVIEW_URL || 'https://det-57-release-reconciled-20261108-detailerfit-git.carmelo7kobe24.workers.dev';
const result = { at: new Date().toISOString(), preview: base, checks: [], errors: [] };
const ok = (name, detail) => { result.checks.push({ name, pass: true, detail }); console.log('PASS', name, detail || ''); };
const record = (name, error) => { result.checks.push({ name, pass: false, error: String(error) }); result.errors.push({ name, error: String(error) }); console.error('FAIL', name, error); };
async function check(name, fn) { try { await fn(); ok(name); } catch (e) { record(name, e.stack || e.message || e); } }
async function captureEvents(page) {
  await page.evaluate(() => {
    window.__det57Events = [];
    const old = window.dfTrackEvent;
    window.dfTrackEvent = (...args) => {
      window.__det57Events.push({ name: args[0], data: args[1] });
      if (typeof old === 'function') return old(...args);
    };
  });
}
const hasEvent = (events, name) => events.some(e => e.name === name);
async function main() {
  fs.mkdirSync('qa-artifacts', { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [320, 375, 390, 768, 1440]) {
      await check('home layout width=' + width, async () => {
        const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(String(e)));
        try {
          const response = await page.goto(base + '/?df_qa=1', { waitUntil: 'domcontentloaded', timeout: 30000 });
          assert(response && response.ok(), 'Home HTTP ' + response?.status());
          await page.locator('body.js-never-matches').count(); // no-op DOM readiness
          await page.waitForFunction(() => document.documentElement.classList.contains('js-home'), null, { timeout: 10000 });
          assert.equal(await page.locator('.software-card[data-profile]').count(), 6);
          assert.match(await page.locator('h1').innerText(), /right software/i);
          const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
          assert(sizes.scroll <= sizes.client + 2, 'horizontal overflow: ' + JSON.stringify(sizes));
          assert.deepEqual(errors, [], 'JS page errors');
          await page.screenshot({ path: 'qa-artifacts/home-' + width + '.png', fullPage: true, animations: 'disabled' });
        } finally { await context.close(); }
      });
    }
    await check('homepage compare and first-party event dispatch', async () => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      try {
        await page.goto(base + '/?df_qa=1', { waitUntil: 'domcontentloaded' });
        await captureEvents(page);
        await page.locator('.software-card[data-profile="housecall-pro"] input[type="checkbox"]').check();
        await page.locator('.software-card[data-profile="zenbooker"] input[type="checkbox"]').check();
        assert.equal(await page.locator('#open-comparison').isEnabled(), true);
        await page.locator('#open-comparison').click();
        assert.equal(await page.locator('#df-compare').isVisible(), true);
        assert((await page.locator('#comparison-content .comparison-row').count()) >= 6);
        const hcp = page.locator('#comparison-content a.vendor-link[data-vendor="Housecall Pro"]');
        const zen = page.locator('#comparison-content a.vendor-link[data-vendor="Zenbooker"]');
        assert.equal(await hcp.count(), 1, 'HCP vendor exit');
        assert.equal(await zen.count(), 1, 'Zenbooker vendor exit');
        const hcpHref = await hcp.getAttribute('href');
        const hcpRel = (await hcp.getAttribute('rel')) || '';
        const zenRel = (await zen.getAttribute('rel')) || '';
        assert(hcpHref.startsWith('https://www.housecallpro.com/'), hcpHref);
        assert(!hcpRel.split(/\s+/).includes('sponsored'), hcpRel);
        assert(zenRel.split(/\s+/).includes('sponsored'), zenRel);
        const ev = await page.evaluate(() => window.__det57Events);
        assert(hasEvent(ev, 'software_compare_select'), 'software_compare_select missing');
        assert(hasEvent(ev, 'software_comparison_view'), 'software_comparison_view missing');
        await page.locator('#clear-selection').click();
        const ev2 = await page.evaluate(() => window.__det57Events);
        assert(hasEvent(ev2, 'software_compare_clear'), 'software_compare_clear missing');
        await page.screenshot({ path: 'qa-artifacts/home-compare-390.png', fullPage: true, animations: 'disabled' });
      } finally { await context.close(); }
    });
    await check('three-question Finder and tool events', async () => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(String(e)));
      try {
        const response = await page.goto(base + '/finder?df_qa=1', { waitUntil: 'domcontentloaded' });
        assert(response?.ok(), 'Finder response ' + response?.status());
        await captureEvents(page);
        await page.locator('input[name="teamCount"][value="1"]').check();
        await page.locator('input[name="jobsCount"][value="25"]').check();
        await page.locator('input[name="budgetAmount"][value="200"]').check();
        await page.locator('#finderForm button[type="submit"]').first().click();
        await page.waitForFunction(() => {
          const node = document.getElementById('finderResults');
          return node && node.textContent.trim().length >= 150;
        }, null, { timeout: 12000 });
        const text = await page.locator('#finderResults').innerText();
        assert(/plan|match|software/i.test(text), 'Unexpected Finder result content');
        assert.deepEqual(errors, [], 'Finder JS errors');
        const events = await page.evaluate(() => window.__det57Events);
        assert(hasEvent(events, 'tool_start'), 'tool_start missing');
        assert(hasEvent(events, 'tool_result_view') || hasEvent(events, 'tool_no_match'), 'Result event missing');
        await page.screenshot({ path: 'qa-artifacts/finder-result-390.png', fullPage: true, animations: 'disabled' });
      } finally { await context.close(); }
    });
    await check('calculator and tool events', async () => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(String(e)));
      try {
        const response = await page.goto(base + '/software-cost-calculator?df_qa=1', { waitUntil: 'domcontentloaded' });
        assert(response?.ok(), 'Calculator response ' + response?.status());
        await captureEvents(page);
        await page.locator('#costCalcForm [name="team"]').fill('2');
        await page.locator('#costCalcForm [name="jobs"]').fill('60');
        await page.locator('#costCalcForm [name="selfBooking"][value="yes"]').check();
        await page.locator('#costCalcForm button[type="submit"]').click();
        await page.waitForFunction(() => {
          const node = document.getElementById('costResults');
          return node && node.textContent.trim().length > 150;
        }, null, { timeout: 12000 });
        assert.deepEqual(errors, [], 'Calculator JS errors');
        const events = await page.evaluate(() => window.__det57Events);
        assert(hasEvent(events, 'tool_start'), 'tool_start missing');
        assert(hasEvent(events, 'tool_result_view') || hasEvent(events, 'tool_no_match'), 'Result event missing');
        await page.screenshot({ path: 'qa-artifacts/calculator-result-390.png', fullPage: true, animations: 'disabled' });
      } finally { await context.close(); }
    });
    await check('affiliate disclosure and private resource exclusion', async () => {
      const page = await browser.newPage();
      try {
        const disclosure = await page.goto(base + '/affiliate-disclosure?df_qa=1', { waitUntil: 'domcontentloaded' });
        assert(disclosure?.ok(), 'Disclosure page HTTP');
        assert.match((await page.locator('body').innerText()), /affiliate|commission/i);
        for (const privatePath of ['/.detailerfit-bridge-state.json', '/docs/det57/verification.md', '/tools/check-det57.py']) {
          const response = await page.request.get(base + privatePath);
          assert.equal(response.status(), 404, 'private asset exposed: ' + privatePath);
        }
      } finally { await page.close(); }
    });

    await check('WebKit Safari-engine mobile/desktop smoke and menu', async () => {
      const wk = await webkit.launch({ headless: true });
      try {
        for (const width of [390, 1440]) {
          const context = await wk.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
          const page = await context.newPage();
          const jsErrors = [];
          page.on('pageerror', e => jsErrors.push(String(e)));
          try {
            const resp = await page.goto(base + '/?df_qa=1', { waitUntil: 'domcontentloaded', timeout: 30000 });
            assert(resp?.ok(), 'WebKit home response');
            assert.equal(await page.locator('.software-card').count(), 6);
            const dims = await page.evaluate(() => ({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
            assert(dims.scroll <= dims.width + 2, 'WebKit horizontal overflow: ' + JSON.stringify(dims));
            if (width === 390) {
              const menu = page.locator('.menuBtn');
              assert.equal(await menu.isVisible(), true);
              await menu.click();
              assert.equal(await menu.getAttribute('aria-expanded'), 'true', 'mobile menu expanded state');
              assert.equal(await page.locator('#navlinks').isVisible(), true, 'mobile menu links visible');
              await menu.click();
              assert.equal(await menu.getAttribute('aria-expanded'), 'false', 'mobile menu close state');
              await page.goto(base + '/finder?df_qa=1', { waitUntil: 'domcontentloaded' });
              assert.equal(await page.locator('#finderForm input[name="teamCount"]').count(), 5);
            }
            assert.deepEqual(jsErrors, [], 'WebKit JS errors');
            await page.screenshot({ path:'qa-artifacts/webkit-' + width + '.png', fullPage: true, animations:'disabled' });
          } finally { await context.close(); }
        }
      } finally { await wk.close(); }
    });
    await check('axe WCAG 2.0/2.1 A and AA serious/critical issues', async () => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      try {
        for (const path of ['/', '/finder', '/software-cost-calculator']) {
          await page.goto(base + path + '?df_qa=1', { waitUntil: 'domcontentloaded' });
          await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
          const resultAxe = await page.evaluate(async () => {
            const res = await window.axe.run(document, { runOnly: { type:'tag', values:['wcag2a','wcag2aa','wcag21a','wcag21aa'] }});
            return { violations: res.violations.map(v => ({ id:v.id, impact:v.impact, description:v.help, nodes:v.nodes.map(n => n.target).slice(0,5) })) };
          });
          const safe = path.replace(/[^a-z0-9]/gi, '-');
          fs.writeFileSync('qa-artifacts/axe' + safe + '.json', JSON.stringify(resultAxe,null,2));
          const severe = resultAxe.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
          assert.equal(severe.length, 0, 'axe serious/critical issues on '+path+': '+JSON.stringify(severe));
        }
      } finally { await context.close(); }
    });
  } finally { await browser.close(); }
  fs.writeFileSync('qa-artifacts/results.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ passed: result.checks.filter(c => c.pass).length, failed: result.errors.length }));
  if (result.errors.length) process.exitCode = 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
