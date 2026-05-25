import { readdir, readFile, writeFile } from 'fs/promises';
import { join, extname, basename } from 'path';
import sharp from 'sharp';
import { encode } from 'blurhash';

const IMAGES_DIR = join(import.meta.dir, '..', 'src', 'assets', 'images');
const REGISTRY_PATH = join(import.meta.dir, '..', 'src', 'assets', 'images.json');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

async function loadRegistry() {
  try {
    const content = await readFile(REGISTRY_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function saveRegistry(registry) {
  await writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n');
}

async function computeBlurhash(filePath) {
  const { data, info } = await sharp(filePath)
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: 'inside' })
    .toBuffer({ resolveWithObject: true });

  const hash = encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    4,
    4
  );

  return hash;
}

async function getImageDimensions(filePath) {
  const metadata = await sharp(filePath).metadata();
  return { width: metadata.width || 0, height: metadata.height || 0 };
}

async function main() {
  const registry = await loadRegistry();

  let files;
  try {
    files = await readdir(IMAGES_DIR);
  } catch {
    console.log('No images directory found. Creating it...');
    const { mkdir } = await import('fs/promises');
    await mkdir(IMAGES_DIR, { recursive: true });
    console.log(`Created ${IMAGES_DIR}`);
    return;
  }

  const imageFiles = files.filter((f) =>
    IMAGE_EXTENSIONS.has(extname(f).toLowerCase())
  );

  let processed = 0;
  let skipped = 0;

  for (const file of imageFiles) {
    const slug = basename(file, extname(file));

    if (registry[slug]) {
      skipped++;
      continue;
    }

    const filePath = join(IMAGES_DIR, file);
    console.log(`Processing: ${file}`);

    try {
      const [blurhash, dimensions] = await Promise.all([
        computeBlurhash(filePath),
        getImageDimensions(filePath),
      ]);

      registry[slug] = {
        slug,
        src: `/assets/images/${file}`,
        blurhash,
        width: dimensions.width,
        height: dimensions.height,
        alt: '',
        caption: '',
      };

      processed++;
      console.log(`  ✓ ${slug}: ${dimensions.width}x${dimensions.height}, hash=${blurhash.slice(0, 12)}...`);
    } catch (err) {
      console.error(`  ✗ Failed to process ${file}:`, err.message);
    }
  }

  await saveRegistry(registry);
  console.log(`\nDone. Processed: ${processed}, Skipped: ${skipped}, Total: ${Object.keys(registry).length}`);
}

main().catch(console.error);
