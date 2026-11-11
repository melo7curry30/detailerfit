# Strata Finder tier-gate release — 2026-11-12

This is a guarded DetailerFit Gmail bridge release trigger for the already merged PR #9.
Main base commit: `d9259c2aacd9437651b0aa2d340b09bcb9876fd4`.

- The existing `match-score.js` in main now selects Solo $59 for 1 user, Pro $89 for 2–5 users, Premier $199 for 6+ users.
- Temporary intro discounts are explanatory and not used as ongoing monthly budget gates.
- New-buyer team/client limits and SMS gates reflect https://stratacrm.app/pricing (checked 2026-11-12).
- JavaScript syntax check and six direct plan tests passed before merge.

No source files are modified by this deploy trigger. Verify production asset and interactive Finder results separately after publish.
