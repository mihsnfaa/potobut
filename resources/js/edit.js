import './strip-compositor';

document.addEventListener('DOMContentLoaded', function(){
  const previewStrip = document.getElementById('previewStrip');
  const captionInput = document.getElementById('captionInput');
  const captionCount = document.getElementById('captionCount');
  const captionText = document.getElementById('captionText');
  const bgColor = document.getElementById('bgColor');
  const presets = document.querySelectorAll('.preset');
  const patternOptions = document.querySelectorAll('.pattern-option');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const btnDownload = document.getElementById('btnDownload');
  const btnBack = document.getElementById('btnBackEdit');
  const btnAgain = document.getElementById('btnAgain');

  const layoutRaw = localStorage.getItem('potobut_layout') || '2';
  const layoutCount = parseInt(String(layoutRaw).replace(/\D/g,''),10) || 2;

  // load photos from sessionStorage (robust fallback)
  let photos = [];
  try{
    const stored = sessionStorage.getItem('potobut_photos');
    if(stored) photos = JSON.parse(stored) || [];
  }catch(e){ photos = []; }
  // fallback: sometimes the flow saved photos in localStorage or as objects
  if(!photos || photos.length < 1){
    try{
      const alt = localStorage.getItem('potobut_photos');
      if(alt){ const parsed = JSON.parse(alt); if(Array.isArray(parsed)) photos = parsed; }
    }catch(e){}
  }
  // normalize array entries: accept objects with dataUrl or {src}
  photos = (photos || []).map(p => {
    if(!p) return null;
    if(typeof p === 'string') return p;
    if(p.dataUrl) return p.dataUrl;
    if(p.src) return p.src;
    return null;
  }).slice(0, layoutCount);

  // state
  let currentFilter = 'normal';
  let currentPattern = 'plain';
  // default background for edit picker: Star Light Blue
  let currentBg = bgColor ? bgColor.value : '#E0F2FE';

  function createPreview(imgSrc, idx, imgHeight){
    const wrap = document.createElement('div');
    wrap.className = 'w-full rounded-lg overflow-hidden shadow-sm border border-white/10 bg-white flex-shrink-0';
    wrap.style.position = 'relative';
    wrap.style.height = imgHeight + 'px';
    wrap.style.maxWidth = '320px';
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = 'photo-'+idx;
    img.className = 'w-full h-full';
    img.style.objectFit = 'cover';
    img.style.transition = 'filter 200ms ease, transform 200ms ease';
    // ensure no mirror transform is applied
    img.style.transform = 'none';
    img.style.webkitTransform = 'none';
    wrap.appendChild(img);
    // caption under each photo
    const cap = document.createElement('div');
    cap.className = 'mt-2 text-xs text-[#0F172A] text-center font-medium';
    cap.style.paddingTop = '6px';
    cap.textContent = captionInput.value || '';
    wrap.appendChild(cap);
    return wrap;
  }

  function renderStrip(){
    // Render only the composed strip into #previewStrip.
    // Clear any previous children and let renderCompositePreview inject the composed image.
    previewStrip.innerHTML = '';
    previewStrip.style.background = currentBg;
    previewStrip.style.backgroundImage = '';
    // patterns and background color only influence the editor preview background, not the composed template
    if(currentPattern === 'polka'){
      previewStrip.style.backgroundImage = 'radial-gradient(circle at 10px 10px, rgba(0,0,0,0.04) 2px, transparent 3px)';
      previewStrip.style.backgroundSize = '24px 24px';
    } else if(currentPattern === 'stripes'){
      previewStrip.style.backgroundImage = 'repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0 6px, transparent 6px 12px)';
    } else if(currentPattern === 'dots-min'){
      previewStrip.style.backgroundImage = 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.03) 1px, transparent 2px)';
      previewStrip.style.backgroundSize = '16px 16px';
    }

    // caption text will be managed by composed preview (guard element may be removed)
    if(captionText) captionText.textContent = '';

    // Render composed preview into previewStrip (only one preview element)
    renderCompositePreview();
  }

  // Prepare an image with filter applied and return a dataURL image source
  async function prepareImageWithFilter(src, filter){
    // load source
    const img = await new Promise((res, rej)=>{ const i=new Image(); i.crossOrigin='anonymous'; i.onload=()=>res(i); i.onerror=()=>rej(new Error('img load')); i.src = src; });
    // draw into offscreen canvas at natural size and apply filter
    const cw = img.naturalWidth || img.width || 800;
    const ch = img.naturalHeight || img.height || 600;
    const c = document.createElement('canvas'); c.width = cw; c.height = ch; const cx = c.getContext('2d');
    switch(filter){
      case 'warm': cx.filter = 'sepia(0.25) contrast(1.05) saturate(1.1)'; break;
      case 'cool': cx.filter = 'brightness(0.98) contrast(1.02) hue-rotate(200deg)'; break;
      case 'vintage': cx.filter = 'sepia(0.5) contrast(1.05) saturate(0.9)'; break;
      case 'bw': cx.filter = 'grayscale(1) contrast(1.05)'; break;
      default: cx.filter = 'none';
    }
    cx.drawImage(img, 0, 0, cw, ch);
    cx.filter = 'none';
    return c.toDataURL('image/png');
  }

  // Use StripComposer.composeCanvas to produce composition using template PNG
  async function composeStripCanvas(outWidth){
    // For composition, prepare photos with filters applied
    const cfg = window.StripComposer && window.StripComposer.STRIP_CONFIG ? window.StripComposer.STRIP_CONFIG : null;
    const needed = (cfg && cfg[layoutCount]) ? cfg[layoutCount].slots.length : layoutCount;
    const limited = photos.slice(0, needed);
    const prepared = [];
    for(let i=0;i<limited.length;i++){
      const p = limited[i];
      if(!p) { prepared.push(null); continue; }
      try{ const dataUrl = await prepareImageWithFilter(p, currentFilter); prepared.push(dataUrl); }catch(e){ prepared.push(p); }
    }

    const composed = await window.StripComposer.composeCanvas(layoutCount, prepared, captionInput.value || '');
    if(outWidth && outWidth < composed.width){ const s = outWidth / composed.width; const out = document.createElement('canvas'); out.width = outWidth; out.height = Math.round(composed.height * s); const octx = out.getContext('2d'); octx.drawImage(composed,0,0,out.width,out.height); return out; }
    return composed;
  }

  async function renderCompositePreview(){
    // create a small preview and insert into previewStrip
    try{
      const previewCanvas = await composeStripCanvas(360);
      const img = document.createElement('img'); img.src = previewCanvas.toDataURL('image/png'); img.className = 'rounded-md shadow-sm'; img.style.maxWidth = '100%';
      // inject composed preview directly into #previewStrip (single preview)
      previewStrip.innerHTML = '';
      previewStrip.appendChild(img);
      // remove any legacy composed preview holder to avoid duplicate placeholder
      const holder = document.getElementById('composedPreviewHolder'); if(holder && holder.parentNode) holder.parentNode.removeChild(holder);
      // update caption below (UI element)
      const cap = document.getElementById('captionText'); if(cap) cap.textContent = captionInput.value || '';
    }catch(e){ /* strip not found or compose failed — fallback to simple strip */ }
  }

  function applyFilterToElement(node, filter){
    const img = node.querySelector('img');
    if(!img) return;
    switch(filter){
      case 'warm': img.style.filter = 'sepia(0.25) contrast(1.05) saturate(1.1)'; break;
      case 'cool': img.style.filter = 'brightness(0.98) contrast(1.02) hue-rotate(200deg)'; break;
      case 'vintage': img.style.filter = 'sepia(0.5) contrast(1.05) saturate(0.9)'; break;
      case 'bw': img.style.filter = 'grayscale(1) contrast(1.05)'; break;
      default: img.style.filter = 'none';
    }
  }

  // wire controls
  if(bgColor){
    bgColor.addEventListener('input', (e)=>{ currentBg = e.target.value; renderStrip(); });
  }
  presets.forEach(b=> b.addEventListener('click', (e)=>{ currentBg = e.target.getAttribute('data-color'); if(bgColor) bgColor.value = currentBg; renderStrip(); }));
  patternOptions.forEach(p=> p.addEventListener('click', (e)=>{ currentPattern = p.getAttribute('data-pattern'); patternOptions.forEach(x=>{ x.classList.remove('ring-2','ring-red-500','shadow-md'); }); p.classList.add('ring-2','ring-red-500','shadow-md'); renderStrip(); }));
  filterBtns.forEach(b=> b.addEventListener('click', (e)=>{ currentFilter = b.getAttribute('data-filter'); filterBtns.forEach(x=>{ x.classList.remove('ring-2','ring-red-500','shadow-md'); }); b.classList.add('ring-2','ring-red-500','shadow-md'); // smooth transition
    // re-render composed preview to reflect new filter
    renderStrip();
  }));

  captionInput.addEventListener('input', (e)=>{
    const v = e.target.value || '';
    if(v.length > 10){ e.target.value = v.slice(0,10); }
    captionCount.textContent = String((e.target.value||'').length);
    // update composed preview caption
    if(captionText) captionText.textContent = '';
    renderStrip();
  });

  // Download: compose a simple vertical canvas
  btnDownload.addEventListener('click', async function(){
    // strict validation: photos array length must exactly match layoutCount
    const provided = (photos || []).filter(Boolean).length;
    if(provided !== layoutCount){
      alert('Please provide ' + layoutCount + ' photos before downloading.');
      return;
    }

    try{
      // prepare photos with filters applied before download
      const cfg2 = window.StripComposer && window.StripComposer.STRIP_CONFIG ? window.StripComposer.STRIP_CONFIG : null;
      const needed = (cfg2 && cfg2[layoutCount]) ? cfg2[layoutCount].slots.length : layoutCount;
      const limited = photos.slice(0, needed);
      const prepared = [];
      for(let i=0;i<limited.length;i++){
        const p = limited[i];
        if(!p) { prepared.push(null); continue; }
        try{ const dataUrl = await prepareImageWithFilter(p, currentFilter); prepared.push(dataUrl); }catch(e){ prepared.push(p); }
      }

      await window.StripComposer.composeAndDownload(layoutCount, prepared, captionInput.value || '', 'potobut-strip.png');
      try{ sessionStorage.removeItem('potobut_photos'); }catch(e){}
    }catch(err){ console.error('compose/download failed', err); alert('Failed to create strip.'); }
  });

  // old per-slot draw helper removed — composition is handled by StripComposer

  btnBack.addEventListener('click', ()=>{ if(window.history.length>1) window.history.back(); else window.location.href = '/poto'; });
  btnAgain.addEventListener('click', ()=>{ // reset to start (layout): clear flow state and navigate
    try{ sessionStorage.removeItem('potobut_photos'); localStorage.removeItem('potobut_mode'); localStorage.removeItem('potobut_layout'); }catch(e){}
    window.location.href = '/pilih-layout';
  });

  // initial UI state
  // select default filter button
  const def = Array.from(filterBtns).find(b=>b.getAttribute('data-filter')==='normal'); if(def) def.classList.add('ring-2','ring-red-500','shadow-md');
  const defPat = Array.from(patternOptions).find(p=>p.getAttribute('data-pattern')==='plain'); if(defPat) defPat.classList.add('ring-2','ring-red-500','shadow-md');
  renderStrip();
});
