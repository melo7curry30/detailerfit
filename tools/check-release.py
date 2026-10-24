"""Validate all modified pages against the pre-redesign commit. No dependencies."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import csv, io, json, re, subprocess

BASE = '39216335257b2cebc87959302708e0f781acc919'
class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.vendors=[]; self.ids=[]; self.scripts=[]; self.canonical=None
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.append(a['id'])
        if tag=='a' and a.get('data-vendor'):
            self.vendors.append(tuple(a.get(k,'') for k in ['data-vendor','href','rel','target']))
        if tag=='script' and a.get('src'): self.scripts.append(a['src'])
        if tag=='link' and a.get('rel')=='canonical': self.canonical=a.get('href')

changed=subprocess.check_output(['git','diff','--name-only',BASE,'--','*.html'],text=True).splitlines()
for name in changed:
    old=subprocess.check_output(['git','show',f'{BASE}:{name}'],text=True)
    new=Path(name).read_text(); before=Page(old); after=Page(new)
    if name == 'index.html':
        # The redesign consolidates duplicate CTAs and consistently opens vendor
        # sites in a new tab. Every issued URL, vendor and rel value is retained.
        assert {v[:3] for v in before.vendors} <= {v[:3] for v in after.vendors}, name
        assert all(v[3]=='_blank' for v in after.vendors), name
    else:
        assert Counter(before.vendors) <= Counter(after.vendors), f'Issued vendor link or attributes changed: {name}'
    assert before.canonical==after.canonical, f'Canonical changed: {name}'
    assert re.search(r'<title>(.*?)</title>',old,re.S)[1]==re.search(r'<title>(.*?)</title>',new,re.S)[1], name
    assert new.count('<h1')==old.count('<h1')==1, name
    old_ids=Counter(before.ids); new_ids=Counter(after.ids)
    assert not any(count>max(1,old_ids[id_]) for id_,count in new_ids.items()), f'New duplicate ID: {name}'
    for source in after.scripts:
        if not urlsplit(source).scheme: assert Path(source.lstrip('/')).is_file(), (name,source)
    for schema in re.findall(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',new,re.S): json.loads(schema)

for name, script in [('finder.html','/match-score.js'),('software-cost-calculator.html','cost-calculator.js')]:
    scripts=Page(Path(name).read_text()).scripts
    assert scripts.index('/pricing-data.js') < scripts.index(script)
assert "return {plan:'Starter',cost:0" not in Path('match-score.js').read_text()
for name in ['quoteiq.html','quoteiq-pricing-mobile-detailing.html']:
    text=Path(name).read_text()
    assert '$74.99' not in text and '$149.99' not in text
    assert '$299.99' in text and '$699.99' in text and '$25' in text
csv_name='auto-detailing-software-pricing.csv'
before_rows={row['Tool']:row for row in csv.DictReader(io.StringIO(subprocess.check_output(['git','show',f'{BASE}:{csv_name}'],text=True)))}
after_rows={row['Tool']:row for row in csv.DictReader(Path(csv_name).open())}
assert before_rows.keys()==after_rows.keys()
for vendor,row in after_rows.items():
    if vendor not in ('DetailPilot','QuoteIQ'): assert row==before_rows[vendor], vendor
assert after_rows['DetailPilot']['Published entry price']=='$29/mo Growth'
assert '$25/month' in after_rows['QuoteIQ']['Entry limits / users']
print(f'PASS: {len(changed)} changed pages retain issued affiliate links, canonicals and titles; JSON-LD parses; script order is correct.')
print('PASS: CSV pricing is aligned; all other vendor records remain unchanged.')
