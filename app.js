
function toggleMenu(btn){
  const nav=document.getElementById('navlinks');
  if(!nav)return;
  const open=nav.classList.toggle('open');
  if(btn)btn.setAttribute('aria-expanded',String(open));
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

document.addEventListener('DOMContentLoaded',()=>{
  const form=document.getElementById('finderForm');
  if(!form)return;

  const goal=new URLSearchParams(location.search).get('goal');
  const check=(name,value)=>{
    const el=form.querySelector(`[name="${name}"][value="${value}"]`);
    if(el)el.checked=true;
  };
  if(goal==='booking')check('booking','yes');
  if(goal==='budget'){check('budget','low');check('priority','lowcost')}
  if(goal==='iphone')check('device','iphone');
  if(goal==='team'){check('team','grow');check('priority','scale')}

  const tools={
    "QuoteIQ":{
      s:0,url:"quoteiq.html",
      why:"Strong detailing-oriented quoting, invoicing and internal scheduling at a low entry price, with deeper communications and operations on higher tiers.",
      baseWatch:"True customer self-booking is not on Essentials, Beginner or Pro; InstaSchedule starts on Elite.",
      tags:["Web + iOS + Android","Detailing-friendly"]
    },
    "ServiceM8":{
      s:0,url:"servicem8.html",
      why:"Excellent entry economics and unusually generous user limits on paid plans, with scheduling, online bookings and job management tied together.",
      baseWatch:"ServiceM8 is explicitly Apple-first. Android field staff get ServiceM8 Lite rather than the full iPhone/iPad experience.",
      tags:["Apple-first","Unlimited users on paid plans"]
    },
    "Jobber":{
      s:0,url:"jobber.html",
      why:"A mature general field-service workflow with online booking on Core and stronger automation as you move into higher plans.",
      baseWatch:"It is not detailing-specific, and higher automation/team tiers can cost materially more than entry-level specialist options.",
      tags:["iOS + Android","General field service"]
    },
    "Urable":{
      s:0,url:"urable.html",
      why:"The strongest automotive-specialist fit in this five-product set, with unlimited users on every published plan.",
      baseWatch:"The $70 Express tier has internal scheduling, but customer online booking starts on Pro at $110/month.",
      tags:["Web + iOS + Android","Unlimited users"]
    },
    "Housecall Pro":{
      s:0,url:"housecall-pro.html",
      why:"A broad field-service platform with online booking and scheduling/dispatch on Basic, then stronger routing and team controls above it.",
      baseWatch:"It is built for general home-service operations, not specifically for vehicle-care businesses.",
      tags:["iOS + Android","Dispatch-focused"]
    }
  };

  const planFor=(name,d)=>{
    const team=d.get('team'),jobs=d.get('jobs'),booking=d.get('booking'),needs=d.getAll('priority');
    if(name==='QuoteIQ'){
      if(booking==='yes'||team==='grow')return {plan:'Elite',price:'$299/mo',cost:299};
      if(needs.includes('automation'))return {plan:'Pro',price:'$149.99/mo',cost:149.99};
      if(team==='small')return {plan:'Beginner / Pro',price:'$74.99–$149.99/mo',cost:74.99};
      return {plan:'Essentials',price:'$29.99/mo',cost:29.99};
    }
    if(name==='ServiceM8'){
      if(jobs==='low'&&team==='solo')return {plan:'Free',price:'$0/mo',cost:0};
      if(jobs==='starter')return {plan:'Starter',price:'$29/mo',cost:29};
      if(jobs==='mid')return {plan:'Growing',price:'$79/mo',cost:79};
      if(jobs==='high')return {plan:'Premium / Premium Plus',price:'$149–$349/mo',cost:149};
      return {plan:'Starter',price:'$29/mo',cost:29};
    }
    if(name==='Jobber'){
      if(needs.includes('automation')||team==='grow')return {plan:'Connect / Grow',price:'from $99/mo billed annually',cost:99};
      return {plan:'Core',price:'$49/mo flexible · $29/mo annual',cost:49};
    }
    if(name==='Urable'){
      if(booking==='yes'||needs.includes('automation'))return {plan:'Pro',price:'$110/mo',cost:110};
      return {plan:'Express',price:'$70/mo',cost:70};
    }
    if(name==='Housecall Pro'){
      if(team==='grow')return {plan:'Max',price:'$329/mo · $299/mo annual',cost:329};
      if(team==='small'||needs.includes('scale'))return {plan:'Essentials',price:'$189/mo · $149/mo annual',cost:189};
      return {plan:'Basic',price:'$79/mo · $59/mo annual',cost:79};
    }
  };

  const budgetCeiling=(v)=>v==='low'?49:v==='mid'?120:9999;

  form.addEventListener('submit',e=>{
    e.preventDefault();
    Object.values(tools).forEach(x=>x.s=0);

    const d=new FormData(form);
    const team=d.get('team'),jobs=d.get('jobs'),budget=d.get('budget'),
          booking=d.get('booking'),device=d.get('device'),needs=d.getAll('priority');

    if(team==='solo'){tools.ServiceM8.s+=6;tools.QuoteIQ.s+=5;tools.Jobber.s+=3;tools.Urable.s+=2;tools["Housecall Pro"].s+=2}
    if(team==='small'){tools.Urable.s+=5;tools.ServiceM8.s+=5;tools.Jobber.s+=4;tools.QuoteIQ.s+=4;tools["Housecall Pro"].s+=4}
    if(team==='grow'){tools.Jobber.s+=6;tools["Housecall Pro"].s+=6;tools.ServiceM8.s+=4;tools.Urable.s+=4;tools.QuoteIQ.s+=3}

    if(jobs==='low'){tools.ServiceM8.s+=6;tools.QuoteIQ.s+=5;tools.Jobber.s+=2}
    if(jobs==='starter'){tools.ServiceM8.s+=6;tools.QuoteIQ.s+=4;tools.Jobber.s+=3;tools.Urable.s+=2}
    if(jobs==='mid'){tools.ServiceM8.s+=5;tools.Urable.s+=4;tools.QuoteIQ.s+=4;tools.Jobber.s+=4;tools["Housecall Pro"].s+=3}
    if(jobs==='high'){tools.Jobber.s+=6;tools["Housecall Pro"].s+=6;tools.Urable.s+=4;tools.ServiceM8.s+=3;tools.QuoteIQ.s+=3}

    if(budget==='low'){tools.ServiceM8.s+=7;tools.QuoteIQ.s+=6;tools.Jobber.s+=2;tools.Urable.s-=2;tools["Housecall Pro"].s-=2}
    if(budget==='mid'){tools.Urable.s+=5;tools.ServiceM8.s+=4;tools.Jobber.s+=4;tools.QuoteIQ.s+=3;tools["Housecall Pro"].s+=2}
    if(budget==='high'){tools.Jobber.s+=5;tools["Housecall Pro"].s+=5;tools.Urable.s+=4;tools.QuoteIQ.s+=4}

    if(booking==='yes'){tools.Jobber.s+=7;tools.ServiceM8.s+=6;tools["Housecall Pro"].s+=6;tools.Urable.s+=5;tools.QuoteIQ.s+=1}
    else{tools.QuoteIQ.s+=4;tools.ServiceM8.s+=3}

    if(device==='iphone'){tools.ServiceM8.s+=7;tools.QuoteIQ.s+=3;tools.Jobber.s+=3;tools.Urable.s+=3;tools["Housecall Pro"].s+=3}
    if(device==='android'){tools.ServiceM8.s-=5;tools.QuoteIQ.s+=4;tools.Jobber.s+=4;tools.Urable.s+=4;tools["Housecall Pro"].s+=4}
    if(device==='either'){Object.values(tools).forEach(x=>x.s+=2)}

    if(needs.includes('detail')){tools.Urable.s+=7;tools.QuoteIQ.s+=6}
    if(needs.includes('automation')){tools.QuoteIQ.s+=5;tools.Jobber.s+=5;tools["Housecall Pro"].s+=3;tools.Urable.s+=3}
    if(needs.includes('scale')){tools.Jobber.s+=6;tools["Housecall Pro"].s+=6;tools.ServiceM8.s+=5;tools.Urable.s+=5}
    if(needs.includes('lowcost')){tools.ServiceM8.s+=7;tools.QuoteIQ.s+=6;tools.Jobber.s+=2}

    const ceiling=budgetCeiling(budget);
    Object.entries(tools).forEach(([name,t])=>{
      const p=planFor(name,d);
      t.plan=p;
      if(p.cost>ceiling*1.35)t.s-=5;
    });

    const ranked=Object.entries(tools).sort((a,b)=>b[1].s-a[1].s).slice(0,3);
    const results=document.getElementById('finderResults');

    results.innerHTML=ranked.map((x,i)=>{
      const [name,t]=x;
      let watch=t.baseWatch;
      if(t.plan.cost>ceiling*1.35){
        watch=`The plan that best matches these answers (${t.plan.plan}) is above your stated budget. ${watch}`;
      }
      return `
        <article class="result ${i===0?'top':''}">
          <div class="result-head">
            <div>
              <div class="kicker">${i===0?'TOP MATCH':'ALTERNATIVE'}</div>
              <h3>${i+1}. ${name}</h3>
            </div>
            <span class="pill ${i===0?'goodpill':''}">${t.plan.plan}</span>
          </div>
          <div class="result-plan"><strong>Plan to inspect first:</strong> ${t.plan.plan} · ${t.plan.price}</div>
          <p class="small">${t.why}</p>
          <div class="result-tags">${t.tags.map(tag=>`<span class="result-tag">${tag}</span>`).join('')}</div>
          <div class="result-watch"><strong>Watch:</strong> ${watch}</div>
          <div class="actions">
            <a class="btn secondary" href="${t.url}">See research notes</a>
            ${i===0?'<a class="btn ghost" href="compare.html">Compare all 5</a>':''}
          </div>
        </article>`;
    }).join('');

    const box=document.getElementById('resultsBox');
    box.style.display='block';
    box.scrollIntoView({behavior:'smooth',block:'start'});
  });
});
