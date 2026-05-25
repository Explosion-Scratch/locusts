import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import sharp from 'sharp';
import { encode } from 'blurhash';

const PORT = 3333;
const PROJECT_ROOT = join(import.meta.dir, '..', '..');
const IMAGES_DIR = join(PROJECT_ROOT, 'src', 'assets', 'images');
const REGISTRY_PATH = join(PROJECT_ROOT, 'src', 'assets', 'images.json');

async function ensureDir(dir) {
  try { await mkdir(dir, { recursive: true }); } catch {}
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

async function computeBlurhash(buffer) {
  const { data, info } = await sharp(buffer)
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: 'inside' })
    .toBuffer({ resolveWithObject: true });

  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
}

async function processImage(buffer, slug, alt, caption) {
  await ensureDir(IMAGES_DIR);

  const metadata = await sharp(buffer).metadata();
  const format = metadata.format || 'png';
  const ext = format === 'jpeg' ? 'jpg' : format;
  const filename = `${slug}.${ext}`;
  const filePath = join(IMAGES_DIR, filename);

  await writeFile(filePath, buffer);
  const blurhash = await computeBlurhash(buffer);

  const entry = {
    slug,
    src: `/assets/images/${filename}`,
    blurhash,
    width: metadata.width || 0,
    height: metadata.height || 0,
    alt: alt || '',
    caption: caption || '',
  };

  const registry = await loadRegistry();
  registry[slug] = entry;
  await saveRegistry(registry);

  return entry;
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Image Uploader — Locusts</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Georgia, serif;
      background: #faf8f5;
      color: #1a1a1a;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2em;
    }
    .container {
      max-width: 540px;
      width: 100%;
    }
    h1 {
      font-size: 1.8em;
      font-weight: 600;
      margin-bottom: 0.3em;
      text-align: center;
    }
    .subtitle {
      text-align: center;
      color: #6b6b6b;
      margin-bottom: 2em;
      font-size: 0.95em;
    }
    .drop-zone {
      border: 2px dashed #e0dcd6;
      border-radius: 3px;
      padding: 3em 2em;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      margin-bottom: 1.5em;
      background: #fff;
    }
    .drop-zone:hover, .drop-zone.active {
      border-color: #c45a3c;
      background: rgba(196, 90, 60, 0.04);
    }
    .drop-zone p { color: #6b6b6b; margin-bottom: 0.5em; }
    .drop-zone .or { font-size: 0.85em; color: #999; margin: 0.8em 0; }
    .preview { max-width: 100%; max-height: 200px; margin-top: 1em; border-radius: 2px; }
    .field { margin-bottom: 1em; }
    .field label { display: block; font-size: 0.88em; color: #6b6b6b; margin-bottom: 0.3em; font-weight: 600; }
    .field input {
      width: 100%;
      font-family: Georgia, serif;
      font-size: 0.95em;
      padding: 0.6em 0.8em;
      border: 1px solid #e0dcd6;
      border-radius: 3px;
      background: #fff;
      color: #1a1a1a;
      outline: none;
      transition: border-color 0.15s;
    }
    .field input:focus { border-color: #c45a3c; }
    button.submit {
      width: 100%;
      font-family: Georgia, serif;
      font-size: 1em;
      padding: 0.7em;
      background: #c45a3c;
      color: #fff;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }
    button.submit:hover { background: #a84830; }
    button.submit:disabled { background: #ccc; cursor: default; }
    .result {
      margin-top: 1.5em;
      padding: 1em;
      background: #fff;
      border: 1px solid #e0dcd6;
      border-radius: 3px;
      font-size: 0.9em;
    }
    .result code {
      display: block;
      background: #f0ece7;
      padding: 0.5em 0.7em;
      margin-top: 0.5em;
      border-radius: 2px;
      font-family: monospace;
      font-size: 0.9em;
      user-select: all;
    }
    .result .success { color: #2e7d32; font-weight: 600; }
    .error { color: #c45a3c; margin-top: 1em; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Image Uploader</h1>
    <p class="subtitle">Paste an image, drop a file, or enter a URL</p>

    <div class="drop-zone" id="dropZone">
      <p>Drop image here or click to browse</p>
      <p class="or">or paste from clipboard (Ctrl+V)</p>
      <input type="file" id="fileInput" accept="image/*" style="display:none">
      <img class="preview" id="preview" style="display:none">
    </div>

    <div class="field">
      <label>Image URL (alternative)</label>
      <input type="text" id="urlInput" placeholder="https://example.com/image.jpg">
    </div>

    <div class="field">
      <label>Slug *</label>
      <input type="text" id="slugInput" placeholder="my-image-name" required>
    </div>

    <div class="field">
      <label>Alt text / Caption</label>
      <input type="text" id="altInput" placeholder="Description of the image">
    </div>

    <button class="submit" id="submitBtn" disabled>Upload Image</button>

    <div class="error" id="errorMsg" style="display:none"></div>
    <div class="result" id="resultBox" style="display:none"></div>
  </div>

  <script>
    let imageData = null;

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('preview');
    const urlInput = document.getElementById('urlInput');
    const slugInput = document.getElementById('slugInput');
    const altInput = document.getElementById('altInput');
    const submitBtn = document.getElementById('submitBtn');
    const errorMsg = document.getElementById('errorMsg');
    const resultBox = document.getElementById('resultBox');

    function showPreview(dataUrl) {
      preview.src = dataUrl;
      preview.style.display = 'block';
      submitBtn.disabled = !slugInput.value.trim();
    }

    function showError(msg) {
      errorMsg.textContent = msg;
      errorMsg.style.display = 'block';
      setTimeout(() => { errorMsg.style.display = 'none'; }, 5000);
    }

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('active');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('active'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('active');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) handleFile(file);
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) handleFile(e.target.files[0]);
    });

    document.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          handleFile(item.getAsFile());
          return;
        }
      }
    });

    function handleFile(file) {
      imageData = file;
      const reader = new FileReader();
      reader.onload = (e) => showPreview(e.target.result);
      reader.readAsDataURL(file);
    }

    slugInput.addEventListener('input', () => {
      submitBtn.disabled = !(slugInput.value.trim() && (imageData || urlInput.value.trim()));
    });
    urlInput.addEventListener('input', () => {
      submitBtn.disabled = !(slugInput.value.trim() && (imageData || urlInput.value.trim()));
    });

    submitBtn.addEventListener('click', async () => {
      const slug = slugInput.value.trim();
      const alt = altInput.value.trim();
      const url = urlInput.value.trim();

      if (!slug) return showError('Slug is required');
      if (!imageData && !url) return showError('Provide an image or URL');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Uploading…';
      errorMsg.style.display = 'none';

      try {
        const formData = new FormData();
        formData.append('slug', slug);
        formData.append('alt', alt);
        if (imageData) {
          formData.append('image', imageData);
        } else {
          formData.append('url', url);
        }

        const res = await fetch('/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Upload failed');

        resultBox.innerHTML =
          '<p class="success">✓ Image uploaded successfully</p>' +
          '<p>Use in markdown:</p>' +
          '<code>![' + (alt || slug) + '](' + data.src + ')</code>';
        resultBox.style.display = 'block';

        imageData = null;
        preview.style.display = 'none';
        slugInput.value = '';
        altInput.value = '';
        urlInput.value = '';
      } catch (err) {
        showError(err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Upload Image';
      }
    });
  </script>
</body>
</html>`;

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      return new Response(HTML, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (req.method === 'POST' && url.pathname === '/upload') {
      try {
        const formData = await req.formData();
        const slug = formData.get('slug')?.toString().trim();
        const alt = formData.get('alt')?.toString().trim() || '';
        const caption = alt;
        const imageFile = formData.get('image');
        const imageUrl = formData.get('url')?.toString().trim();

        if (!slug) {
          return Response.json({ error: 'Slug is required' }, { status: 400 });
        }

        let buffer;

        if (imageFile && imageFile instanceof File) {
          buffer = Buffer.from(await imageFile.arrayBuffer());
        } else if (imageUrl) {
          const res = await fetch(imageUrl);
          if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);
          buffer = Buffer.from(await res.arrayBuffer());
        } else {
          return Response.json({ error: 'No image provided' }, { status: 400 });
        }

        const entry = await processImage(buffer, slug, alt, caption);
        return Response.json(entry);
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`🖼  Image uploader running at http://localhost:${PORT}`);
