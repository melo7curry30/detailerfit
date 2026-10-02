/* DetailerFit Finder Trust & Conversion snapshot v1.0.0
 * Informational only: this layer never changes Match Score, Evidence Confidence,
 * budget gates, vendor ranking, CTA order, or affiliate treatment.
 * Verified: 2026-10-02 from current DetailerFit research / official vendor sources.
 */
(function(){
  'use strict';

  const DATA={
    'QuoteIQ':{
      googleReviews:['verify','Google-specific review integration is not yet normalized in the Finder evidence set.'],
      brandedBooking:['verify','InstaSchedule self-booking is verified; booking-page branding controls still need direct verification.'],
      customDomain:['verify','Custom-domain support for the customer booking experience is not yet verified.'],
      reviewAutomation:['verify','General email/text automation is documented, but native post-job review automation is not yet normalized.']
    },
    'Mobile Tech RX':{
      googleReviews:['verify','Automated post-service review asks are documented; Google-specific routing is not yet normalized.'],
      brandedBooking:['verify','Native customer-facing self-booking remains unverified in the current Finder evidence set.'],
      customDomain:['verify','Custom-domain support for a customer booking surface is not yet verified.'],
      reviewAutomation:['verified','Mobile Tech RX documents automated text messages that ask customers for a review after service.']
    },
    'ServiceM8':{
      googleReviews:['verified','Customer Feedback can direct review requests to Google.'],
      brandedBooking:['verify','Hosted and embeddable online booking are verified; branding-control depth is not yet normalized.'],
      customDomain:['verify','A custom domain for the hosted booking page is not yet verified.'],
      reviewAutomation:['verified','ServiceM8 documents automated feedback and review requests.']
    },
    'Jobber':{
      googleReviews:['verified','Jobber Marketing Tools documents automated Google review asks.'],
      brandedBooking:['verify','Customizable request and booking forms are verified; branding depth for the hosted booking surface is not yet normalized.'],
      customDomain:['qualified','Custom domains are documented for Jobber Websites; booking/request forms still use Jobber Client Hub infrastructure.'],
      reviewAutomation:['verified','Automated Google review asks can trigger after a visit, job close, or invoice payment.']
    },
    'Urable':{
      googleReviews:['verified','Urable documents automated review requests with user-controlled destinations, including Google workflows.'],
      brandedBooking:['verify','Customer online booking is verified on Pro; booking-page branding controls are not yet normalized.'],
      customDomain:['verify','Custom-domain support for the booking experience is not yet verified.'],
      reviewAutomation:['verified','Urable documents automated post-job review requests.']
    },
    'Strata':{
      googleReviews:['verify','Automated review requests are documented, but Google-specific integration or routing is not yet normalized.'],
      brandedBooking:['verify','Customer booking is documented; booking-page branding controls are not yet normalized.'],
      customDomain:['verify','Custom-domain support for the customer booking experience is not yet verified.'],
      reviewAutomation:['verified','Strata documents automated review-request workflows.']
    },
    'DetailPilot':{
      googleReviews:['verified','Growth and higher plans include automated Google review requests and a Google review badge.'],
      brandedBooking:['verified','Every plan includes a branded online booking page with logo, colors and photos.'],
      customDomain:['verified','Pro and higher plans include a professional website on the business’s own domain plus an embeddable booking widget.'],
      reviewAutomation:['verified','Growth and higher plans can automatically request a Google review after a completed job.']
    },
    'Housecall Pro':{
      googleReviews:['verified','Housecall Pro Reviews connects Google Business Profile and can route review requests to Google.'],
      brandedBooking:['verify','Online Booking is verified; branding depth for the hosted booking page is not yet normalized.'],
      customDomain:['verify','Custom-domain support for the booking experience is not yet normalized in the Finder dataset.'],
      reviewAutomation:['verified','Review requests can be sent automatically when a job is completed or paid.']
    }
  };

  const LABELS=[
    ['Google reviews','googleReviews'],
    ['Branded booking page','brandedBooking'],
    ['Custom domain','customDomain'],
    ['Review automation','reviewAutomation']
  ];

  const STATUS={
    verified:{label:'Verified',className:'is-verified'},
    qualified:{label:'Qualified',className:'is-qualified'},
    verify:{label:'Verify',className:'is-verify'}
  };

  function esc(value){
    return String(value).replace(/[&<>"']/g,function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }

  function vendorName(card){
    const text=(card.querySelector('h3')?.textContent||'').trim();
    return text.replace(/^\d+\.\s*/, '').trim();
  }

  function axisHtml(name){
    const vendor=DATA[name];
    if(!vendor)return '';
    const rows=LABELS.map(function(pair){
      const label=pair[0], key=pair[1];
      const item=vendor[key]||['verify','Not yet normalized.'];
      const meta=STATUS[item[0]]||STATUS.verify;
      return '<div class="df-trust-item" title="'+esc(item[1])+'" aria-label="'+esc(label+': '+meta.label+'. '+item[1])+'">'+
        '<span>'+esc(label)+'</span><b class="'+meta.className+'">'+esc(meta.label)+'</b></div>';
    }).join('');
    const qualified=LABELS
      .map(function(pair){return [pair[0],vendor[pair[1]]];})
      .filter(function(pair){return pair[1]&&pair[1][0]==='qualified';})
      .map(function(pair){return '<li><strong>'+esc(pair[0])+':</strong> '+esc(pair[1][1])+'</li>';})
      .join('');
    return '<section class="df-trust-axis" data-df-trust-axis="true" aria-label="Trust and Conversion feature snapshot">'+
      '<div class="df-trust-head"><strong>Trust &amp; Conversion</strong><span>Non-scoring comparison axis</span></div>'+
      '<div class="df-trust-grid">'+rows+'</div>'+
      (qualified?'<ul class="df-trust-qualified">'+qualified+'</ul>':'')+
      '<p class="df-trust-note">Informational only — this snapshot does not change Match Score or ranking. “Verify” means DetailerFit does not yet have enough normalized evidence to call the feature present or absent.</p>'+
      '</section>';
  }

  function injectStyles(){
    if(document.getElementById('df-trust-conversion-style'))return;
    const style=document.createElement('style');
    style.id='df-trust-conversion-style';
    style.textContent='\
      .df-trust-axis{margin:12px 0;padding:11px;border:1px solid var(--line);border-radius:10px;background:#0c141b}\
      .df-trust-head{display:flex;justify-content:space-between;gap:10px;align-items:baseline;margin-bottom:8px}\
      .df-trust-head span{font-size:.75rem;color:var(--muted)}\
      .df-trust-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}\
      .df-trust-item{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:7px 8px;border:1px solid #24313c;border-radius:8px;background:#101922;font-size:.8rem}\
      .df-trust-item b{font-size:.72rem;white-space:nowrap}\
      .df-trust-item .is-verified{color:var(--accent)}\
      .df-trust-item .is-qualified{color:#e3c87a}\
      .df-trust-item .is-verify{color:var(--muted)}\
      .df-trust-qualified{margin:8px 0 0;padding-left:18px;font-size:.75rem;color:var(--muted)}\
      .df-trust-note{margin:8px 0 0;font-size:.75rem;color:var(--muted)}\
      @media(max-width:520px){.df-trust-grid{grid-template-columns:1fr}.df-trust-head{display:block}.df-trust-head span{display:block;margin-top:2px}}';
    document.head.appendChild(style);
  }

  function enhanceCard(card){
    if(card.querySelector('[data-df-trust-axis]'))return;
    const name=vendorName(card);
    if(!DATA[name])return;
    const anchor=card.querySelector('.result-tags')||card.querySelector('.df-score-row')||card.querySelector('.result-plan');
    if(!anchor)return;
    anchor.insertAdjacentHTML('afterend',axisHtml(name));
  }

  function scan(root){
    if(!root)return;
    if(root.matches?.('article.result'))enhanceCard(root);
    root.querySelectorAll?.('article.result').forEach(enhanceCard);
  }

  function init(){
    injectStyles();
    const results=document.getElementById('finderResults');
    if(!results)return;
    scan(results);
    new MutationObserver(function(records){
      records.forEach(function(record){
        record.addedNodes.forEach(function(node){
          if(node.nodeType===1)scan(node);
        });
      });
    }).observe(results,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
