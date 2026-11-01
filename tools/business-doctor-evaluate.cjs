/* Evidence-gated pilot shortlist. No commercial fields, scores or Finder edits. */
'use strict';
function evaluate(r){
  const required=['confirmedNeed','booking','team','territories','driveTime','vehicleRecords','bookableEstimates','budget'];
  const missing=required.filter(k=>r[k]===undefined||r[k]===null||r[k]==='unknown');
  if(r.confirmedNeed===false)return {status:'keep-current',candidates:[],questions:['Try a supported copy/process change before buying software.']};
  if(missing.length)return {status:'clarify',candidates:[],questions:missing};
  if(!['request','instant','none'].includes(r.booking)||![r.team,r.territories].every(n=>Number.isInteger(n)&&n>0)||typeof r.budget!=='number'||!Number.isFinite(r.budget)||r.budget<0||!['confirmedNeed','driveTime','vehicleRecords','bookableEstimates'].every(k=>typeof r[k]==='boolean'))throw Error('Invalid confirmed requirements');
  const candidates=[],blocked=[];
  function add(vendor,plan,cost,notes){if(cost<=r.budget)candidates.push({vendor,plan,monthlyUSD:cost,status:'inspect',notes});else blocked.push({vendor,reason:'Over confirmed monthly budget',plan,monthlyUSD:cost});}
  if(r.vehicleRecords){
    if(r.booking==='none')add('Urable','Express',70,'Verify vehicle-record needs and per-location subscription cost.');
    else candidates.push({vendor:'Urable',plan:'Pro',monthlyUSD:null,status:'quote-required',notes:'Official monthly price conflict ($110 pricing page vs $120 help). Budget and location fit unresolved; no exact cost recommendation.'});
    blocked.push({vendor:'ServiceLink / Zenbooker',reason:'Detailed vehicle-record requirement is not verified for this pilot catalog.'});
  }else{
    if(!r.driveTime&&!r.bookableEstimates&&r.territories===1&&r.team<=4)add('ServiceLink',r.team===1?'Pro':'Team',r.team===1?20:60,'Verify service duration, request/instant booking behavior, area rules and payment-device eligibility.');
    else blocked.push({vendor:'ServiceLink',reason:'Required territory, drive-time, bookable-estimate or >4-person capability not verified.'});
    const tiers=[['Standard',29,2],['Professional',79,8],['Enterprise',149,36],['National',259,96]];
    const start=r.driveTime?2:r.bookableEstimates?1:0;
    const tier=tiers.slice(start).find(t=>t[2]>=r.territories);
    if(tier)add('Zenbooker',tier[0],tier[1],'Verify vehicle intake and current checkout fees. Territory count must be confirmed by the owner.');
    else blocked.push({vendor:'Zenbooker',reason:'More than 96 territories; custom quote required.'});
  }
  if(r.fleetConsolidatedBilling===true){for(const c of candidates){c.status='verify-required';c.notes+=' Consolidated fleet invoicing is unverified; do not recommend purchase.';}}
  // A vehicle-CRM fit must not silently satisfy unrelated routing/estimate needs.
  for(const c of candidates){
    if(c.vendor==='Urable'&&(r.driveTime||r.bookableEstimates||r.territories>1)){
      c.status='verify-required';c.notes+=' Required drive-time rules, bookable estimates or multi-territory configuration are not established by this catalog; confirm every required workflow and total location cost before purchase.';
    }
  }
  candidates.sort((a,b)=>a.vendor.localeCompare(b.vendor));
  return {status:candidates.length?'conditional-shortlist':'no-verified-fit',catalogScope:'Three-vendor pilot; not exhaustive. Preserve current tools unless a confirmed gap justifies change.',candidates,blocked,questions:[]};
}
module.exports={evaluate};
if(require.main===module){let s='';process.stdin.setEncoding('utf8');process.stdin.on('data',c=>s+=c);process.stdin.on('end',()=>{try{process.stdout.write(JSON.stringify(evaluate(JSON.parse(s)),null,2)+'\n');}catch(e){process.stderr.write(e.message+'\n');process.exitCode=1;}});}
