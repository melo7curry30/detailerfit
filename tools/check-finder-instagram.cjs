/* Regression for DET-46: run from repository root with Playwright installed.
 * Browser requests are fulfilled from repository files; analytics and vendor
 * requests never leave the test. QA uses the site's existing df_qa exclusion.
 * Usage: DF_BROWSER_EXECUTABLE=/path/to/browser node tools/check-finder-instagram.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {chromium,firefox,webkit} = require(process.env.DF_PLAYWRIGHT_MODULE||'playwright');
const engine = process.env.DF_BROWSER_ENGINE || 'chromium';
const base = process.env.DF_TEST_BASE || 'HEAD';
const original = execFileSync('git',['show',`${base}:finder.html`],{encoding:'utf8'});
const current = fs.readFileSync('finder.html','utf8');
const origin = 'https://getdetailerfit.com';
const mime = {html:'text/html',js:'application/javascript',css:'text/css',svg:'image/svg+xml',png:'image/png'};
const scenarios = [
 {name:'solo-low-budget',team:'1',jobs:'25',budget:'50'},
 {name:'team',team:'3',jobs:'50',budget:'200'},
 {name:'larger-team',team:'10',jobs:'100',budget:'500'}
];
const reports=[];
(async()=>{
 const browser=await ({chromium,firefox,webkit}[engine]).launch({headless:true,...(process.env.DF_BROWSER_EXECUTABLE?{executablePath:process.env.DF_BROWSER_EXECUTABLE}:{})});
 try{
  for(const width of [320,390,1280]){
   for(const scenario of scenarios){
    let expected;
    for(const [variant,source] of [['before-direct',''],['after-direct',''],['after-instagram','&utm_source=instagram'],['after-ig','&src=ig']]){
     const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
     const errors=[],requests=[];
     page.on('pageerror',e=>errors.push(e.message));
     await page.route('**/*',r=>{
      const u=new URL(r.request().url());
      if(u.origin!==origin){requests.push(u.hostname);return r.abort();}
      let file=decodeURIComponent(u.pathname).replace(/^\//,'')||'index.html';
      if(!path.extname(file))file+='.html';
      assert(!file.split('/').includes('..'));
      if(!fs.existsSync(file))return r.fulfill({status:404,body:'Not found'});
      const body=file==='finder.html'&&variant.startsWith('before')?Buffer.from(original):fs.readFileSync(file);
      return r.fulfill({status:200,body,contentType:mime[path.extname(file).slice(1)]||'application/octet-stream'});
     });
     await page.goto(origin+'/finder?df_qa=1'+source,{waitUntil:'load'});
     // Observe event calls locally, keeping the real QA exclusion in place.
     await page.evaluate(()=>{
      window.__qaEvents=[];
      const track=window.dfTrackEvent;
      window.dfTrackEvent=(event,payload)=>{window.__qaEvents.push({event,payload});return track(event,payload)};
     });
     for(const [name,value] of [['teamCount',scenario.team],['jobsCount',scenario.jobs],['budgetAmount',scenario.budget]])await page.locator(`[name="${name}"][value="${value}"]`).check();
     await page.locator('.finder-primary-cta').click({timeout:4000});
     const snapshot=await page.evaluate(async()=>{
      await new Promise(r=>setTimeout(r,80));
      return [...document.querySelectorAll('#finderResults article.result')].map(card=>({
       name:card.querySelector('h3').textContent,
       plan:card.querySelector('.result-plan')?.textContent,
       scores:[...card.querySelectorAll('.df-score-row')].map(e=>e.textContent),
       links:[...card.querySelectorAll('a')].map(a=>({href:a.getAttribute('href'),rel:a.rel,vendor:a.dataset.vendor||null}))
      }));
     });
     assert(snapshot.length>0,'No results');
     if(variant==='before-direct')expected=snapshot;else assert.deepEqual(snapshot,expected,'Ranking/plan/score/destination regression');
     // DOM must stop changing after the result enhancement callbacks finish.
     const mutations=await page.evaluate(async()=>{
      let count=0;const o=new MutationObserver(rs=>count+=rs.length);
      o.observe(document.querySelector('#finderResults'),{childList:true,subtree:true});
      await new Promise(r=>setTimeout(r,100));o.disconnect();return count;
     });
     assert.equal(mutations,0,'Result DOM did not settle');
     await page.locator('.finder-primary-cta').click({timeout:4000});
     const vendor=page.locator('#finderResults a[rel~="sponsored"]').first();
     if(await vendor.count()){
      await vendor.evaluate(a=>a.addEventListener('click',e=>e.preventDefault(),{once:true}));
      await vendor.click({timeout:4000});
     }
     const state=await page.evaluate(()=>({qa:localStorage.getItem('detailerfit_qa_mode'),width:innerWidth,scroll:document.documentElement.scrollWidth,events:window.__qaEvents.map(e=>e.event),networkTelemetry:performance.getEntriesByType('resource').filter(r=>/google-analytics|googletagmanager|posthog/.test(r.name)).map(r=>r.name),nextNotes:document.querySelectorAll('#instagramFinderNextStep').length,comparison:document.querySelector('#finderResults a[href*="compare"]')?.getAttribute('href')}));
     assert.equal(state.qa,'1');assert.equal(state.networkTelemetry.length,0);
     assert(state.scroll<=width+1,'Horizontal overflow');
     assert.equal(errors.length,0,errors.join('; '));
     if(source){assert.equal(state.nextNotes,1);assert.equal(state.events.filter(e=>e==='instagram_finder_result_view').length,1)}
     assert(!requests.some(h=>h!=='static.cloudflareinsights.com'),'Unexpected external request');
     reports.push({engine,width,scenario:scenario.name,variant,cards:snapshot.length,settledMutations:mutations,events:state.events,errors});
     await page.close();
    }
   }
  }
  console.log(JSON.stringify({status:'PASS',engine,cases:reports.length,base,reports},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
