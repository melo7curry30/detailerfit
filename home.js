/* Static cards are the source of truth. No scores, commercial sorting or URL rewriting. */
(() => {
  'use strict';
  const cards = [...document.querySelectorAll('[data-profile]')];
  if (!cards.length) return;
  const byId = new Map(cards.map(card => [card.dataset.profile, card]));
  const selected = new Set();
  const tray = document.querySelector('.compare-tray');
  const trayTools = document.getElementById('selected-tools');
  const openButton = document.getElementById('open-comparison');
  const status = document.getElementById('selection-status');
  const comparison = document.getElementById('df-compare');
  const comparisonContent = document.getElementById('comparison-content');
  let activeFilter = 'all';
  let comparisonOpened = false;
  const nameOf = card => card.querySelector('h3').textContent;
  const track = (name, data) => {
    if (typeof window.dfTrackEvent === 'function') window.dfTrackEvent(name, data);
  };
  const announce = message => {
    status.textContent = message;
    const feedback = document.getElementById('selection-feedback');
    feedback.hidden = !message.startsWith('You can compare');
    feedback.textContent = feedback.hidden ? '' : message;
  };
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  function filter(value, origin = 'filter') {
    activeFilter = value;
    let visible = 0;
    cards.forEach(card => {
      card.hidden = value !== 'all' && !card.dataset.filters.split(' ').includes(value);
      if (!card.hidden) visible++;
    });
    document.querySelectorAll('[data-filter]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === value));
    });
    document.getElementById('result-count').textContent = `${visible} of ${cards.length} tools · A–Z`;
    track('software_filter_change', {workflow: value, result_count: visible, cta_position: `home_${origin}`});
  }

  function renderComparison() {
    if (!comparisonOpened) return;
    comparison.hidden = false;
    comparisonContent.replaceChildren();
    if (selected.size < 2) {
      document.getElementById('comparison-names').textContent = 'Choose at least two tools to compare.';
      const empty = make('p', 'comparison-empty', 'Add another software profile to see the plan differences. ');
      const link = make('a', '', 'Back to software');
      link.href = '#software'; empty.append(link); comparisonContent.append(empty);
      return;
    }
    const current = [...selected].map(id => byId.get(id));
    document.getElementById('comparison-names').textContent = current.map(nameOf).join(' / ');
    comparisonContent.style.setProperty('--columns', String(current.length));
    const heads = make('div', 'comparison-heads');
    current.forEach(card => {
      const head = make('div');
      head.append(make('p', 'category', card.querySelector('.category').textContent), make('h3', '', nameOf(card)));
      heads.append(head);
    });
    comparisonContent.append(heads);
    const fields = [['price', 'Entry price'], ['plan', 'Plan & billing'], ['booking', 'Customer online booking'], ['capacity', 'Capacity'], ['watch', 'The trade-off']];
    fields.forEach(([key, label]) => {
      const row = make('section', 'comparison-row');
      row.setAttribute('aria-label', label);
      row.append(make('h3', '', label));
      const values = make('div', 'comparison-values');
      current.forEach(card => {
        const cell = make('div');
        cell.setAttribute('aria-label', nameOf(card));
        cell.append(make('span', 'mobile-vendor', nameOf(card)), make('span', '', card.querySelector(`[data-fact="${key}"]`).textContent));
        values.append(cell);
      });
      row.append(values); comparisonContent.append(row);
    });
    const exits = make('section', 'comparison-row comparison-exits');
    exits.setAttribute('aria-label', 'Review and vendor links');
    exits.append(make('h3', '', 'Take a closer look'));
    const links = make('div', 'comparison-values');
    current.forEach(card => {
      const cell = make('div');
      cell.append(make('span', 'mobile-vendor', nameOf(card)));
      const review = card.querySelector('.review-link').cloneNode(true);
      review.dataset.ctaPosition = 'home_comparison';
      const vendor = card.querySelector('.vendor-link').cloneNode(true);
      vendor.dataset.ctaPosition = 'home_comparison';
      // Restore the exact issued source URL before the existing attribution
      // enricher runs. A catalog sub-ID must not leak into comparison clicks.
      vendor.setAttribute('href', vendor.dataset.issuedHref);
      cell.append(review, vendor, card.querySelector('.link-type').cloneNode(true));
      links.append(cell);
    });
    exits.append(links); comparisonContent.append(exits);
    document.dispatchEvent(new Event('df:links-updated'));
  }

  function sync(message, removalFocus = null) {
    cards.forEach(card => {
      const picked = selected.has(card.dataset.profile);
      card.classList.toggle('is-selected', picked);
      card.querySelector('input[type="checkbox"]').checked = picked;
    });
    tray.hidden = selected.size === 0;
    document.body.classList.toggle('has-selection', selected.size > 0);
    document.getElementById('selection-count').textContent = selected.size === 1 ? '1 selected · choose one more' : `${selected.size} selected · ready to compare`;
    trayTools.replaceChildren();
    [...selected].forEach(id => {
      const button = make('button', 'selected-tool', nameOf(byId.get(id)));
      button.type = 'button';
      button.dataset.remove = id;
      button.setAttribute('aria-label', `Remove ${nameOf(byId.get(id))} from comparison`);
      const icon = make('span', '', '×'); icon.setAttribute('aria-hidden', 'true'); button.append(icon);
      trayTools.append(button);
    });
    openButton.disabled = selected.size < 2;
    openButton.textContent = `Compare (${selected.size}) →`;
    renderComparison();
    if (message) announce(message);
    if (removalFocus) {
      const remaining = trayTools.querySelector('button');
      const original = byId.get(removalFocus);
      if (remaining) remaining.focus();
      else if (!original.hidden) original.querySelector('input').focus();
      else document.querySelector(`[data-filter="${activeFilter}"]`).focus();
    }
  }

  // Save issued hrefs before enrichment; it runs at DOMContentLoaded.
  cards.forEach(card => {
    const link = card.querySelector('.vendor-link');
    link.dataset.issuedHref = link.getAttribute('href');
    card.querySelector('input').addEventListener('change', event => {
      const input = event.currentTarget;
      const id = card.dataset.profile;
      if (input.checked && selected.size === 3) {
        input.checked = false;
        announce('You can compare up to 3 tools. Remove one from your shortlist to add another.');
        return;
      }
      if (input.checked) selected.add(id); else selected.delete(id);
      sync(`${nameOf(card)} ${input.checked ? 'added to' : 'removed from'} comparison. ${selected.size} selected.`);
      track('software_compare_select', {vendor: nameOf(card), selected: input.checked, selected_count: selected.size, cta_position: 'home_catalog'});
    });
  });
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => filter(button.dataset.filter)));
  document.querySelectorAll('[data-shortcut]').forEach(link => link.addEventListener('click', () => filter(link.dataset.shortcut, 'need')));
  trayTools.addEventListener('click', event => {
    const button = event.target.closest('button[data-remove]');
    if (!button) return;
    const id = button.dataset.remove;
    selected.delete(id);
    sync(`${nameOf(byId.get(id))} removed. ${selected.size} selected.`, id);
    track('software_compare_remove', {vendor: nameOf(byId.get(id)), selected_count: selected.size, cta_position: 'home_tray'});
  });
  document.getElementById('clear-selection').addEventListener('click', () => {
    selected.clear();
    sync('Comparison selection cleared.');
    document.querySelector(`[data-filter="${activeFilter}"]`).focus();
    track('software_compare_clear', {cta_position: 'home_tray'});
  });
  openButton.addEventListener('click', () => {
    if (selected.size < 2) return;
    comparisonOpened = true;
    renderComparison();
    document.getElementById('comparison-title').focus({preventScroll:true});
    comparison.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
    announce(`Comparing ${[...selected].map(id => nameOf(byId.get(id))).join(', ')}.`);
    track('software_comparison_view', {vendors:[...selected].join(','), selected_count:selected.size, cta_position:'home_comparison'});
  });
  document.querySelectorAll('.compare-check,.filter-bar,.compare-help,.menuBtn').forEach(el => {el.hidden=false;});
  document.documentElement.classList.add('js-home');
  // A menu link that points within this page should close the mobile disclosure.
  document.querySelector('#navlinks').addEventListener('click', event => {
    if (!event.target.closest('a')) return;
    const nav = document.getElementById('navlinks');
    nav.classList.remove('open');
    const button = document.querySelector('.menuBtn');
    button.setAttribute('aria-expanded','false'); button.textContent='Menu';
  });
})();
