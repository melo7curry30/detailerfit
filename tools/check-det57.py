#!/usr/bin/env python3
"""Homepage refresh invariants against the actual post-DET-54 integration base.

Run from the repository root: python3 tools/check-det57.py
This is source regression QA, not a browser or performance test.
"""
from pathlib import Path
from urllib.parse import urlsplit
from collections import Counter
import gzip
import json
import subprocess
from site_html import Document
from release_baseline import BASE, HCP_DISCLOSURE_BEFORE, HCP_DISCLOSURE_AFTER, RECONCILED_CHECKS

def original(name):
    return subprocess.check_output(['git', 'show', f'{BASE}:{name}'])

before = Document(original('index.html').decode())
after = Document(Path('index.html').read_text())
for tag in ('title', 'h1', 'meta'):
    assert [(n.attrs, n.text()) for n in before.find(tag)] == [(n.attrs, n.text()) for n in after.find(tag)], tag
canonical = lambda doc: [n.attrs for n in doc.find('link') if n.attrs.get('rel') == 'canonical']
assert canonical(before) == canonical(after)
schemas = lambda doc: [json.loads(doc.inner(n)) for n in doc.find('script') if n.attrs.get('type') == 'application/ld+json']
assert schemas(before) == schemas(after)
scripts = lambda doc: [n.attrs for n in doc.find('script') if 'src' in n.attrs]
assert scripts(before) == scripts(after), 'Script order or analytics changed'
ids = Counter(n.attrs['id'] for n in after.find() if n.attrs.get('id'))
assert all(count == 1 for count in ids.values()), 'Duplicate IDs'
links = lambda doc: [n for n in doc.find('a') if n.attrs.get('href')]
assert {n.attrs['href'] for n in links(before)} <= {n.attrs['href'] for n in links(after)}, 'Existing destination removed'
for n in links(after):
    url = urlsplit(n.attrs['href'])
    if url.scheme or url.netloc:
        continue
    if not url.path and url.fragment:
        assert url.fragment in ids, url.fragment
    if url.path:
        path = Path(url.path.lstrip('/') or 'index.html')
        if not path.suffix:
            path = path.with_suffix('.html')
        assert path.is_file(), path

old_cards, new_cards = before.find('article', 'software-card'), after.find('article', 'software-card')
expected = ['housecall-pro', 'jobber', 'servicelink', 'servicem8', 'urable', 'zenbooker']
assert [c.attrs['data-profile'] for c in new_cards] == expected
for old, new in zip(old_cards, new_cards):
    facts = lambda card: {n.attrs['data-fact']: n.text() for n in card.find() if 'data-fact' in n.attrs}
    assert facts(old) == facts(new), new.attrs['data-profile']
    assert len(facts(new)) == 5
    for cls in ('review-link', 'vendor-link'):
        assert old.find('a', cls)[0].attrs == new.find('a', cls)[0].attrs, cls
    for cls in ('category', 'product-fit', 'price-line', 'feature-line', 'source-note', 'link-type'):
        # Display arrows are intentionally standardized; facts/labels are unchanged.
        assert old.find(cls=cls)[0].text().replace('↗', '→') == new.find(cls=cls)[0].text(), cls
    preview = new.find('p', 'tradeoff-preview')[0]
    assert preview.find('span')[1].attrs['data-fact'] == 'watch'
    assert preview.parent == new, 'Caveat must be visible without opening details'
    vendor = new.find('a', 'vendor-link')[0].attrs
    assert ('sponsored' in vendor['rel']) == (vendor['data-vendor'] in ('ServiceLink', 'Zenbooker'))
assert 'housecallpro.partnerlinks.io' not in after.source

hero = after.find('section', 'hero-editorial')[0]
assert len(hero.find('a', 'button-dark')) == 1
assert hero.find('a', 'button-dark')[0].attrs['href'] == 'finder'
image = hero.find('img')[0].attrs
assert image['alt'] == '' and int(image['width']) > 0 and int(image['height']) > 0
assert Path(image['src'].lstrip('/')).is_file()
assert 'No email required' in hero.text() and '3 questions' in hero.text()
assert len([n for n in after.find() if 'data-filter' in n.attrs]) == 4
assert len([n for n in after.find() if 'data-shortcut' in n.attrs]) == 3

# Every other existing runtime file remains byte-identical to the integration base.
tracked = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', BASE], text=True).splitlines()
for name in tracked:
    if name in ('index.html', 'home.css') or name in RECONCILED_CHECKS:
        continue
    if name == 'quoteiq-vs-housecall-pro.html':
        expected = original(name).decode()
        assert expected.count(HCP_DISCLOSURE_BEFORE) == 1
        assert Path(name).read_text() == expected.replace(HCP_DISCLOSURE_BEFORE, HCP_DISCLOSURE_AFTER)
        continue
    assert Path(name).read_bytes() == original(name), f'Out-of-scope edit: {name}'
css = Path('home.css').read_text()
assert 'prefers-reduced-motion' in css and 'forced-colors:active' in css
assert '@import' not in css and 'fonts.googleapis' not in css
print('PASS: SEO title/H1/meta/canonical/JSON-LD; all prior destinations; six A-Z vendors.')
print('PASS: 30 identical comparison facts; vendor URLs/labels/rel; visible caveats; one hero CTA.')
print('PASS: exact one-sentence DET-54 correction; other tracked runtime unchanged, including scoring, analytics, navigation, bridge and workflows. Legacy QA scripts are explicitly reconciled.')
for name in ('index.html', 'home.css'):
    old, new = original(name), Path(name).read_bytes()
    print(f'{name}: {len(old)} -> {len(new)} bytes; gzip {len(gzip.compress(old))} -> {len(gzip.compress(new))}')
print(f'Hero WebP: {Path(image["src"].lstrip("/")).stat().st_size} bytes. Byte counts are not CWV measurements.')
