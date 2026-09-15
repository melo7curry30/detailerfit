# DetailerFit Affiliate Click Fallback — 2026-09-15

## Root cause
The v2 click handler only entered the vendor-event branch when a clicked link had `data-vendor`.
A sponsored affiliate CTA missing `data-vendor` therefore fell through without sending `affiliate_click`,
even though the link itself correctly used `rel="sponsored"`.

## Fix
- Evaluate affiliate status before requiring `data-vendor`.
- Any link with `rel="sponsored"` or `data-affiliate="true"` now sends `affiliate_click`.
- `data-vendor` remains the preferred vendor label.
- When a sponsored CTA has no `data-vendor`, the event uses the clicked hostname as a fallback vendor label.
- Non-sponsored links with `data-vendor` still send `vendor_outbound_click`.
- Existing rankings, URLs, design, SEO content and affiliate destinations are unchanged.

## Validation target
After deployment, click one sponsored CTA and confirm `affiliate_click` appears in GA4 Realtime.
