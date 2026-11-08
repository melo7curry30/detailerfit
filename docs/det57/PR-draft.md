# Draft: DET-57 — Make the homepage Finder-first and surface product trade-offs

The homepage already links to Finder, but does not explain the three-question input or the resulting shortlist, while a prominent workflow panel competes for attention. Product caveats require opening each card. This change clarifies the Finder outcome, makes it the dominant hero action, and exposes each existing caveat before the review/vendor links.

Homepage-only HTML/CSS changes retain the title, H1, metadata, canonical, JSON-LD, all prior destinations, six A–Z vendors and the existing 30 comparison facts. A small decorative WebP and monochrome typography/spacing refine the presentation. Existing Finder, comparison, attribution, navigation and deployment scripts are unchanged. Integration base: `6ec4c63a49f2763036eff223ecc2b061f6decb0b`, including DET-54's non-affiliate Housecall Pro correction.

Validation: source invariant check, pricing regression check, JS syntax and whitespace checks pass. Chromium responsive layouts at 320/375/768/1440px show no horizontal overflow. Tested filters, menu/Escape, selection limits and persistence, two/three-product comparisons, six review links, Finder results/reasons/back navigation, cost calculation, progressive HTML fallback, and local event payloads. See `docs/det57/verification.md` for scope and evidence limitations.

Release blockers: DET-54 acceptance remains open; no production publishing authorized. Legacy `check-home.py` fails at line 47 on both unchanged main and this branch because it still expects Housecall Pro to be sponsored. Safari, full accessibility, Lighthouse/CWV and full CI remain unverified. Do not auto-merge/deploy. No conversion uplift claimed.

This file is a PR draft only: GitHub create_branch returned HTTP 403, so no remote branch or PR has been created.
