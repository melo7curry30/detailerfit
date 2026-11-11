'use strict';
// Offline contract checks. No browser, telemetry or vendor network requests.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const baseline='32996875886214021c46bdea9552e96b3f1f8bc1';
const vendors=['QuoteIQ','Mobile Tech RX','ServiceM8','Jobber','Urable','Strata','DetailPilot','Housecall Pro'];
function harness(source){
  const ready=[],events=[],nodes={};
  const node=id=>nodes[id]||=( {dataset:{},style:{},innerHTML:'',addEventListener(){},scrollIntoView(){},insertAdjacentHTML(p,s){this.innerHTML+=s;}} );
  const ctx={window:{DetailerFitPricing:require('../pricing-data.js'),dfTrackEvent:(event,payload)=>events.push({event,payload})},document:{getElementById:node,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:(n,f)=>{if(n==='DOMContentLoaded')ready.push(f);}}};
  // Expose the existing renderer only inside this isolated VM.
  const marker='window.DetailerFitMatchScore={';
  assert(source.includes(marker));
  vm.runInNewContext(source.replace(marker,'window.__render=render;'+marker),ctx);
  ready.forEach(f=>f());
  return {ctx,nodes,events,score:ctx.window.DetailerFitMatchScore.scoreVendor};
}
const current=harness(fs.readFileSync('match-score.js','utf8'));
const before=harness(execFileSync('git',['show',baseline+':match-score.js'],{encoding:'utf8'}));
const plain=x=>JSON.parse(JSON.stringify(x));
let comparisons=0;
for(const team of [1,3,5,10,25])for(const jobs of [25,50,100,200])for(const budget of [50,100,200,300,500])for(const booking of ['unsure','yes'])for(const device of ['either','ios','android']){
  const input={team,jobs,budget,booking,device,needs:[],setup:'unsure',migration:'unsure'};
  for(const vendor of vendors){assert.deepEqual(plain(current.score(vendor,input)),plain(before.score(vendor,input)));comparisons++;}
}
const basic={team:1,jobs:25,budget:50,booking:'unsure',device:'either',needs:[],setup:'unsure',migration:'unsure'};
const cases=[
  {input:basic,count:3,stage:'initial'},
  {input:{...basic,team:3},count:1,stage:'initial'},
  {input:{...basic,team:3,budget:100,booking:'yes'},count:2,stage:'refined'},
  {input:{...basic,team:25,jobs:200,booking:'yes'},count:3,stage:'refined',over:true},
  {input:{...basic,setup:'guided',migration:'yes'},count:3,stage:'refined'}
];
for(const c of cases){
  current.ctx.window.__render(c.input,vendors.map(v=>current.score(v,c.input)));
  const html=current.nodes.finderResults.innerHTML,event=current.events.at(-1);
  assert.equal((html.match(/<article /g)||[]).length,c.count);
  assert.equal(event.event,'tool_result_view');assert.equal(event.payload.result_count,c.count);assert.equal(event.payload.fit_stage,c.stage);
  assert.equal(html.includes('Match Score</span>'),c.stage==='refined');
  if(c.count<3)assert(current.nodes.finderBudgetMessage.innerHTML.includes(c.count+' matching option'));
  if(c.over)assert(current.nodes.finderBudgetMessage.innerHTML.includes('No verified in-budget'));
  for(const card of html.split('<article ').slice(1)){assert(card.indexOf('Check before choosing:')<card.indexOf('data-vendor='));assert(card.includes('Evidence confidence'));}
}
const app=fs.readFileSync('app.js','utf8');
const start=app.indexOf('function dfTrackEvent('),end=app.indexOf('// One visible CTA exposure');
assert(start>0&&end>start);
for(const qa of [false,true]){
  const listeners=[],calls=[];
  const ctx={DF_QA_MODE:qa,window:{gtag:(...args)=>calls.push(args)},location:{pathname:'/finder'},document:{title:'Finder',addEventListener:(n,f)=>listeners.push(f),querySelectorAll:()=>[]}};
  vm.runInNewContext(app.slice(start,end),ctx);
  for(const [vendor,rel,href,event] of [['QuoteIQ','sponsored noopener','https://admin-quoteiq.web.app/register?via=ryo','affiliate_click'],['Housecall Pro','noopener','https://www.housecallpro.com/pricing/','vendor_outbound_click']]){
    const link={dataset:{vendor,ctaPosition:'finder_result',toolName:'finder',resultRank:'1',resultPlan:'Test'},href,hostname:new URL(href).hostname,textContent:'Visit '+vendor,getAttribute:n=>n==='rel'?rel:href};
    listeners[0]({target:{closest:()=>link}});
    if(!qa){const c=calls.at(-1);assert.equal(c[1],event);assert.equal(c[2].result_rank,1);assert.equal(c[2].link_url,href);assert.equal(c[2].cta_position,'finder_result');assert.equal(c[2].transport_type,'beacon');}
  }
  assert.equal(calls.length,qa?0:2);
}
console.log(`PASS: ${comparisons} unchanged scoring/plan/eligibility/vendor comparisons; ${cases.length} render/event cases; affiliate vs official outbound event payloads and QA suppression. This does not verify GA4 server receipt or partner attribution.`);
