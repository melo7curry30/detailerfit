# DET-58: isolated compare → Finder UX experiment

This directory contains an **independent, non-production** HTML/CSS/JS prototype. It is not imported by the homepage, compare page or Finder, and is not authorized for deployment.

## Critical route
Define buyer's user count, jobs, budget and optional self-booking → compare three evidence-backed software samples and select a shortlist → view plan caveats → optionally open the **existing live Finder**. There is no auto-transfer; the viewer manually reenters answers. The live Finder remains the existing eight-vendor Match Score and is not modified.

**Important model distinction:** The price example chooses the lowest cost under only *login count* and *self-booking requirement*, including $25 QuoteIQ extra logins. It is NOT a claim that higher-tier team/crew features are available with cheaper logins. The product itself warns about the incomplete feature fit. No fabricated rankings, quotes, reviews, CVs, or commission claims.

Sources, observed 2026-11-13: https://stratacrm.app/pricing ; https://urable.com/pricing/ ; https://myquoteiq.com/pricing/ ; https://intercom.help/quoteiq/en/articles/16152075-quoteiq-pricing-plans-2026 . Pricing requires re-check before release.

## Local verification performed
**113/113 scripted Chromium/Playwright assertions passed** on 320, 375, 768 and 1440px viewports: heading focus/aria-current, no document horizontal overflow, stage navigation, selection persistence, safe Finder URL, affordability disclosure, 1/5/6/10/25-user seat/booking price boundaries and no live-analytics code. Detailed script/screenshots/results reside in the associated DET-58 conversation handoff package and are not yet checked into this branch.

Not run: mobile screen readers, Safari, live partner signups/conversions, production integrations, real user sessions, competitor live mobile screenshots. No SEO, analytics, consent, ranking, or affiliate changes in this PR.

## Release gate
**Draft PR only. Do not merge, deploy or use the email bridge from this branch.** DET-52/56/57/46 ownership is unchanged. Before any promotion: confirm live prices/release queue, acceptance and keyboard+screen reader QA, establish safe transfer contract, review revenue funnel measurement, obtain CEO approval, then use the separately approved release process.
