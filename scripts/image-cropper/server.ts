import { readdir, readFile, writeFile } from 'fs/promises';
import { join, extname, relative, resolve, normalize } from 'path';
import sharp from 'sharp';
import { encode } from 'blurhash';

const PORT = 3334;
const PROJECT_ROOT = join(import.meta.dir, '..', '..');
const IMAGES_DIR = join(PROJECT_ROOT, 'src', 'assets', 'images');
const LOCUSTS_LEFT = join(PROJECT_ROOT, 'src', 'assets', 'locusts', 'left');
const LOCUSTS_RIGHT = join(PROJECT_ROOT, 'src', 'assets', 'locusts', 'right');
const REGISTRY_PATH = join(PROJECT_ROOT, 'src', 'assets', 'images.json');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

const ROOTS = [
  { group: 'Images', dir: IMAGES_DIR, prefix: 'images' },
  { group: 'Locusts — Left', dir: LOCUSTS_LEFT, prefix: 'locusts/left' },
  { group: 'Locusts — Right', dir: LOCUSTS_RIGHT, prefix: 'locusts/right' },
];

async function listImagesInDir(dir, prefix) {
  let files;
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }
  return files
    .filter((f) => IMAGE_EXTENSIONS.has(extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => ({
      id: `${prefix}/${f}`,
      name: f,
      group: ROOTS.find((r) => r.prefix === prefix)?.group ?? prefix,
      path: join(dir, f),
    }));
}

async function listAllImages() {
  const items = [];
  for (const { dir, prefix } of ROOTS) {
    items.push(...(await listImagesInDir(dir, prefix)));
  }
  return items;
}

function resolveImagePath(id) {
  const normalized = normalize(id.replace(/\\/g, '/'));
  if (normalized.includes('..') || !normalized.includes('/')) return null;
  const full = resolve(PROJECT_ROOT, 'src', 'assets', normalized);
  const allowed = ROOTS.map((r) => r.dir);
  if (!allowed.some((dir) => full.startsWith(dir + '/') || full === dir)) return null;
  if (!IMAGE_EXTENSIONS.has(extname(full).toLowerCase())) return null;
  return full;
}

