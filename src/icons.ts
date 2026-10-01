import { ICON_PATHS } from './data/icon-paths';

const cache = new Map<string, Path2D>();

export const hasIcon = (name: string) => name in ICON_PATHS;

export function iconPath(name: string): Path2D | null {
  const d = ICON_PATHS[name];
  if (!d) return null;
  let p = cache.get(name);
  if (!p) { p = new Path2D(d); cache.set(name, p) }
  return p;
}

export function icon(name: string, cls = ''): string {
  const d = ICON_PATHS[name] ?? ICON_PATHS.skull;
  return `<svg class="ic ${cls}" viewBox="0 0 512 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="${d}"/></svg>`;
}
