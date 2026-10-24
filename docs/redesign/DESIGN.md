# Homepage design contract

## Intent
Premium minimalism, with the user's next decision visible. Warm white, near-black type, muted gray, restrained sage/lime accent inherited from DetailerFit. No external fonts, images, carousels, pointer tilt or continuous animation.

## Information architecture
1. Compact header: Explore, Reviews, Guides, Find my match. Company/policy links in footer.
2. Hero: explicit detailing-software value; primary CTA directly to the Finder; three need-based links filter the software list.
3. Six concise software profiles, alphabetical: Housecall Pro, Jobber, ServiceLink, ServiceM8, Urable, Zenbooker. The prior five are retained; Housecall Pro extends team/dispatch coverage using its existing review and affiliate destination. This is a diverse entry shortlist, not a complete catalog or ranking. All reviews and full comparison links remain adjacent.
4. Progressive comparison: native checkboxes choose 2–3 profiles; persistent selection tray with per-product remove controls; comparison opens an in-page section, not a modal. At mobile widths, feature rows stack named values so no horizontal table scroll is needed. Explicit empty/one-item state and maximum-selection feedback. Filtering does not discard selections.
5. Compact cost-calculator feature and three research links. All prior homepage internal destinations stay in a native expandable research directory.
6. Concise editorial independence/verification explanation and footer.

## Data and trust
- Retain issued affiliate destination strings and rel=sponsored/noopener. Reuse existing delegated tracking and partner deep attribution; set explicit home_catalog and home_comparison positions.
- Store profile facts as static semantic HTML. Comparison clones those facts/links rather than maintaining a separate JS pricing dataset.
- Source dates refer to pricing/booking validation, not a claim of hands-on testing. Link official pricing in expandable card details. No invented reviews or performance claims.
- Keep title, description, canonical, existing URLs, sitemap, broader comparison and Finder unchanged. Existing home has no JSON-LD; add only truthful Organization/WebSite schema, no ratings or offer schema.
- No commercial sorting, scoring changes or partner preference. Cards alphabetical and filters use documented use cases.

## Delivery and accessibility
- New home.css replaces the home page's dependency on shared styles.css. Other pages retain their styles. app.js and affiliate-deep-attribution.js remain byte-identical.
- home.js is a small enhancement, loaded with defer. No dependencies; no build required for production. All six cards, review/vendor links, disclosure, sources and research directory work without JavaScript.
- Native checkboxes/details; visible focus; 44 px minimum interactive controls; status announcements; no focus traps. Mobile menu closes on Escape, outside click and focus exit via existing app.js.
- Sticky comparison tray reserves document bottom space. Respect prefers-reduced-motion and forced colors; no scroll listeners needed.
- Preserve old #df-compare, #guides, #use-cases anchors where useful.

## Acceptance checks
- Browser viewport simulations: 390 × 844 (iPhone-sized), 412 × 915 (Android-sized), 768 × 1024 (tablet), desktop 1363 × 936. CSS viewport simulation is not physical-device/Safari testing.
- Filter/reset; add 1/2/3; reject a 4th without losing selections; remove; clear; change selection updates comparison; affiliate IDs and attribution; internal links; menu/keyboard; reduced-motion CSS; no-JS content.
- Static tests: metadata preservation, every former home internal destination present, links resolve, issued affiliate IDs exact, unchanged shared assets/SEO pages, JSON-LD valid, duplicate IDs absent, production source size comparison.
- Report local size/timing observations separately from real-user Core Web Vitals. No claims of revenue lift before live data.
