"""Trace the provided logo into native SVG outlines; no font substitution.
Developer-only asset preparation: Pillow, numpy, matplotlib.
Production has no Python, fonts, raster dependencies or generation calls.
"""
from pathlib import Path
from PIL import Image
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

root=Path(__file__).resolve().parent.parent/'assets/brand'
pixels=np.array(Image.open(root/'reference.png').convert('L'))

def simplify(points,tolerance=.08):
 if len(points)<3:return points
 delta=points[-1]-points[0]; length=np.linalg.norm(delta)
 distance=np.linalg.norm(points-points[0],axis=1) if length==0 else np.abs(delta[0]*(points[:,1]-points[0,1])-delta[1]*(points[:,0]-points[0,0]))/length
 i=int(np.argmax(distance))
 if distance[i]<=tolerance:return points[[0,-1]]
 return np.concatenate((simplify(points[:i+1],tolerance)[:-1],simplify(points[i:],tolerance)))

def trace(box):
 x,y,w,h=box; data=pixels[y:y+h,x:x+w]
 fig,ax=plt.subplots(); contour=ax.contour(data,levels=[160])
 paths=[]
 for seg in contour.allsegs[0]:
  if len(seg)<5: continue
  # Subpixel contour from the original. Line simplification stays within
  # 0.08 source pixels and removes redundant points, not brand features.
  pts=simplify(seg)
  d=f'M{pts[0,0]:.2f} {pts[0,1]:.2f}'
  for p in pts[1:]:d+=f'L{p[0]:.2f} {p[1]:.2f}'
  paths.append(d+'Z')
 plt.close(fig);return ''.join(paths)
mark=trace((170,58,182,164)); detailer=trace((130,232,191,41)); fit=trace((318,232,64,41))
def svg(name,view,content):
 text=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" role="img" aria-label="DetailerFit">{content}</svg>\n'; (root/name).write_text(text)
def symbol(color='#0b0f12'):return f'<path fill="{color}" fill-rule="evenodd" d="{mark}"/>'
def words(color='#0b0f12',secondary='#394858'):
 return f'<path fill="{color}" fill-rule="evenodd" d="{detailer}"/><path transform="translate(188 0)" fill="{secondary}" fill-rule="evenodd" d="{fit}"/>'
for mode,ink,gray in [('dark','#0b0f12','#394858'),('light','#ffffff','#c3cdd5')]:
 svg('detailerfit-'+mode+'.svg','0 0 328 60',f'<g transform="translate(0 2) scale(.34)">{symbol(ink)}</g><g transform="translate(73 10)">{words(ink,gray)}</g>')
 svg('symbol-'+mode+'.svg','0 0 200 200',f'<g transform="translate(9 18)">{symbol(ink)}</g>')
svg('favicon.svg','0 0 200 200',f'<style>path{{fill:#0b0f12}}@media(prefers-color-scheme:dark){{path{{fill:#fff}}}}</style><g transform="translate(9 18)">{symbol()}</g>')
svg('profile.svg','0 0 512 512',f'<rect width="512" height="512" fill="#fff"/><g transform="translate(131 92) scale(1.4)">{symbol()}</g><g transform="translate(82 341) scale(1.4)">{words()}</g>')
# Raster exports render the exact same native paths, not a generated redraw.
from matplotlib.path import Path as MPath
from matplotlib.patches import PathPatch
from matplotlib.transforms import Affine2D
import re
def draw(ax,d,offset,scale,color):
 vertices=[]; codes=[]
 for cmd,values in re.findall(r'([MLQZ])([^MLQZ]*)',d):
  v=[float(x) for x in values.split()]
  if cmd=='M': vertices.append(v);codes.append(MPath.MOVETO)
  elif cmd=='L':vertices.append(v);codes.append(MPath.LINETO)
  elif cmd=='Q': vertices.extend([v[:2],v[2:]]);codes.extend([MPath.CURVE3,MPath.CURVE3])
  else: vertices.append([0,0]);codes.append(MPath.CLOSEPOLY)
 path=MPath(vertices,codes)
 ax.add_patch(PathPatch(path,facecolor=color,edgecolor='none',transform=Affine2D().scale(scale).translate(*offset)+ax.transData))
def canvas(size,view,bg):
 fig=plt.figure(figsize=(size/100,size/100),dpi=100,facecolor=bg)
 ax=fig.add_axes([0,0,1,1]);ax.set_xlim(0,view);ax.set_ylim(view,0);ax.set_axis_off()
 return fig,ax
fig,ax=canvas(1024,512,'white')
draw(ax,mark,(131,92),1.4,'#0b0f12');draw(ax,detailer,(82,341),1.4,'#0b0f12');draw(ax,fit,(82+188*1.4,341),1.4,'#394858')
fig.savefig(root/'gmail-profile.png',dpi=100,facecolor='white');plt.close(fig)
for size,name in [(32,'favicon-32.png'),(180,'apple-touch-icon.png')]:
 fig,ax=canvas(size,200,'#f8f9f6');draw(ax,mark,(9,18),1,'#0b0f12');fig.savefig(root/name,dpi=100,facecolor='#f8f9f6');plt.close(fig)
print([(p.name,p.stat().st_size) for p in root.iterdir()])
