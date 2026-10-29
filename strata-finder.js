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
        const baseline = team === 1 ? 59 : 89;

        if (!Number.isFinite(team) || !Number.isFinite(budget)) return;
        if (!Number.isInteger(team) || team < 1 || team > 5) return;
        if (budget < baseline) return;
        if (needs.includes('scale') || needs.includes('vehicle')) return;
        if (booking !== 'yes' && !needs.includes('detail')) return;

        const candidate = document.createElement('article');
        candidate.id = 'strata-finder-candidate';
        candidate.className = 'result';

        const plan = team === 1
          ? 'Solo: $59/month list ($39 first 3 months), one login, up to 500 clients; no two-way SMS'
          : 'Pro: $89/month list ($69 first 3 months), up to 5 logins, up to 1,000 clients, SMS included';

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
          Two-way SMS begins on Pro. Confirm messaging charges at checkout.
          Route optimization, VIN scanning and offline operation
          are not verified. Pricing verified: October 29, 2026.
          </div>
          <div class="actions">
          <a class="btn secondary" href="/strata-crm-review">
          Read the Strata CRM review</a>
          <a class="btn primary" data-vendor="Strata"
          data-cta-position="finder_result" data-tool-name="finder"
          data-result-plan="${team === 1 ? 'Solo' : 'Pro'}"
          href="${affiliate}" rel="sponsored noopener" target="_blank">
          Try Strata Free for 30 Days</a>
          </div>
          <p class="small">Strata's pricing FAQ currently says a card is required before the 30-day trial;
          <a href="https://stratacrm.app/pricing" rel="noopener" target="_blank">published trial terms</a>
          checked October 29, 2026. Confirm live checkout before signing up.</p>
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
