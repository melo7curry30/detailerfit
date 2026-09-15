# DetailerFit Revenue Click Tracking Audit — 2026-09-15

## Confirmed before this patch
- `app.js` creates a `dataLayer` event and calls `gtag()` only when `window.gtag` already exists.
- The current site code loads `app.js` and the Cloudflare Web Analytics beacon.
- No Google Analytics 4 or Google Tag Manager loader was found in the audited site code.
- Therefore the custom `affiliate_click` events are not currently persisted by GA4/GTM.
- Cloudflare Web Analytics is useful for traffic/performance analytics, but it does not currently support custom events.

## Problem fixed here
Before this patch, every link with `data-vendor` was recorded as `affiliate_click`, including ordinary vendor/pricing links that were not monetized.

After this patch:
- `affiliate_click` = a vendor link whose `rel` contains `sponsored`, or an explicit future `data-affiliate="true"` override.
- `vendor_outbound_click` = a `data-vendor` link that is not monetized.
- Both event types retain vendor, URL, host, CTA position and link text context.
- Existing rankings, links, design, SEO content and affiliate destinations are unchanged.

## Still required for persistent conversion reporting
A real custom-event destination still needs to be configured. Recommended next step: add GA4 or GTM only after the correct Measurement ID / Container ID is available, then verify events in Realtime / DebugView before relying on reports.

Do not add a fake or placeholder analytics ID.
