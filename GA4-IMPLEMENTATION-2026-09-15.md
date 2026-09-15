# DetailerFit GA4 Implementation — 2026-09-15

## GA4 web stream
Measurement ID: `G-1MS4N4L2J1`

## Implementation
- GA4 is loaded once from `app.js`, so existing pages that already load the shared script inherit analytics without duplicating Google tags across every HTML file.
- Standard GA4 page measurement is initialized with `gtag('config', ...)`.
- Existing custom event routing remains intact:
  - `affiliate_click` = sponsored/revenue vendor CTA.
  - `vendor_outbound_click` = non-sponsored vendor/official-site CTA.
  - `tool_click` = Finder / Cost Calculator navigation.
- Existing custom event payloads include page path/title and, where applicable, vendor, clicked URL/host, link text, CTA position and monetization state.
- `privacy.html` is updated to disclose GA4 and the custom outbound-click telemetry.

## Guardrails
- No ranking, editorial conclusion, affiliate URL, pricing content, CSS or page structure is changed.
- No duplicate Google tag is inserted into individual HTML pages.
- Do not treat GA4 data as complete until the deployed tag is verified in Realtime/DebugView.
- To analyze `vendor`, `cta_position`, `link_host` or `monetized` as reusable GA4 dimensions, register the relevant event-scoped custom dimensions in GA4 after events begin arriving.
