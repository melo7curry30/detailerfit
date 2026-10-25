# Add a page without fragmenting the interface

1. Copy the appropriate existing review, guide or comparison. Retain its semantic main/heading structure, then edit the actual research; never invent prices, tests or reviews.
2. Link `styles.css` (or `home.css` only for Home). The shared tokens, brand shell and buttons live in `design-system.css`.
3. From repository root, run `python3 tools/sync-site-shell.py` and `python3 tools/sync-responsive-tables.py`. These write ordinary static HTML, are idempotent, and require no runtime fetch or application build.
4. Use semantic tables with a first header row or row headers; mobile labels are generated from the published headings. Keep each fact in one source cell. Do not add merged/ambiguous table headings without a mobile-specific review.
5. Run `python3 tools/check-sitewide.py`, `python3 tools/check-release.py`, `node tools/check-pricing.cjs`, and `node --check site-ui.js`; browser-test the new page at 390/768/1280px. Baseline checks cover existing pages; extend the page inventory only after reviewing new source facts and links.
6. Check current main and `.detailerfit-bridge-state.json` before packaging. The existing bridge accepts an exact-main-base ZIP and only the already verified DetailerFit self-recipient. Never edit authentication/workflow/hosting settings to make a release go through.

Pricing and scoring are maintained in their existing modules. `site-ui.js` reads displayed cards to build Compare and directory filtering; it does not carry a second vendor-fact database. Finder comparison links carry selected product names, and unknown query names are ignored. The static reference directory remains available without JavaScript. The main navigation is also readable without JavaScript; the compact menu activates only when the existing handler is available.
