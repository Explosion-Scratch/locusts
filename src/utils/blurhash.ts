import { decode } from 'blurhash';

/**
 * Decode a blurhash string into a data URL for use as a placeholder.
 * @param {string} hash - The blurhash string
 * @param {number} width - Decode width (small is fine, e.g. 32)
 * @param {number} height - Decode height
 * @returns {string} A data URL (image/png) of the decoded blurhash
 */
export function decodeBlurhash(hash, width = 32, height = 32) {
  try {
    const pixels = decode(hash, width, height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const imageData = ctx.createImageData(width, height);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  } catch {
    return '';
  }
}
