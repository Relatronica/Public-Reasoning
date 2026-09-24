/** Pagine focus: niente sidebar community, layout a tutta larghezza utile. */
export function isFocusLayoutPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (/^\/records\/[^/]+$/.test(pathname)) return true;
  if (pathname.startsWith('/curator')) return true;
  if (pathname.startsWith('/settings')) return true;
  if (pathname.startsWith('/auth')) return true;
  if (pathname === '/records/capture' || pathname === '/records/new') return true;
  if (pathname === '/guardian') return true;
  return false;
}

export function isRecordDetailPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return /^\/records\/[^/]+$/.test(pathname);
}
