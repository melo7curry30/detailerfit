"""Apply static shared chrome to every rendered page; no runtime HTML fetching.
Run from repository root after adding a page or updating templates. Idempotent.
"""
from pathlib import Path
from site_html import Document, replace
import re
header=Path('templates/site-header.html').read_text().strip()
footer=Path('templates/site-footer.html').read_text().strip()
for f in sorted(Path('.').glob('*.html')):
 source=f.read_text(); d=Document(source)
 if not d.find('body'): continue
 headers=d.find('header','site-header'); footers=d.find('footer','site-footer') or d.find('footer','footer')
 assert len(headers)==1 and len(footers)==1,f
 current=f.stem
 h=header.replace(f'href="{current}"',f'href="{current}" aria-current="page"')
 source=replace(source,[(headers[0].start,headers[0].end,h),(footers[0].start,footers[0].end,footer)])
 source=re.sub(r'(<meta\b(?=[^>]*name=["\']theme-color["\'])[^>]*content=["\'])[^"\']+',r'\g<1>#f8f9f6',source)
 source=re.sub(r'(<meta\b[^>]*content=["\'])#090d12(["\'][^>]*name=["\']theme-color["\'])',r'\g<1>#f8f9f6\2',source)
 if 'href="/design-system.css"' not in source:
  source=source.replace('</head>','<link rel="stylesheet" href="/design-system.css">\n<link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml">\n<link rel="icon" href="/assets/brand/favicon-32.png" sizes="32x32" type="image/png">\n<link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">\n</head>',1)
 if 'src="/site-ui.js"' not in source: source=source.replace('</body>','<script src="/site-ui.js" defer></script>\n</body>',1)
 f.write_text(source)
print('Synchronized static header, footer, brand assets and shared stylesheet.')
