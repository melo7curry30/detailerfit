/* DetailerFit decision desk. No dependencies, no affiliate URL rewriting. */
(() => {
  'use strict';
  const root = document.querySelector('.df-hero');
  const source = document.getElementById('df-profile-data');
  if (!root || !source) return;
  let profiles;
  try { profiles = JSON.parse(source.textContent); } catch (_) { return; }
  const buttons = [...root.querySelectorAll('[data-product]')];
  const panels = [...root.querySelectorAll('.df-product')];
  const left = document.getElementById('df-select-left');
  const right = document.getElementById('df-select-right');
  const status = document.getElementById('df-comparison-status');
  if (!left || !right || profiles.length !== buttons.length) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  function track(name, data) {
    if (typeof window.dfTrackEvent === 'function') window.dfTrackEvent(name, data);
  }
  // The existing app uses delegated link tracking; cloned links retain all
  // vendor, rel and target attributes and never receive a second click handler.
  function linkFrom(markup, position) {
    const template = document.createElement('template');
    template.innerHTML = markup;
    const link = template.content.firstElementChild;
    link.dataset.ctaPosition = position;
    return link;
  }
  function renderSide(side, id) {
    const p = profiles.find(item => item.id === id);
    const card = document.querySelector(`[data-side="${side}"]`);
    card.querySelector('.df-overline').textContent = p.fit;
    card.querySelector('h3').textContent = p.name;
    const values = [p.price, p.plan, p.booking, p.limit, p.watch];
    card.querySelectorAll('dd').forEach((dd, i) => { dd.textContent = values[i]; });
    card.querySelector('.actions').replaceChildren(linkFrom(p.review, 'home_decision_desk'), linkFrom(p.cta, 'home_decision_desk'));
    card.querySelector('.small').textContent = `Review pricing checked ${p.date}. Confirm current vendor terms.`;
  }
  function syncComparison(changed, announce = true) {
    if (left.value === right.value) {
      const other = changed === left ? right : left;
      other.value = profiles.find(p => p.id !== changed.value).id;
    }
    renderSide('left', left.value);
    renderSide('right', right.value);
    document.dispatchEvent(new Event('df:links-updated'));
    if (announce) {
      status.textContent = `Comparing ${left.selectedOptions[0].textContent} with ${right.selectedOptions[0].textContent}. Pricing, limits and links updated.`;
      track('software_comparison_change', {first_vendor: left.selectedOptions[0].textContent, second_vendor: right.selectedOptions[0].textContent, cta_position: 'home_decision_desk'});
    }
  }
  function activate(id, announce = true) {
    const p = profiles.find(item => item.id === id);
    root.dataset.tone = id;
    panels.forEach(panel => { panel.hidden = panel.id !== `df-product-${id}`; });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.product === id)));
    left.value = id;
    syncComparison(left, announce);
    if (announce) track('software_profile_select', {vendor: p.name, cta_position: 'home_showcase'});
  }
  panels.forEach(panel => panel.querySelectorAll('.actions a').forEach(a => { a.dataset.ctaPosition = 'home_showcase'; }));
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => activate(button.dataset.product));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      if (next === undefined) return;
      event.preventDefault(); buttons[next].focus(); activate(buttons[next].dataset.product);
    });
  });
  [left, right].forEach(select => select.addEventListener('change', () => syncComparison(select)));
  root.querySelector('.df-selector').hidden = false;
  document.querySelector('.df-compare-controls').hidden = false;
  syncComparison(left, false);
  // A single scheduled update only while the pointer moves. No idle loop,
  // scroll hijacking, WebGL, mobile tilt, or hidden-content reveal dependency.
  const stage = root.querySelector('.df-stage');
  let frame = 0;
  let point;
  const reset = () => {
    cancelAnimationFrame(frame); frame = 0;
    stage.style.removeProperty('--rx'); stage.style.removeProperty('--ry');
    root.style.removeProperty('--light-x'); root.style.removeProperty('--light-y');
  };
  stage.addEventListener('pointermove', event => {
    if (motion.matches || !fine.matches || event.pointerType === 'touch') return;
    point = {x: event.clientX, y: event.clientY};
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const rect = stage.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (point.x - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (point.y - rect.top) / rect.height));
      stage.style.setProperty('--rx', `${(0.5-y)*5}deg`);
      stage.style.setProperty('--ry', `${(x-0.5)*7}deg`);
      root.style.setProperty('--light-x', `${60+x*20}%`);
      root.style.setProperty('--light-y', `${25+y*20}%`);
    });
  });
  stage.addEventListener('pointerleave', reset);
  stage.addEventListener('focusin', reset);
  motion.addEventListener('change', reset);
  fine.addEventListener('change', reset);
})();
