
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('costCalcForm');
  if (!form) return;

  const money = (n) => Number.isFinite(n)
    ? `$${n.toFixed(2).replace(/\.00$/, '')}`
    : 'Contact sales';

  const total12 = (n) => Number.isFinite(n) ? money(n * 12) : '—';

  const quoteIQ = (team, selfBooking, routeOpt) => {
    const tiers = [
      {plan:'Essentials', monthly:29.99, annualMonthly:25.00, annualTotal:299.99, users:'1 user'},
      {plan:'Beginner', monthly:74.99, annualMonthly:62.50, annualTotal:749.99, users:'2 users'},
      {plan:'Pro', monthly:149.99, annualMonthly:125.00, annualTotal:1499.99, users:'4 users'},
      {plan:'Elite', monthly:299, annualMonthly:249, annualTotal:2990, users:'10 users'},
      {plan:'Max', monthly:699, annualMonthly:582.50, annualTotal:6990, users:'Unlimited users'}
    ];
    let seatIndex = team <= 1 ? 0 : team <= 2 ? 1 : team <= 4 ? 2 : team <= 10 ? 3 : 4;
    let featureIndex = (selfBooking || routeOpt) ? 3 : 0;
    const p = tiers[Math.max(seatIndex, featureIndex)];
    const pushes = [];
    if (team > 1) pushes.push(`${team} users require enough seats`);
    if (selfBooking) pushes.push('customer self-booking requires Elite or higher');
    if (routeOpt) pushes.push('route optimization requires Elite or higher');
    return {
      name:'QuoteIQ', url:'quoteiq.html', plan:p.plan, monthly:p.monthly,
      annualMonthly:p.annualMonthly, annualTotal:p.annualTotal, complete:true,
      capacity:p.users,
      why: pushes.length ? pushes.join('; ') + '.' : 'Essentials covers the entry workflow for one user when self-booking and route optimization are not required.',
      watch:'Plan gates matter sharply: the $29.99 starting price is not the self-booking or route-optimization price.'
    };
  };

  const serviceM8 = (team, jobs, selfBooking, routeOpt) => {
    let p;
    if (team === 1 && jobs <= 30) p={plan:'Free',monthly:0,capacity:'1 user · 30 jobs/mo'};
    else if (jobs <= 50) p={plan:'Starter',monthly:29,capacity:'Unlimited users · 50 jobs/mo'};
    else if (jobs <= 150) p={plan:'Growing',monthly:79,capacity:'Unlimited users · 150 jobs/mo'};
    else if (jobs <= 500) p={plan:'Premium',monthly:149,capacity:'Unlimited users · 500 jobs/mo'};
    else {
      const extraJobs=Math.max(0,jobs-1500);
      p={
        plan:'Premium Plus',
        monthly:349+(extraJobs*0.20),
        capacity:extraJobs>0
          ? `Unlimited users · 1,500 jobs included + ${extraJobs} extra @ $0.20/job`
          : 'Unlimited users · 1,500 jobs/mo'
      };
    }

    let why = `${jobs} jobs/month and ${team} user${team===1?'':'s'} point to ${p.plan}.`;
    if (jobs > 1500) why += ` The published $0.20-per-extra-job charge adds $${((jobs-1500)*0.20).toFixed(2).replace('.00','')} to the $349 Premium Plus base.`;
    if (selfBooking) why += ' Online Bookings are published across all plans.';
    if (routeOpt) why += ' Auto Routing is available as an add-on across plans.';

    return {
      name:'ServiceM8', url:'servicem8.html', plan:p.plan, monthly:p.monthly,
      annualMonthly:null, annualTotal:null, complete:!routeOpt,
      capacity:p.capacity, why,
      watch: routeOpt
        ? 'Route optimization requires the Auto Routing add-on. Its add-on price is not included here, so the full monthly total is unknown.'
        : 'Apple-first product direction: Android field workers use ServiceM8 Lite rather than the full iPhone/iPad field experience.'
    };
  };

  const jobber = (team, selfBooking, routeOpt) => {
    let p;
    if (team > 15) {
      return {
        name:'Jobber', url:'jobber.html', plan:'Contact Sales', monthly:null,
        annualMonthly:null, annualTotal:null, complete:false,
        capacity:'16+ users · contact sales',
        why:'Jobber publishes custom pricing for teams of 16 or more.',
        watch:'A live quote is required, so DetailerFit does not guess the monthly total.'
      };
    }

    const needsConnect=team>1||routeOpt;
    if (!needsConnect) {
      p={plan:'Core',monthly:49,annualMonthly:29,capacity:'1 user'};
    } else if (team <= 1) {
      p={plan:'Connect',monthly:139,annualMonthly:99,capacity:'1-user configuration'};
    } else if (team <= 5) {
      p={plan:'Connect',monthly:199,annualMonthly:149,capacity:'5 users included'};
    } else if (team <= 10) {
      p={plan:'Connect',monthly:299,annualMonthly:229,capacity:'10 users included'};
    } else {
      p={plan:'Connect',monthly:399,annualMonthly:299,capacity:'15 users included'};
    }

    const reasons=[];
    if (team > 1) reasons.push(`${team} users require a multi-user configuration because Core is one user`);
    if (routeOpt) reasons.push('route optimization is available on Connect, Grow, and Plus');
    if (selfBooking) reasons.push('online booking is already available on Core');
    return {
      name:'Jobber', url:'jobber.html', plan:p.plan, monthly:p.monthly,
      annualMonthly:p.annualMonthly, annualTotal:p.annualMonthly*12, complete:true,
      capacity:p.capacity,
      why: reasons.length ? reasons.join('; ') + '.' : 'Core is the lowest published no-commitment configuration for one user.',
      watch:'Current Jobber pricing varies by plan and team-size configuration. This calculator uses the lowest published configuration that meets the selected requirements.'
    };
  };

  const urable = (team, selfBooking, routeOpt) => {
    const p = selfBooking
      ? {plan:'Pro',monthly:110,annualMonthly:110,annualTotal:1320}
      : {plan:'Express',monthly:70,annualMonthly:70,annualTotal:840};
    const reasons=[];
    if (selfBooking) reasons.push('online booking starts on Pro');
    else reasons.push('Express covers internal scheduling');
    if (routeOpt) reasons.push('route creation/optimization is published on Express and above');
    reasons.push('users are unlimited on all published plans');
    return {
      name:'Urable', url:'urable.html', plan:p.plan, monthly:p.monthly,
      annualMonthly:p.annualMonthly, annualTotal:p.annualTotal, complete:true,
      capacity:'Unlimited users', why:reasons.join('; ') + '.',
      watch:'The monthly and published annual totals are effectively the same monthly rate; the main cost jump here is the Pro feature gate for online booking.'
    };
  };

  const housecall = (team, selfBooking, routeOpt) => {
    const make = (plan, baseMonthly, baseAnnual, included, extraMonthly, route) => {
      const extra = Math.max(0, team - included);
      return {
        plan, monthly:baseMonthly + extra*extraMonthly,
        annualMonthly:baseAnnual + extra*extraMonthly,
        annualTotal:(baseAnnual + extra*extraMonthly)*12,
        capacity: extra ? `${included} included + ${extra} extra user${extra===1?'':'s'}` : `${included} user${included===1?'':'s'} included`,
        route
      };
    };

    let p;
    if (routeOpt) {
      p=make('Max',329,299,8,75,true);
    } else {
      const candidates=[];
      if (team <= 1) candidates.push(make('Basic',79,59,1,0,false));
      candidates.push(make('Essentials',189,149,5,100,false));
      candidates.push(make('Max',329,299,8,75,true));
      p=candidates.sort((a,b)=>a.monthly-b.monthly)[0];
    }

    const reasons=[];
    if (selfBooking) reasons.push('online booking is included on Basic and above');
    if (routeOpt) reasons.push('route optimization requires Max');
    if (team > 1) reasons.push(`${team} users affect the included-seat math`);
    return {
      name:'Housecall Pro', url:'housecall-pro.html', plan:p.plan, monthly:p.monthly,
      annualMonthly:p.annualMonthly, annualTotal:p.annualTotal, complete:true,
      capacity:p.capacity,
      why: reasons.length ? reasons.join('; ') + '.' : 'Basic is the lowest published configuration for one user.',
      watch:'Additional-user charges are included in this estimate where your team exceeds the plan’s included seats. Taxes and optional add-ons are excluded.'
    };
  };

  function calculate() {
    const d = new FormData(form);
    const team = Math.max(1, Number(d.get('team')) || 1);
    const jobs = Math.max(0, Number(d.get('jobs')) || 0);
    const selfBooking = d.get('selfBooking') === 'yes';
    const routeOpt = d.get('routeOpt') === 'yes';

    const results = [
      quoteIQ(team,selfBooking,routeOpt),
      serviceM8(team,jobs,selfBooking,routeOpt),
      jobber(team,selfBooking,routeOpt),
      urable(team,selfBooking,routeOpt),
      housecall(team,selfBooking,routeOpt)
    ];

    results.sort((a,b)=>{
      if(a.complete!==b.complete) return a.complete ? -1 : 1;
      const ac=Number.isFinite(a.monthly)?a.monthly:999999;
      const bc=Number.isFinite(b.monthly)?b.monthly:999999;
      return ac-bc;
    });

    const lowest = results.find(r=>r.complete && Number.isFinite(r.monthly));
    const headline = document.getElementById('calcHeadline');
    if(lowest){
      headline.innerHTML = `<div class="calc-answer"><span>LOWEST KNOWN COMPLETE BASE COST</span><strong>${lowest.name} · ${lowest.plan}</strong><b>${money(lowest.monthly)}/mo</b><small>for the requirements you selected</small></div>`;
    }else{
      headline.innerHTML = `<div class="warning"><b>No fully priced match found.</b> At least one required component needs a live vendor quote or add-on price.</div>`;
    }

    const cards = results.map((r,i)=>{
      const diff = lowest && r.complete && Number.isFinite(r.monthly)
        ? r.monthly-lowest.monthly : null;
      const rank = r===lowest ? 'LOWEST KNOWN COMPLETE COST' : r.complete ? 'COMPLETE PUBLISHED BASE COST' : 'TOTAL NEEDS VERIFICATION';
      const annualBlock = Number.isFinite(r.annualMonthly)
        ? `<div><span>Annual billing</span><b>${money(r.annualMonthly)}/mo effective</b><small>${money(r.annualTotal)} billed/12 months</small></div>`
        : `<div><span>Annual billing</span><b>Not used</b><small>Compare the vendor’s current billing options</small></div>`;
      const monthlyTotal = Number.isFinite(r.monthly) ? total12(r.monthly) : '—';
      const delta = diff!==null && diff>0 ? `<span class="cost-delta">+${money(diff)}/mo vs lowest</span>` : '';
      return `
        <article class="cost-result ${r===lowest?'best':''}">
          <div class="cost-result-head">
            <div><span class="kicker">${rank}</span><h2>${r.name}</h2><p>${r.plan}</p></div>
            ${delta}
          </div>
          <div class="cost-numbers">
            <div><span>Flexible monthly</span><b>${Number.isFinite(r.monthly)?money(r.monthly)+'/mo':'Contact sales'}</b><small>${monthlyTotal}${Number.isFinite(r.monthly)?' over 12 months':''}</small></div>
            ${annualBlock}
          </div>
          <div class="cost-capacity"><b>Capacity:</b> ${r.capacity}</div>
          <p class="cost-why"><b>Why this plan:</b> ${r.why}</p>
          <div class="${r.complete?'note':'warning'}"><b>${r.complete?'Verify before buying':'Cost not fully known'}:</b> ${r.watch}</div>
          <div class="actions"><a class="btn secondary" href="${r.url}">See ${r.name} research</a></div>
        </article>`;
    }).join('');

    document.getElementById('costResults').innerHTML = cards;
    document.getElementById('resultsSection').hidden = false;

    const requirementText = [
      `${team} software user${team===1?'':'s'}`,
      `${jobs} new jobs/month`,
      selfBooking ? 'customer self-booking required' : 'self-booking not required',
      routeOpt ? 'route optimization required' : 'route optimization not required'
    ].join(' · ');
    document.getElementById('requirementSummary').textContent = requirementText;
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    calculate();
    document.getElementById('resultsSection').scrollIntoView({behavior:'smooth',block:'start'});
  });

  calculate();
});
