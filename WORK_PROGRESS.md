# DetailerFit homepage redesign — 2026-10-23 JST

## Status
- Branch: `redesign/home-discovery-20261023` (local only).
- Base: `39216335257b2cebc87959302708e0f781acc919` (`main`, fetched 2026-10-23).
- Published: **NO**. Production remains unchanged.
- Phases 1–4 complete; Phase 5 resumed with user-authorized existing mail bridge. Release package prepared; awaiting send and verification. See the latest phase entries below.

## Phase 1 — Audit
- Cloned current GitHub main into a separate checkout. No AGENTS.md or existing WORK_PROGRESS.md found.
- Static HTML / CSS / vanilla JavaScript, no application build or dependencies required.
- Read existing Cloudflare-related documentation and mail bridge workflow. Mail bridge commits to main, but no checked-in Cloudflare deployment configuration or verified direct deployment hook was found. Do not infer deployment settings.
- Read live homepage and captured desktop screenshot. 11 main sections; 8,401 px tall at 1,363 × 936 viewport.
- Repeated hero profiles, five-tool comparison, booking-first promotion, pricing table and article grids make the home page unnecessarily long. Main CTA leads to another chooser rather than directly to the Finder.
- Recorded metadata, internal and vendor link sets, file hashes and payload sizes in `docs/redesign/baseline.json`.
- Baseline GSC window 2026-09-23–2026-10-20, America/Los_Angeles: 14 clicks, 2,844 impressions, 0.492% CTR, average position 31.96. Home: 1 click / 57 impressions. Treat this small sample as baseline, not causal evidence.
- GA4 same dates, getdetailerfit.com hostname scope: 360 sessions, 5 affiliate_click events from 4 users; all 5 events on mobile. These are outbound clicks, not confirmed purchases or commissions. Home page itself: 0 affiliate clicks, 183 sessions; homepage landing sessions: 171 with 2 later affiliate clicks.
- Existing affiliate attribution (ServiceLink atp=Fo98tt; Zenbooker red=detail) and delegated GA4/PostHog events must be preserved. Use existing ?df_qa=1 during browser QA.

## Initial access blockers (historical; mail restriction superseded below)
- GitHub connector create_branch returned 403 `Resource not accessible by integration`.
- Standard Git push with prompting disabled failed: no GitHub transport credentials.
- No authentication/security changes attempted. External email forbidden, so no mail bridge message will be sent.
- Continue implementation, local phase commits, browser QA and a resumable delivery package. Remote PR/merge/publication cannot be claimed.

## Source findings requiring care
- Official DetailPilot pricing now shows paid Growth $29 / Pro $59 / Business $119, after a 14-day trial; existing broader site still describes a free Starter. Do not introduce that outdated fact into the redesigned homepage. A source-driven sitewide data refresh remains separate follow-up.
- QuoteIQ official October help article shows changed upper-tier prices/user counts. Do not copy stale price summaries into the new homepage.
- Rechecked existing home profile sources for ServiceLink, Zenbooker, ServiceM8, Urable and Jobber; finalize specific values before implementation.

## Original plan (historical)
1. Commit the design contract in Phase 2.
2. Replace repeated home sections with concise discovery, selectable comparison, cost/research and trust sections.
3. Preserve all existing homepage internal destinations in a compact expandable research directory; leave SEO pages/URLs intact.
4. Add a dependency-free local preview/QA harness; run through Sites preview and CUA browser only.
5. Verify 390/412/768 CSS viewports and desktop, filter/selection/removal, mobile comparison, link destinations, keyboard and no-JS fallback.
6. Record every result, commit Phase 4, then attempt only an authorized existing publication route if access becomes available. Otherwise package local Git history, exact changes, tests and resume commands.

## Initial tests (historical)
- Current production page rendered in cloud Chrome desktop.
- Read-only GitHub main check successful.
- Browser screenshots of responsive sizes, functional regression tests, new page accessibility, live CWV: pending.

## Phase 2 — Design complete
- Design contract saved in `docs/redesign/DESIGN.md`.
- Six alphabetical entry profiles, need filters, 2–3 product selection tray, vertically readable mobile comparison.
- New home-only CSS/JS; reuse shared analytics and affiliate enrichment unchanged.
- Official Housecall Pro pricing confirms $79 monthly Basic, one user and online booking; $59 is annual billing. No promotional savings claim will be added.
- No build/package dependencies added.

## Phase 3 — Implementation complete
- Rebuilt `index.html`; added `home.css`, `home.js`, and `tools/check-home.py`.
- Six static, source-linked cards; workflow filters; native comparison checkboxes; persistent 2–3 tool tray; row-based responsive comparison; clear/remove states; CTA positions.
- Retained all 41 prior internal destinations, all five prior vendor destinations, metadata/canonical and every existing shared asset. Added Housecall Pro using its existing issued affiliate URL.
- No dependencies or deployment/security config changes. Local QA server and viewport harness are outside the repository.
- Validation: Python static regression checks, node --check home.js, git diff --check passed. Browser QA pending.


