'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const chromium=require('playwright').chromium;
const preview=process.env.DET57_PREVIEW_URL||'https://det-57-release-reconciled-20261108-detailerfit-git.carmelo7kobe24.workers.dev';
const cli=path.resolve('node_modules','.bin','lighthouse');assert(fs.existsSync(cli),'Lighthouse CLI missing');
const targets=[['live','https://getdetailerfit.com','mobile'],['candidate',preview,'mobile'],['live','https://getdetailerfit.com','desktop'],['candidate',preview,'desktop']];
const reports=[];fs.mkdirSync('qa-artifacts',{recursive:true});
for(const [target,origin,device] of targets){
 const out=path.resolve('qa-artifacts','lh-'+target+'-'+device+'.json');
 const args=[origin+'/?df_qa=1','--quiet','--chrome-flags=--headless --no-sandbox --disable-gpu --disable-dev-shm-usage','--output=json','--output-path='+out,'--only-categories=performance,accessibility,best-practices,seo'];
 if(device==='desktop')args.push('--preset=desktop');
 const result=cp.spawnSync(cli,args,{encoding:'utf8',timeout:150000,env:{...process.env,CHROME_PATH:chromium.executablePath()}});
 if(result.status!==0){console.error('Lighthouse failed',target,device,result.status,(result.stderr||'').slice(-2500));process.exitCode=1;continue;}
 const data=JSON.parse(fs.readFileSync(out,'utf8'));
 const score=k=>Math.round((data.categories?.[k]?.score||0)*100);
 const metric=k=>data.audits?.[k]?.numericValue??null;
 const entry={target,device,performance:score('performance'),accessibility:score('accessibility'),bestPractices:score('best-practices'),seo:score('seo'),LCPms:metric('largest-contentful-paint'),FCPms:metric('first-contentful-paint'),TBTms:metric('total-blocking-time'),CLS:metric('cumulative-layout-shift')};
 reports.push(entry);console.log('LIGHTHOUSE',JSON.stringify(entry));
}
for(const device of ['mobile','desktop']){
 const l=reports.find(x=>x.device===device&&x.target==='live'),c=reports.find(x=>x.device===device&&x.target==='candidate');
 if(l&&c)console.log('LAB DELTA',device,'performance:',c.performance-l.performance,'LCP ms:',Math.round((c.LCPms||0)-(l.LCPms||0)));
}
fs.writeFileSync('qa-artifacts/lighthouse-summary.json',JSON.stringify({note:'Single same-run lab checks; not field CWV or release approval.',reports},null,2)+'\n');
if(reports.length!==4)process.exitCode=1;
