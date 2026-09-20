
function toggleMenu(btn){
  const nav=document.getElementById('navlinks');
  if(!nav)return;
  const button=btn||document.querySelector('.menuBtn');
  const open=nav.classList.toggle('open');
  if(button){button.setAttribute('aria-expanded',String(open));button.textContent=open?'Close':'Menu';}
}

document.addEventListener('click',(e)=>{
  const nav=document.getElementById('navlinks');
  const btn=document.querySelector('.menuBtn');
  if(!nav||!btn||!nav.classList.contains('open'))return;
  if(!nav.contains(e.target)&&!btn.contains(e.target)){
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
    btn.textContent='Menu';
  }
});

document.addEventListener('keydown',(e)=>{
  if(e.key!=='Escape')return;
  const nav=document.getElementById('navlinks');
  const btn=document.querySelector('.menuBtn');
  if(nav?.classList.contains('open')){
    nav.classList.remove('open');
    btn?.setAttribute('aria-expanded','false');
    if(btn)btn.textContent='Menu';
    btn?.focus();
  }
});


// DetailerFit GA4 bootstrap v1.
// One shared loader keeps GA4 consistent across every page that already loads app.js.
const DF_GA4_MEASUREMENT_ID='G-1MS4N4L2J1';
window.dataLayer=window.dataLayer||[];
window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};