## Phase 4 — Validation and fixes complete
- Full results and limitations: `docs/redesign/VALIDATION.md`.
- Browser: 390/412/768/1280/1363 px widths plus 320 px; no horizontal overflow. Two/three-product comparison, fourth-selection rejection, removal, clear, retained selection on filtering, keyboard navigation and no-JS fallback checked.
- Corrected hidden-line-break spacing, maximum-selection feedback, selected-chip touch targets, and mobile text legibility.
- Verified browser-rendered affiliate identifiers and separate catalog/comparison attribution. Shared tracker files remain unchanged; live ingestion/commissions not tested.
- Finder CTA and result submission work; inherited DetailPilot/QuoteIQ plan data still need a source-driven refresh before release.
- Static checks passed: `python3 tools/check-home.py`, `node --check home.js`, `git diff --check`. No application build required.
- Final first-party payload: 125,759 bytes vs 157,021 baseline (19.9% smaller). Desktop height: 3,658 vs 8,401 px at 1363 × 936. No CWV or revenue improvement claim.
- Changed production files: `index.html`; new `home.css`, `home.js`. Supporting files: `tools/check-home.py`, `docs/redesign/baseline.json`, `docs/redesign/DESIGN.md`, `docs/redesign/VALIDATION.md`, this file.
- Screenshots captured for desktop/mobile/tablet and comparison; durable handoff package pending.
- Not tested: real device/Safari/Android engine, screen reader, axe, OS reduced-motion rendering, live performance, post-deploy.

## Immediate next steps
1. Commit Phase 4 fixes and validation.
2. Recheck remote main without mutating it; record Phase 5 blocked state and resume commands.
3. Package a Git bundle, exact patch, source snapshot, screenshots and QA harness so work survives loss of the local workspace.
4. Resume only with an authorized existing GitHub write route and verified deployment procedure; reconcile the inherited pricing issues before release.


## Phase 5 — Publication blocked; handoff prepared
- Final read-only `git ls-remote origin refs/heads/main` still returns `39216335257b2cebc87959302708e0f781acc919`.
- **Not published. No remote branch/PR/merge.** No settings, authentication, billing or email changes.
- Phase 1 commit `e05f35b`; Phase 2 `47ee771`; Phase 3 `5725fcd`; Phase 4 `1783104`. The final Phase 5 documentation commit follows this entry.
- `docs/redesign/RESUME_JA.md` gives exact restoration, tests, remote reconciliation and publication prerequisites.
- Package prepared for durable handoff: full Git bundle, exact patch, source snapshot, commits, QA harness, five screenshots, reports. Screenshots in the package include final desktop/mobile/comparison, tablet comparison and production baseline.
- Outstanding: GitHub write access, verified existing deployment route, inherited DetailPilot/QuoteIQ pricing-data refresh, physical-device/browser/accessibility checks, live measurement and post-deployment verification.
- Resume priority: restore bundle; read progress/validation; check current remote main; resolve data correctness and access; run tests; publish only through a verified existing route; verify production.


## Bridge continuation — 2026-10-24
- User explicitly authorized the existing mail bridge, superseding the earlier email restriction only for this deployment. Other restrictions remain in force.
- Confirmed sender/recipient from the account and previous command: hello.detailerfit@gmail.com to itself. Only that DetailerFit account was read.
- Existing workflow requires subject `[DETAILERFIT-DEPLOY]`, attachment `detailerfit-deploy.zip`, schema 1 manifest and the exact current main SHA. It rejects stale bases and protected paths, then commits to main. Workflow/authentication settings will not be changed.
- Main remains `39216335257b2cebc87959302708e0f781acc919`. No bridge email has been sent in this continuation yet.
- Pricing refresh in progress: DetailPilot paid Growth after trial; QuoteIQ October prices, 20 included Max seats, $25/month extra users. Shared `pricing-data.js` feeds Finder/calculator; articles and JSON-LD updated with specific source dates.
- Added plan/budget integration checks and release-wide affiliate/title/canonical/schema checks. Next: run checks, browser-test Finder/calculator, package current-main diff, send via existing bridge, verify main and production.

## Release ready — 2026-10-24
- Pricing blocker resolved using official DetailPilot and QuoteIQ sources, recorded in `docs/redesign/pricing-refresh.json`. Finder and calculator share plan facts in `pricing-data.js`; scoring weights and affiliate relationships are not ranking inputs.
- Updated affected articles and downloadable pricing CSV; retained all issued affiliate URLs, existing page titles and canonicals. No URL deletions, dependencies, authentication, workflow or hosting-setting changes.
- Passed: `node tools/check-pricing.cjs`, `python3 tools/check-release.py`, `python3 tools/check-home.py`, Node syntax checks for all changed/new JavaScript, `git diff --check`.
- Browser continuation: 390 px calculator (3 users = QuoteIQ $79.99; self-booking = Elite $299.99), 1280 px calculator, 412 px Finder (DetailPilot Growth $29 with budget gate), 390 px home 2-product comparison. No horizontal overflow in those states. Earlier full home QA remains recorded in VALIDATION.md.
- Real-device Safari/Android, screen readers, axe, live CWV and conversion ingestion remain unverified. These are explicitly excluded from completed checks.
- Current source files: homepage HTML/CSS/JS; shared pricing-data module; Finder/calculator integration; 28 pricing-related HTML pages; pricing CSV; regression tools; redesign docs and this progress file. Exact paths: `git diff --name-only 39216335257b2cebc87959302708e0f781acc919`.
- Next: commit release; create validated bridge ZIP with `base_commit` matching current main; send once from DetailerFit Gmail to itself; read updated bridge state and compare deployed assets to package. Publication remains NO until verified.
