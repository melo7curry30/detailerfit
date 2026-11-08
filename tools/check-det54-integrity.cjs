'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const preview=process.env.DET57_PREVIEW_URL||'https://det-57-release-reconciled-20261108-detailerfit-git.carmelo7kobe24.workers.dev';
const production='https://getdetailerfit.com';
const routes=['/','/finder','/housecall-pro','/housecall-pro-pricing-auto-detailers',
'/housecall-pro-alternatives-auto-detailers','/quoteiq-vs-housecall-pro',
'/jobber-vs-housecall-pro-auto-detailing','/urable-vs-housecall-pro','/compare',
'/reviews','/software-cost-calculator','/auto-detailing-software-pricing',
'/how-to-stop-no-shows-mobile-detailing','/affiliate-disclosure'];
const bad=[
{name:'revoked domain',re:/housecallpro\.partnerlinks\.io/i},
{name:'obsolete promotion',re:/(?:get|claim)\s+(?:a\s+)?20%\s+off\s+housecall\s+pro/i},
{name:'outdated mixed disclosure',re:/both\s+primary\s+buttons\s+are\s+affiliate\s+links/i}
];
const matches=s=>bad.flatMap(x=>{const m=x.re.exec(s);return m?[{name:x.name,excerpt:s.slice(Math.max(0,m.index-70),m.index+160).replace(/\s+/g,' ')}]:[]});
const report={at:new Date().toISOString(),source:[],preview:[],production:[]};
const files=cp.execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(p=>/\.(html|js|css)$/i.test(p)&&!p.startsWith('docs/')&&!p.startsWith('tools/')&&!p.includes('.github/'));
for(const path of files){const hits=matches(fs.readFileSync(path,'utf8'));if(hits.length)report.source.push({path,hits});}
assert.equal(report.source.length,0,'Candidate source revocation mismatch: '+JSON.stringify(report.source));
console.log('PASS source source-file sweep',files.length,'files');
async function examine(base,isPreview){
const dest=isPreview?report.preview:report.production;
for(const route of routes){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),25000);
 try{
  const response=await fetch(base+route,{redirect:'follow',signal:controller.signal});
  const body=await response.text();
  const hits=matches(body);
  const entry={route,status:response.status,hits};
  dest.push(entry);
  assert(response.ok,route+' HTTP '+response.status);
  if(isPreview){
   assert.equal(hits.length,0,'Candidate has obsolete HCP text '+route+': '+JSON.stringify(hits));
   if(route==='/quoteiq-vs-housecall-pro')assert(/Housecall Pro buttons? (?:link|links|go) to (?:its|the) official/i.test(body),'Mixed disclosure missing update');
  }else if(hits.length)console.log('KNOWN PRODUCTION GAP',route,JSON.stringify(hits));
 }finally{clearTimeout(timer);}
}
}
(async()=>{
 fs.mkdirSync('qa-artifacts',{recursive:true});
 try{await examine(preview,true);await examine(production,false);
  console.log('PASS candidate HCP audit',routes.length,'routes; production gaps',report.production.filter(x=>x.hits.length).length);}
 finally{fs.writeFileSync('qa-artifacts/det54-integrity.json',JSON.stringify(report,null,2)+'\n');}
})().catch(e=>{console.error(e);process.exitCode=1});
