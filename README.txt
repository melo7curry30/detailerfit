DetailerFit Revenue Funnel Fix — 2026-09-15

Purpose
- Fix clean-URL JavaScript routing that prevented some dynamic revenue CTAs from appearing.
- Strengthen Housecall Pro conversion paths without redesigning the site.
- Keep existing affiliate relationships, SEO copy, design system and editorial content intact.

Housecall Pro affiliate URL
https://housecallpro.partnerlinks.io/lquesdqg2t22

Important fixes
1. app.js now normalizes extensionless URLs and legacy .html URLs to the same page key.
   This fixes the revenue-decision block on clean URLs such as:
   - /jobber-vs-housecall-pro-auto-detailing
   - /urable-vs-housecall-pro
   - /orbisx-vs-jobber-auto-detailing
   - /urable-vs-orbisx
   It also fixes the ceramic-coating vendor CTA enhancer on the clean URL.

2. app.js and cost-calculator.js now generate clean internal URLs instead of .html URLs,
   reducing redirect hops and keeping internal navigation aligned with canonical URLs.

3. Housecall Pro high-intent pages now use the more durable CTA label:
   "See Current Housecall Pro Offer"
   instead of assuming the affiliate landing page will always emphasize the same trial offer.

4. /housecall-pro now includes stronger social/Article/Breadcrumb metadata, comparison exits,
   and a time-stamped note that the referral landing page displayed a 20% first-12-month offer
   when checked on September 15, 2026. The page tells readers to verify current terms.

5. Static Housecall Pro revenue exits were added to:
   - jobber-vs-housecall-pro-auto-detailing.html
   - urable-vs-housecall-pro.html
   - best-mobile-detailing-software.html
   - best-software-ceramic-coating-business.html
   so conversion does not depend entirely on JavaScript.

6. Existing Housecall Pro CTA wording was standardized on:
   - compare.html
   - reviews.html
   - mobile-detailing-scheduling-software.html
   - best-auto-detailing-software-2026.html
   - mobile-tech-rx-alternatives-auto-detailers.html

Validation performed
- JavaScript syntax: PASS (app.js, cost-calculator.js)
- One H1 per HTML page: PASS across snapshot
- Canonical tag count: PASS across snapshot
- Internal link targets: PASS across snapshot
- Housecall Pro affiliate attributes: PASS
  rel="sponsored noopener"
  data-vendor="Housecall Pro"
  target="_blank"
- Affiliate disclosures near newly added Housecall Pro revenue exits: PASS

Upload instructions
Replace the matching files in the GitHub repository with the files in this folder.
Do not rename them. Existing files not included here should remain unchanged.
