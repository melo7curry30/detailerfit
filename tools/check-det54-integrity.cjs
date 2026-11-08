'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict'),chromium=require('playwright').chromium;
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
async function examine(browser,base,isPreview){
const dest=isPreview?report.preview:report.production;
const page=await browser.newPage();
try{
for(const route of routes){
  const response=await page.goto(base+route+'?df_qa=1',{waitUntil:'domcontentloaded',timeout:30000});
  const body=await page.content(),hits=matches(body),status=response?.status();
  dest.push({route,status,hits});
  assert(response&&response.ok(),route+' HTTP '+status);
  if(isPreview){
    assert.equal(hits.length,0,'Candidate has obsolete HCP text '+route+': '+JSON.stringify(hits));
    if(route==='/quoteiq-vs-housecall-pro')assert(/Housecall Pro buttons? (?:link|links|go) to (?:its|the) official/i.test(body),'Mixed disclosure missing update');
  }else if(hits.length)console.log('KNOWN PRODUCTION GAP',route,JSON.stringify(hits));
}
}finally{await page.close();}
}
(async()=>{
 fs.mkdirSync('qa-artifacts',{recursive:true});
 const browser=await chromium.launch({headless:true});
 try{await examine(browser,preview,true);await examine(browser,production,false);
  console.log('PASS candidate HCP audit',routes.length,'routes; production gaps',report.production.filter(x=>x.hits.length).length);}
 finally{await browser.close();fs.writeFileSync('qa-artifacts/det54-integrity.json',JSON.stringify(report,null,2)+'\n');}
})().catch(e=>{console.error(e);process.exitCode=1});
