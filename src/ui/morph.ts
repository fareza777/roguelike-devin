const keyOf = (n: Node): string | null => (n.nodeType === 1 ? (n as Element).getAttribute('data-key') || (n as Element).id || null : null);

function same(a: Node, b: Node) {
  if (a.nodeType !== b.nodeType) return false;
  if (a.nodeType !== 1) return true;
  const ea = a as Element, eb = b as Element;
  return ea.tagName === eb.tagName && keyOf(ea) === keyOf(eb);
}

function syncAttrs(from: Element, to: Element) {
  for (const { name, value } of Array.from(to.attributes)) if (from.getAttribute(name) !== value) from.setAttribute(name, value);
  for (const { name } of Array.from(from.attributes)) if (!to.hasAttribute(name)) from.removeAttribute(name);
}

function morphNode(from: Node, to: Node) {
  if (from.nodeType !== 1) { if (from.nodeValue !== to.nodeValue) from.nodeValue = to.nodeValue; return }
  const a = from as Element, b = to as Element;
  if (a.tagName === 'CANVAS') return;
  syncAttrs(a, b);
  if (a instanceof HTMLInputElement) { if (document.activeElement !== a && a.value !== (b as HTMLInputElement).value) a.value = (b as HTMLInputElement).value; return }
  if (a.hasAttribute('data-static')) return;
  morphChildren(a, b);
}

function morphChildren(parent: Node, next: Node) {
  const olds = Array.from(parent.childNodes);
  const keyed = new Map<string, Node>();
  olds.forEach(o => { const k = keyOf(o); if (k) keyed.set(k, o) });
  const news = Array.from(next.childNodes);
  news.forEach((n, i) => {
    const k = keyOf(n);
    const cur = parent.childNodes[i] ?? null;
    let match: Node | null = k ? keyed.get(k) ?? null : cur && !keyOf(cur) ? cur : null;
    if (match && !same(match, n)) match = null;
    if (match) {
      if (match !== cur) parent.insertBefore(match, cur);
      morphNode(match, n);
    } else parent.insertBefore(n, cur);
  });
  while (parent.childNodes.length > news.length) parent.removeChild(parent.lastChild!);
}

export function patch(root: Element, html: string) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  morphChildren(root, tpl.content);
}
