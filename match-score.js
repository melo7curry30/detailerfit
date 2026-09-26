/* DetailerFit Evidence-Weighted Match Score v1.0.0
 * Scope: Software Finder only.
 * Match Score is personalized fit, not a universal vendor quality rating.
 * Affiliate relationships and commission data are intentionally absent.
 */
(function(){
  'use strict';

  const MODEL_VERSION='1.0.0';
  const LAST_VERIFIED='2026-09-27';
  const EVIDENCE={
    hands_on:1.00,
    official_help:0.98,
    official_product:0.95,
    official_demo:0.90,
    vendor_confirmed:0.85,
    multi_third_party:0.70,
    unknown:0.00
  };

  const evidenceLabel={
    hands_on:'Hands-on verified',
    official_help:'Official help documentation',
    official_product:'Official pricing / product documentation',
    official_demo:'Official demo / release material',
    vendor_confirmed:'Vendor-confirmed',
    multi_third_party:'Multiple third-party sources',
    unknown:'Not verified'
  };

  // Raw values use a conservative rubric:
  // 100 = requirement clearly confirmed; 50 = partial/neutral/unknown; 0 = clearly does not satisfy.
  // Evidence confidence then shrinks raw scores toward neutral 50.
  const vendors={
    'QuoteIQ':{
      url:'quoteiq',vendorUrl:'https://admin-quoteiq.web.app/register?via=ryo',vendorRel:'sponsored noopener',
      why:'Detailing-oriented quoting, invoicing and scheduling with deeper communications and operations on higher tiers.',
      watch:'Customer self-booking uses InstaSchedule and starts on Elite. Seat limits are plan-gated.',
      tags:['Web + iOS + Android','Detailing-focused'],
      industry:{raw:100,evidence:'official_product',note:'Purpose-built detailing workflow.'},
      automation:{raw:100,evidence:'official_product',note:'Automation/admin capability is plan-gated and the Finder moves to the first eligible tier.'},
      scale:{raw:50,evidence:'official_product',note:'Team capacity is documented; the full routing/dispatch cluster is not treated as fully established here.'},
      vehicle:{raw:50,evidence:'unknown',note:'Vehicle-first VIN/documentation workflow is not scored without stronger evidence.'}
    },
    'Mobile Tech RX':{
      url:'mobile-tech-rx-review-auto-detailers',vendorUrl:'https://www.mobiletechrx.com/?_by=detailerfit-5e824c',vendorRel:'sponsored noopener',
      why:'Vehicle-first automotive workflow built around VIN scanning, estimating, before/after documentation and structured job operations.',
      watch:'Native customer-facing self-booking was not clearly established in the official sources reviewed. Route optimization is also not treated as confirmed.',
      tags:['Vehicle-first','VIN + estimating'],
      industry:{raw:75,evidence:'official_product',note:'Automotive-specialist rather than general field service.'},
      automation:{raw:50,evidence:'official_product',note:'Broad admin tooling exists, but the selected priority is not scored as fully confirmed from current Finder evidence.'},
      scale:{raw:50,evidence:'unknown',note:'Routing/dispatch is not treated as confirmed.'},
      vehicle:{raw:100,evidence:'official_product',note:'VIN scanning, estimating and vehicle documentation are core documented workflows.'}
    },
    'ServiceM8':{
      url:'servicem8',vendorUrl:'https://www.servicem8.com/us/pricing',vendorRel:'noopener',
      why:'Low entry cost, published job-volume tiers, online booking and unlimited users on paid plans.',
      watch:'The full field experience is Apple-first. Android field staff use ServiceM8 Lite.',
      tags:['Apple-first','Unlimited users on paid plans'],
      industry:{raw:50,evidence:'official_product',note:'General field-service platform, not detailing-specific.'},
      automation:{raw:50,evidence:'unknown',note:'Not enough normalized Finder evidence to award a full automation match.'},
      scale:{raw:50,evidence:'unknown',note:'Not enough normalized Finder evidence to award a full routing/dispatch match.'},
      vehicle:{raw:50,evidence:'unknown',note:'Vehicle-first VIN/documentation workflow is not established in the current Finder dataset.'}
    },
    'Jobber':{
      url:'jobber',vendorUrl:'https://www.getjobber.com/pricing/',vendorRel:'noopener',
      why:'Mature general field-service workflow with customer booking and stronger automation/team tooling above entry level.',
      watch:'For teams above five, current official pricing and Help Center material are not perfectly aligned, so seat configuration is marked for verification.',
      tags:['iOS + Android','General field service'],
      industry:{raw:50,evidence:'official_product',note:'General field-service platform, not detailing-specific.'},
      automation:{raw:100,evidence:'official_product',note:'Automation is documented on the eligible plan path used by the Finder.'},
      scale:{raw:50,evidence:'official_product',note:'Team tooling is documented; this normalized model does not assume the full routing/dispatch cluster without plan-level verification.'},
      vehicle:{raw:50,evidence:'unknown',note:'Vehicle-first VIN/documentation workflow is not established in the current Finder dataset.'}
    },
    'Urable':{
      url:'urable',vendorUrl:'https://urable.com/pricing/',vendorRel:'noopener',
      why:'Automotive-specialist workflow with unlimited users and customer online booking on Pro.',
      watch:'Express has internal scheduling; customer online booking starts on Pro.',
      tags:['Web + iOS + Android','Unlimited users'],
      industry:{raw:75,evidence:'official_product',note:'Automotive-specialist workflow.'},
      automation:{raw:100,evidence:'official_product',note:'The Finder moves to Pro when automation is selected.'},
      scale:{raw:50,evidence:'official_product',note:'Unlimited users are documented; the full routing/dispatch cluster is kept neutral until normalized verification is complete.'},
      vehicle:{raw:50,evidence:'unknown',note:'Vehicle-first VIN/documentation workflow is not awarded without stronger normalized evidence.'}
    },
    'Housecall Pro':{
      url:'housecall-pro',vendorUrl:'https://housecallpro.partnerlinks.io/lquesdqg2t22',vendorRel:'sponsored noopener',vendorTarget:'_blank',
      why:'Broad field-service platform with customer booking, scheduling/dispatch and larger-team plan paths.',
      watch:'Built for general home-service operations rather than vehicle-care businesses. User counts are plan-gated.',
      tags:['iOS + Android','Dispatch-focused'],
      industry:{raw:50,evidence:'official_product',note:'General field-service platform, not detailing-specific.'},
      automation:{raw:50,evidence:'official_product',note:'Broad operational tooling is documented, but the normalized automation cluster is not treated as fully confirmed here.'},
      scale:{raw:100,evidence:'official_product',note:'Scheduling/dispatch and team controls are documented on the relevant plan path.'},
      vehicle:{raw:50,evidence:'unknown',note:'Vehicle-first VIN/documentation workflow is not established in the current Finder dataset.'}
    }
  };

  function adjusted(raw,confidence){
    return 50+(confidence*(raw-50));
  }
  function round1(n){return Math.round(n*10)/10;}
  function money(v){return Number.isFinite(v)?`$${v.toFixed(2).replace('.00','')}/mo`:'Price to verify';}
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function evidenceCriterion(key,label,base,weight){
    const conf=EVIDENCE[base.evidence]??0;
    return {key,label,raw:base.raw,confidence:conf,adjusted:adjusted(base.raw,conf),weight,note:base.note,evidence:base.evidence};
  }

  function quoteIqPlan(team,booking,needs){
    const tiers=[
      {plan:'Essentials',cost:29.99,annual:'$25/mo effective annual',users:'1 user',booking:false},
      {plan:'Beginner',cost:74.99,annual:'$62.50/mo effective annual',users:'2 users',booking:false},
      {plan:'Pro',cost:149.99,annual:'$125/mo effective annual',users:'4 users',booking:false},
      {plan:'Elite',cost:299,annual:'$249/mo effective annual',users:'10 users',booking:true},
      {plan:'Max',cost:699,annual:'$582.50/mo effective annual',users:'Unlimited users',booking:true}
    ];
    let seatIndex=team<=1?0:team<=2?1:team<=4?2:team<=10?3:4;
    let featureIndex=0;
    if(needs.includes('automation'))featureIndex=Math.max(featureIndex,2);
    if(booking==='yes'||needs.includes('scale'))featureIndex=Math.max(featureIndex,3);
    return {...tiers[Math.max(seatIndex,featureIndex)],capacityConfidence:EVIDENCE.official_product};
  }

  function mobileTechRxPlan(team,needs){
    if(team>10)return {plan:'Custom pricing',cost:null,annual:'',users:`${team} users · custom pricing`,booking:'unverified',capacityConfidence:EVIDENCE.vendor_confirmed,note:'Teams above 10 are directed to custom pricing.'};
    let tier='Getting Started',base=39,extra=15,annualBase=429,annualExtra=165;
    if(needs.includes('scale')){tier='Pro';base=199;extra=29;annualBase=2189;annualExtra=319;}
    else if(needs.includes('automation')){tier='Standard';base=99;extra=29;annualBase=1089;annualExtra=319;}
    const additional=Math.max(0,team-1),cost=base+(additional*extra),annualTotal=annualBase+(additional*annualExtra);
    return {plan:tier,cost,annual:`$${(annualTotal/12).toFixed(2).replace('.00','')}/mo effective · $${annualTotal.toFixed(0)}/year`,users:`1 admin + ${additional} additional user${additional===1?'':'s'}`,booking:'unverified',capacityConfidence:EVIDENCE.official_product};
  }

  function serviceM8Plan(team,jobs){
    if(team===1&&jobs<=30)return {plan:'Free',cost:0,annual:'',users:'1 user · 30 jobs/mo',booking:true,capacityConfidence:EVIDENCE.official_product};
    if(jobs<=50)return {plan:'Starter',cost:29,annual:'',users:'Unlimited users · 50 jobs/mo',booking:true,capacityConfidence:EVIDENCE.official_product};
    if(jobs<=150)return {plan:'Growing',cost:79,annual:'',users:'Unlimited users · 150 jobs/mo',booking:true,capacityConfidence:EVIDENCE.official_product};
    if(jobs<=500)return {plan:'Premium',cost:149,annual:'',users:'Unlimited users · 500 jobs/mo',booking:true,capacityConfidence:EVIDENCE.official_product};
    const extraJobs=Math.max(0,jobs-1500),cost=349+(extraJobs*0.20);
    return {plan:'Premium Plus',cost,annual:'',users:extraJobs>0?`Unlimited users · 1,500 jobs included + ${extraJobs} extra @ $0.20/job`:'Unlimited users · 1,500 jobs/mo',booking:true,capacityConfidence:EVIDENCE.official_product};
  }

  function jobberPlan(team,needs){
    const needsConnect=team>1||needs.includes('automation')||needs.includes('scale');
    if(!needsConnect)return {plan:'Core',cost:49,annual:'from $29/mo billed annually',users:'1 user',booking:true,capacityConfidence:EVIDENCE.official_product};
    if(team<=1)return {plan:'Connect',cost:139,annual:'from $99/mo billed annually',users:'1-user configuration',booking:true,capacityConfidence:EVIDENCE.official_product};
    if(team<=5)return {plan:'Connect',cost:199,annual:'from $149/mo billed annually',users:'5 users included',booking:true,capacityConfidence:EVIDENCE.official_product};
    return {plan:'Verify with Jobber',cost:null,annual:'',users:`${team} users · seat configuration to verify`,booking:true,capacityConfidence:0.35,note:'Official seat documentation is not sufficiently aligned above five users.'};
  }

  function urablePlan(booking,needs){
    if(booking==='yes'||needs.includes('automation'))return {plan:'Pro',cost:110,annual:'$1,320/year',users:'Unlimited users',booking:true,capacityConfidence:EVIDENCE.official_product};
    return {plan:'Express',cost:70,annual:'$840/year',users:'Unlimited users',booking:false,capacityConfidence:EVIDENCE.official_product};
  }

  function hcpPlan(team,needs){
    if(team===1&&!needs.includes('scale'))return {plan:'Basic',cost:79,annual:'$59/mo billed annually',users:'1 user',booking:true,capacityConfidence:EVIDENCE.official_product};
    if(team<=5)return {plan:'Essentials',cost:189,annual:'$149/mo billed annually',users:'5 users included',booking:true,capacityConfidence:EVIDENCE.official_product};
    const extra=Math.max(0,team-8);
    return {plan:extra>0?'Max + extra users':'Max',cost:329+(extra*35),annual:extra>0?`$299/mo annual base + $${extra*35}/mo for ${extra} extra user${extra===1?'':'s'}`:'$299/mo billed annually',users:extra>0?`8 included + ${extra} extra user${extra===1?'':'s'} @ $35/mo each`:'8 users included',booking:true,capacityConfidence:EVIDENCE.official_product};
  }

  function planFor(name,team,jobs,booking,needs){
    if(name==='QuoteIQ')return quoteIqPlan(team,booking,needs);
    if(name==='Mobile Tech RX')return mobileTechRxPlan(team,needs);
    if(name==='ServiceM8')return serviceM8Plan(team,jobs);
    if(name==='Jobber')return jobberPlan(team,needs);
    if(name==='Urable')return urablePlan(booking,needs);
    if(name==='Housecall Pro')return hcpPlan(team,needs);
  }

  function priceCriterion(cost,budget){
    if(!Number.isFinite(cost))return {key:'price',label:'Price fit',raw:50,confidence:0.25,adjusted:50,weight:30,note:'Exact monthly cost is not verified for this configuration.',evidence:'unknown'};
    if(budget<=0)return {key:'price',label:'Price fit',raw:50,confidence:EVIDENCE.official_product,adjusted:50,weight:30,note:'No positive budget was entered, so price remains neutral.',evidence:'official_product'};
    const raw=cost<=budget?100:Math.max(0,Math.min(100,100*Math.pow(budget/cost,2)));
    return {key:'price',label:'Price fit',raw,confidence:EVIDENCE.official_product,adjusted:adjusted(raw,EVIDENCE.official_product),weight:30,note:cost<=budget?'Selected plan is within the stated monthly budget.':'Over-budget plans receive a continuous penalty based on the budget-to-cost ratio.',evidence:'official_product'};
  }

  function capacityCriterion(name,plan){
    const conf=plan.capacityConfidence??0;
    const raw=conf>=0.90?100:50;
    return {key:'capacity',label:'Team / capacity fit',raw,confidence:conf,adjusted:adjusted(raw,conf),weight:15,note:plan.note||'The selected plan is the first verified configuration that fits the entered team/volume rules.',evidence:conf>=0.9?'official_product':conf>0?'vendor_confirmed':'unknown'};
  }

  function deviceCriterion(name,device){
    if(device==='either')return null;
    let raw=100,ev='official_product',note='Current Finder research supports this device fit.';
    if(name==='ServiceM8'&&device==='android'){
      raw=50;ev='official_help';note='Android field staff use ServiceM8 Lite rather than the full Apple-first field experience.';
    }
    const conf=EVIDENCE[ev];
    return {key:'device',label:'Device fit',raw,confidence:conf,adjusted:adjusted(raw,conf),weight:15,note,evidence:ev};
  }

  function bookingCriterion(plan,booking){
    if(booking!=='yes')return null;
    if(plan.booking==='unverified')return {gate:'unverified',reason:'Native customer self-booking is required but is not verified in the current evidence set.'};
    const raw=plan.booking===true?100:0,conf=EVIDENCE.official_product;
    return {key:'booking',label:'Customer self-booking',raw,confidence:conf,adjusted:adjusted(raw,conf),weight:20,note:raw===100?'Customer-facing self-booking is confirmed on the selected plan.':'The selected plan does not satisfy the required self-booking workflow.',evidence:'official_product'};
  }

  function scoreVendor(name,input){
    const vendor=vendors[name],plan=planFor(name,input.team,input.jobs,input.booking,input.needs);
    const criteria=[];
    const industryWeight=input.needs.includes('detail')?25:5;
    criteria.push(evidenceCriterion('industry','Industry fit',vendor.industry,industryWeight));
    criteria.push(capacityCriterion(name,plan));
    criteria.push(priceCriterion(plan.cost,input.budget));
    const device=deviceCriterion(name,input.device);if(device)criteria.push(device);
    const booking=bookingCriterion(plan,input.booking);
    if(booking?.gate)return {name,vendor,plan,eligible:false,gateReason:booking.reason,criteria:[]};
    if(booking)criteria.push(booking);
    if(input.needs.includes('vehicle'))criteria.push(evidenceCriterion('vehicle','Vehicle workflow',vendor.vehicle,25));
    if(input.needs.includes('automation'))criteria.push(evidenceCriterion('automation','Automation / admin',vendor.automation,20));
    if(input.needs.includes('scale'))criteria.push(evidenceCriterion('scale','Routing / dispatch / team growth',vendor.scale,20));

    const totalWeight=criteria.reduce((s,c)=>s+c.weight,0)||1;
    const match=criteria.reduce((s,c)=>s+(c.adjusted*c.weight),0)/totalWeight;
    const confidence=criteria.reduce((s,c)=>s+(c.confidence*c.weight),0)/totalWeight*100;
    const knownCost=Number.isFinite(plan.cost),inBudget=knownCost&&plan.cost<=input.budget;
    const gap=knownCost?Math.max(0,plan.cost-input.budget):Infinity;
    return {name,vendor,plan,eligible:true,criteria,match:round1(match),confidence:round1(confidence),knownCost,inBudget,gap};
  }

  function injectStyles(){
    if(document.getElementById('df-match-score-style'))return;
    const style=document.createElement('style');
    style.id='df-match-score-style';
    style.textContent=`
      .df-score-row{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 6px}
      .df-score-badge{display:inline-flex;align-items:baseline;gap:5px;border:1px solid #3d7663;background:#10211c;border-radius:10px;padding:8px 10px}
      .df-score-badge b{font-size:1.35rem;color:var(--accent)}
      .df-confidence-badge{display:inline-flex;align-items:center;border:1px solid var(--line);background:#0f171f;border-radius:10px;padding:8px 10px;font-size:.875rem;color:#cbd6df}
      .df-factors{display:grid;gap:7px;margin:12px 0}
      .df-factor{display:grid;grid-template-columns:minmax(120px,1fr) minmax(100px,1.5fr) auto;gap:8px;align-items:center;font-size:.82rem}
      .df-factor-track{height:7px;background:#26323d;border-radius:999px;overflow:hidden}
      .df-factor-fill{height:100%;background:var(--accent);border-radius:inherit}
      .df-factor small{color:var(--muted)}
      .df-score-note{font-size:.82rem;color:var(--muted);margin:8px 0}
      @media(max-width:520px){.df-factor{grid-template-columns:1fr auto}.df-factor-track{grid-column:1/-1;grid-row:2}.df-factor small{grid-column:2;grid-row:1}.df-score-badge b{font-size:1.2rem}}
    `;
    document.head.appendChild(style);
  }

  function factorHtml(c){
    const val=Math.round(c.adjusted),conf=Math.round(c.confidence*100);
    return `<div class="df-factor" title="${esc(c.note)}"><span>${esc(c.label)}</span><div class="df-factor-track"><div class="df-factor-fill" style="width:${Math.max(0,Math.min(100,val))}%"></div></div><small>${val} · ${conf}% conf.</small></div>`;
  }

  function render(input,scored){
    const eligible=scored.filter(x=>x.eligible);
    const anyInBudget=eligible.some(x=>x.inBudget);
    const pool=anyInBudget?eligible.filter(x=>x.inBudget):eligible;
    pool.sort((a,b)=>b.match-a.match||b.confidence-a.confidence||((a.plan.cost??999999)-(b.plan.cost??999999)));
    const ranked=pool.slice(0,3);

    const budgetMessage=document.getElementById('finderBudgetMessage');
    if(anyInBudget){
      budgetMessage.innerHTML=`<div class="note goodnote"><b>Budget gate applied:</b> At least one verified configuration fits your $${input.budget.toFixed(0)}/month budget, so over-budget options are excluded before Match Score ranking.</div>`;
    }else{
      budgetMessage.innerHTML=`<div class="warning"><b>No verified in-budget configuration found.</b> Over-budget or price-unverified candidates remain eligible and Price Fit is penalized continuously inside the Match Score.</div>`;
    }

    document.getElementById('finderResults').innerHTML=ranked.map((x,i)=>{
      const p=x.plan,v=x.vendor;
      const budgetLabel=x.inBudget?`<span class="pill goodpill">Fits $${input.budget.toFixed(0)} budget</span>`:Number.isFinite(p.cost)?`<span class="pill overpill">$${x.gap.toFixed(0)} over budget</span>`:`<span class="pill">Price to verify</span>`;
      const annual=p.annual?`<div class="small annual-note"><strong>Annual billing:</strong> ${esc(p.annual)}</div>`:'';
      const planNote=p.note?`<div class="small"><strong>Plan note:</strong> ${esc(p.note)}</div>`:'';
      const factors=x.criteria.slice().sort((a,b)=>b.weight-a.weight).map(factorHtml).join('');
      return `<article class="result ${i===0?'top':''}">
        <div class="result-head"><div><div class="kicker">${i===0?'TOP MATCH':'ALTERNATIVE'} · MODEL ${MODEL_VERSION}</div><h3>${i+1}. ${esc(x.name)}</h3></div>${budgetLabel}</div>
        <div class="df-score-row"><div class="df-score-badge"><b>${Math.round(x.match)}%</b><span>Match</span></div><div class="df-confidence-badge">Evidence confidence&nbsp;<strong>${Math.round(x.confidence)}%</strong></div></div>
        <div class="result-plan"><strong>Plan to inspect first:</strong> ${esc(p.plan)} · ${money(p.cost)}</div>${annual}<div class="small"><strong>Capacity:</strong> ${esc(p.users)}</div>${planNote}
        <p class="small">${esc(v.why)}</p>
        <div class="result-tags">${v.tags.map(tag=>`<span class="result-tag">${esc(tag)}</span>`).join('')}</div>
        <div class="df-factors">${factors}</div>
        <p class="df-score-note">Unknown or weakly supported criteria are pulled toward neutral 50 rather than treated as failures. <a href="match-score-methodology">How scoring works</a>.</p>
        <div class="result-watch"><strong>Verify before buying:</strong> ${esc(v.watch)}</div>
        <div class="actions"><a class="btn secondary" href="${esc(v.url)}">See research notes</a><a class="btn primary" data-vendor="${esc(x.name)}" data-cta-position="finder_result" data-tool-name="finder" data-result-rank="${i+1}" data-result-plan="${esc(p.plan)}" href="${esc(v.vendorUrl)}" rel="${esc(v.vendorRel||'noopener')}"${v.vendorTarget?` target="${esc(v.vendorTarget)}"`:''}>Visit ${esc(x.name)}</a>${i===0?'<a class="btn ghost" href="compare">Open comparison hub</a>':''}</div>
      </article>`;
    }).join('');

    if(!ranked.length){
      const reasons=scored.filter(x=>!x.eligible).map(x=>`${x.name}: ${x.gateReason}`);
      document.getElementById('finderResults').innerHTML=`<div class="warning"><b>No verified match.</b> ${esc(reasons.join(' '))}</div>`;
    }

    const box=document.getElementById('resultsBox');
    box.style.display='block';
    if(typeof window.dfTrackEvent==='function'&&ranked.length){
      window.dfTrackEvent('tool_result_view',{tool_name:'finder',result_count:ranked.length,top_vendor:ranked[0].name,top_plan:ranked[0].plan.plan,match_score:ranked[0].match,evidence_confidence:ranked[0].confidence,scoring_model:MODEL_VERSION,any_in_budget:anyInBudget});
    }
    box.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }

  function handleSubmit(e){
    e.preventDefault();
    e.stopImmediatePropagation();
    const form=e.currentTarget,d=new FormData(form);
    const input={
      team:Math.max(1,Number(d.get('teamCount'))||1),
      jobs:Math.max(0,Number(d.get('jobsCount'))||0),
      budget:Math.max(0,Number(d.get('budgetAmount'))||0),
      booking:d.get('booking')||'unsure',
      device:d.get('device')||'either',
      needs:d.getAll('priority')
    };
    if(typeof window.dfTrackEvent==='function')window.dfTrackEvent('tool_start',{tool_name:'finder',team_size:input.team,jobs_per_month:input.jobs,budget_monthly:input.budget,booking_requirement:input.booking,device_preference:input.device,priority_count:input.needs.length,scoring_model:MODEL_VERSION});
    const scored=Object.keys(vendors).map(name=>scoreVendor(name,input));
    render(input,scored);
  }

  document.addEventListener('DOMContentLoaded',()=>{
    injectStyles();
    const form=document.getElementById('finderForm');
    if(!form)return;
    form.addEventListener('submit',handleSubmit,{capture:true});
    window.DetailerFitMatchScore={version:MODEL_VERSION,lastVerified:LAST_VERIFIED,evidence:EVIDENCE,scoreVendor};
  });
})();
