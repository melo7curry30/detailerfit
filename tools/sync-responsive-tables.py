"""Add static mobile labels without duplicating or changing table facts. Idempotent."""
from pathlib import Path
from site_html import Document,replace
import re,html
count=0
for f in sorted(Path('.').glob('*.html')):
 s=f.read_text();d=Document(s);patch=[]
 for table in d.find('table'):
  if 'responsive-table' in table.attrs.get('class','').split():continue
  rows=table.find('tr')
  if not rows:continue
  first=[n for n in rows[0].children if n.tag in ('td','th')]
  hashead=bool(first) and all(n.tag=='th' for n in first)
  labels=[n.text() for n in first] if hashead else []
  opening=s[table.start:table.open_end]
  if 'class=' in opening:opening=re.sub(r'class=(["\'])(.*?)\1',lambda m:'class='+m[1]+m[2]+' responsive-table'+m[1],opening,1)
  else:opening=opening.replace('<table','<table class="responsive-table"',1)
  if 'role=' not in opening:opening=opening.replace('<table','<table role="table"',1)
  patch.append((table.start,table.open_end,opening))
  for ri,row in enumerate(rows):
   cells=[n for n in row.children if n.tag in ('td','th')]
   ro=s[row.start:row.open_end]
   if ri==0 and hashead and row.parent.tag!='thead':ro=ro.replace('<tr','<tr class="table-heading-row"',1)
   if 'role=' not in ro:ro=ro.replace('<tr','<tr role="row"',1)
   patch.append((row.start,row.open_end,ro))
   for ci,cell in enumerate(cells):
    co=s[cell.start:cell.open_end];role='columnheader' if hashead and ri==0 else 'rowheader' if cell.tag=='th' else 'cell'
    if 'role=' not in co:co=co.replace('<'+cell.tag,'<'+cell.tag+' role="'+role+'"',1)
    if cell.tag=='th' and 'scope=' not in co:co=co.replace('<th','<th scope="'+('col' if ri==0 and hashead else 'row')+'"',1)
    if labels and ri>0 and ci<len(labels):co+='<span class="cell-label" aria-hidden="true">'+html.escape(labels[ci])+'</span>'
    patch.append((cell.start,cell.open_end,co))
  count+=1
 if patch:f.write_text(replace(s,patch))
print(f'Added mobile table labels: {count} new tables.')
