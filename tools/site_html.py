"""Small source-preserving HTML reader for static-site maintenance. Stdlib only."""
from html.parser import HTMLParser
import re

VOID = set('area base br col embed hr img input link meta param source track wbr'.split())

class Node:
    def __init__(self, tag='', attrs=(), start=0, open_end=0, parent=None):
        self.tag, self.attrs = tag, dict(attrs)
        self.start, self.open_end, self.end = start, open_end, open_end
        self.parent, self.children, self.parts = parent, [], []
    def find(self, tag=None, cls=None):
        out = []
        for n in self.children:
            if (tag is None or n.tag == tag) and (cls is None or cls in n.attrs.get('class', '').split()): out.append(n)
            out.extend(n.find(tag, cls))
        return out
    def text(self):
        return re.sub(r'\s+', ' ', ''.join(x.text() if isinstance(x, Node) else x for x in self.parts)).strip()

class Document(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.source, self.root = source, Node()
        self.stack = [self.root]
        self.offsets = [0]
        for m in re.finditer('\n', source): self.offsets.append(m.end())
        self.feed(source); self.close()
    def pos(self):
        row, col = self.getpos(); return self.offsets[row-1] + col
    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.pos(), self.pos()+len(self.get_starttag_text()), self.stack[-1])
        self.stack[-1].children.append(n); self.stack[-1].parts.append(n)
        if tag not in VOID: self.stack.append(n)
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID: self.stack.pop()
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, 0, -1):
            if self.stack[i].tag == tag:
                end = self.source.find('>', self.pos()) + 1
                for n in self.stack[i:]: n.end = end
                del self.stack[i:]; return
    def handle_data(self, data): self.stack[-1].parts.append(data)
    def find(self, tag=None, cls=None): return self.root.find(tag, cls)
    def html(self, n): return self.source[n.start:n.end]
    def inner(self, n): return self.source[n.open_end:self.source.rfind('</', n.open_end, n.end)]

def replace(source, patches):
    for start, end, value in sorted(patches, reverse=True): source = source[:start] + value + source[end:]
    return source
