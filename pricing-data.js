/* Published plan facts, checked 2026-10-24. No affiliate or ranking inputs.
 * https://myquoteiq.com/pricing/
 * https://intercom.help/quoteiq/en/articles/16152075-quoteiq-pricing-plans-2026
 * https://detailpilot.com/pricing
 */
(function (root) {
  'use strict';
  const quoteIqTiers = [
    {name: 'Essentials', monthly: 29.99, annual: 299.99, seats: 1},
    {name: 'Beginner', monthly: 99.99, annual: 999.99, seats: 2},
    {name: 'Pro', monthly: 199.99, annual: 1999.99, seats: 4},
    {name: 'Elite', monthly: 299.99, annual: 2999.99, seats: 10},
    {name: 'Max', monthly: 699.99, annual: 6999.99, seats: 20}
  ];
  const cents = value => Math.round(value * 100) / 100;

  function quoteIQ(team, {booking = false, automation = false, routing = false} = {}) {
    const users = Math.max(1, Math.ceil(Number(team) || 1));
    const firstTier = booking || routing ? 3 : automation ? 2 : 0;
    const candidates = quoteIqTiers.slice(firstTier).map(tier => {
      const extra = Math.max(0, users - tier.seats);
      return {
        plan: tier.name + (extra ? ` + ${extra} extra user${extra === 1 ? '' : 's'}` : ''),
        monthly: cents(tier.monthly + extra * 25),
        annualBase: tier.annual,
        annualTotal: cents(tier.annual + extra * 25 * 12),
        extraMonthly: extra * 25,
        extra,
        included: tier.seats,
        booking: quoteIqTiers.indexOf(tier) >= 3,
        capacity: extra ? `${tier.seats} included + ${extra} extra user${extra === 1 ? '' : 's'} at $25/month each` : `${tier.seats} user${tier.seats === 1 ? '' : 's'} included`
      };
    }).filter(plan => plan.extra <= 100);
    // Find the lowest published monthly configuration satisfying the requested
    // features, including the documented optional seats on every paid plan.
    candidates.sort((a, b) => a.monthly - b.monthly);
    return candidates[0] || null;
  }

  function detailPilot(team, needs = []) {
    if (team > 1 || needs.includes('scale')) return {
      plan: 'Business', cost: 119, annual: '$928/year · $77.33/mo effective',
      users: 'Team roles and multi-location tools; confirm required seat count',
      booking: true,
      note: 'Business is the documented team tier. A numeric included-seat limit is not published in the pricing summary; confirm your team size before buying.'
    };
    return {
      plan: 'Growth', cost: 29, annual: '$228/year · $19/mo effective',
      users: 'Solo / non-team plan path', booking: true,
      note: 'Paid plan after a 14-day Pro trial. No DetailPilot commission; payment-processor fees still apply.'
    };
  }

  const api = Object.freeze({verified: '2026-10-24', quoteIQ, detailPilot});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DetailerFitPricing = api;
})(typeof window !== 'undefined' ? window : globalThis);
