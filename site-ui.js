/* Shared progressive UI. Product facts, price math and scoring stay in their existing modules. */
(() => {
  'use strict';
  const make = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  const track = (name, data) => {
    if (typeof window.dfTrackEvent === 'function') window.dfTrackEvent(name, data);
  };
  const header = document.querySelector('.site-header');
  const menu = header?.querySelector('.menuBtn');
  const nav = header?.querySelector('#navlinks');
  if (menu && nav && typeof window.toggleMenu === 'function') {
    header.classList.add('nav-ready'); menu.hidden = false;
    nav.addEventListener('click', event => {
      if (!event.target.closest('a')) return;
      nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.textContent = 'Menu';
    });
  }

  // All directory entries remain available to search engines and without JS.
  const page = location.pathname.replace(/\.html$/,'').replace(/\/$/,'') || '/';
  // DetailerFit independent, unranked partner research, 2026-10-26.
  // Does not change the six homepage profiles, Match Score, price data or ranking.
  const partnerOptions = [
    {name:'Rinse',path:'/rinse-review-mobile-detailers',url:'https://rinsehq.com/?ref=detailerfit',summary:'Free CRM with up to 5 active jobs; $6/mo Pro adds public booking.',fit:'LOW-COST DETAILING CRM'},
    {name:'RouteShine',path:'/routeshine-review-mobile-detailers',url:'https://routeshine.com/register?ref=detailerfit',summary:'$49/mo early-access booking, service-area checks and Square deposits.',fit:'MOBILE BOOKING + DEPOSITS'}
  ];
  const partnerCard = option => {
    const card=make('article','card review-directory-card');
    const heading=make('h2'); const link=make('a','',option.name); link.href=option.path;
    heading.append(link); card.append(heading,make('p','',option.summary));
    const review=make('a','text-link','Read review ↗'); review.href=option.path;
    card.append(review); return card;
  };
  if (page === '/affiliate-disclosure') {
    const relationshipList = document.getElementById('current-relationships')?.nextElementSibling?.nextElementSibling;
    if (relationshipList?.matches('ul.list')) {
      partnerOptions.forEach(option => {
        const exists = [...relationshipList.querySelectorAll('li')].some(li => li.textContent.trim() === option.name);
        if (!exists) relationshipList.append(make('li','',option.name));
      });
      relationshipList.append(...[...relationshipList.children].sort((a,b) => a.textContent.localeCompare(b.textContent,'en')));
      const asOf = relationshipList.previousElementSibling;
      if (asOf?.textContent.includes('As of October 10, 2026')) {
        asOf.textContent = asOf.textContent.replace('As of October 10, 2026', 'As of October 26, 2026');
      }
    }
  }
  if (page === '/reviews') {
    const grid = document.querySelector('[data-ui-generated="review-directory"] .review-directory-grid');
    if(grid) {
      partnerOptions.forEach(option => {
        if (!grid.querySelector(`a[href="${option.path.slice(1)}"]`)) grid.append(partnerCard(option));
      });
      const sorted=[...grid.children].sort((a,b)=>a.querySelector('h2')?.textContent.localeCompare(b.querySelector('h2')?.textContent,'en'));
      grid.append(...sorted);
      const lead=grid.parentElement.querySelector('p.small');
      if(lead) lead.textContent=lead.textContent.replace(/\b\d+ published reviews\b/,`${grid.querySelectorAll('.review-directory-card').length} published reviews`);
    }
  }
  if (page === '/mobile-detailing-scheduling-software' || page === '/compare' || page === '/finder') {
    const anchor = page === '/mobile-detailing-scheduling-software' ? document.getElementById('booking-options-sprint')?.closest('section') : page === '/compare' ? document.getElementById('additional-research-options')?.closest('section') : document.getElementById('finder-decision-stage')?.closest('section');
    if(anchor && !document.getElementById('df-new-research-20261026')) {
      const section=make('section','section tight'); section.id='df-new-research-20261026';
      section.setAttribute('aria-labelledby','df-new-research-heading');
      const wrap=make('div','wrap article'); const inner=make('div','card');
      const heading=make('h2','','Other booking and CRM tools to research'); heading.id='df-new-research-heading';
      inner.append(make('p','kicker','NEW INDEPENDENT RESEARCH · OUTSIDE MATCH SCORE'),heading,make('p','','These unranked options serve different needs. Affiliate relationships do not determine rankings or shortlist scores. Compare current vendor terms before signing up.'));
      partnerOptions.forEach(option=>{
        inner.append(make('h3','',option.name),make('p','',option.summary));
        const actions=make('div','actions');
        const review=make('a','btn secondary',`Read ${option.name} review`); review.href=option.path;
        const visit=make('a','btn secondary',`Explore ${option.name}`); visit.href=option.url;
        visit.target='_blank'; visit.rel='sponsored noopener'; visit.dataset.vendor=option.name; visit.dataset.ctaPosition=page.slice(1).replace(/[^a-z0-9]+/g,'_')+'_partner_research';
        actions.append(review,visit);inner.append(actions);
      });
      const note=make('p','cta-disclosure small');
      note.textContent='Affiliate links. DetailerFit may earn a commission from qualifying signups at no extra cost to you. ';
      const disclosure=make('a','','Affiliate disclosure');disclosure.href='/affiliate-disclosure';note.append(disclosure);
      inner.append(note);wrap.append(inner);section.append(wrap);anchor.after(section);
    }
  }

  if (page === '/reviews' || page === '/guides') {
    const grids = [...document.querySelectorAll('.guide-grid,.review-directory-grid')];
    if (!grids.length) {
      const fallback = document.querySelector('main .grid2,main .grid3');
      if (fallback) grids.push(fallback);
    }
    const grid = grids[0];
    const cards = grids.flatMap(el => [...el.children].filter(card => card.matches('.card')));
    if (cards.length > 4) {
      const filter = make('div','directory-filter');
      const label = make('label','',page === '/reviews' ? 'Find a review' : 'Find a guide');
      label.htmlFor = 'directory-search';
      const input = make('input'); input.type = 'search'; input.id = 'directory-search'; input.placeholder = page === '/reviews' ? 'Search software or workflow' : 'Search a topic';
      input.autocomplete = 'off';
      const count = make('p','small'); count.setAttribute('role','status');
      const empty = make('p','directory-empty','No matches. Try a software name or a broader topic.'); empty.hidden = true;
      filter.append(label,input); grid.before(filter,count); grid.after(empty);
      const update = () => {
        const query = input.value.trim().toLowerCase(); let shown = 0;
        cards.forEach(card => {card.hidden = !card.textContent.toLowerCase().includes(query); if (!card.hidden) shown++;});
        count.textContent = `${shown} of ${cards.length} ${page === '/reviews' ? 'reviews' : 'guides'}`;
        empty.hidden = shown !== 0;
      };
      input.addEventListener('input',update); update();
    }
  }

  const results = document.getElementById('finderResults');
  if (results) {
    const link = make('a','btn secondary result-compare-link','Compare these matches');
    link.hidden = true; link.dataset.ctaPosition = 'finder_shortlist_compare'; results.before(link);
    const update = () => {
      const names = [...results.querySelectorAll('article.result h3')].map(el => el.textContent.replace(/^\d+\.\s*/, '').trim());
      link.hidden = names.length < 2;
      link.href = `compare?products=${encodeURIComponent(names.slice(0,3).join(','))}#selected-comparison`;
      link.textContent = `Compare these ${names.length} matches`;
    };
    new MutationObserver(update).observe(results,{childList:true}); update();
  }

  const directory = document.querySelector('.compare-section .mobile-compare');
  if (!directory) return;
  const cards = [...directory.querySelectorAll('.compare-card')];
  const items = new Map(cards.map(card => [card.querySelector('h2').textContent.trim(),card]));
  const selected = new Set();
  let opened = false;
  const panel = make('section','compare-selector'); panel.setAttribute('aria-labelledby','select-software-title');
  const title = make('h2','','Make the comparison yours.'); title.id = 'select-software-title';
  const help = make('p','small','Choose 2 or 3 tools to focus on their prices, booking and team fit.');
  const fields = make('fieldset','compare-options'); fields.style.border = '0'; fields.style.padding = '0';
  const legend = make('legend','sr-only','Software to compare'); fields.append(legend);
  const inputs = new Map();
  items.forEach((card,name) => {
    const label = make('label','compare-option');
    const input = make('input'); input.type = 'checkbox'; input.value = name;
    label.append(input,make('span','',name)); fields.append(label); inputs.set(name,input);
    input.addEventListener('change', () => {
      if (input.checked && selected.size >= 3) {
        input.checked = false; status.textContent = 'Choose up to 3 tools. Remove one before adding another.'; return;
      }
      input.checked ? selected.add(name) : selected.delete(name); sync();
      track('software_compare_select',{vendor:name,selected:input.checked,cta_position:'compare_selector'});
    });
  });
  const status = make('p','selection-summary'); status.setAttribute('role','status'); status.setAttribute('aria-live','polite');
  const actions = make('div','actions');
  const open = make('button','btn primary','Compare selected'); open.type = 'button'; open.disabled = true;
  const clear = make('button','btn secondary','Clear selection'); clear.type = 'button'; clear.hidden = true;
  actions.append(open,clear); panel.append(title,help,fields,status,actions);
  const output = make('section','compare-selection-result'); output.id = 'selected-comparison'; output.hidden = true;
  const heading = make('h2','','Your selected comparison'); heading.tabIndex = -1;
  const columns = make('div','comparison-picked'); output.append(heading,columns);
  directory.parentElement.prepend(panel,output);
  const updateUrl = () => {
    const url = new URL(location.href);
    if (selected.size) url.searchParams.set('products',[...selected].join(','));
    else url.searchParams.delete('products');
    if (opened && selected.size >= 2) url.hash = 'selected-comparison';
    else if (url.hash === '#selected-comparison') url.hash = '';
    history.replaceState(null,'',url);
  };
  const render = () => {
    columns.replaceChildren(); output.hidden = !opened || selected.size < 2;
    if (output.hidden) return;
    columns.style.setProperty('--selected-count',String(selected.size));
    selected.forEach(name => {
      const card = items.get(name).cloneNode(true);
      card.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      card.querySelectorAll('[data-vendor]').forEach(el => {el.dataset.ctaPosition = 'compare_selection';});
      const remove = make('button','compare-clear-one',`Remove ${name}`); remove.type = 'button';
      remove.addEventListener('click', () => {selected.delete(name); inputs.get(name).checked = false; sync(); inputs.get(name).focus();});
      card.prepend(remove); columns.append(card);
    });
  };
  const sync = () => {
    open.disabled = selected.size < 2;
    open.textContent = selected.size < 2 ? 'Choose at least 2 tools' : `Compare ${selected.size} tools`;
    clear.hidden = selected.size === 0;
    status.textContent = selected.size ? `Selected: ${[...selected].join(' · ')} (${selected.size}/3)` : 'No tools selected. Choose your first two.';
    render();
    // Keep a previously opened comparison shareable after removal or replacement.
    if (opened) updateUrl();
  };
  clear.addEventListener('click', () => {
    selected.clear(); inputs.forEach(input => {input.checked=false;}); opened=false; sync(); inputs.values().next().value.focus();
    updateUrl();
    track('software_compare_clear',{cta_position:'compare_selector'});
  });
  const show = () => {
    if (selected.size < 2) return;
    opened=true; render(); heading.focus({preventScroll:true}); output.scrollIntoView({block:'start',behavior:'auto'});
    updateUrl();
    track('software_comparison_view',{vendors:[...selected].join(','),selected_count:selected.size,cta_position:'compare_selection'});
  };
  open.addEventListener('click',show);
  const requested = new URL(location.href).searchParams.get('products');
  if (requested) requested.split(',').forEach(name => {if(items.has(name)&&selected.size<3){selected.add(name);inputs.get(name).checked=true;}});
  sync(); if(selected.size>=2) show();
})();
