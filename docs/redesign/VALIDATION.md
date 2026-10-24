# Validation — 2026-10-24 JST

## Release state

Homepage implementation and the available local checks are complete. **Not published.** Remote write access and the existing deployment route are unresolved. Existing sitewide pricing inconsistencies described below should be resolved before sending more traffic to the Finder.

## Automated checks

Run from the repository root:

```sh
python3 tools/check-home.py
node --check home.js
git diff --check
```

All passed. This is a static HTML/CSS/JavaScript site: there is no application build, dependency installation or new package to run.

The regression script verifies the original title, description and canonical; all 41 original home internal destinations; all original issued vendor URLs; local links and anchors; sponsored/noopener attributes; alphabetical profiles; unique IDs and one H1; valid Organization/WebSite JSON-LD; five comparison facts per profile; script ordering; and byte-identical protected shared assets, Finder, comparison page, sitemap and redirects.

## Browser checks

Cloud Chrome rendered the site through the Sites preview. Responsive cases use a same-origin iframe with the specified CSS viewport. These are **not physical iPhone/Android tests, Safari tests or mobile network emulation**. The desktop engine has a 15 px scrollbar, so the available document width is correspondingly smaller than the CSS viewport.

| CSS viewport | Result |
| --- | --- |
| 390 × 844, iPhone-sized | All six profiles and the two-product comparison: no horizontal document overflow or overflowing content elements. Final mobile body/details text enlarged for readability. |
| 412 × 915, Android-sized | Catalog and comparison rendered without horizontal overflow. Menu opened by pointer and keyboard; Tab reached its first link; Escape closed it. |
| 768 × 1024, tablet | No horizontal overflow. Three selected products rendered in aligned comparison columns; screenshot saved. |
| 1280 × 900, desktop | No horizontal overflow; six profiles visible in the catalog. |
| 1363 × 936, desktop | Visual inspection and screenshot; document height 3,658 px. |
| 320 × 740, small screen | Final larger mobile text, all six profiles and two-product comparison: no horizontal overflow. |

Observed interactions:

- Booking need shortcut filtered to ServiceLink and Zenbooker; All workflows restored all six without losing the selection.
- One selected product disabled Compare; two or three enabled it. Results reflected the current names and five facts from the static cards.
- A fourth product was rejected without losing the first three; a visible warning and live status announce the limit.
- Removing Jobber updated an open three-product comparison to ServiceLink/Zenbooker. Clear removed the tray and displayed the comparison's choose-two state.
- Native checkbox selection worked with Space. The mobile menu supported Enter, Tab and Escape. Native disclosure controls remain keyboard accessible.
- Without JavaScript, all six product profiles, navigation, vendor/review links and source details remained available; inactive filter/checkbox controls were hidden.
- Hero Finder CTA navigated successfully. Submitting Solo / 1–25 jobs / up to $50 returned three existing Finder results. Full comparison and cost-calculator pages rendered. This verifies navigation/functionality, not the accuracy of every existing result.
- No application console error observed during normal QA. Browser-extension metadata errors were unrelated. No-JS sandbox blocking messages are expected.

Corrections made during QA: fixed a missing space when a mobile heading's line break is hidden; increased selected-chip tap height to 44 px; added a visible maximum-selection warning; enlarged mobile explanatory text. The QA harness toolbar initially intercepted pointer clicks on the frame header; removing the toolbar from the capture view verified the actual menu.

## Links, measurement and SEO

- Existing ServiceLink `atp=Fo98tt` and Zenbooker `red=detail` remain exact. Housecall Pro reuses the already-issued `https://housecallpro.partnerlinks.io/lquesdqg2t22` from the existing comparison page.
- Browser-rendered ServiceLink sub3 changed from `home-catalog` to `home-comparison` for the cloned comparison CTA. Zenbooker sid similarly changed from `df-home-home-catalog` to `df-home-home-comparison`. Sponsored/noopener and new-tab labeling remain intact.
- Existing delegated tracking and affiliate enrichment scripts are unchanged. New filter/select/remove/clear/comparison events use the existing `dfTrackEvent` function. QA used `?df_qa=1` to avoid contaminating GA4/PostHog. Live event ingestion and partner commission attribution are **not verified**; no artificial conversions were generated.
- Homepage title, description, canonical and original internal destinations are preserved. No URL changes or content-page deletions. Added only Organization/WebSite schema, with no ratings or fabricated reviews.
- Official pricing sources were checked for the six home profiles. Source links and dates appear in native details. Monthly prices are distinguished from annual/introductory offers.

## Size observations

| Measure | Before | After |
| --- | ---: | ---: |
| First-party home HTML + referenced CSS/JS, uncompressed bytes | 157,021 | 125,759 |
| Desktop page height at 1363 × 936, initial state | 8,401 px | 3,658 px |

The initial source payload is about 19.9% smaller, and the initial desktop page is about 56.5% shorter. This is **not a measured 19.9% speed improvement**. Third-party analytics, transfer compression, cache behavior, server latency and real-user Core Web Vitals are outside these numbers. No revenue uplift can be claimed before deployment and measurement.

## Remaining work and limits

1. GitHub connector branch creation returned 403 `Resource not accessible by integration`; Git push had no transport credentials. No remote branch, PR or merge was created. Do not change authentication/security settings to work around this.
2. No verified direct Cloudflare deployment method was found. The checked-in mail bridge uses external email, which the user forbids. Do not send mail or invent hosting settings.
3. Existing DetailPilot data in the Finder still recommends a free Starter plan. Official pricing checked during this audit instead lists Growth $29 / Pro $59 / Business $119 after a trial. Official QuoteIQ pricing also differs from some existing upper-tier summaries. These are inherited issues in unchanged files; refresh their normalized plan data, scoring inputs, calculator and affected articles with sources before release. Do not change rankings based on commissions.
4. Physical devices, Safari/Android browser engines, screen-reader behavior, automated WCAG/axe audit, live CWV and post-deployment checks are not completed. Reduced motion/forced-colors support was verified in the CSS; OS-mode rendering was not emulated.
5. After release, verify real home_catalog/home_comparison events in analytics and confirmed partner conversions separately. Compare mobile sessions and outbound rates against the baseline; do not mistake affiliate clicks for commissions.

## Evidence package

The handoff ZIP contains the five-phase Git history, full source snapshot, patch, this report, WORK_PROGRESS.md, the local-only QA harness and browser screenshots. Final screenshots are desktop, mobile hero and mobile comparison; a tablet comparison and the production-before screenshot are also included. The QA harness is not a production dependency.
