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
// Public URL HTTP checks are performed outside GitHub-hosted runners.
// Cloudflare returns HTTP 403 to automated probes from these runners.
// This test is deterministic source-only and intentionally does not certify live delivery.
fs.mkdirSync('qa-artifacts',{recursive:true});
report.publicAudits='NOT RUN in GitHub Actions (runner egress HTTP 403); externally verified separately';
fs.writeFileSync('qa-artifacts/det54-integrity.json',JSON.stringify(report,null,2)+'\n');
console.log('PASS DET-54 source revocation sweep (public delivery not checked here)');
