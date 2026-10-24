#!/usr/bin/env python3
"""Dependency-free homepage regression checks. Run from the repository root."""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
from urllib.parse import urlsplit, unquote
import hashlib, json, re

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]; self.ids=[]; self.meta={}; self.sources=[]; self.profiles=[]; self.canonical=None
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='a' and a.get('href'):self.links.append(a)
        if tag=='meta':self.meta[a.get('name',a.get('property',''))]=a.get('content','')
        if tag=='link' and a.get('rel')=='canonical':self.canonical=a['href']
        if tag=='script' and 'src' in a:self.sources.append(a['src'])
        if 'data-profile' in a:self.profiles.append(a['data-profile'])

base=json.loads(Path('docs/redesign/baseline.json').read_text())
html=Path('index.html').read_text(); p=Page(); p.feed(html)
assert unescape(re.search(r'<title>(.*?)</title>',html,re.S)[1])==base['title']
assert p.meta['description']==base['description']
assert p.canonical==base['canonical']
assert len(p.ids)==len(set(p.ids)), 'Duplicate ids'
assert len(re.findall(r'<h1(?: |>)',html))==1
normalize=lambda x:unquote(urlsplit(x).path).removesuffix('.html').strip('/')
internal={normalize(a['href']) for a in p.links if not urlsplit(a['href']).scheme}
assert {normalize(h) for h in base['internal_links']} <= internal, 'Existing internal destination removed'
for a in p.links:
    url=urlsplit(a['href'])
    if url.scheme:continue
    if url.path:
        f=Path(url.path.lstrip('/') or 'index.html')
        if not f.suffix:f=f.with_suffix('.html')
        if url.path=='/':f=Path('index.html')
        assert f.exists(),f'Broken internal link: {a["href"]}'
    elif url.fragment:assert url.fragment in p.ids,f'Broken anchor: {url.fragment}'
vendors=[a for a in p.links if 'data-vendor' in a]
assert {a['href'] for a in vendors} >= set(base['vendor_links']), 'Issued vendor link missing/changed'
assert len(vendors)==6
expected=['housecall-pro','jobber','servicelink','servicem8','urable','zenbooker']
assert p.profiles==expected, 'Expected alphabetical profile ordering'
for a in vendors:
    if a['data-vendor'] in ('Housecall Pro','ServiceLink','Zenbooker'):
        assert 'sponsored' in a.get('rel','').split()
    else:assert 'sponsored' not in a.get('rel','').split()
    assert 'noopener' in a.get('rel','').split()
    assert a['data-cta-position']=='home_catalog'
assert p.sources.index('home.js') < p.sources.index('affiliate-deep-attribution.js'), 'Capture issued URLs before enrichment'
for script in p.sources:
    if not urlsplit(script).scheme:assert Path(script).exists()
# compare/finder received an explicit source-verified pricing refresh before release.
refresh=json.loads(Path('docs/redesign/pricing-refresh.json').read_text())['reviewed_hashes']
assert set(refresh)=={'compare.html','finder.html'}
for name,digest in base['hashes'].items():
    digest=refresh.get(name,digest)
    assert hashlib.sha256(Path(name).read_bytes()).hexdigest()==digest,f'Protected shared/SEO file changed: {name}'
for schema in re.findall(r'<script type="application/ld\+json">(.*?)</script>',html,re.S):
    data=json.loads(schema);assert data['@context']=='https://schema.org'
    assert all(x['@type'] in ('Organization','WebSite') for x in data['@graph'])
assert 'prefers-reduced-motion' in Path('home.css').read_text()
assert len(re.findall(r'data-fact="(?:price|plan|booking|capacity|watch)"',html))==6*5
assert 'df-experience.js' not in p.sources
baseline=sum(base['bytes'].values())
after=sum(Path(x).stat().st_size for x in ['index.html','home.css','app.js','home.js','affiliate-deep-attribution.js'])
print(f'PASS: metadata, {len(base["internal_links"])} prior internal destinations, six profile schemas, affiliate IDs/rel, anchors, JSON-LD and protected shared files.')
print(f'First-party HTML+CSS+JS bytes: {baseline:,} -> {after:,} ({(1-after/baseline)*100:.1f}% reduction). Third-party analytics excluded.')
