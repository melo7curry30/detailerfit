# Verified production release

Verified at 2026-10-24T17:26:44+09:00.

- Site: https://getdetailerfit.com/
- Production commit: 085979515bb862322bd4f878e1e913a2928ad8b6
- Original source commit: 131d800acb5d4a7ce8ed9aaada45976da02e5879
- Development branch: redesign/home-discovery-20261023 (local history)
- Successful existing mail bridge run: https://github.com/melo7curry30/detailerfit/actions/runs/40065709413
- Applied: October 24, 2026, 14:18 JST. Command df-home-discovery-20261024-v1, Gmail UID 453.
- All 45 package payloads match fetched main exactly. No file deletions or deployment/authentication setting changes.

## Live browser verification

| Check | Result |
| --- | --- |
| Desktop home, 1363 px | New design, 6 cards, home.css, no horizontal overflow |
| Mobile CSS viewport 390 px | Hero and menu usable; Escape closes menu; two-product comparison readable without horizontal overflow |
| Mobile CSS viewport 412 px | Selected comparison and calculator results fit |
| Tablet CSS viewport 768 px | Selected comparison fits |
| Booking filter | ServiceLink and Zenbooker shown |
| Comparison affiliate URLs | Existing atp=Fo98tt / red=detail retained, sponsored noopener and home-comparison attribution present |
| Finder, solo / 1–25 jobs / $50 | DetailPilot Growth $29 appears as paid after trial; updated model 1.5.1 renders |
| Calculator, 3 users / no self-booking | QuoteIQ Essentials + 2 extra users, $79.99 monthly; annual base plus monthly extra-seat charges clearly separated |
| Calculator, 3 users / self-booking | QuoteIQ Elite $299.99 |
| Calculator keyboard and pointer submit | Both passed after hiding the outer QA toolbar for pointer testing |

The mobile/tablet checks use actual production pages inside CSS-sized iframes in cloud Chrome, not physical devices. The QA harness is outside the production repository. The existing df_qa opt-out excluded test visits from analytics.

## Before and after

- Consolidated the long, duplicated homepage into discovery, selectable comparison, research and trust sections.
- Six alphabetical profiles plus clear links to the full catalog; no commission-based reordering.
- First-party home HTML/CSS/JS: 157,021 to 125,759 bytes, a 19.9% reduction. This is source size, not a measured load-speed gain.
- Desktop document height in the original controlled local check: 8,401 to 3,658 px at 1363 × 936.
- Kept 41 original internal destinations, homepage title/meta/canonical, issued affiliate URLs and unchanged shared analytics/enrichment code.
- Corrected inherited DetailPilot/QuoteIQ pricing in Finder, calculator, related articles and downloadable CSV using dated official sources.

## Limits and follow-up

Real-device Safari/Android, screen-reader/axe audits, field Core Web Vitals, live analytics ingestion and affiliate conversions were not verified. Terminal production downloads returned HTTP 403; no HTTP byte-equivalence or Lighthouse result is asserted. Repository equality and live browser behavior are independently confirmed.

A records-only follow-up bridge command carries these final notes. Its later commit, if applied, changes documentation only; the functional release remains the commit above. Check .detailerfit-bridge-state.json for command df-home-discovery-20261024-verified before resending anything.

Suggested next work: extend the visual system to deeper pages, monitor qualified outbound traffic and verified affiliate results, and keep vendor plan facts source-dated.
