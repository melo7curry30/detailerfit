'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {normalizeWebsite,buildRequest}=require('../business-doctor.js');
const {evaluate}=require('./business-doctor-evaluate.cjs');
let checks=0;function test(name,fn){fn();checks++;console.log('PASS '+name);}
test('public hostname normalization',()=>assert.equal(normalizeWebsite('my-detail-shop.com/booking'),'https://my-detail-shop.com/booking'));
for(const url of ['javascript:alert(1)','https://user:password@example.org','http://127.0.0.1','http://2130706433','http://[::1]','http://localhost','https://foo.local','https://site.com?email=person@site.com','https://site.com/#token','https://site.com/admin','https://site.com:3000','https://example.com','https://site.com/hello\nBcc:evil@example.org'])test('reject unsafe URL '+url.replace(/\n/g,' '),()=>assert.throws(()=>normalizeWebsite(url)));
const vals={website:'https://my-detail-shop.com',type:'mobile',goal:'booking',authority:true,consent:true};
test('both consents required',()=>{assert.throws(()=>buildRequest({...vals,authority:false},'2026-11-01','BD-QA'));assert.throws(()=>buildRequest({...vals,consent:false},'2026-11-01','BD-QA'));});
test('no injected select values',()=>assert.throws(()=>buildRequest({...vals,type:'<script>'},'2026-11-01','BD-QA')));
test('request has consent version and not-submitted notice',()=>{const s=buildRequest(vals,'2026-11-01T00:00:00Z','BD-QA');assert(s.includes('doctor-consent-v1-20261101'));assert(s.includes('does not submit'));assert(s.includes('not marketing consent'));});
const r={confirmedNeed:true,booking:'instant',team:1,territories:1,driveTime:false,vehicleRecords:false,bookableEstimates:false,budget:50};
test('no software needed is first-class outcome',()=>assert.equal(evaluate({confirmedNeed:false}).status,'keep-current'));
test('unknown requirements never fabricated',()=>assert.equal(evaluate({...r,territories:'unknown'}).status,'clarify'));
test('solo candidates within budget and A-Z',()=>assert.deepEqual(evaluate(r).candidates.map(x=>[x.vendor,x.monthlyUSD]),[['ServiceLink',20],['Zenbooker',29]]));
test('drive-time gate chooses Enterprise',()=>assert.equal(evaluate({...r,driveTime:true,budget:200}).candidates[0].plan,'Enterprise'));
test('bookable estimates gate chooses Professional',()=>assert.equal(evaluate({...r,bookableEstimates:true,budget:100}).candidates[0].plan,'Professional'));
test('team cap does not invent extra seats',()=>assert(!evaluate({...r,team:5}).candidates.some(x=>x.vendor==='ServiceLink')));
test('territory gate does not count city labels',()=>assert.equal(evaluate({...r,territories:9,budget:200}).candidates[0].plan,'Enterprise'));
test('quote conflict never becomes exact Urable cost',()=>{const c=evaluate({...r,vehicleRecords:true,budget:200}).candidates[0];assert.equal(c.monthlyUSD,null);assert.equal(c.status,'quote-required');});
test('vehicle CRM does not imply drive-time support',()=>assert.equal(evaluate({...r,vehicleRecords:true,driveTime:true,budget:200}).candidates[0].status,'verify-required'));
test('multiple territories do not imply one Urable subscription fits',()=>assert.equal(evaluate({...r,vehicleRecords:true,territories:2,budget:200}).candidates[0].status,'verify-required'));
test('unknown fleet billing blocks purchase recommendation',()=>assert(evaluate({...r,fleetConsolidatedBilling:true}).candidates.every(x=>x.status==='verify-required')));
test('commercial fields cannot affect result',()=>assert.deepEqual(evaluate(r),evaluate({...r,commission:100000,affiliateStatus:'Active',preferredVendor:'Zenbooker'})));
test('no affordable fit is explicit',()=>assert.equal(evaluate({...r,budget:10}).status,'no-verified-fit'));
test('invalid inputs fail closed',()=>assert.throws(()=>evaluate({...r,team:-1})));
function telemetryHarness({qa=false,blockedStorage=false}={}){
  const listeners={},links=[],scripts=[],calls=[];const consent={checked:false,addEventListener:(k,fn)=>listeners[k]=fn};const status={textContent:''};
  for(const [vendor,rel] of [['ServiceLink','sponsored noopener'],['Urable','noopener'],['Zenbooker','sponsored noopener']])links.push({dataset:{vendor},rel,addEventListener:function(k,fn){if(k==='click')this.click=fn;}});
  const ctx={URLSearchParams,location:{search:qa?'?df_qa=1&email=private@example.org':'?email=private@example.org',pathname:'/business-doctor-options',hash:'#private-client'},history:{replaceState:(a,b,c)=>calls.push(['history',c])},localStorage:{setItem:()=>{if(blockedStorage)throw Error('blocked');},getItem:()=>{if(blockedStorage)throw Error('blocked');return null;}},document:{getElementById:id=>id==='doctor-analytics-consent'?consent:status,querySelectorAll:()=>links,createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}},Date};ctx.window=ctx;vm.runInNewContext(fs.readFileSync('business-doctor-analytics.js','utf8'),ctx);return {ctx,consent,status,listeners,links,scripts,calls};
}
test('zero telemetry before optional consent',()=>{const h=telemetryHarness();h.links[0].click();assert.equal(h.scripts.length,0);assert.equal(h.ctx.dataLayer,undefined);assert.deepEqual(h.calls,[['history','/business-doctor-options']]);});
test('opt-in exact event shape excludes request PII',()=>{const h=telemetryHarness();h.consent.checked=true;h.listeners.change();h.links[0].click();h.links[1].click();const events=h.ctx.dataLayer.filter(a=>a[0]==='event');assert.deepEqual(Array.from(events,a=>a[1]),['doctor_options_view','affiliate_click','vendor_outbound_click']);assert(!JSON.stringify(h.ctx.dataLayer).includes('private@'));assert(!JSON.stringify(h.ctx.dataLayer).includes('private-client'));});
test('withdrawal stops future business events',()=>{const h=telemetryHarness();h.consent.checked=true;h.listeners.change();h.consent.checked=false;h.listeners.change();const n=h.ctx.dataLayer.length;h.links[2].click();assert.equal(h.ctx.dataLayer.length,n);assert.equal(h.ctx['ga-disable-G-1MS4N4L2J1'],true);});
test('QA blocks SDK even when browser storage fails',()=>{const h=telemetryHarness({qa:true,blockedStorage:true});h.consent.checked=true;h.listeners.change();assert.equal(h.scripts.length,0);assert.equal(h.consent.checked,false);});
test('intake has no analytics/global app/remote script',()=>{const s=fs.readFileSync('business-doctor.html','utf8');assert(!/src=["'](?:https?:|\/app\.js)/.test(s));assert(!s.includes('business-doctor-analytics'));assert(!s.includes(' checked'));assert(s.includes('<fieldset disabled>'));});
test('existing affiliate identity remains exact before enrichment',()=>{const s=fs.readFileSync('business-doctor-options.html','utf8');assert(s.includes('https://myservicelink.app/?atp=Fo98tt'));assert(s.includes('https://zenbooker.com/?red=detail'));assert(!s.includes('housecallpro.partnerlinks.io'));});
console.log(`\n${checks} meaningful checks passed. Browser layout, delivery, server analytics and partner attribution require separate verification.`);
