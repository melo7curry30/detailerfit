# DetailerFit brand assets

Geometry and lettering are traced directly from the owner's `reference.png` (IMG_4854.png), not retyped with a replacement font. The source image remains unchanged. Flat fill removes the photographic mockup texture and border; the d/f silhouette, detached bar, angled top and wordmark outline are retained.

- `detailerfit-dark.svg`: horizontal lockup for white/light backgrounds. Default site header width 190px, mobile 164px; footer 174px. Native vector paths, no fonts or embedded raster.
- `detailerfit-light.svg`: the same paths in white/slate for dark backgrounds.
- `symbol-dark.svg` / `symbol-light.svg`: symbol only. Do not replace with letters “df” or another monogram.
- `favicon.svg`: symbol with system light/dark adaptation. `favicon-32.png` and `apple-touch-icon.png` are raster fallbacks.
- `profile.svg` / `gmail-profile.png`: square 1024px PNG with circular-avatar-safe whitespace. Same source outlines; Gmail account settings were not changed.

Keep the aspect ratio; never stretch or crop the mark/lettering. The SVG viewBoxes include clear space. Use the full lockup in navigation and the symbol for a favicon. Exports are prepared by `tools/build-brand.py` using developer-environment Pillow/numpy/matplotlib; these are not production dependencies. SVG paths follow the resolution of the supplied 512×341 reference, so they are a faithful raster trace, not an original designer's Bézier master.
