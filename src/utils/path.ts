export function resolveAssetUrl(url?: string): string {
  if (!url) return '';
  const path = url.startsWith('/src/assets/')
    ? url.replace('/src/assets/', '/assets/')
    : url;
  if (path.startsWith('/')) {
    const base = import.meta.env.BASE_URL || '/';
    return `${base.replace(/\/$/, '')}${path}`;
  }
  return path;
}
