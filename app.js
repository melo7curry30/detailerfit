
function toggleMenu(){
  document.getElementById('navlinks')?.classList.toggle('open');
}
document.addEventListener('DOMContentLoaded',()=>{
  const form=document.getElementById('finderForm');
  if(!form)return;
  const tools={
    "QuoteIQ":{s:0,url:"quoteiq.html",why:"Detailing-friendly quoting, scheduling and invoicing with a low published entry price and deeper automation on higher tiers."},
    "ServiceM8":{s:0,url:"servicem8.html",why:"Excellent starting economics for solo operators, with a free tier and an Apple-first field workflow."},
    "Jobber":{s:0,url:"jobber.html",why:"A broad field-service platform that becomes more compelling as team size, routing and process complexity increase."},
    "Urable":{s:0,url:"compare.html",why:"A vehicle-service-focused option with online booking, invoicing, automation and unlimited users on its entry plan."},
    "Housecall Pro":{s:0,url:"compare.html",why:"A general field-service suite with strong booking, dispatch, proposals, payments and review tools."}
  };
  form.addEventListener('submit',e=>{
    e.preventDefault();
    Object.values(tools).forEach(x=>x.s=0);
    const d=new FormData(form),team=d.get('team'),jobs=d.get('jobs'),budget=d.get('budget'),needs=d.getAll('need');
    if(team==='solo'){tools.ServiceM8.s+=5;tools.QuoteIQ.s+=4;tools.Urable.s+=2}
    if(team==='small'){tools.QuoteIQ.s+=5;tools.ServiceM8.s+=4;tools.Urable.s+=4;tools.Jobber.s+=3}
    if(team==='grow'){tools.Jobber.s+=6;tools.HousecallPro?.s;tools["Housecall Pro"].s+=5;tools.QuoteIQ.s+=3;tools.Urable.s+=3}
    if(jobs==='low'){tools.ServiceM8.s+=5;tools.QuoteIQ.s+=4}
    if(jobs==='mid'){tools.QuoteIQ.s+=5;tools.Urable.s+=4;tools.ServiceM8.s+=3;tools.Jobber.s+=2}
    if(jobs==='high'){tools.Jobber.s+=5;tools["Housecall Pro"].s+=5;tools.QuoteIQ.s+=3}
    if(budget==='low'){tools.ServiceM8.s+=6;tools.QuoteIQ.s+=5}
    if(budget==='mid'){tools.QuoteIQ.s+=4;tools.Urable.s+=4;tools.ServiceM8.s+=3}
    if(budget==='high'){tools.Jobber.s+=4;tools["Housecall Pro"].s+=4;tools.QuoteIQ.s+=4;tools.Urable.s+=3}
    if(needs.includes('iphone'))tools.ServiceM8.s+=6;
    if(needs.includes('detail')){tools.QuoteIQ.s+=5;tools.Urable.s+=5}
    if(needs.includes('auto')){tools.QuoteIQ.s+=4;tools.Jobber.s+=4;tools["Housecall Pro"].s+=3}
    if(needs.includes('scale')){tools.Jobber.s+=6;tools["Housecall Pro"].s+=5;tools.ServiceM8.s+=3}
    const ranked=Object.entries(tools).sort((a,b)=>b[1].s-a[1].s).slice(0,3);
    document.getElementById('finderResults').innerHTML=ranked.map((x,i)=>`
      <div class="result">
        <div class="kicker">${i===0?'TOP MATCH':'ALTERNATIVE'}</div>
        <h3>${i+1}. ${x[0]}</h3>
        <p class="small">${x[1].why}</p>
        <a class="btn secondary" href="${x[1].url}">See research notes</a>
      </div>`).join('');
    const box=document.getElementById('resultsBox');box.style.display='block';box.scrollIntoView({behavior:'smooth',block:'start'});
  });
});
