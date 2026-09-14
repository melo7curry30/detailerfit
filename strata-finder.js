/* DETAILERFIT-STRATA-V2 */
(() => {
  'use strict';
  const affiliate = 'https://stratacrm.app/?via=ryo-yonemura';

  function init() {
    const form = document.getElementById('finderForm');
    const results = document.getElementById('resultsBox');
    if (!form || !results) return;
    if (form.dataset.strataExtension === 'ready') return;
    form.dataset.strataExtension = 'ready';

    form.addEventListener('submit', () => {
      window.setTimeout(() => {
        document.getElementById('strata-finder-candidate')?.remove();

        const data = new FormData(form);
        const team = Number(data.get('teamCount'));
        const budget = Number(data.get('budgetAmount'));
        const booking = data.get('booking');
        const needs = data.getAll('priority');
        const baseline = team === 1 ? 39 : 89;

        if (!Number.isFinite(team) || !Number.isFinite(budget)) return;
        if (!Number.isInteger(team) || team < 1 || team > 5) return;
        if (budget < baseline) return;
        if (needs.includes('scale') || needs.includes('vehicle')) return;
        if (booking !== 'yes' && !needs.includes('detail')) return;

        const candidate = document.createElement('article');
        candidate.id = 'strata-finder-candidate';
        candidate.className = 'result';

        const plan = team === 1
          ? 'Focus: $39/month, one login, up to 2,000 clients'
          : 'Flow: $89/month, unlimited team logins, up to 20,000 clients';

        candidate.innerHTML = `
          <div class="kicker">ADDITIONAL CRM CANDIDATE</div>
          <h3>Strata</h3>
          <p>Worth evaluating for customer and vehicle records,
          online booking and everyday business organization.</p>
          <div class="result-plan">
          <strong>Standard subscription to inspect:</strong> ${plan}
          </div>
          <div class="result-watch">
          <strong>Verify plan fit:</strong>
          Your client count may require a higher plan.
          This form does not establish an exact Strata cost match.
          Confirm texting setup and charges; official pages disagree.
          Route optimization, VIN scanning and offline operation
          are not verified. Source check: September 15, 2026.
          </div>
          <div class="actions">
          <a class="btn secondary" href="/strata-crm-review">
          Read the Strata CRM review</a>
          <a class="btn primary" data-vendor="Strata"
          href="${affiliate}" rel="sponsored noopener" target="_blank">
          Explore Strata CRM</a>
          </div>
          <p class="cta-disclosure small">
          DetailerFit may earn a commission if you sign up through
          this link, at no extra cost to you.
          <a href="/affiliate-disclosure">Affiliate disclosure</a>.
          </p>`;
        results.appendChild(candidate);
      }, 0);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once: true});
  } else {
    init();
  }
})();