if(!document.querySelector(`script[data-detailerfit-ga4="${DF_GA4_MEASUREMENT_ID}"]`)){
  const ga4=document.createElement('script');
  ga4.async=true;
  ga4.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(DF_GA4_MEASUREMENT_ID)}`;
  ga4.dataset.detailerfitGa4=DF_GA4_MEASUREMENT_ID;
  document.head.appendChild(ga4);

  window.gtag('js',new Date());
  window.gtag('config',DF_GA4_MEASUREMENT_ID);
}


// DetailerFit conversion telemetry.
// If GA4/gtag is installed later, these events start flowing automatically.
// dataLayer is also populated for Google Tag Manager compatibility.
function dfTrackEvent(eventName, params={}){
  const payload={
    ...params,
    page_path: location.pathname,
    page_title: document.title
  };

  window.dataLayer=window.dataLayer||[];
  if(typeof window.gtag==='function'){
    window.gtag('event',eventName,{
      ...payload,
      transport_type:'beacon'
    });
  }else{
    window.dataLayer.push({event:eventName,...payload});
  }
}

const DF_AFFILIATE_VENDOR_HOSTS={
  'admin-quoteiq.web.app':'QuoteIQ',
  'detailpilot.com':'DetailPilot',
  'housecallpro.partnerlinks.io':'Housecall Pro',
  'orbisx.com':'OrbisX',
  'mobiletechrx.com':'Mobile Tech RX',
  'marlie.ai':'Marlie AI',
  'stratacrm.app':'Strata',
  'bookingkoala.com':'BookingKoala',
  'truereview.co':'TrueReview',
  'gohighlevel.com':'HighLevel',
  'ai-receptionist.com':'AI Receptionist',
  'onepagecrm.com':'OnePageCRM',
  'jotform.com':'Jotform',
  'smarfle.com':'Smarfle',
  'roapp.io':'RO App',
  'watch.thewrapinstitute.com':'The Wrap Institute',
  'thewrapinstitute.com':'The Wrap Institute',
  'myaifrontdesk.com':'My AI Front Desk',
  'garagetool.app':'GarageTool'
};

function dfVendorContext(link,explicitVendor,isAffiliate){
  if(explicitVendor)return {vendor:explicitVendor,source:'data-vendor'};
  if(!isAffiliate)return {vendor:'',source:'none'};
  const host=(link.hostname||'').toLowerCase().replace(/^www\./,'');
  const canonical=DF_AFFILIATE_VENDOR_HOSTS[host];
  return {
    vendor:canonical||host||'unknown',
    source:canonical?'hostname_map':'hostname'
  };
}

function dfLinkContext(link){
  if(link.dataset.ctaPosition){
    const position=link.dataset.ctaPosition;
    const aliases={'cost-calculator-result':'calculator_result','finder-result':'finder_result','compare-page':'compare_table','pricing-index-affiliate-grid':'pricing_index_affiliate_section','decision-exit':'review_secondary_cta','cost-calculator-page':'footer_or_related'};
    return aliases[position]||position.replace(/-/g,'_');
  }
  if(link.closest('.heroMini'))return 'review_primary_cta';
  if(link.closest('.revenue-decision-cta'))return 'review_secondary_cta';
  if(link.closest('.review-summary'))return 'review_primary_cta';
  if(link.closest('table'))return 'compare_table';
  if(link.closest('footer'))return 'footer_or_related';

  const pageName=(location.pathname.split('/').pop()||'').replace(/\.html$/i,'');
  const affiliateLinks=[...document.querySelectorAll('a[rel~="sponsored"],a[data-affiliate="true"]')];
  const affiliateIndex=affiliateLinks.indexOf(link);

  if(pageName==='auto-detailing-software-pricing')return 'pricing_index_affiliate_section';
  if(pageName==='software-cost-calculator'||pageName==='finder')return 'footer_or_related';
  if(pageName!=='reviews'&&pageName.includes('review')){
    return affiliateIndex===0?'review_primary_cta':'review_secondary_cta';
  }
  if(pageName.startsWith('best-')||pageName.includes('-vs-')||pageName.includes('alternatives')){
    return 'article_recommendation';
  }

  const section=link.closest('section');
  const heading=section?.querySelector('h2[id],h3[id]');
  if(heading?.id)return heading.id.replace(/-/g,'_');

  return 'review_secondary_cta';
}

document.addEventListener('click',(e)=>{
  const link=e.target.closest?.('a[href]');
  if(!link)return;

  // DetailerFit affiliate click fallback v3.
  // A sponsored affiliate CTA must be tracked even if data-vendor was omitted.
  // data-vendor still provides the preferred human-readable vendor label.
  const relTokens=(link.getAttribute('rel')||'')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const isAffiliate=relTokens.includes('sponsored')||link.dataset.affiliate==='true';
  const explicitVendor=(link.dataset.vendor||'').trim();
  const vendorContext=dfVendorContext(link,explicitVendor,isAffiliate);
  const vendor=vendorContext.vendor;

  if(vendor||isAffiliate){
    dfTrackEvent(isAffiliate?'affiliate_click':'vendor_outbound_click',{
      vendor:vendor||'unknown',
      vendor_label_source:vendorContext.source,
      link_url:link.href,
      clicked_url:link.href,
      link_host:link.hostname,
      link_text:(link.textContent||'').trim().slice(0,120),
      cta_position:dfLinkContext(link),
      monetized:isAffiliate?'true':'false',
      tool_name:link.dataset.toolName||undefined,
      result_rank:link.dataset.resultRank?Number(link.dataset.resultRank):undefined,
      result_plan:link.dataset.resultPlan||undefined
    });
    return;
  }

  const href=(link.getAttribute('href')||'').replace(/^\//,'').replace(/\.html(?=($|[?#]))/i,'');
  if(href==='finder'||href.startsWith('finder?')){
    dfTrackEvent('tool_click',{tool_name:'finder',link_text:(link.textContent||'').trim().slice(0,120)});
  }else if(href==='software-cost-calculator'||href.startsWith('software-cost-calculator?')){
    dfTrackEvent('tool_click',{tool_name:'cost_calculator',link_text:(link.textContent||'').trim().slice(0,120)});
  }
});

// One visible CTA exposure per vendor/position/URL per page load. This is an
// exposure denominator, not a signup or a revenue event. Dynamic tool results
// are observed too; repeated calculations do not inflate the same exposure.
function dfObserveAffiliateCtas(){
  if(typeof IntersectionObserver!=='function'||typeof MutationObserver!=='function')return;
  const selector='a[rel~="sponsored"],a[data-affiliate="true"]';
  const observed=new Set();
  const seen=new Set();
  const observer=new IntersectionObserver(entries=>{
    if(document.visibilityState==='hidden')return;
    entries.forEach(entry=>{
      const link=entry.target;
      if(!entry.isIntersecting||entry.intersectionRatio<0.5||!link.isConnected)return;
      const vendor=dfVendorContext(link,(link.dataset.vendor||'').trim(),true).vendor;
      const position=dfLinkContext(link);
      const key=JSON.stringify([vendor,position,link.href]);
      if(!seen.has(key)){
        seen.add(key);
        dfTrackEvent('affiliate_cta_view',{
          vendor,cta_position:position,monetized:'true',
          link_host:link.hostname,link_url:link.href,
          link_text:(link.textContent||'').trim().slice(0,120),
          tool_name:link.dataset.toolName||undefined,
          result_plan:link.dataset.resultPlan||undefined
        });
      }
      observer.unobserve(link);
      observed.delete(link);
    });
  },{threshold:0.5});
  const scan=root=>{
    const links=[...(root.matches?.(selector)?[root]:[]),...root.querySelectorAll(selector)];
    links.forEach(link=>{
      if(!observed.has(link)){observed.add(link);observer.observe(link);}
    });
  };
  scan(document);
  new MutationObserver(records=>{
    observed.forEach(link=>{
      if(!link.isConnected){observer.unobserve(link);observed.delete(link);}
    });
    records.forEach(record=>record.addedNodes.forEach(node=>{
      if(node.nodeType===1)scan(node);
    }));
  }).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='hidden')return;
    observed.forEach(link=>{observer.unobserve(link);observer.observe(link);});
  });
}
document.addEventListener('DOMContentLoaded',dfObserveAffiliateCtas,{once:true});

document.addEventListener('DOMContentLoaded',()=>{
  const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const resultScrollBehavior=reducedMotion?'auto':'smooth';

  // Normalize legacy sponsored CTAs at runtime so every monetized click has
  // a canonical vendor label and stable CTA position without rewriting dozens
  // of editorial pages. Explicit page attributes always win.
  document.querySelectorAll('a[rel~="sponsored"],a[data-affiliate="true"]').forEach(link=>{
    const explicitVendor=(link.dataset.vendor||'').trim();
    if(!explicitVendor){
      const vendorContext=dfVendorContext(link,'',true);
      if(vendorContext.vendor&&vendorContext.vendor!=='unknown')link.dataset.vendor=vendorContext.vendor;
    }
    if(!link.dataset.ctaPosition)link.dataset.ctaPosition=dfLinkContext(link);
  });

  // Upgrade older pages that still use the original header markup.
  const menuBtn=document.querySelector('.menuBtn');
  const nav=document.getElementById('navlinks');
  if(menuBtn){
    menuBtn.setAttribute('type','button');
    menuBtn.setAttribute('aria-controls','navlinks');
    if(!menuBtn.hasAttribute('aria-expanded'))menuBtn.setAttribute('aria-expanded','false');
  }
  if(nav&&!nav.hasAttribute('aria-label'))nav.setAttribute('aria-label','Primary navigation');

  // My AI Front Desk affiliate placement — added only to the existing unranked
  // "Other AI Receptionist Options Worth Watching" section. This does not alter rankings.
  const currentPath=(location.pathname.split('/').pop()||'').replace(/\.html$/i,'');
  if(currentPath==='best-ai-receptionists-auto-detailing') {
    const targetHeading=[...document.querySelectorAll('h3')].find(h=>
      (h.textContent||'').trim().startsWith('My AI Front Desk,')
    );
    const existingMafd=document.querySelector('a[data-vendor="My AI Front Desk"]');
    const targetCopy=targetHeading?.nextElementSibling;
    if(targetHeading&&targetCopy&&!existingMafd){
      const actions=document.createElement('div');
      actions.className='actions';
      actions.innerHTML='<a class="btn primary" href="https://www.myaifrontdesk.com/?via=ryo" rel="sponsored noopener" target="_blank" data-vendor="My AI Front Desk" data-cta-position="article_recommendation">Try My AI Front Desk</a>';
      targetCopy.insertAdjacentElement('afterend',actions);

      const disclosure=document.createElement('p');
      disclosure.className='cta-disclosure small';
      disclosure.innerHTML='Affiliate link. DetailerFit may earn a commission if you sign up, at no extra cost to you. My AI Front Desk remains an unranked option in this guide; the affiliate relationship does not determine our rankings.';
      actions.insertAdjacentElement('afterend',disclosure);
    }

    const researchDisclosure=document.querySelector('.research-detail');
    if(researchDisclosure&&researchDisclosure.textContent.includes('This page contains affiliate links to QuoteIQ, AI Receptionist and Marlie AI.')){
      researchDisclosure.innerHTML=researchDisclosure.innerHTML.replace(
        'This page contains affiliate links to QuoteIQ, AI Receptionist and Marlie AI.',
        'This page contains affiliate links to QuoteIQ, AI Receptionist, Marlie AI and My AI Front Desk.'
      );
    }
  }

  // Keep the site-wide affiliate disclosure in sync with the newly activated link.
  if(currentPath==='affiliate-disclosure') {
    document.querySelectorAll('.note, #current-affiliate-relationships p').forEach(el=>{
      if(el.innerHTML.includes('Jotform, and Smarfle')){
        el.innerHTML=el.innerHTML.replace('Jotform, and Smarfle','Jotform, Smarfle, and My AI Front Desk');
      }
    });
    document.querySelectorAll('#current-affiliate-relationships .small').forEach(el=>{
      if(el.textContent.includes('Disclosure list updated'))el.textContent='Disclosure list updated September 19, 2026.';
    });
  }

  // GarageTool monetization — independent review + unranked discovery surfaces.
  // Do not alter the existing eight-vendor wrap ranking because of the affiliate relationship.
  if(currentPath==='best-car-wrap-software') {
    const sourcesHeading=document.getElementById('sources');
    const existingGarage=document.getElementById('garagetool-unranked');
    if(sourcesHeading&&!existingGarage){
      const wrapBlock=document.createElement('div');
      wrapBlock.innerHTML=`
        <h2 id="garagetool-unranked">GarageTool — Unranked Wrap &amp; Sign Shop Option</h2>
        <p>GarageTool was not part of the original eight-platform ranking on this page, so we are not inserting it into that order because of a commercial relationship. Our standalone review evaluates its wrap/sign estimating, proofing, scheduling, payments, team workflow and current pricing independently.</p>
        <div class="note"><b>Why it is worth a separate look:</b> GarageTool is built specifically for wrap and sign shops, with a visual wrap estimator, 15,000+ vehicle templates, design proofing, scheduling, deposits, invoices and team workflow. Its current Solo Shop plan starts at $100/month.</div>
        <div class="actions"><a class="btn secondary" href="/garagetool-review-wrap-sign-shops">Read the GarageTool Review</a><a class="btn primary" href="https://garagetool.app?fpr=ryo-18b665" rel="sponsored noopener" target="_blank" data-vendor="GarageTool" data-cta-position="article_recommendation">Explore GarageTool</a></div>
        <p class="cta-disclosure small">Affiliate link. DetailerFit may earn a commission if you sign up through GarageTool, at no extra cost to you. This relationship does not change the existing ranking.</p>`;
      while(wrapBlock.firstChild)sourcesHeading.parentNode.insertBefore(wrapBlock.firstChild,sourcesHeading);
    }
    const disclosure=document.querySelector('.research-detail');
    if(disclosure&&disclosure.textContent.includes('This page contains an affiliate link to Mobile Tech RX.')){
      disclosure.innerHTML=disclosure.innerHTML.replace('This page contains an affiliate link to Mobile Tech RX.','This page contains affiliate links to Mobile Tech RX and GarageTool.');
    }
  }

  if(currentPath==='reviews') {
    const existingGarageReview=document.getElementById('garagetool-option-reviews-html');
    const conversionHub=document.querySelector('section[aria-labelledby="reviews-conversion-hub"]');
    if(!existingGarageReview){
      const garageSection=document.createElement('section');
      garageSection.className='section tight';
      garageSection.setAttribute('aria-labelledby','garagetool-option-reviews-html');
      garageSection.innerHTML=`<div class="wrap article"><div class="card"><div class="kicker">WRAP &amp; SIGN SHOP SOFTWARE</div><h2 id="garagetool-option-reviews-html">GarageTool for wrap and sign shops</h2><p>GarageTool connects visual wrap estimating, 15,000+ vehicle templates, design proofing, scheduling, deposits, invoicing, customer records and team workflow. The current Solo Shop plan starts at $100/month; advanced lead-management CRM features are listed on the $200 Multiple Shop + CRM tier.</p><p class="small"><strong>Watch for:</strong> no free trial on the current pricing page; GarageTool advertises a 30-day money-back guarantee.</p><div class="actions"><a class="btn secondary" href="/garagetool-review-wrap-sign-shops">Read the GarageTool review</a><a class="btn primary" href="https://garagetool.app?fpr=ryo-18b665" rel="sponsored noopener" target="_blank" data-vendor="GarageTool" data-cta-position="reviews-page">Explore GarageTool</a></div><p class="cta-disclosure small">DetailerFit may earn a commission if you sign up through this link, at no extra cost to you. <a href="affiliate-disclosure">Affiliate disclosure</a>.</p></div></div>`;
      if(conversionHub)conversionHub.insertAdjacentElement('beforebegin',garageSection);
      else document.querySelector('main')?.appendChild(garageSection);
    }
  }

  if(currentPath==='affiliate-disclosure') {
    document.querySelectorAll('.note, #current-affiliate-relationships p').forEach(el=>{
      if(!el.textContent.includes('GarageTool')&&el.innerHTML.includes('My AI Front Desk')){
        if(el.innerHTML.includes(', and My AI Front Desk')){
          el.innerHTML=el.innerHTML.replace(', and My AI Front Desk',', My AI Front Desk, and GarageTool');
        }else{
          el.innerHTML=el.innerHTML.replace('My AI Front Desk','My AI Front Desk and GarageTool');
        }
      }
    });
    const relSection=document.getElementById('current-affiliate-relationships');
    if(relSection&&!document.getElementById('garagetool-affiliate-relationship')){
      const garageDisclosure=document.createElement('section');
      garageDisclosure.className='section tight';
      garageDisclosure.setAttribute('aria-labelledby','garagetool-affiliate-relationship');
      garageDisclosure.innerHTML=`<div class="wrap article"><div class="kicker">AFFILIATE RELATIONSHIP</div><h2 id="garagetool-affiliate-relationship">GarageTool affiliate relationship</h2><p>DetailerFit participates in the GarageTool affiliate program and may earn a commission from qualifying signups made through clearly marked GarageTool affiliate links, at no extra cost to the reader. Affiliate compensation does not buy ranking position or change our editorial conclusions.</p></div>`;
      relSection.insertAdjacentElement('afterend',garageDisclosure);
    }
  }

  // Keep the Research footer consistent on older pages without editing every footer by hand.
  document.querySelectorAll('.footergrid > div').forEach(col=>{
    const heading=col.querySelector('strong');
    if(!heading||heading.textContent.trim()!=='Research')return;
    if(col.querySelector('a[href="software-cost-calculator"]'))return;
    const finder=col.querySelector('a[href="finder"]');
    if(!finder)return;
    const link=document.createElement('a');
    link.href='software-cost-calculator';
    link.textContent='Cost calculator';
    finder.insertAdjacentElement('afterend',link);
  });

  // Revenue Acceleration v4: add clear decision exits to high-intent comparisons
  // that previously ended without a strong next step.
  const pageName=(location.pathname.split('/').pop() || 'index').replace(/\.html$/i,'');
  const decisionExits={
    'jobber-vs-housecall-pro-auto-detailing':[
      {label:'Check Jobber Pricing',url:'https://www.getjobber.com/pricing/',vendor:'Jobber',rel:'noopener'},
      {label:'See Current Housecall Pro Offer',url:'https://housecallpro.partnerlinks.io/lquesdqg2t22',vendor:'Housecall Pro',rel:'sponsored noopener',target:'_blank'}
    ],
    'orbisx-vs-jobber-auto-detailing':[
      {label:'Try OrbisX Free',url:'https://orbisx.com/detailerfit/',vendor:'OrbisX',rel:'sponsored noopener',target:'_blank'},
      {label:'Check Jobber Pricing',url:'https://www.getjobber.com/pricing/',vendor:'Jobber',rel:'noopener'}
    ],
    'urable-vs-housecall-pro':[
      {label:'Check Urable Pricing',url:'https://urable.com/pricing/',vendor:'Urable',rel:'noopener'},
      {label:'See Current Housecall Pro Offer',url:'https://housecallpro.partnerlinks.io/lquesdqg2t22',vendor:'Housecall Pro',rel:'sponsored noopener',target:'_blank'}
    ],
    'urable-vs-orbisx':[
      {label:'Check Urable Pricing',url:'https://urable.com/pricing/',vendor:'Urable',rel:'noopener'},
      {label:'Try OrbisX Free',url:'https://orbisx.com/detailerfit/',vendor:'OrbisX',rel:'sponsored noopener',target:'_blank'}
    ]
  };
  if(decisionExits[pageName]&&!document.querySelector('.revenue-decision-cta')){
    const article=document.querySelector('main article, main .article');
    if(article){
      const block=document.createElement('div');
      block.className='callout revenue-decision-cta';
      const hasSponsoredExit=decisionExits[pageName].some(x=>x.rel.includes('sponsored'));
      block.innerHTML=`<div><h3>Ready to narrow the decision?</h3><p>Check current vendor terms, or use DetailerFit's tools if you still need to compare workflow and real plan cost.</p><div class="actions">${
        decisionExits[pageName].map(x=>`<a class="btn primary" data-vendor="${x.vendor}" data-cta-position="decision-exit" href="${x.url}" rel="${x.rel}"${x.target?` target="${x.target}"`:``}>${x.label}</a>`).join('')
      }<a class="btn secondary" href="finder">Use the Software Finder</a><a class="btn secondary" href="software-cost-calculator">Calculate Real Plan Cost</a></div>${hasSponsoredExit?'<p class="cta-disclosure small">DetailerFit may earn a commission if you sign up through a sponsored link, at no extra cost to you. <a href="affiliate-disclosure">Affiliate disclosure</a>.</p>':''}</div>`;
      const editorialFooter=article.querySelector(':scope > footer')||article.querySelector('footer');
      if(editorialFooter)editorialFooter.insertAdjacentElement('beforebegin',block);
      else article.appendChild(block);
    }
  }

  // Keep vendor CTA treatment visually consistent on the ceramic-coating guide.
  // Each CTA is inserted at the end of its own product block, not at the end of the whole article.
  // QuoteIQ, Mobile Tech RX and Housecall Pro remain explicitly marked as sponsored affiliate links.
  if(pageName==='best-software-ceramic-coating-business'){
    const vendorCtas={
      'section-3':{label:'Check Urable Pricing',url:'https://urable.com/pricing/',vendor:'Urable',rel:'noopener',match:'urable.com/pricing'},
      'section-4':{label:'Try OrbisX Free',url:'https://orbisx.com/detailerfit/',vendor:'OrbisX',rel:'sponsored noopener',target:'_blank',match:'orbisx.com/detailerfit'},
      'section-5':{label:'Check Mobile Tech RX Pricing',url:'https://www.mobiletechrx.com/?_by=detailerfit-5e824c',vendor:'Mobile Tech RX',rel:'sponsored noopener',match:'mobiletechrx.com/?_by=detailerfit-5e824c'},
      'section-6':{label:'Start QuoteIQ Trial',url:'https://admin-quoteiq.web.app/register?via=ryo',vendor:'QuoteIQ',rel:'sponsored noopener',match:'admin-quoteiq.web.app/register?via=ryo'},
      'section-7':{label:'Check Jobber Pricing',url:'https://www.getjobber.com/pricing/',vendor:'Jobber',rel:'noopener',match:'getjobber.com/pricing'},
      'section-8':{label:'See Current Housecall Pro Offer',url:'https://housecallpro.partnerlinks.io/lquesdqg2t22',vendor:'Housecall Pro',rel:'sponsored noopener',target:'_blank',match:'housecallpro.partnerlinks.io/lquesdqg2t22'}
    };

    Object.entries(vendorCtas).forEach(([id,x])=>{
      const heading=document.getElementById(id);
      const parent=heading?.parentElement;
      if(!heading||!parent)return;

      let node=heading.nextElementSibling;
      let insertBefore=null;
      let existingLink=null;

      while(node){
        if(node.tagName==='H2'){
          insertBefore=node;
          break;
        }
        if(!existingLink){
          if(node.matches?.(`a[href*="${x.match}"]`))existingLink=node;
          else existingLink=node.querySelector?.(`a[href*="${x.match}"]`)||null;
        }
        node=node.nextElementSibling;
      }

      if(existingLink){
        existingLink.classList.add('btn','primary');
        existingLink.dataset.vendor=x.vendor;
        existingLink.rel=x.rel;
        if(x.target)existingLink.target=x.target;
        return;
      }

      const actions=document.createElement('div');
      actions.className='actions revenue-vendor-actions';
      actions.dataset.section=id;
      actions.innerHTML=`<a class="btn primary" data-vendor="${x.vendor}" data-cta-position="decision-exit" href="${x.url}" rel="${x.rel}"${x.target?` target="${x.target}"`:``}>${x.label}</a>`;

      if(insertBefore)parent.insertBefore(actions,insertBefore);
      else parent.appendChild(actions);
    });
  }

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
      s:0,
      url:"quoteiq",
      vendorUrl:"https://admin-quoteiq.web.app/register?via=ryo",
      vendorRel:"sponsored noopener",
      why:"Strong detailing-oriented quoting, invoicing and internal scheduling at a low entry price, with deeper communications and operations on higher tiers.",
      baseWatch:"Customer self-booking uses InstaSchedule and starts on Elite. Seat limits are 1 / 2 / 4 / 10 / unlimited across the five plans.",
      tags:["Web + iOS + Android","Detailing-friendly"]
    },
    "Mobile Tech RX":{
      s:0,
      url:"mobile-tech-rx-review-auto-detailers",
      vendorUrl:"https://www.mobiletechrx.com/?_by=detailerfit-5e824c",
      vendorRel:"sponsored noopener",
      why:"A vehicle-first automotive workflow built around VIN scanning, estimating, before/after documentation, customer records and structured job operations.",
      baseWatch:"Official sources reviewed clearly publish internal scheduling. They did not clearly establish an equivalent native customer-facing self-booking flow, so verify that workflow directly if it is required. Route optimization is not treated as confirmed here.",
      tags:["Vehicle-first","VIN + estimating"]
    },
    "ServiceM8":{
      s:0,
      url:"servicem8",
      vendorUrl:"https://www.servicem8.com/us/pricing",
      vendorRel:"noopener",
      why:"Excellent entry economics, online booking on all published plans and unlimited users on paid plans.",
      baseWatch:"ServiceM8 is explicitly Apple-first. Android field staff use ServiceM8 Lite rather than the full iPhone/iPad field experience. Premium Plus includes 1,500 jobs; additional jobs are published at $0.20 each.",
      tags:["Apple-first","Unlimited users on paid plans"]
    },
    "Jobber":{
      s:0,
      url:"jobber",
      vendorUrl:"https://www.getjobber.com/pricing/",
      vendorRel:"noopener",
      why:"A mature general field-service workflow with online booking on Core and stronger automation, routing and team tools above it.",
      baseWatch:"Jobber is not detailing-specific. Core is one user and DetailerFit uses the published 1- and 5-user Connect configurations. Jobber's pricing page also displays larger team configurations, but current Help Center documentation differs; teams above five should verify the eligible plan and seat configuration directly.",
      tags:["iOS + Android","General field service"]
    },
    "Urable":{
      s:0,
      url:"urable",
      vendorUrl:"https://urable.com/pricing/",
      vendorRel:"noopener",
      why:"A strong automotive-specialist fit in the six-product Finder, with unlimited users on every published plan.",
      baseWatch:"Express has internal scheduling; customer online booking starts on Pro at $110/month.",
      tags:["Web + iOS + Android","Unlimited users"]
    },
    "Housecall Pro":{
      s:0,
      url:"housecall-pro",
      vendorUrl:"https://housecallpro.partnerlinks.io/lquesdqg2t22",
      vendorRel:"sponsored noopener",
      vendorTarget:"_blank",
      why:"A broad field-service platform with online booking and scheduling/dispatch on Basic, then stronger routing and team controls above it.",
      baseWatch:"It is built for general home-service operations rather than vehicle-care businesses. Basic includes 1 user, Essentials 5 and Max 8; additional users are currently published only on Max at $35/month each.",
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

  const mobileTechRxPlan=(team,needs)=>{
    if(team>10)return {
      plan:'Custom pricing',
      cost:null,
      annual:'',
      users:`${team} users · custom pricing`,
      note:'Mobile Tech RX directs teams above 10 people to custom pricing.'
    };

    let tier='Getting Started';
    let base=39, extra=15, annualBase=429, annualExtra=165;

    if(needs.includes('scale')){
      tier='Pro'; base=199; extra=29; annualBase=2189; annualExtra=319;
    }else if(needs.includes('automation')){
      tier='Standard'; base=99; extra=29; annualBase=1089; annualExtra=319;
    }

    const additional=Math.max(0,team-1);
    const cost=base+(additional*extra);
    const annualTotal=annualBase+(additional*annualExtra);
    const annualEffective=annualTotal/12;
    const annual=`$${annualEffective.toFixed(2).replace('.00','')}/mo effective · $${annualTotal.toFixed(0)}/year`;

    return {
      plan:tier,
      cost,
      annual,
      users:`1 admin + ${additional} additional user${additional===1?'':'s'}`,
      note:tier==='Getting Started'
        ? 'Getting Started includes one service module; Detail is one of the published module choices.'
        : tier==='Standard'
          ? 'Standard is the first tier inspected here when broader customer/accounting/admin tools matter.'
          : 'Pro is the first tier inspected here when workflow management, time tracking and checklists matter. Route optimization is not treated as confirmed.'
    };
  };

  const serviceM8Plan=(team,jobs)=>{
    if(team===1&&jobs<=30)return {plan:'Free',cost:0,annual:'',users:'1 user · 30 jobs/mo'};
    if(jobs<=50)return {plan:'Starter',cost:29,annual:'',users:'Unlimited users · 50 jobs/mo'};
    if(jobs<=150)return {plan:'Growing',cost:79,annual:'',users:'Unlimited users · 150 jobs/mo'};
    if(jobs<=500)return {plan:'Premium',cost:149,annual:'',users:'Unlimited users · 500 jobs/mo'};
    const extraJobs=Math.max(0,jobs-1500);
    const cost=349+(extraJobs*0.20);
    return {
      plan:'Premium Plus',
      cost,
      annual:'',
      users:extraJobs>0
        ? `Unlimited users · 1,500 jobs included + ${extraJobs} extra @ $0.20/job`
        : 'Unlimited users · 1,500 jobs/mo'
    };
  };

  const jobberPlan=(team,needs)=>{
    const needsConnect=team>1||needs.includes('automation')||needs.includes('scale');
    if(!needsConnect)return {plan:'Core',cost:49,annual:'from $29/mo billed annually',users:'1 user'};
    if(team<=1)return {plan:'Connect',cost:139,annual:'from $99/mo billed annually',users:'1-user configuration'};
    if(team<=5)return {plan:'Connect',cost:199,annual:'from $149/mo billed annually',users:'5 users included'};
    return {plan:'Verify with Jobber',cost:null,annual:'',users:`${team} users · seat configuration to verify`};
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
      cost:329+(extra*35),
      annual:extra>0?`$299/mo annual base + $${extra*35}/mo for ${extra} extra user${extra===1?'':'s'}`:'$299/mo billed annually',
      users:extra>0?`8 included + ${extra} extra user${extra===1?'':'s'} @ $35/mo each`:'8 users included'
    };
  };

  const planFor=(name,team,jobs,booking,needs)=>{
    if(name==='QuoteIQ')return quoteIqPlan(team,booking,needs);
    if(name==='Mobile Tech RX')return mobileTechRxPlan(team,needs);
    if(name==='ServiceM8')return serviceM8Plan(team,jobs);
    if(name==='Jobber')return jobberPlan(team,needs);
    if(name==='Urable')return urablePlan(booking,needs);
    if(name==='Housecall Pro')return hcpPlan(team,needs);
  };

  // DETAILERFIT-DECISION-FLOW-2026-09-17
  const invalidateFinderResults=()=>{
    const box=document.getElementById('resultsBox');
    const resultList=document.getElementById('finderResults');
    const budgetMessage=document.getElementById('finderBudgetMessage');
    if(box) box.style.display='none';
    if(resultList) resultList.innerHTML='';
    if(budgetMessage) budgetMessage.innerHTML='';
  };
  form.addEventListener('input',invalidateFinderResults);
  form.addEventListener('change',invalidateFinderResults);

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

    dfTrackEvent('tool_start',{
      tool_name:'finder',
      team_size:team,
      jobs_per_month:jobs,
      budget_monthly:budget,
      booking_requirement:booking,
      device_preference:device,
      priority_count:needs.length
    });

    if(team===1){
      tools.ServiceM8.s+=6;tools.QuoteIQ.s+=5;tools["Mobile Tech RX"].s+=4;tools.Jobber.s+=4;tools.Urable.s+=2;tools["Housecall Pro"].s+=2;
    }else if(team<=5){
      tools.Urable.s+=6;tools["Mobile Tech RX"].s+=5;tools.ServiceM8.s+=5;tools.Jobber.s+=5;tools["Housecall Pro"].s+=4;tools.QuoteIQ.s+=4;
    }else{
      tools.Urable.s+=7;tools.Jobber.s+=6;tools.ServiceM8.s+=6;tools["Housecall Pro"].s+=5;tools["Mobile Tech RX"].s+=4;tools.QuoteIQ.s+=3;
    }

    if(jobs<=30){
      tools.ServiceM8.s+=6;tools.QuoteIQ.s+=5;tools["Mobile Tech RX"].s+=3;tools.Jobber.s+=3;
    }else if(jobs<=50){
      tools.ServiceM8.s+=6;tools.QuoteIQ.s+=4;tools["Mobile Tech RX"].s+=4;tools.Jobber.s+=3;tools.Urable.s+=2;
    }else if(jobs<=150){
      tools.ServiceM8.s+=5;tools.Urable.s+=4;tools["Mobile Tech RX"].s+=4;tools.QuoteIQ.s+=4;tools.Jobber.s+=4;tools["Housecall Pro"].s+=3;
    }else{
      tools.Jobber.s+=6;tools["Housecall Pro"].s+=6;tools.Urable.s+=5;tools["Mobile Tech RX"].s+=4;tools.ServiceM8.s+=3;tools.QuoteIQ.s+=3;
    }

    if(booking==='yes'){
      tools.Jobber.s+=7;tools.ServiceM8.s+=7;tools["Housecall Pro"].s+=6;tools.Urable.s+=5;tools.QuoteIQ.s+=1;tools["Mobile Tech RX"].s-=5;
    }else if(booking==='no'){
      tools.QuoteIQ.s+=4;tools.ServiceM8.s+=3;tools["Mobile Tech RX"].s+=3;
    }

    if(device==='iphone'){
      tools.ServiceM8.s+=7;tools.QuoteIQ.s+=3;tools["Mobile Tech RX"].s+=3;tools.Jobber.s+=3;tools.Urable.s+=3;tools["Housecall Pro"].s+=3;
    }else if(device==='android'){
      tools.ServiceM8.s-=7;tools.QuoteIQ.s+=4;tools["Mobile Tech RX"].s+=3;tools.Jobber.s+=4;tools.Urable.s+=4;tools["Housecall Pro"].s+=4;
    }else{
      Object.values(tools).forEach(x=>x.s+=2);
    }

    if(needs.includes('detail')){
      tools["Mobile Tech RX"].s+=8;tools.Urable.s+=7;tools.QuoteIQ.s+=6;
    }
    if(needs.includes('vehicle')){
      tools["Mobile Tech RX"].s+=10;tools.Urable.s+=4;tools.QuoteIQ.s+=2;
    }
    if(needs.includes('automation')){
      tools.QuoteIQ.s+=5;tools.Jobber.s+=5;tools["Housecall Pro"].s+=3;tools.Urable.s+=3;tools.ServiceM8.s+=3;tools["Mobile Tech RX"].s+=2;
    }
    if(needs.includes('scale')){
      tools.Urable.s+=6;tools.Jobber.s+=6;tools["Housecall Pro"].s+=5;tools.ServiceM8.s+=5;tools.QuoteIQ.s+=3;
      // Mobile Tech RX has strong team/workflow tools on Pro, but DetailerFit has not
      // established equivalent route optimization from the official sources reviewed.
      // Treat a routing/dispatch requirement conservatively rather than rewarding it here.
      tools["Mobile Tech RX"].s-=6;
    }

    const entries=Object.entries(tools).map(([name,t])=>{
      const p=planFor(name,team,jobs,booking,needs);
      const knownCost=Number.isFinite(p.cost);
      const inBudget=knownCost&&p.cost<=budget;
      const gap=knownCost?Math.max(0,p.cost-budget):Infinity;
      if(inBudget)t.s+=4;
      else if(knownCost)t.s-=3;

      // A shortlist match must satisfy hard workflow requirements we can verify.
      // Mobile Tech RX remains researchable, but native customer-facing
      // self-booking and route-optimization are not treated as confirmed.
      const hardMismatch = name==='Mobile Tech RX' &&
        (booking==='yes' || needs.includes('scale'));

      return {name,...t,plan:p,inBudget,gap,hardMismatch};
    });

    const eligibleEntries=entries.filter(x=>!x.hardMismatch);
    const anyInBudget=eligibleEntries.some(x=>x.inBudget);
    eligibleEntries.sort((a,b)=>{
      if(anyInBudget&&a.inBudget!==b.inBudget)return a.inBudget?-1:1;
      if(!anyInBudget&&a.gap!==b.gap)return a.gap-b.gap;
      if(b.s!==a.s)return b.s-a.s;
      const ac=Number.isFinite(a.plan.cost)?a.plan.cost:999999;
      const bc=Number.isFinite(b.plan.cost)?b.plan.cost:999999;
      return ac-bc;
    });

    // When at least one verified plan fits the stated budget, keep the
    // shortlist inside that budget. Only show over-budget alternatives when
    // no verified in-budget configuration exists.
    const ranked=(anyInBudget
      ? eligibleEntries.filter(x=>x.inBudget)
      : eligibleEntries
    ).slice(0,3);
    const budgetMessage=document.getElementById('finderBudgetMessage');
    if(anyInBudget){
      budgetMessage.innerHTML=`<div class="note goodnote"><b>Budget check:</b> At least one shortlisted configuration fits your stated $${budget.toFixed(0)}/month budget using published flexible monthly pricing.</div>`;
    }else{
      const firstKnown=eligibleEntries.find(x=>Number.isFinite(x.plan.cost));
      budgetMessage.innerHTML=`<div class="warning"><b>No exact budget fit found.</b> Your stated requirements push the first known matching configurations above $${budget.toFixed(0)}/month. The ranking below starts with the closest published price match; consider changing a requirement before buying.${firstKnown?` Closest known monthly configuration: ${firstKnown.name} ${firstKnown.plan.plan} at about $${firstKnown.plan.cost.toFixed(2).replace('.00','')}/mo.`:''}</div>`;
    }

    const money=(v)=>Number.isFinite(v)?`$${v.toFixed(2).replace('.00','')}/mo`:'Price to verify';

    document.getElementById('finderResults').innerHTML=ranked.map((x,i)=>{
      const p=x.plan;
      const budgetLabel=x.inBudget
        ? `<span class="pill goodpill">Fits $${budget.toFixed(0)} budget</span>`
        : Number.isFinite(p.cost)
          ? `<span class="pill overpill">$${x.gap.toFixed(0)} over budget</span>`
          : `<span class="pill">Price to verify</span>`;
      const annual=p.annual?`<div class="small annual-note"><strong>Annual billing:</strong> ${p.annual}</div>`:'';
      const planNote=p.note?`<div class="small"><strong>Plan note:</strong> ${p.note}</div>`:'';
      const vendorRel=x.vendorRel||'noopener';
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
          ${planNote}
          <p class="small">${x.why}</p>
          <div class="result-tags">${x.tags.map(tag=>`<span class="result-tag">${tag}</span>`).join('')}</div>
          <div class="result-watch"><strong>Verify before buying:</strong> ${x.baseWatch}</div>
          <div class="actions">
            <a class="btn secondary" href="${x.url}">See research notes</a>
            <a class="btn primary" data-vendor="${x.name}" data-cta-position="finder_result" data-tool-name="finder" data-result-rank="${i+1}" data-result-plan="${p.plan}" href="${x.vendorUrl}" rel="${vendorRel}"${x.vendorTarget?` target="${x.vendorTarget}"`:``}>Visit ${x.name}</a>
            ${i===0?'<a class="btn ghost" href="compare">Open comparison hub</a>':''}
          </div>
        </article>`;
    }).join('');

    if(ranked.length){
      dfTrackEvent('tool_result_view',{
        tool_name:'finder',
        result_count:ranked.length,
        top_vendor:ranked[0].name,
        top_plan:ranked[0].plan.plan,
        any_in_budget:anyInBudget
      });
    }else{
      dfTrackEvent('tool_no_match',{
        tool_name:'finder',
        team_size:team,
        jobs_per_month:jobs,
        budget_monthly:budget,
        booking_requirement:booking,
        device_preference:device
      });
    }

    const box=document.getElementById('resultsBox');
    box.style.display='block';
    box.scrollIntoView({behavior:resultScrollBehavior,block:'start'});
  });
});

