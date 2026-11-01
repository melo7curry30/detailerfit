/* Optional telemetry only on the generic options page, which has no request data. */
(()=>{
  'use strict';
  const consent=document.getElementById('doctor-analytics-consent');
  if(!consent)return;
  const id='G-1MS4N4L2J1',flag='ga-disable-'+id,status=document.getElementById('doctor-analytics-state');
  const qs=new URLSearchParams(location.search);let qa=qs.get('df_qa')==='1';
  try{if(qa)localStorage.setItem('detailerfit_qa_mode','1');qa=qa||localStorage.getItem('detailerfit_qa_mode')==='1';}catch(_){/* query exclusion survives blocked storage */}
  // No arbitrary inbound query/referrer, report token or client identifier enters GA4.
  try{history.replaceState(null,'',location.pathname+(location.hash.match(/^#(servicelink|urable|zenbooker)$/)?location.hash:''));}catch(_){qa=true;}
  let loaded=false,viewed=false;window[flag]=true;
  function event(name,vendor){
    if(!consent.checked||qa||!loaded)return;
    const params={experiment_id:'df_business_doctor_v1',cta_position:'doctor-options',page_location:'https://getdetailerfit.com/business-doctor-options',page_referrer:'',page_title:'Business Doctor software options',page_path:'/business-doctor-options',transport_type:'beacon'};
    if(vendor)params.vendor=vendor;
    window.gtag('event',name,params);
  }
  consent.addEventListener('change',()=>{
    if(qa){consent.checked=false;status.textContent='QA mode: analytics remains off.';return;}
    window[flag]=!consent.checked;
    if(!consent.checked){if(loaded)window.gtag('consent','update',{analytics_storage:'denied'});status.textContent='Analytics is off. Previously sent events cannot be recalled by this control.';return;}
    if(!loaded){
      window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};
      window.gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});
      window.gtag('js',new Date());
      window.gtag('config',id,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,ignore_referrer:true,page_location:'https://getdetailerfit.com/business-doctor-options',page_referrer:'',page_title:'Business Doctor software options'});
      const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+id;document.head.appendChild(script);loaded=true;
    }else window.gtag('consent','update',{analytics_storage:'granted'});
    status.textContent='Optional analytics is on for this page. Uncheck to stop future events.';
    if(!viewed){event('doctor_options_view');viewed=true;}
  });
  document.querySelectorAll('a[data-vendor]').forEach(link=>link.addEventListener('click',()=>{
    const vendor=link.dataset.vendor;if(!['ServiceLink','Urable','Zenbooker'].includes(vendor))return;
    event(link.rel.split(/\s+/).includes('sponsored')?'affiliate_click':'vendor_outbound_click',vendor);
  }));
})();
