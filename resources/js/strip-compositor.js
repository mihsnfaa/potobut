/*
  Strip Compositor
  - Loads a PNG template (strip-2/3/4)
  - Creates canvas matching template natural size
  - Draws template as base, then draws each user photo into configured slots
  - Uses object-fit: cover behavior for photos
  - Draws centered caption (max 10 chars) at captionY
  - Exports final PNG and triggers download

  API:
    StripComposer.composeAndDownload(layoutCount, photoSrcArray, caption, filename)
    Returns Promise<void>

  photoSrcArray: array of image sources (URL, dataURL) or HTMLImageElement
*/

// Explicit slot mapping per template (do NOT compute dynamically)
const STRIP_CONFIG = {
  // Layouts use exact Figma-provided pixel coordinates (source of truth)
  2: {
    template: '/templates/strip-2.png',
    canvas: { width: 1240, height: 2480 },
    slots: [
      { x: 120, y: 160,  w: 1000, h: 880 },
      { x: 120, y: 1100, w: 1000, h: 880 }
    ],
    caption: { x: 0, y: 2040, w: 1240, h: 200 }
  },
  3: {
    template: '/templates/strip-3.png',
    canvas: { width: 1240, height: 3300 },
    slots: [
      { x: 120, y: 160,  w: 1000, h: 820 },
      { x: 120, y: 1040, w: 1000, h: 820 },
      { x: 120, y: 1920, w: 1000, h: 820 }
    ],
    caption: { x: 0, y: 2800, w: 1240, h: 220 }
  },
  4: {
    template: '/templates/strip-4.png',
    canvas: { width: 1240, height: 4200 },
    slots: [
      { x: 120, y: 140,  w: 1000, h: 760 },
      { x: 120, y: 980,  w: 1000, h: 760 },
      { x: 120, y: 1820, w: 1000, h: 760 },
      { x: 120, y: 2660, w: 1000, h: 760 }
    ],
    caption: { x: 0, y: 3560, w: 1240, h: 240 }
  }
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (src instanceof HTMLImageElement) return resolve(src);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + src));
    img.src = src;
  });
}

// Draw with object-fit: cover (center-crop) — uses explicit per-slot cover logic
function drawCover(ctx, img, x, y, w, h) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;

  const ir = iw / ih;
  const tr = w / h;

  let sx, sy, sw, sh;
  if (ir > tr) {
    // image is wider than target — crop left/right
    sh = ih;
    sw = Math.round(sh * tr);
    sx = Math.round((iw - sw) / 2);
    sy = 0;
  } else {
    // image is taller than target — crop top/bottom
    sw = iw;
    sh = Math.round(sw / tr);
    sx = 0;
    sy = Math.round((ih - sh) / 2);
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

async function composeCanvas(layoutCount, photoSources = [], caption = '') {
  const cfg = STRIP_CONFIG[layoutCount];
  if (!cfg) throw new Error('Unsupported layout: ' + layoutCount);

  // Load template first
  const template = await loadImage(cfg.template);

  // Create canvas with template natural size (DO NOT resize)
  const canvas = document.createElement('canvas');
  canvas.width = template.naturalWidth;
  canvas.height = template.naturalHeight;
  const ctx = canvas.getContext('2d');

  // Clear and draw the template first (template is the base)
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(template, 0, 0);

  // Load all user photos (strict 1:1 mapping required)
  const slotCount = cfg.slots.length;
  if (!Array.isArray(photoSources) || photoSources.length !== slotCount) {
    throw new Error('composeCanvas: photoSources length must exactly match slots count (' + slotCount + ')');
  }
  const loadedPhotos = await Promise.all(photoSources.map(src => src ? loadImage(src).catch(()=>null) : Promise.resolve(null)));

  // Draw each photo into its slot using explicit cover helper
  for (let i = 0; i < slotCount; i++) {
    const slot = cfg.slots[i];
    const photo = loadedPhotos[i];
    if (!photo) continue; // skip empty slot
    drawCover(ctx, photo, slot.x, slot.y, slot.w, slot.h);
  }

  // Draw caption (max 10 chars) inside caption rect if provided
  if (caption && typeof caption === 'string' && cfg.caption) {
    const text = caption.trim().slice(0, 10);
    const crect = cfg.caption;
    ctx.save();
    // pick a font size that fits inside caption.h (approx)
    const fontSize = Math.max(12, Math.floor(crect.h * 0.5));
    ctx.fillStyle = '#000';
    ctx.font = fontSize + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const cx = crect.x + crect.w / 2;
    const cy = crect.y + crect.h / 2;
    ctx.fillText(text, cx, cy);
    ctx.restore();
  }

  return canvas;
}

async function composeAndDownload(layoutCount, photoSources = [], caption = '', filename = 'strip.png') {
  const canvas = await composeCanvas(layoutCount, photoSources, caption);

  // Export PNG and trigger download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

// Expose API
window.StripComposer = {
  STRIP_CONFIG,
  composeCanvas, // returns canvas element
  composeAndDownload
};

export { STRIP_CONFIG, composeCanvas, composeAndDownload };
