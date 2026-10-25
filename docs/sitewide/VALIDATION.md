# Whole-site UI validation — 2026-10-25 JST

## Scope and preserved source

127 rendered HTML pages (Home, Finder, Compare, Cost, Best/rankings, reviews, guides, methodology, legal and other public pages). The Google verification file is unchanged. Base: `690521e8872d0af1018f12218a767102887b7fc5`, including the separately published Finder contrast/CTA patch. Development branch: `redesign/sitewide-brand-20261024`.

The site remains static HTML/CSS/vanilla JavaScript. No application build or runtime dependencies were added. Home's core layout, facts, home.css and home.js are unchanged; shared navigation, footer and brand assets are the only Home UI migration.

## Automated regression gates

- `python3 tools/check-sitewide.py`: all 127 titles, metadata except theme color, canonicals, H1 text, structured data and prior internal destinations preserved; 183 table fact sets unchanged; 266 distinct issued vendor-link tuples preserved; shared shell, local assets and unique IDs pass. Article main content retained; reorganized tool pages tested separately.
- Pricing/scoring input and calculator modules, app.js, affiliate attribution, home code, CSV, robots, redirects and sitemap files byte-identical to the base. Match Score inputs/math and trust research data unchanged.
- `python3 tools/check-release.py`: published pages retain original issued affiliate links and attributes, titles/canonicals, valid JSON-LD and script order. New shell template fragments are excluded from page-specific H1/title checks.
- `node tools/check-pricing.cjs`: plan prices, seat boundaries, feature gates, annual billing, budget gates and unaffected vendor cases pass.
- `python3 tools/check-home.py`: 41 prior internal destinations, six profiles, schema, affiliate IDs and protected Home files pass.
- Node syntax checks on changed JS and `git diff --check`: pass.

## Browser layout coverage

Cloud Chrome rendering real local pages in CSS-size iframes, not physical devices.

- 1280 × 900: all 127 pages checked; no document overflow, wide inspected content, missing initial images, duplicate H1/shared shell or legacy dark card findings. Full saved report: `browser-desktop.json`.
- 390 × 844: initial full 127-page pass found one real issue in the GarageTool review. A long slash-separated integration list overflowed its article card. Visually hidden table headings also needed a block clipping box. Fixed both; the review passed at 320, 390 and 412 pixels. Initial report and explicit passing retest retained, not overwritten.
- Final 390px sweep: all 127 pages passed with zero findings. Saved full result: `browser-mobile-final.json`.
- 412 × 915, 768 × 1024, 320 × 740: Finder, Compare, Cost, Reviews, Guides, Methodology, QuoteIQ review and Best Mobile Detailing Software — 24 checks, all passed (`browser-responsive.json`).
- Full-page sweeps check layout properties and shared surfaces; representative screens were also visually inspected. They are not 127 manual screenshot reviews.

## Functional checks

- Home at 390px: booking filter; ServiceLink and Zenbooker selection; compare; clear; correct original attribution IDs and comparison placement values. A failed locator used the AX checkbox label for an actual toggle button; corrected to its observed button role and passed.
- Finder: Solo / 1–25 jobs / up to $50 gives QuoteIQ 98, DetailPilot 98, Mobile Tech RX 95 with $29.99/$29/$39 plan costs and model 1.5.1. Evidence details remain expandable. Early result CTAs follow actual DOM/keyboard order.
- Finder → Compare carries those three exact product names; selected cards and vendor links update correctly.
- Compare: selecting two products, three-product handoff, rejecting a fourth, removing one and clearing all pass. Clear disables comparison and hides the result. Mobile comparison stacks vertically.
- Cost at 412px: three people / 25 jobs yields QuoteIQ Essentials + 2 users at $79.99/month. Requiring customer self-booking yields Elite at $299.99/month. Existing calculation logic is unchanged.
- Reviews: 39/39 initial, Zenbooker 1/39, nonexistent query 0/39 with helpful state, clearing restores 39. A–Z, explicitly not a ranking. Existing research notes remain expandable.
- Guides: both existing grids now searched; 59/59 initial, `invoicing` finds two including the second grid, nonexistent query gives zero, clearing restores 59.
- Mobile menu opens; Escape closes and sets aria-expanded=false. Visible focus and native labels observed. Guides/navigation remain readable with JavaScript disabled; all 59 guide cards remain in static HTML.
- Shared review screen: all inspected visible controls had accessible text/labels. No full screen-reader or axe audit claimed.
- Compared QuoteIQ CTA actually opened its official registration page with `via=ryo` retained. No registration/form submission performed. Checked placement values `finder_result` and `compare_selection`; existing delegated tracking reused, QA opt-out enabled.
- Logo variants inspected on white/black backgrounds, at mobile header size, and as 32px/16px symbols. Square PNG inspected. Gmail account settings were not changed.

## Performance and limitations

Shared CSS drops from 60,550 to 29,716 uncompressed bytes including tokens. Home's already-redesigned first-party source increases from 125,759 to 151,013 bytes because of shared UI and vector branding. These are source-byte totals, not measured speed or CWV gains. No remote font, animation package or new production dependency.

CrUX through the available GSC connection returned `notConfigured`; no API key or setting changes. Physical iOS Safari/Android devices, field CWV, full screen-reader testing, analytics server ingestion and affiliate conversion/revenue are unverified. No performance or revenue improvement is invented.

Screenshots saved outside the web repository: desktop reviews, mobile Finder result, mobile Compare and brand proof. Screenshot clipping was unreliable; ordinary viewport captures succeeded. QA preview/tool files are not shipped to production.
