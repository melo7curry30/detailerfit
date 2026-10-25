"""Record pre-change SEO/content/link invariants for the complete static site."""
from pathlib import Path
from collections import Counter
from site_html import Document
import json, hashlib, subprocess

pages=[]; classes=Counter(); inline=Counter(); tables=Counter()
for f in sorted(Path('.').glob('*.html')):
    d=Document(f.read_text())
    if not d.find('body'): continue
    kind='review' if 'review' in f.stem or f.stem in ['jobber','urable','quoteiq','housecall-pro','servicem8','bookingkoala'] else 'comparison' if '-vs-' in f.stem else 'guide' if f.stem.startswith(('how-','when-')) else 'ranking' if f.stem.startswith('best-') else 'other'
    for n in d.find():
        classes.update(n.attrs.get('class','').split())
        if n.attrs.get('style'): inline[n.attrs['style']]+=1
    tables[kind]+=len(d.find('table'))
    metas=[n.attrs for n in d.find('meta') if n.attrs.get('name')!='theme-color']
    links=[n.attrs for n in d.find('a') if n.attrs.get('href')]
    pages.append({'file':f.name,'kind':kind,'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'title':[n.text() for n in d.find('title')], 'meta':metas,'canonical':[n.attrs.get('href') for n in d.find('link') if n.attrs.get('rel')=='canonical'],'h1':[n.text() for n in d.find('h1')], 'internal_links':sorted(set(a['href'] for a in links if not a['href'].startswith(('http','mailto:','tel:')))), 'vendor_links':sorted(set((a.get('data-vendor',''),a['href'],a.get('rel',''),a.get('target','')) for a in links if a.get('data-vendor') or 'sponsored' in a.get('rel',''))), 'jsonld':[d.inner(n) for n in d.find('script') if n.attrs.get('type')=='application/ld+json']})
Path('docs/sitewide').mkdir(exist_ok=True)
Path('docs/sitewide/baseline.json').write_text(json.dumps({'base':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'pages':pages},indent=2)+'\n')
print(json.dumps({'page_count':len(pages),'groups':Counter(p['kind'] for p in pages),'classes':classes.most_common(),'inline_styles':inline.most_common(15),'tables':tables},indent=2))