// The menu is a non-modal disclosure; close it when keyboard focus leaves the header.
document.querySelector('.site-header')?.addEventListener('focusout', (event) => {
  const header=event.currentTarget;
  if(event.relatedTarget && !header.contains(event.relatedTarget)){
    document.getElementById('navlinks')?.classList.remove('open');
    const button=header.querySelector('.menuBtn');
    if(button){button.setAttribute('aria-expanded','false');button.textContent='Menu';}
  }
});
const currentPage=(location.pathname.split('/').pop() || '').replace(/\.html$/i,'');
document.querySelectorAll('.navlinks a').forEach(link=>{
  const raw=link.getAttribute('href')||'';
  const href=raw.replace(/^\//,'').replace(/\.html$/i,'');
  if((!currentPage && raw==='/') || href===currentPage)link.setAttribute('aria-current','page');
});


// DetailerFit mobile comparison conversion bar - Sep 20, 2026.
// Keeps both compared affiliate options equally accessible after the balanced
// primary CTA has scrolled away. It never changes rankings or conclusions.
document.addEventListener('DOMContentLoaded',()=>{
  const page=location.pathname.replace(/\/+$/,'').split('/').pop()?.replace(/\.html$/i,'')||'';
  const eligiblePages=new Set([
    'quoteiq-vs-housecall-pro',
    'strata-crm-vs-quoteiq-auto-detailers',
    'marlie-ai-vs-my-ai-front-desk-auto-detailers'
  ]);
  if(!eligiblePages.has(page))return;

  const primaryLinks=[...document.querySelectorAll('a[data-cta-position="comparison_primary_cta"][rel~="sponsored"]')].slice(0,2);
  if(primaryLinks.length!==2)return;

  const style=document.createElement('style');
  style.textContent=`
    .df-mobile-comparison-bar{display:none}
    @media(max-width:800px){
      .df-mobile-comparison-bar{display:block;position:fixed;left:0;right:0;bottom:0;z-index:45;padding:7px 10px calc(7px + env(safe-area-inset-bottom));background:rgba(9,13,18,.96);border-top:1px solid #2b3a46;box-shadow:0 -8px 24px rgba(0,0,0,.32);transform:translateY(115%);opacity:0;pointer-events:none;transition:transform .18s ease,opacity .18s ease}
      .df-mobile-comparison-bar.is-visible{transform:translateY(0);opacity:1;pointer-events:auto}
      .df-mobile-comparison-bar-inner{max-width:850px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:7px}
      .df-mobile-comparison-bar-label{grid-column:1/-1;text-align:center;color:#91a0ad;font-size:.6875rem;line-height:1.1;letter-spacing:.04em;text-transform:uppercase}
      .df-mobile-comparison-link{display:flex;align-items:center;justify-content:center;min-height:44px;padding:8px 10px;border:1px solid #4d8d77;border-radius:8px;background:#77d9b8;color:#061b14;text-decoration:none;font-size:.8125rem;font-weight:800;line-height:1.2;text-align:center}
      body.df-mobile-comparison-bar-active{padding-bottom:78px}
    }
    @media(prefers-reduced-motion:reduce){.df-mobile-comparison-bar{transition:none!important}}
  `;
  document.head.appendChild(style);

  const bar=document.createElement('aside');
  bar.className='df-mobile-comparison-bar';
  bar.setAttribute('aria-label','Affiliate options for the compared software');
  bar.setAttribute('aria-hidden','true');
  bar.setAttribute('inert','');
  const inner=document.createElement('div');
  inner.className='df-mobile-comparison-bar-inner';
  const label=document.createElement('span');
  label.className='df-mobile-comparison-bar-label';
  label.textContent='Affiliate links - same comparison conclusions';
  inner.appendChild(label);

  primaryLinks.forEach(source=>{
    const link=source.cloneNode(true);
    link.className='df-mobile-comparison-link';
    link.dataset.ctaPosition='comparison_sticky_cta';
    link.textContent=`${source.dataset.vendor||source.textContent.trim()} >`;
    link.tabIndex=-1;
    inner.appendChild(link);
  });
  bar.appendChild(inner);
  document.body.appendChild(bar);

  const sourceCta=primaryLinks[0].closest('.mid-cta')||primaryLinks[0].parentElement;
  const footer=document.querySelector('.footer');
  const mobileQuery=window.matchMedia('(max-width:800px)');
  const clonedLinks=[...bar.querySelectorAll('a[href]')];
  const sync=()=>{
    const sourcePassed=Boolean(sourceCta&&sourceCta.getBoundingClientRect().bottom<0);
    const footerNear=Boolean(footer&&footer.getBoundingClientRect().top<(window.innerHeight-24));
    const show=Boolean(mobileQuery.matches&&sourcePassed&&!footerNear);
    bar.classList.toggle('is-visible',show);
    bar.setAttribute('aria-hidden',String(!show));
    bar.toggleAttribute('inert',!show);
    clonedLinks.forEach(link=>{link.tabIndex=show?0:-1;});
    document.body.classList.toggle('df-mobile-comparison-bar-active',show);
  };
  sync();
  addEventListener('scroll',sync,{passive:true});
  addEventListener('resize',sync,{passive:true});
  mobileQuery.addEventListener?.('change',sync);
});
