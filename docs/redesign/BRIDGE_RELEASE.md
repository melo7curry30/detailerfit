# DetailerFit release — 2026-10-24

The user authorized continuation via the existing self-addressed Gmail deployment bridge. This supersedes the original email restriction only for these deployment commands. No credentials, access or workflow settings were changed.

## Scope
Premium minimal homepage, six alphabetical entry cards, need filters, accessible two/three-product comparison, mobile comparison rows, original internal destinations and issued affiliate links preserved. Shared analytics and affiliate enrichment files are unchanged.

Source-verified pricing corrections resolve an inherited release blocker: DetailPilot is paid after a trial; QuoteIQ October pricing supports $25/month extra users on every tier. Plan details feed Finder and calculator from one module; relevant articles, JSON-LD and CSV agree. Official URLs and scoped verification dates are in pricing-refresh.json. Existing unrelated product research was not represented as newly verified.

## Validation
- Pricing integration tests exercise budgets, booking/automation gates, extra-seat limits, annual base plus monthly seats, and unaffected vendor paths.
- Release checks retain original issued vendor URLs, page titles, canonicals, valid JSON-LD and script order; CSV records for other vendors are unchanged.
- Home regression retains 41 original internal destinations, metadata, alphabetical ordering, affiliate identifiers, reduced-motion CSS and protected shared files.
- All changed/new JavaScript passes node --check. git diff --check passes. No build or dependency installation is necessary for this static site.
- Browser QA from Phase 4 covers 320/390/412/768/1280/1363 px widths, navigation, keyboard comparison, 2/3 selections, fourth rejection, clear/remove, filters and no-JS fallback.
- Continuation QA covers 390 px calculator ($79.99 for three QuoteIQ users; $299.99 when self-booking required), desktop calculator, 412 px Finder (Growth $29, not free), and mobile two-product home comparison. No horizontal overflow observed.
- Viewports simulate CSS layouts in cloud desktop Chrome. Physical iPhone/Android/Safari, screen-reader/axe audits, field CWV, real affiliate ingestion and sales are not claimed as tested.

## Deployment protocol
Existing .github/workflows/detailerfit-chatgpt-mail-bridge.yml scans Gmail Sent. Subject marker [DETAILERFIT-DEPLOY]; attachment detailerfit-deploy.zip. Root manifest uses schema 1, exact current main SHA, unique command ID, replace paths and no deletes. Payload paths are repository-relative. Maximum 250 operations / 20 MiB; protected paths are excluded. The workflow commits to main with its existing bot. This is a bridge commit, not a PR merge.

Publication is now verified: production commit `085979515bb862322bd4f878e1e913a2928ad8b6`. See POST_DEPLOY.md for live checks and limitations. Historical blocked handoff documents remain for continuity; this release record and latest WORK_PROGRESS.md entries supersede their next steps.
