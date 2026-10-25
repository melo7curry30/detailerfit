"""Whole-site regression checks. No third-party dependencies; run from repo root."""
from pathlib import Path
from collections import Counter
from urllib.parse import urlsplit,unquote
from site_html import Document,replace
import json,re,subprocess
baseline=json.loads(Path('docs/sitewide/baseline.json').read_text());base=baseline['base']
def oldfile(name):return subprocess.check_output(['git','show',f'{base}:{name}'],text=True)
def norm(href):
 u=urlsplit(href);return unquote(u.path).removesuffix('.html').strip('/')
pagecount=0;tablecount=0;vendorcount=0
for saved in baseline['pages']:
 name=saved['file'];source=Path(name).read_text();d=Document(source);before=Document(oldfile(name));pagecount+=1
 assert [n.text() for n in d.find('title')]==saved['title'],('title',name)
 assert [n.text() for n in d.find('h1')]==saved['h1'],('h1',name)
 assert [n.attrs for n in d.find('meta') if n.attrs.get('name')!='theme-color']==saved['meta'],('metadata',name)
 assert [n.attrs.get('href') for n in d.find('link') if n.attrs.get('rel')=='canonical']==saved['canonical'],('canonical',name)
 assert [json.loads(d.inner(n)) for n in d.find('script') if n.attrs.get('type')=='application/ld+json']==[json.loads(s) for s in saved['jsonld']],('schema',name)
 links=[n.attrs for n in d.find('a') if n.attrs.get('href')]
 vendors=set((a.get('data-vendor',''),a['href'],a.get('rel',''),a.get('target','')) for a in links if a.get('data-vendor') or 'sponsored' in a.get('rel',''))
 assert set(map(tuple,saved['vendor_links']))<=vendors,('vendor URL or attribution attributes',name)
 vendorcount+=len(vendors)
 now={norm(a['href']) for a in links if not urlsplit(a['href']).scheme}
 assert {norm(s) for s in saved['internal_links']}<=now,('internal destinations',name)
 assert len(d.find('header','site-header'))==len(d.find('footer','site-footer'))==1,('shared shell',name)
 ids=Counter(n.attrs['id'] for n in d.find() if n.attrs.get('id'))
 assert all(v==1 for v in ids.values()),('duplicate IDs',name)
 for a in links:
  u=urlsplit(a['href'])
  if u.scheme or u.netloc:continue
  if not u.path and u.fragment:assert unquote(u.fragment) in ids,('anchor',name,u.fragment)
 for n in d.find('script')+d.find('link')+d.find('img'):
  href=n.attrs.get('src') or (n.attrs.get('href') if n.attrs.get('rel') in ('stylesheet','icon','apple-touch-icon') else None)
  if href and not urlsplit(href).scheme:assert Path(urlsplit(href).path.lstrip('/')).is_file(),('missing asset',name,href)
 assert len([n for n in d.find('link') if n.attrs.get('href')=='/design-system.css'])==1,name
 assert len([n for n in d.find('script') if n.attrs.get('src')=='/site-ui.js'])==1,name
 oldtables=before.find('table');newtables=d.find('table');assert len(oldtables)==len(newtables),name
 for old,new in zip(oldtables,newtables):
  tablecount+=1
  # Strip display-only mobile labels before comparing every fact and destination.
  t=d.html(new);td=Document(t);clean=replace(t,[(n.start,n.end,'') for n in td.find('span','cell-label')]);nt=Document(clean)
  expected=old.text().replace('Explore Free Plan','Explore DetailPilot') if name=='compare.html' else old.text()
  assert nt.find('table')[0].text()==expected,('table facts changed',name)
  assert 'responsive-table' in new.attrs.get('class',''),('mobile table missing',name)
 # Every article's body remains byte-equivalent in visible content, except three explicitly reorganized tools.
 if name not in ('finder.html','software-cost-calculator.html','compare.html'):
  cleaned=replace(source,[(n.start,n.end,'') for n in d.find('span','cell-label')]+[(n.start,n.end,'') for n in d.find() if n.attrs.get('data-ui-generated')]);after=Document(cleaned)
  assert [n.text() for n in before.find('main')]==[n.text() for n in after.find('main')],('main content changed',name)
for name in ['app.js','affiliate-deep-attribution.js','home.js','home.css','cost-calculator.js','pricing-data.js','sitemap.xml','sitemap-research.xml','_redirects','robots.txt','auto-detailing-software-pricing.csv']:
 assert Path(name).read_text()==oldfile(name),('protected logic, content or routing',name)
assert Path('match-score.js').read_text().split('  function injectStyles()')[0]==oldfile('match-score.js').split('  function injectStyles()')[0], 'Scoring data or logic changed'
changed=subprocess.check_output(['git','diff','--name-only',base],text=True).splitlines()
assert not any(n.startswith(('.github/','.env')) or n=='.detailerfit-bridge-state.json' for n in changed)
for s in ['styles.css','design-system.css']:assert 'linear-gradient' not in Path(s).read_text()
print(f'PASS: {pagecount} pages, {tablecount} unchanged fact tables, {vendorcount} issued vendor-link tuples; metadata/schema/H1/internal destinations preserved.')
print('PASS: static shared shell, existing article content, unique IDs, local assets, pricing/scoring inputs, analytics, homepage content and routing protected.')
assert Path('finder-trust-conversion.js').read_text().split('  function axisHtml')[0]==oldfile('finder-trust-conversion.js').split('  function axisHtml')[0], 'Trust facts changed'