async function loadRegistry() {
  try {
    return JSON.parse(await readFile(REGISTRY_PATH, 'utf-8'));
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
  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
}

async function updateRegistryForImage(filePath) {
  const rel = relative(IMAGES_DIR, filePath);
  if (rel.startsWith('..')) return;
  const slug = rel.replace(extname(rel), '');
  const registry = await loadRegistry();
  const entry = registry[slug];
  if (!entry) return;
  const metadata = await sharp(filePath).metadata();
  entry.width = metadata.width || 0;
  entry.height = metadata.height || 0;
  entry.blurhash = await computeBlurhash(filePath);
  registry[slug] = entry;
  await saveRegistry(registry);
}

async function saveImageBuffer(filePath, buffer) {
  const ext = extname(filePath).toLowerCase();
  let pipeline = sharp(buffer);
  if (ext === '.png') pipeline = pipeline.png();
  else if (ext === '.jpg' || ext === '.jpeg') pipeline = pipeline.jpeg({ quality: 95 });
  else if (ext === '.webp') pipeline = pipeline.webp();
  else if (ext === '.gif') pipeline = pipeline.gif();
  const out = await pipeline.toBuffer();
  await writeFile(filePath, out);
  if (filePath.startsWith(IMAGES_DIR)) {
    await updateRegistryForImage(filePath);
  }
  const updated = await sharp(filePath).metadata();
  return { width: updated.width, height: updated.height };
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Image Cropper — Locusts</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.css">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Georgia, serif;
      background: #faf8f5;
      color: #1a1a1a;
      height: 100vh;
      display: flex;
      overflow: hidden;
    }
    aside {
      width: 220px;
      flex-shrink: 0;
      border-right: 1px solid #e0dcd6;
      background: #fff;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    aside h1 {
      font-size: 0.95em;
      font-weight: 600;
      padding: 0.9em 1em;
      border-bottom: 1px solid #e0dcd6;
    }
    .list {
      flex: 1;
      overflow-y: auto;
      padding: 0.4em 0;
    }
    .group-label {
      font-size: 0.7em;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #999;
      padding: 0.6em 1em 0.25em;
    }
    .thumb {
      display: flex;
      align-items: center;
      gap: 0.5em;
      padding: 0.35em 0.7em;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-family: inherit;
      font-size: 0.78em;
      color: #1a1a1a;
      transition: background 0.12s;
    }
    .thumb:hover { background: #f5f3ef; }
    .thumb.active { background: #f0ece7; }
    .thumb img {
      width: 32px;
      height: 32px;
      object-fit: cover;
      border-radius: 2px;
      border: 1px solid #e0dcd6;
      flex-shrink: 0;
    }
    .thumb span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .toolbar {
      display: flex;
      align-items: center;
      gap: 0.6em;
      padding: 0.6em 1em;
      border-bottom: 1px solid #e0dcd6;
      background: #fff;
      flex-shrink: 0;
    }
    .toolbar .name {
      flex: 1;
      font-size: 0.85em;
      color: #6b6b6b;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .toolbar button {
      font-family: Georgia, serif;
      font-size: 0.82em;
      padding: 0.4em 0.85em;
      border: 1px solid #e0dcd6;
      border-radius: 3px;
      background: #fff;
      color: #1a1a1a;
      cursor: pointer;
      transition: border-color 0.12s, background 0.12s;
    }
    .toolbar button:hover { border-color: #c45a3c; }
    .toolbar button.primary {
      background: #c45a3c;
      color: #fff;
      border-color: #c45a3c;
    }
    .toolbar button.primary:hover { background: #a84830; }
    .toolbar button:disabled { opacity: 0.45; cursor: default; }
    .toolbar .sep {
      width: 1px;
      height: 1.2em;
      background: #e0dcd6;
      flex-shrink: 0;
    }
    .crop-wrap {
      flex: 1;
      min-height: 0;
      background: #eeeae4;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1em;
      overflow: hidden;
    }
    .crop-wrap img {
      display: block;
      max-width: 100%;
      max-height: 100%;
    }
    .empty {
      color: #999;
      font-size: 0.9em;
    }
    .status {
      font-size: 0.78em;
      padding: 0.4em 1em;
      border-top: 1px solid #e0dcd6;
      background: #fff;
      color: #6b6b6b;
      min-height: 1.8em;
    }
    .status.ok { color: #2e7d32; }
    .status.err { color: #c45a3c; }
  </style>
</head>
<body>
  <aside>
    <h1>Image Cropper</h1>
    <div class="list" id="list"></div>
  </aside>
  <main>
    <div class="toolbar">
      <span class="name" id="currentName">Select an image</span>
      <button type="button" id="prevBtn" disabled>←</button>
      <button type="button" id="nextBtn" disabled>→</button>
      <span class="sep"></span>
      <button type="button" id="rotateLeftBtn" disabled title="Rotate 90° left">↺</button>
      <button type="button" id="rotateRightBtn" disabled title="Rotate 90° right">↻</button>
      <button type="button" id="resetBtn" disabled>Reset</button>
      <button type="button" class="primary" id="saveBtn" disabled>Save crop</button>
    </div>
    <div class="crop-wrap">
      <p class="empty" id="placeholder">Select an image from the sidebar</p>
      <img id="cropImage" alt="" style="display:none">
    </div>
    <div class="status" id="status"></div>
  </main>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.js"></script>
  <script>
    let images = [];
    let index = -1;
    let cropper = null;

    const listEl = document.getElementById('list');
    const cropImg = document.getElementById('cropImage');
    const placeholder = document.getElementById('placeholder');
    const currentName = document.getElementById('currentName');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const rotateLeftBtn = document.getElementById('rotateLeftBtn');
    const rotateRightBtn = document.getElementById('rotateRightBtn');
    const resetBtn = document.getElementById('resetBtn');
    const saveBtn = document.getElementById('saveBtn');
    const statusEl = document.getElementById('status');

    function setToolbarEnabled(on) {
      prevBtn.disabled = !on || index <= 0;
      nextBtn.disabled = !on || index >= images.length - 1;
      rotateLeftBtn.disabled = !on;
      rotateRightBtn.disabled = !on;
      resetBtn.disabled = !on;
      saveBtn.disabled = !on;
    }

    function setStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className = 'status' + (type ? ' ' + type : '');
    }

    function destroyCropper() {
      if (cropper) {
        cropper.destroy();
        cropper = null;
      }
    }

    function renderList() {
      const groups = {};
      for (const img of images) {
        if (!groups[img.group]) groups[img.group] = [];
        groups[img.group].push(img);
      }
      listEl.innerHTML = '';
      for (const [group, items] of Object.entries(groups)) {
        const label = document.createElement('div');
        label.className = 'group-label';
        label.textContent = group;
        listEl.appendChild(label);
        for (const img of items) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'thumb' + (images.indexOf(img) === index ? ' active' : '');
          btn.dataset.id = img.id;
          btn.innerHTML = '<img src="/file/' + encodeURIComponent(img.id) + '" alt=""><span>' + img.name + '</span>';
          btn.addEventListener('click', () => selectImage(images.indexOf(img)));
          listEl.appendChild(btn);
        }
      }
    }

    async function selectImage(i) {
      if (i < 0 || i >= images.length) return;
      index = i;
      const img = images[i];
      destroyCropper();
      setStatus('');
      currentName.textContent = img.id;
      setToolbarEnabled(true);
      prevBtn.disabled = index <= 0;
      nextBtn.disabled = index >= images.length - 1;
      placeholder.style.display = 'none';
      cropImg.style.display = 'block';
      cropImg.src = '/file/' + encodeURIComponent(img.id) + '?t=' + Date.now();
      renderList();
      cropImg.onload = () => {
        destroyCropper();
        cropper = new Cropper(cropImg, {
          viewMode: 1,
          dragMode: 'move',
          autoCropArea: 1,
          responsive: true,
          background: false,
        });
      };
    }

    prevBtn.addEventListener('click', () => selectImage(index - 1));
    nextBtn.addEventListener('click', () => selectImage(index + 1));
    rotateLeftBtn.addEventListener('click', () => cropper?.rotate(-90));
    rotateRightBtn.addEventListener('click', () => cropper?.rotate(90));
    resetBtn.addEventListener('click', () => cropper?.reset());
    saveBtn.addEventListener('click', async () => {
      if (!cropper || index < 0) return;
      const img = images[index];
      const canvas = cropper.getCroppedCanvas({
        maxWidth: 8192,
        maxHeight: 8192,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
      if (!canvas) return setStatus('Nothing to save', 'err');
      const ext = img.name.split('.').pop()?.toLowerCase();
      const mime =
        ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
        : ext === 'webp' ? 'image/webp'
        : 'image/png';
      saveBtn.disabled = true;
      setStatus('Saving…');
      try {
        const blob = await new Promise((resolve, reject) => {
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Export failed'))), mime, 0.95);
        });
        const formData = new FormData();
        formData.append('id', img.id);
        formData.append('image', blob, img.name);
        const res = await fetch('/crop', { method: 'POST', body: formData });
        const out = await res.json();
        if (!res.ok) throw new Error(out.error || 'Save failed');
        setStatus('Saved — ' + out.width + '×' + out.height, 'ok');
        await selectImage(index);
      } catch (err) {
        setStatus(err.message, 'err');
      } finally {
        saveBtn.disabled = false;
      }
    });

    function rotateBy(deg) {
      if (!cropper) return;
      cropper.rotate(deg);
    }

    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea')) return;
      if (e.altKey) {
        if (e.key === 'ArrowLeft' && index > 0) {
          e.preventDefault();
          selectImage(index - 1);
        }
        if (e.key === 'ArrowRight' && index < images.length - 1) {
          e.preventDefault();
          selectImage(index + 1);
        }
        return;
      }
      if (!cropper) return;
      const step = e.shiftKey ? 5 : 1;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        rotateBy(-step);
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        rotateBy(step);
      }
    });

    fetch('/api/images')
      .then((r) => r.json())
      .then((data) => {
        images = data;
        renderList();
        if (images.length) selectImage(0);
      })
      .catch((err) => setStatus(err.message, 'err'));
  </script>
</body>
</html>`;

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      return new Response(HTML, { headers: { 'Content-Type': 'text/html' } });
    }

    if (req.method === 'GET' && url.pathname === '/api/images') {
      const images = await listAllImages();
      return Response.json(images.map(({ id, name, group }) => ({ id, name, group })));
    }

    if (req.method === 'GET' && url.pathname.startsWith('/file/')) {
      const id = decodeURIComponent(url.pathname.slice('/file/'.length));
      const filePath = resolveImagePath(id);
      if (!filePath) return new Response('Not Found', { status: 404 });
      try {
        const buffer = await readFile(filePath);
        const ext = extname(filePath).toLowerCase();
        const types = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.webp': 'image/webp',
          '.gif': 'image/gif',
          '.avif': 'image/avif',
        };
        return new Response(buffer, {
          headers: {
            'Content-Type': types[ext] || 'application/octet-stream',
            'Cache-Control': 'no-store',
          },
        });
      } catch {
        return new Response('Not Found', { status: 404 });
      }
    }

    if (req.method === 'POST' && url.pathname === '/crop') {
      try {
        const formData = await req.formData();
        const id = formData.get('id')?.toString();
        const imageFile = formData.get('image');
        if (!id || !(imageFile instanceof File)) {
          return Response.json({ error: 'Invalid crop data' }, { status: 400 });
        }
        const filePath = resolveImagePath(id);
        if (!filePath) return Response.json({ error: 'Invalid image' }, { status: 400 });
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const result = await saveImageBuffer(filePath, buffer);
        return Response.json({ ok: true, ...result });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`✂  Image cropper running at http://localhost:${PORT}`);
