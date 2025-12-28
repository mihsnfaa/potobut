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
  let currentBg = bgColor ? bgColor.value : '#fff5f7';

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
    cap.className = 'mt-2 text-xs text-[#2b0505] text-center font-medium';
    cap.style.paddingTop = '6px';
    cap.textContent = captionInput.value || '';
    wrap.appendChild(cap);
    return wrap;
  }

  function renderStrip(){
    previewStrip.innerHTML = '';
    previewStrip.style.background = currentBg;
    // apply pattern as background-image if needed
    previewStrip.style.backgroundImage = '';
    if(currentPattern === 'polka'){
      previewStrip.style.backgroundImage = 'radial-gradient(circle at 10px 10px, rgba(0,0,0,0.04) 2px, transparent 3px)';
      previewStrip.style.backgroundSize = '24px 24px';
    } else if(currentPattern === 'stripes'){
      previewStrip.style.backgroundImage = 'repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0 6px, transparent 6px 12px)';
    } else if(currentPattern === 'dots-min'){
      previewStrip.style.backgroundImage = 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.03) 1px, transparent 2px)';
      previewStrip.style.backgroundSize = '16px 16px';
    }

    // choose image height based on layout count (portrait proportions)
    const heightMap = {2:360, 3:240, 4:180};
    const imgHeight = heightMap[layoutCount] || 240;
    for(let i=0;i<layoutCount;i++){
      const src = photos[i] || null;
      if(src){
        const node = createPreview(src, i, imgHeight);
        // apply current filter
        applyFilterToElement(node, currentFilter);
        previewStrip.appendChild(node);
      } else {
        // placeholder empty slot sized consistently
        const ph = document.createElement('div');
        ph.className = 'w-full rounded-lg bg-white/60 border border-white/10 flex items-center justify-center text-red-300 flex-shrink-0';
        ph.style.height = imgHeight + 'px';
        ph.textContent = '+';
        previewStrip.appendChild(ph);
      }
    }
    // caption (we'll show caption below composed preview)
    captionText.textContent = '';

    // render composed strip preview image (small) but don't replace slot previews
    renderCompositePreview();
  }

  async function composeStripCanvas(outWidth){
    // load strip template matching layout
    const stripSrc = `/templates/strip-${layoutCount}.png`;
    const stripImg = await new Promise((res,rej)=>{ const i=new Image(); i.crossOrigin='anonymous'; i.onload=()=>res(i); i.onerror=()=>rej(new Error('strip load')); i.src = stripSrc; });
    const canvas = document.createElement('canvas');
    canvas.width = stripImg.naturalWidth; canvas.height = stripImg.naturalHeight;
    const ctx = canvas.getContext('2d');

    // compute layout for slots (relative margins)
    const marginX = Math.round(canvas.width * 0.06);
    const marginY = Math.round(canvas.height * 0.06);
    const spacing = Math.max(8, Math.round(canvas.height * 0.02));
    const slotW = canvas.width - marginX*2;
    const slotH = Math.floor((canvas.height - marginY*2 - spacing*(layoutCount-1)) / layoutCount);

    // draw photos first into slots
    let y = marginY;
    for(let i=0;i<layoutCount;i++){
      const src = photos[i];
      if(src){ await drawImageToCanvas(ctx, src, marginX, y, slotW, slotH, currentFilter); }
      y += slotH + spacing;
    }

    // overlay the strip artwork on top so frames/decals show through
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(stripImg, 0, 0, canvas.width, canvas.height);

    // if outWidth requested, produce scaled canvas
    if(outWidth && outWidth < canvas.width){ const s = outWidth / canvas.width; const out = document.createElement('canvas'); out.width = outWidth; out.height = Math.round(canvas.height * s); const octx = out.getContext('2d'); octx.drawImage(canvas,0,0,out.width,out.height); return out; }
    return canvas;
  }

  async function renderCompositePreview(){
    // create a small preview and insert into previewStrip
    try{
      const previewCanvas = await composeStripCanvas(360);
      const img = document.createElement('img'); img.src = previewCanvas.toDataURL('image/png'); img.className = 'rounded-md shadow-sm'; img.style.maxWidth = '100%';
      // keep original slot previews; place composed thumbnail into dedicated holder in the blade
      let holder = document.getElementById('composedPreviewHolder');
      if(!holder){
        // fallback to legacy container appended inside previewStrip (rare)
        let container = document.getElementById('composedPreviewContainer');
        if(!container){ container = document.createElement('div'); container.id = 'composedPreviewContainer'; container.className = 'mt-4 w-full flex items-center justify-center'; previewStrip.appendChild(container); }
        container.innerHTML = '';
        container.appendChild(img);
      } else {
        holder.innerHTML = '';
        holder.appendChild(img);
      }
      // caption below
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
    // apply to existing nodes
    const nodes = previewStrip.querySelectorAll('div');
    nodes.forEach(n=> applyFilterToElement(n, currentFilter));
  }));

  captionInput.addEventListener('input', (e)=>{
    const v = e.target.value || '';
    if(v.length > 10){ e.target.value = v.slice(0,10); }
    captionCount.textContent = String((e.target.value||'').length);
    // update caption under each preview node
    const caps = previewStrip.querySelectorAll('div > div.mt-2');
    caps.forEach(c=> c.textContent = e.target.value);
    captionText.textContent = '';
  });

  // Download: compose a simple vertical canvas
  btnDownload.addEventListener('click', async function(){
    try{
      const composed = await composeStripCanvas();
      // draw caption onto composed canvas bottom area
      const ctx = composed.getContext('2d');
      ctx.fillStyle = '#2b0505'; ctx.font = '28px system-ui, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText((captionInput.value||''), composed.width/2, composed.height - 40);
      const link = document.createElement('a'); link.download = 'potobut.png'; link.href = composed.toDataURL('image/png'); link.click();
      try{ sessionStorage.removeItem('potobut_photos'); }catch(e){}
    }catch(err){ console.error('compose/download failed', err); }
  });

  async function drawImageToCanvas(ctx, src, x, y, w, h, filter){
    return new Promise((resolve)=>{
      const img = new Image(); img.crossOrigin = 'anonymous'; img.onload = function(){
        // apply filter
        switch(filter){
          case 'warm': ctx.filter = 'sepia(0.25) contrast(1.05) saturate(1.1)'; break;
          case 'cool': ctx.filter = 'brightness(0.98) contrast(1.02) hue-rotate(200deg)'; break;
          case 'vintage': ctx.filter = 'sepia(0.5) contrast(1.05) saturate(0.9)'; break;
          case 'bw': ctx.filter = 'grayscale(1) contrast(1.05)'; break;
          default: ctx.filter = 'none';
        }
        // ensure transform reset (no mirror)
        ctx.setTransform(1,0,0,1,0,0);
        // cover fit: draw image proportionally to cover box
        const ratio = Math.max(w / img.width, h / img.height);
        const nw = img.width * ratio; const nh = img.height * ratio;
        const dx = x - (nw - w)/2; const dy = y - (nh - h)/2;
        ctx.drawImage(img, dx, dy, nw, nh);
        ctx.filter = 'none';
        resolve();
      };
      img.onerror = ()=> resolve();
      img.src = src;
    });
  }

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
