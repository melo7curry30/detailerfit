/* Business Doctor v1. Intake stays local; no fetch, analytics or auto-send. */
(function(root){
  'use strict';
  const VERSION='doctor-consent-v1-20261101';
  const TYPES={mobile:'Owner-led mobile',studio:'Studio / quote-led specialist',fleet:'Multi-area / fleet',other:'Other / unsure'};
  const GOALS={booking:'Clarify the booking path',quotes:'Improve the quote handoff',areas:'Check service-area and team fit',unsure:'Not sure yet'};
  function normalizeWebsite(raw){
    const s=String(raw||'').trim();
    if(s.length>500||/[\s<>\\]/.test(s))throw Error('Enter a public business website, without spaces or private information.');
    let u;try{u=new URL(s.includes('://')?s:'https://'+s);}catch(_){throw Error('Enter a valid public business website.');}
    const host=u.hostname.toLowerCase().replace(/\.$/,'');
    if(!['https:','http:'].includes(u.protocol)||u.username||u.password||u.port||!host.includes('.')||/^[\d.]+$/.test(host)||host.includes(':')||/(^|\.)(localhost|local|internal|test|invalid)$/.test(host)||host==='example.com'||host.endsWith('.example.com'))throw Error('Use your public business website, not a login, local address or example URL.');
    if(u.search||u.hash||/(?:^|\/)(?:login|signin|admin|account|dashboard)(?:\/|$)/i.test(u.pathname))throw Error('Use a public page without login details, query parameters or a # fragment.');
    return u.origin+u.pathname;
  }
  function buildRequest(values,now,id){
    if(!values.authority||!values.consent)throw Error('Confirm both checkboxes before preparing your request.');
    if(!TYPES[values.type]||!GOALS[values.goal])throw Error('Choose your business type and review focus.');
    const website=normalizeWebsite(values.website);
    return `Business Doctor pilot request\nRequest reference: ${id}\nWebsite: ${website}\nBusiness type: ${TYPES[values.type]}\nReview focus: ${GOALS[values.goal]}\n\nI own/manage this business or am authorized to request its review.\nI request an AI-assisted review of its public website and consent to DetailerFit using this email address, URL and selected answers to respond about this diagnosis and deliver a report.\nI have read the Business Doctor privacy notice. This is not marketing consent or permission to share my contact details with software vendors.\nConsent version: ${VERSION}\nPrepared at: ${now}\n\nPlease confirm pilot availability. I understand that preparing this message does not submit a request; it is received only after I send it. No guaranteed turnaround or revenue outcome.\nDo not add customer records, passwords, payment details or private documents.`;
  }
  const api={normalizeWebsite,buildRequest,VERSION};
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.BusinessDoctor=api;
  if(typeof document==='undefined')return;
  const menu=document.querySelector('.menuBtn'),nav=document.querySelector('#navlinks');
  if(menu&&nav){menu.hidden=false;document.querySelector('.site-header').classList.add('nav-ready');menu.removeAttribute('onclick');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});}
  const form=document.getElementById('doctor-form');
  if(!form)return;
  const receipt=document.getElementById('doctor-receipt'),draft=document.getElementById('doctor-draft'),open=document.getElementById('doctor-open-email'),error=document.getElementById('doctor-error');
  let requestId=null;
  function invalidate(){receipt.hidden=true;draft.value='';open.removeAttribute('href');error.textContent='';requestId=null;}
  form.addEventListener('input',invalidate);
  form.addEventListener('change',invalidate);
  form.addEventListener('submit',event=>{
    event.preventDefault();error.textContent='';
    try{
      const values={website:form.elements.website.value,type:form.elements.business_type.value,goal:form.elements.goal.value,authority:form.elements.authority.checked,consent:form.elements.consent.checked};
      requestId=requestId||'BD-'+(typeof crypto.randomUUID==='function'?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10));
      const body=buildRequest(values,new Date().toISOString(),requestId);
      draft.value=body;
      open.href='mailto:hello.detailerfit@gmail.com?subject='+encodeURIComponent('[DF Business Doctor] '+requestId)+'&body='+encodeURIComponent(body);
      receipt.hidden=false;document.getElementById('doctor-ready').focus();
    }catch(e){error.textContent=e.message;error.focus();}
  });
  document.getElementById('doctor-copy').addEventListener('click',async()=>{
    const status=document.getElementById('doctor-copy-status');
    try{await navigator.clipboard.writeText(draft.value);status.textContent='Copied. Paste it into an email to hello.detailerfit@gmail.com and send when ready.';}
    catch(_){draft.focus();draft.select();status.textContent='Select and copy the draft below, then email hello.detailerfit@gmail.com.';}
  });
  form.addEventListener('reset',()=>{invalidate();document.getElementById('doctor-copy-status').textContent='';});
  form.querySelector('fieldset').disabled=false;
})(typeof window==='undefined'?globalThis:window);
