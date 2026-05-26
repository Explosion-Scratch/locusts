import imageRegistry from '@/assets/images.json';

type RegistryEntry = { width?: number; height?: number };

export function getImageAspectRatio(src: string): number {
  const slug = src.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '';
  const entry = (imageRegistry as Record<string, RegistryEntry>)[slug];
  if (entry?.width && entry?.height) return entry.width / entry.height;
  return 1;
}

export function gridColumnCount(count: number): number {
  if (count <= 1) return 1;
  let best = 2;
  let bestDiff = Infinity;
  for (let cols = 2; cols <= Math.min(4, count); cols++) {
    const rows = Math.ceil(count / cols);
    const diff = Math.abs(cols - rows);
    if (diff < bestDiff || (diff === bestDiff && cols > best)) {
      bestDiff = diff;
      best = cols;
    }
  }
  return best;
}

export function layoutImagesForGrid<T extends { src: string }>(images: T[]): T[] {
  if (images.length <= 1) return [...images];
  return [...images].sort(
    (a, b) => getImageAspectRatio(a.src) - getImageAspectRatio(b.src)
  );
}
