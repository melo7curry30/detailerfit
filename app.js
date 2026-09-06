
function toggleMenu(btn){
  const nav=document.getElementById('navlinks');
  if(!nav)return;
  const button=btn||document.querySelector('.menuBtn');
  const open=nav.classList.toggle('open');
  if(button)button.setAttribute('aria-expanded',String(open));
}

document.addEventListener('click',(e)=>{
  const nav=document.getElementById('navlinks');
  const btn=document.querySelector('.menuBtn');
  if(!nav||!btn||!nav.classList.contains('open'))return;
  if(!nav.contains(e.target)&&!btn.contains(e.target)){
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
  }
});

document.addEventListener('keydown',(e)=>{
  if(e.key!=='Escape')return;
  const nav=document.getElementById('navlinks');
  const btn=document.querySelector('.menuBtn');
  if(nav?.classList.contains('open')){
    nav.classList.remove('open');
    btn?.setAttribute('aria-expanded','false');
    btn?.focus();
  }
});

document.addEventListener('DOMContentLoaded',()=>{
  // Upgrade older pages that still use the original header markup.
  const menuBtn=document.querySelector('.menuBtn');
  const nav=document.getElementById('navlinks');
  if(menuBtn){
    menuBtn.setAttribute('type','button');
    menuBtn.setAttribute('aria-controls','navlinks');
    if(!menuBtn.hasAttribute('aria-expanded'))menuBtn.setAttribute('aria-expanded','false');
  }
  if(nav&&!nav.hasAttribute('aria-label'))nav.setAttribute('aria-label','Primary navigation');

  const form=document.getElementById('finderForm');
  if(!form)return;

  const goal=new URLSearchParams(location.search).get('goal');
  const setValue=(id,value)=>{
    const el=document.getElementById(id);
    if(el)el.value=value;
  };
  const check=(name,value)=>{
    const el=form.querySelector(`[name="${name}"][value="${value}"]`);
    if(el)el.checked=true;
  };
  if(goal==='booking')check('booking','yes');
  if(goal==='budget')setValue('budgetAmount',49);
  if(goal==='iphone')check('device','iphone');
  if(goal==='team'){
    setValue('teamCount',6);
    check('priority','scale');
  }

  const tools={
    "QuoteIQ":{
      s:0,url:"quoteiq.html",
      why:"Strong detailing-oriented quoting, invoicing and internal scheduling at a low entry price, with deeper communications and operations on higher tiers.",
      baseWatch:"Customer self-booking uses InstaSchedule and starts on Elite. Seat limits are 1 / 2 / 4 / 10 / unlimited across the five plans.",
      tags:["Web + iOS + Android","Detailing-friendly"]
    },
    "ServiceM8":{
      s:0,url:"servicem8.html",
      why:"Excellent entry economics, online booking on all published plans and unlimited users on paid plans.",
      baseWatch:"ServiceM8 is explicitly Apple-first. Android field staff use ServiceM8 Lite rather than the full iPhone/iPad field experience.",
      tags:["Apple-first","Unlimited users on paid plans"]
    },
    "Jobber":{
      s:0,url:"jobber.html",
      why:"A mature general field-service workflow with online booking on Core and stronger automation, routing and team tools above it.",
      baseWatch:"Jobber is not detailing-specific. Its current pricing page and Help Center are not perfectly aligned on some larger-team configurations, so verify the current team quote.",
      tags:["iOS + Android","General field service"]
    },
    "Urable":{
      s:0,url:"urable.html",
      why:"The strongest automotive-specialist fit in this five-product set, with unlimited users on every published plan.",
      baseWatch:"Express has internal scheduling; customer online booking starts on Pro at $110/month.",
      tags:["Web + iOS + Android","Unlimited users"]
    },
    "Housecall Pro":{
      s:0,url:"housecall-pro.html",
      why:"A broad field-service platform with online booking and scheduling/dispatch on Basic, then stronger routing and team controls above it.",
      baseWatch:"It is built for general home-service operations rather than vehicle-care businesses. Teams above eight users can add users to Max at an extra published per-user cost.",
      tags:["iOS + Android","Dispatch-focused"]
    }
  };

  const quoteIqPlan=(team,booking,needs)=>{
    const tiers=[
      {plan:'Essentials',cost:29.99,annual:'$25/mo effective annual',users:'1 user'},
      {plan:'Beginner',cost:74.99,annual:'$62.50/mo effective annual',users:'2 users'},
      {plan:'Pro',cost:149.99,annual:'$125/mo effective annual',users:'4 users'},
      {plan:'Elite',cost:299,annual:'$249/mo effective annual',users:'10 users'},
      {plan:'Max',cost:699,annual:'$582.50/mo effective annual',users:'Unlimited users'}
    ];
    let seatIndex=team<=1?0:team<=2?1:team<=4?2:team<=10?3:4;
    let featureIndex=0;
    if(needs.includes('automation'))featureIndex=Math.max(featureIndex,2);
    if(booking==='yes'||needs.includes('scale'))featureIndex=Math.max(featureIndex,3);
    return tiers[Math.max(seatIndex,featureIndex)];
  };

  const serviceM8Plan=(team,jobs)=>{
    if(team===1&&jobs<=30)return {plan:'Free',cost:0,annual:'',users:'1 user · 30 jobs/mo'};
    if(jobs<=50)return {plan:'Starter',cost:29,annual:'',users:'Unlimited users · 50 jobs/mo'};
    if(jobs<=150)return {plan:'Growing',cost:79,annual:'',users:'Unlimited users · 150 jobs/mo'};
    if(jobs<=500)return {plan:'Premium',cost:149,annual:'',users:'Unlimited users · 500 jobs/mo'};
    return {plan:'Premium Plus',cost:349,annual:'',users:'Unlimited users · 1,500+ jobs/mo'};
  };

  const jobberPlan=(team,needs)=>{
    if(team>15)return {plan:'Contact Sales',cost:null,annual:'',users:'16+ people · verify current configuration'};
    if(team>=11)return {plan:'Plus',cost:699,annual:'from $529/mo billed annually for 15-user configuration',users:'Up to 15 users'};
    if(team>=6)return {plan:'Grow',cost:399,annual:'from $299/mo billed annually for 10-user configuration',users:'Up to 10 users'};
    if(team>=2)return {plan:'Connect',cost:199,annual:'from $149/mo billed annually for 5-user configuration',users:'Up to 5 users'};
    if(needs.includes('automation'))return {plan:'Connect',cost:139,annual:'from $99/mo billed annually',users:'1-user configuration'};
    return {plan:'Core',cost:49,annual:'from $29/mo billed annually',users:'1 user'};
  };

  const urablePlan=(booking,needs)=>{
    if(booking==='yes'||needs.includes('automation'))return {plan:'Pro',cost:110,annual:'$1,320/year',users:'Unlimited users'};
    return {plan:'Express',cost:70,annual:'$840/year',users:'Unlimited users'};
  };

  const hcpPlan=(team,needs)=>{
    if(team===1&&!needs.includes('scale'))return {plan:'Basic',cost:79,annual:'$59/mo billed annually',users:'1 user'};
    if(team<=5)return {plan:'Essentials',cost:189,annual:'$149/mo billed annually',users:'5 users included'};
    const extra=Math.max(0,team-8);
    return {
      plan:extra>0?'Max + extra users':'Max',
      cost:329+(extra*75),
      annual:extra>0?'$299/mo annual base + published extra-user charges':'$299/mo billed annually',
      users:extra>0?`8 included + ${extra} extra user${extra===1?'':'s'}`:'8 users included'
    };
  };

  const planFor=(name,team,jobs,booking,needs)=>{
    if(name==='QuoteIQ')return quoteIqPlan(team,booking,needs);
    if(name==='ServiceM8')return serviceM8Plan(team,jobs);
    if(name==='Jobber')return jobberPlan(team,needs);
    if(name==='Urable')return urablePlan(booking,needs);
    if(name==='Housecall Pro')return hcpPlan(team,needs);
  };

  form.addEventListener('submit',e=>{
    e.preventDefault();
    Object.values(tools).forEach(x=>x.s=0);

    const d=new FormData(form);
    const team=Math.max(1,Number(d.get('teamCount'))||1);
    const jobs=Math.max(0,Number(d.get('jobsCount'))||0);
    const budget=Math.max(0,Number(d.get('budgetAmount'))||0);
    const booking=d.get('booking')||'unsure';
    const device=d.get('device')||'either';
    const needs=d.getAll('priority');

    if(team===1){
      tools.ServiceM8.s+=6;tools.QuoteIQ.s+=5;tools.Jobber.s+=4;tools.Urable.s+=2;tools["Housecall Pro"].s+=2;
    }else if(team<=5){
      tools.Urable.s+=6;tools.ServiceM8.s+=5;tools.Jobber.s+=5;tools["Housecall Pro"].s+=4;tools.QuoteIQ.s+=4;
    }else{
      tools.Urable.s+=7;tools.Jobber.s+=6;tools.ServiceM8.s+=6;tools["Housecall Pro"].s+=5;tools.QuoteIQ.s+=3;
    }

    if(jobs<=30){
      tools.ServiceM8.s+=6;tools.QuoteIQ.s+=5;tools.Jobber.s+=3;
    }else if(jobs<=50){
      tools.ServiceM8.s+=6;tools.QuoteIQ.s+=4;tools.Jobber.s+=3;tools.Urable.s+=2;
    }else if(jobs<=150){
      tools.ServiceM8.s+=5;tools.Urable.s+=4;tools.QuoteIQ.s+=4;tools.Jobber.s+=4;tools["Housecall Pro"].s+=3;
    }else{
      tools.Jobber.s+=6;tools["Housecall Pro"].s+=6;tools.Urable.s+=5;tools.ServiceM8.s+=3;tools.QuoteIQ.s+=3;
    }

    if(booking==='yes'){
      tools.Jobber.s+=7;tools.ServiceM8.s+=7;tools["Housecall Pro"].s+=6;tools.Urable.s+=5;tools.QuoteIQ.s+=1;
    }else if(booking==='no'){
      tools.QuoteIQ.s+=4;tools.ServiceM8.s+=3;
    }

    if(device==='iphone'){
      tools.ServiceM8.s+=7;tools.QuoteIQ.s+=3;tools.Jobber.s+=3;tools.Urable.s+=3;tools["Housecall Pro"].s+=3;
    }else if(device==='android'){
      tools.ServiceM8.s-=7;tools.QuoteIQ.s+=4;tools.Jobber.s+=4;tools.Urable.s+=4;tools["Housecall Pro"].s+=4;
    }else{
      Object.values(tools).forEach(x=>x.s+=2);
    }

    if(needs.includes('detail')){tools.Urable.s+=7;tools.QuoteIQ.s+=6}
    if(needs.includes('automation')){tools.QuoteIQ.s+=5;tools.Jobber.s+=5;tools["Housecall Pro"].s+=3;tools.Urable.s+=3;tools.ServiceM8.s+=3}
    if(needs.includes('scale')){tools.Urable.s+=6;tools.Jobber.s+=6;tools["Housecall Pro"].s+=5;tools.ServiceM8.s+=5;tools.QuoteIQ.s+=3}

    const entries=Object.entries(tools).map(([name,t])=>{
      const p=planFor(name,team,jobs,booking,needs);
      const knownCost=Number.isFinite(p.cost);
      const inBudget=knownCost&&p.cost<=budget;
      const gap=knownCost?Math.max(0,p.cost-budget):Infinity;
      if(inBudget)t.s+=4;
      else if(knownCost)t.s-=3;
      return {name,...t,plan:p,inBudget,gap};
    });

    const anyInBudget=entries.some(x=>x.inBudget);
    entries.sort((a,b)=>{
      if(anyInBudget&&a.inBudget!==b.inBudget)return a.inBudget?-1:1;
      if(!anyInBudget&&a.gap!==b.gap)return a.gap-b.gap;
      if(b.s!==a.s)return b.s-a.s;
      const ac=Number.isFinite(a.plan.cost)?a.plan.cost:999999;
      const bc=Number.isFinite(b.plan.cost)?b.plan.cost:999999;
      return ac-bc;
    });

    const ranked=entries.slice(0,3);
    const budgetMessage=document.getElementById('finderBudgetMessage');
    if(anyInBudget){
      budgetMessage.innerHTML=`<div class="note goodnote"><b>Budget check:</b> At least one shortlisted configuration fits your stated $${budget.toFixed(0)}/month budget using published flexible monthly pricing.</div>`;
    }else{
      const firstKnown=entries.find(x=>Number.isFinite(x.plan.cost));
      budgetMessage.innerHTML=`<div class="warning"><b>No exact budget fit found.</b> Your stated requirements push the first known matching configurations above $${budget.toFixed(0)}/month. The ranking below starts with the closest published price match; consider changing a requirement before buying.${firstKnown?` Closest known monthly configuration: ${firstKnown.name} ${firstKnown.plan.plan} at about $${firstKnown.plan.cost.toFixed(2).replace('.00','')}/mo.`:''}</div>`;
    }

    const money=(v)=>Number.isFinite(v)?`$${v.toFixed(2).replace('.00','')}/mo`:'Contact sales';

    document.getElementById('finderResults').innerHTML=ranked.map((x,i)=>{
      const p=x.plan;
      const budgetLabel=x.inBudget
        ? `<span class="pill goodpill">Fits $${budget.toFixed(0)} budget</span>`
        : Number.isFinite(p.cost)
          ? `<span class="pill overpill">$${x.gap.toFixed(0)} over budget</span>`
          : `<span class="pill">Price to verify</span>`;
      const annual=p.annual?`<div class="small">Lower-commitment option shown above · ${p.annual}</div>`:'';
      return `
        <article class="result ${i===0?'top':''}">
          <div class="result-head">
            <div>
              <div class="kicker">${i===0?'TOP MATCH':'ALTERNATIVE'}</div>
              <h3>${i+1}. ${x.name}</h3>
            </div>
            ${budgetLabel}
          </div>
          <div class="result-plan"><strong>Plan to inspect first:</strong> ${p.plan} · ${money(p.cost)}</div>
          ${annual}
          <div class="small"><strong>Capacity:</strong> ${p.users}</div>
          <p class="small">${x.why}</p>
          <div class="result-tags">${x.tags.map(tag=>`<span class="result-tag">${tag}</span>`).join('')}</div>
          <div class="result-watch"><strong>Verify before buying:</strong> ${x.baseWatch}</div>
          <div class="actions">
            <a class="btn secondary" href="${x.url}">See research notes</a>
            ${i===0?'<a class="btn ghost" href="compare.html">Compare all 5</a>':''}
          </div>
        </article>`;
    }).join('');

    const box=document.getElementById('resultsBox');
    box.style.display='block';
    box.scrollIntoView({behavior:'smooth',block:'start'});
  });
});
