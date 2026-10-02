// DetailerFit verified partner deep attribution - Oct 2, 2026.
// Adds only partner-documented non-personal sub IDs while preserving the
// merchant-issued affiliate identifiers (ServiceLink atp / Zenbooker red).
(function(){
  function clean(value,max=36){
    return String(value||'')
      .toLowerCase()
      .replace(/\.html$/i,'')
      .replace(/[^a-z0-9]+/g,'-')
      .replace(/^-+|-+$/g,'')
      .slice(0,max)||'link';
  }

  function pageKey(){
    const raw=(location.pathname.split('/').pop()||'home').replace(/\.html$/i,'')||'home';
    return clean(raw,42);
  }

  function ctaKey(link){
    return clean(link.dataset.ctaPosition||'link',32);
  }

  function enrich(){
    const page=pageKey();

    // Affonso officially supports sub1-sub5 on an existing affiliate link.
    document.querySelectorAll('a[href*="myservicelink.app"]').forEach(link=>{
      try{
        const url=new URL(link.href,location.href);
        const host=(url.hostname||'').toLowerCase().replace(/^www\./,'');
        if(host!=='myservicelink.app'||url.searchParams.get('atp')!=='Fo98tt')return;
        if(!url.searchParams.has('sub1'))url.searchParams.set('sub1','detailerfit');
        if(!url.searchParams.has('sub2'))url.searchParams.set('sub2',page);
        if(!url.searchParams.has('sub3'))url.searchParams.set('sub3',ctaKey(link));
        link.href=url.toString();
      }catch(_){/* preserve original issued affiliate URL on parse failure */}
    });

    // Reditus officially uses sid for affiliate Sub IDs.
    document.querySelectorAll('a[href*="zenbooker.com"]').forEach(link=>{
      try{
        const url=new URL(link.href,location.href);
        const host=(url.hostname||'').toLowerCase().replace(/^www\./,'');
        if(host!=='zenbooker.com'||url.searchParams.get('red')!=='detail')return;
        if(!url.searchParams.has('sid')){
          url.searchParams.set('sid',`df-${page}-${ctaKey(link)}`.slice(0,96));
        }
        link.href=url.toString();
      }catch(_){/* preserve original issued affiliate URL on parse failure */}
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enrich,{once:true});
  else enrich();
})();
