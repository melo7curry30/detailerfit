/* DetailerFit booking showcase enhancement — additive, no affiliate URL rewriting. */
(() => {
  'use strict';
  const boot = () => {
    const heading = document.getElementById('booking-next-title');
    const section = heading && heading.closest('section');
    if (!section || section.dataset.dfMotionReady) return;
    const grid = section.querySelector('.df-booking-grid');
    if (!grid) return;
    const cards = [...grid.querySelectorAll(':scope > article.card')];
    if (cards.length < 2) return;
    section.dataset.dfMotionReady = 'true';
    section.classList.add('df-motion-section');
    grid.classList.add('df-motion-grid');
    const style = document.createElement('style');
    style.textContent = `
      .df-motion-section{position:relative;isolation:isolate;overflow:hidden;padding-top:clamp(32px,5vw,72px);padding-bottom:clamp(32px,5vw,72px)}
      .df-motion-section::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(ellipse at var(--df-glow-x,28%) 38%,var(--df-glow,rgba(102,225,181,.16)),transparent 64%);transition:background .6s,opacity .5s}
      .df-motion-section .df-motion-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(14px,2.5vw,30px);perspective:1100px;align-items:stretch}
      .df-motion-section .df-motion-grid>.card{position:relative;min-width:0;height:100%;transform-style:preserve-3d;transform:translateY(0) rotateY(0deg);transition:transform .55s cubic-bezier(.2,.75,.2,1),box-shadow .55s,border-color .4s,opacity .4s;will-change:transform;box-shadow:0 12px 30px rgba(0,0,0,.15);border:1px solid rgba(164,187,205,.18);overflow:hidden}
      .df-motion-section .df-motion-grid>.card::before{content:"";position:absolute;inset:0 0 auto;height:3px;background:linear-gradient(90deg,var(--df-card-accent,#66e1b5),transparent);opacity:.8;pointer-events:none}
      .df-motion-section .df-motion-grid>.card[data-df-active="true"]{transform:translateY(-9px) rotateY(var(--df-tilt,-3deg));box-shadow:0 26px 60px rgba(0,0,0,.34),0 0 34px var(--df-card-glow,rgba(102,225,181,.12));border-color:var(--df-card-accent,#66e1b5)}
      .df-motion-section .df-motion-grid>.card[data-df-active="false"]{opacity:.84;transform:translateY(3px) scale(.985)}
      .df-motion-section .df-motion-grid>.card:focus-within{outline:2px solid var(--df-card-accent,#66e1b5);outline-offset:3px;opacity:1}
      .df-motion-controls{display:flex;align-items:center;gap:10px;margin:0 0 18px;flex-wrap:wrap}
      .df-motion-controls button{cursor:pointer;border:1px solid rgba(164,187,205,.35);border-radius:999px;background:#14202c;color:#f6f8fb;padding:9px 15px;font:inherit;font-size:.9rem;transition:background .2s,border-color .2s}
      .df-motion-controls button[aria-pressed="true"]{background:#24423c;border-color:#66e1b5}
      .df-motion-controls button:focus-visible{outline:2px solid #66e1b5;outline-offset:3px}
      .df-motion-hint{font-size:.82rem;opacity:.7;margin-left:auto}
      @media(max-width:740px){.df-motion-section .df-motion-grid{grid-template-columns:minmax(0,1fr)}.df-motion-section .df-motion-grid>.card[data-df-active="true"]{transform:translateY(-4px)}.df-motion-section .df-motion-grid>.card[data-df-active="false"]{transform:none;opacity:1}.df-motion-hint{display:none}}
      @media(prefers-reduced-motion:reduce){.df-motion-section .df-motion-grid>.card,.df-motion-section::before,.df-motion-controls button{transition:none!important;transform:none!important;animation:none!important}}
    `;
    document.head.appendChild(style);
    const controls = document.createElement('div');
    controls.className = 'df-motion-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Highlight a booking software option');
    const options = [
      {name:'ServiceLink', accent:'#66e1b5', glow:'rgba(102,225,181,.19)', shadow:'rgba(102,225,181,.14)'},
      {name:'Zenbooker', accent:'#82a7ff', glow:'rgba(130,167,255,.2)', shadow:'rgba(130,167,255,.14)'}
    ];
    let active = 0;
    const buttons = cards.map((card, i) => {
      const info = options[i] || options[0];
      card.style.setProperty('--df-card-accent',info.accent);
      card.style.setProperty('--df-card-glow',info.shadow);
      card.style.setProperty('--df-tilt',i%2===0?'-2deg':'2deg');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = info.name;
      button.setAttribute('aria-label',`Highlight ${info.name} comparison card`);
      button.addEventListener('click',()=>activate(i));
      button.addEventListener('keydown',(event)=>{
        if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
          event.preventDefault();
          const next=(i+(event.key==='ArrowRight'?1:-1)+cards.length)%cards.length;
          activate(next);buttons[next].focus();
        }
      });
      controls.appendChild(button);
      return button;
    });
    const hint=document.createElement('span');hint.className='df-motion-hint';hint.textContent='Choose a card to compare';controls.appendChild(hint);
    grid.parentNode.insertBefore(controls,grid);
    function activate(index){
      active=index;
      cards.forEach((card,i)=>{card.dataset.dfActive=String(i===active);});
      buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===active)));
      section.style.setProperty('--df-glow',options[active].glow);
      section.style.setProperty('--df-glow-x',active===0?'25%':'75%');
    }
    activate(0);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
