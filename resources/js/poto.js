document.addEventListener('DOMContentLoaded', function(){
  const content = document.getElementById('potoContent');
  const status = document.getElementById('potoStatus');
  const btnBack = document.getElementById('btnBack');
  const btnNext = document.getElementById('btnNext');
  let mode = null;
  // derive a single numeric layoutCount from localStorage (guard against non-numeric values)
  const _layoutRaw = localStorage.getItem('potobut_layout') || '2';
  const layoutCount = parseInt(String(_layoutRaw).replace(/\D/g, ''), 10) || 2;
  let layout = String(layoutCount);
  let stream = null;
  let cameraActive = false;
  
  function setStatus(text){ if(status) status.textContent = 'Status: ' + text; }

  function createCameraUI(){
    content.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'flex flex-col items-center space-y-4';

    const preview = document.createElement('div');
    preview.className = 'w-full max-w-md bg-gray-100 rounded-lg p-2 flex items-center justify-center';
    preview.style.minHeight = '220px';
    // allow absolutely-positioned countdown overlay
    preview.style.position = 'relative';
    preview.id = 'cameraPreview';
    preview.innerHTML = '<div class="text-red-300">Camera preview will appear here</div>';

    // Helper to compute net horizontal scale (scaleX) from ancestor transforms
    function getScaleXFromTransform(transform){
      if(!transform || transform === 'none') return 1;
      const m = transform.match(/matrix\(([^)]+)\)/);
      if(m && m[1]){
        const a = parseFloat(m[1].split(',')[0]);
        return isNaN(a) ? 1 : a;
      }
      if(transform.includes('scaleX')){
        const sx = transform.match(/scaleX\((-?\d+(?:\.\d+)?)\)/);
        if(sx && sx[1]) return parseFloat(sx[1]);
      }
      if(transform.includes('scale(')){
        const s = transform.match(/scale\((-?\d+(?:\.\d+)?)(?:,\s*-?\d+(?:\.\d+)?)?\)/);
        if(s && s[1]) return parseFloat(s[1]);
      }
      return 1;
    }

    function computeNetScaleX(el){
      let node = el.parentElement; // start from preview's parent chain (exclude video itself)
      let net = 1;
      while(node && node.nodeType === 1){
        const cs = window.getComputedStyle(node).transform || 'none';
        const sx = getScaleXFromTransform(cs);
        net *= sx;
        node = node.parentElement;
      }
      return net;
    }

    function recomputePreviewFlip(videoEl){
      try{
        const net = computeNetScaleX(preview);
        if(net < 0){
          // apply flip explicitly and force priority to override external CSS
          videoEl.style.setProperty('transform', 'scaleX(-1)', 'important');
          videoEl.style.setProperty('-webkit-transform', 'scaleX(-1)', 'important');
          videoEl.style.setProperty('-ms-transform', 'scaleX(-1)', 'important');
        } else {
          // ensure no mirror on preview by forcing scaleX(1) with high priority
          videoEl.style.setProperty('transform', 'scaleX(1)', 'important');
          videoEl.style.setProperty('-webkit-transform', 'scaleX(1)', 'important');
          videoEl.style.setProperty('-ms-transform', 'scaleX(1)', 'important');
        }
        videoEl.style.setProperty('transform-origin', 'center', 'important');
      }catch(e){}
    }

    // helper to determine if current stream is front-facing (user)
    function isFrontFacing(streamObj){
      try{
        if(!streamObj || !streamObj.getVideoTracks) return false;
        const tracks = streamObj.getVideoTracks();
        if(!tracks || !tracks.length) return false;
        const settings = tracks[0].getSettings && tracks[0].getSettings();
        return !!(settings && (settings.facingMode === 'user' || settings.facingMode === 'front'));
      }catch(e){ return false; }
    }

    const controls = document.createElement('div');
    controls.className = 'flex items-center gap-3';

    // optional canvas-based preview (used when browser/CSS forces a mirrored video element)
    let previewCanvas = null;
    let previewCanvasCtx = null;
    let previewLoopId = null;
    // reusable capture canvas to avoid repeated allocations
    let captureCanvas = null;
    let captureCtx = null;
    let captureWidth = 0;
    let captureHeight = 0;
    // debounce timer for sessionStorage writes
    let saveTimeout = null;

    function startPreviewLoop(videoEl, unflip) {
      if(!previewCanvas){
        previewCanvas = document.createElement('canvas');
        previewCanvas.className = videoEl.className;
        // make canvas cover the preview area absolutely
        previewCanvas.style.position = 'absolute';
        previewCanvas.style.left = '0';
        previewCanvas.style.top = '0';
        previewCanvas.style.width = '100%';
        previewCanvas.style.height = '100%';
        previewCanvas.style.borderRadius = 'inherit';
        previewCanvas.style.objectFit = 'cover';
        // match preview background so canvas doesn't appear black initially
        try{ previewCanvas.style.background = window.getComputedStyle(preview).backgroundColor || 'transparent'; }catch(e){ previewCanvas.style.background = 'transparent'; }
        previewCanvasCtx = previewCanvas.getContext('2d');
        // insert canvas in preview area above the video
        preview.appendChild(previewCanvas);
      }

      function loop(){
        try{
          if(videoEl.videoWidth && videoEl.videoHeight){
            if(previewCanvas.width !== videoEl.videoWidth || previewCanvas.height !== videoEl.videoHeight){
              previewCanvas.width = videoEl.videoWidth;
              previewCanvas.height = videoEl.videoHeight;
            }
            // draw unflipped frame if requested
            if(unflip){
              previewCanvasCtx.save();
              previewCanvasCtx.translate(previewCanvas.width, 0);
              previewCanvasCtx.scale(-1, 1);
              previewCanvasCtx.drawImage(videoEl, 0, 0, previewCanvas.width, previewCanvas.height);
              previewCanvasCtx.restore();
            } else {
              previewCanvasCtx.drawImage(videoEl, 0, 0, previewCanvas.width, previewCanvas.height);
            }
          }
        }catch(e){}
        previewLoopId = requestAnimationFrame(loop);
      }
      if(!previewLoopId) loop();
    }

    function stopPreviewLoop(videoEl){ 
      try{ if(previewLoopId){ cancelAnimationFrame(previewLoopId); previewLoopId = null; } }catch(e){}
      try{ if(previewCanvas){ previewCanvas.remove(); previewCanvas = null; previewCanvasCtx = null; } }catch(e){}
      try{ if(videoEl){ videoEl.style.removeProperty('opacity'); videoEl.style.removeProperty('pointer-events'); } }catch(e){}
      // also release capture canvas when stopping preview to free memory
      try{ captureCanvas = null; captureCtx = null; captureWidth = 0; captureHeight = 0; }catch(e){}
    }

    const btnStart = document.createElement('button');
    btnStart.className = 'px-6 py-2 rounded-full bg-red-500 text-white font-semibold transition duration-200 ease-in-out transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
    btnStart.textContent = 'START';

    const btnRetake = document.createElement('button');
    btnRetake.className = 'px-6 py-2 rounded-full bg-transparent border border-red-200 text-red-700 font-semibold transition duration-200 ease-in-out transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
    btnRetake.textContent = 'RETAKE';
    btnRetake.disabled = true;

    // photos array and helpers
    const photos = [];
    const maxPhotos = layoutCount;
    
    // countdown state
    let countdownActive = false;
    let countdownAbort = false;

    function updateControls(){
      // status: only these three states
      if(photos.length === 0){
        setStatus('idle');
      } else if(photos.length < maxPhotos){
        setStatus(`taking photos (${photos.length} / ${maxPhotos})`);
      } else {
        setStatus('completed');
      }

      // START disabled when we've reached exact layout count
      btnStart.disabled = photos.length >= maxPhotos;

      // RETAKE active only when exactly equal to layout count
      btnRetake.disabled = !(photos.length === maxPhotos);

      // NEXT active only when exactly equal
      if(photos.length === maxPhotos){
        btnNext.disabled = false; btnNext.classList.add('cursor-pointer');
      } else {
        btnNext.disabled = true; btnNext.classList.remove('cursor-pointer');
      }

      // persist current photos to sessionStorage so Edit step can read them
      // debounce writes to avoid frequent large string serializations
      try{ if(saveTimeout) clearTimeout(saveTimeout); saveTimeout = setTimeout(()=>{ try{ sessionStorage.setItem('potobut_photos', JSON.stringify(photos)); }catch(e){} }, 300); }catch(e){}

      // when the required photos are taken, enable RETAKE and NEXT and let the user decide
      // do NOT auto-navigate — allow user to review/retake first
    }

    function renderPreviews(){
      // remove existing preview container if any
      let container = document.getElementById('potoPreviewContainer');
      if(container) container.remove();
      if(photos.length === 0) return;
      // outer container centers the gallery
      container = document.createElement('div');
      container.id = 'potoPreviewContainer';
      container.className = 'w-full flex justify-center mt-6';

      // gallery holds thumbnails and can wrap responsively
      const gallery = document.createElement('div');
      gallery.id = 'potoPreviewGallery';
      gallery.className = 'flex gap-3 px-2 flex-wrap justify-center';

      photos.forEach((dataUrl, idx)=>{
        const imgWrap = document.createElement('div');
        imgWrap.className = 'w-24 h-32 rounded-md overflow-hidden shadow-sm flex-shrink-0 transform transition duration-200 hover:scale-105 hover:shadow-md';
        imgWrap.setAttribute('data-aos','fade-up');
        imgWrap.setAttribute('data-aos-delay', String(100 + idx*60));
        const img = document.createElement('img');
        img.src = dataUrl; img.className = 'w-full h-full object-cover cursor-pointer';
        img.style.transform = 'none';
        // click to zoom
        img.addEventListener('click', (e)=>{ showZoom(dataUrl); });
        imgWrap.appendChild(img);
        gallery.appendChild(imgWrap);
      });
      container.appendChild(gallery);
      content.appendChild(container);
      if(window.AOS) AOS.refresh();
    }

    // zoom overlay helpers
    let currentZoomOverlay = null;
    function showZoom(src){
      // create overlay styled to match Potobut theme
      if(currentZoomOverlay) return;
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-[#0B1C2D]/80';
      overlay.style.backdropFilter = 'blur(3px)';

      const inner = document.createElement('div');
      inner.className = 'relative bg-[#F8FAFC] rounded-xl shadow-xl border border-white/20 p-4 max-w-[90vw] max-h-[90vh] flex items-center justify-center';

      const img = document.createElement('img');
      img.src = src;
      img.alt = 'preview';
      img.className = 'rounded-lg w-auto h-auto max-w-[90vw] max-h-[90vh] opacity-0 scale-95 transition-all duration-200 ease-in-out';

      // animate in (fade + scale)
      requestAnimationFrame(()=>{ img.classList.remove('opacity-0','scale-95'); img.classList.add('opacity-100','scale-100'); });

      // close on click outside
      overlay.addEventListener('click', (ev)=>{ if(ev.target === overlay) closeZoom(); });

      // close button styled to theme (red) and subtle
      const btnClose = document.createElement('button');
      btnClose.className = 'absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-md hover:bg-red-600 transition cursor-pointer';
      btnClose.innerHTML = '&#10005;';
      btnClose.addEventListener('click', closeZoom);

      inner.appendChild(img);
      inner.appendChild(btnClose);
      overlay.appendChild(inner);
      document.body.appendChild(overlay);
      currentZoomOverlay = overlay;

      // ESC to close
      function onKey(e){ if(e.key === 'Escape') closeZoom(); }
      document.addEventListener('keydown', onKey);
      overlay._cleanup = ()=>{ document.removeEventListener('keydown', onKey); };
    }

    function closeZoom(){
      if(!currentZoomOverlay) return;
      const ov = currentZoomOverlay;
      if(ov._cleanup) ov._cleanup();
      ov.remove();
      currentZoomOverlay = null;
    }

    function createCountdownOverlay(){
      const overlay = document.createElement('div');
      overlay.className = 'absolute inset-0 flex items-center justify-center pointer-events-none';
      // mark overlay so it can be reliably removed later
      overlay.setAttribute('data-countdown-overlay','1');
      overlay.style.zIndex = 30;
      const num = document.createElement('div');
      num.className = 'text-red-600 font-extrabold text-6xl sm:text-7xl';
      overlay.appendChild(num);
      return { overlay, num };
    }

    function waitForVideoReady(video, timeout = 3000){
      return new Promise((resolve, reject)=>{
        let done = false;
        function checkReady(){
          if(video.videoWidth > 0 && video.videoHeight > 0){ done = true; resolve(); }
        }
        const onCan = ()=>{ checkReady(); };
        video.addEventListener('canplay', onCan, { once: true });
        video.addEventListener('loadedmetadata', onCan, { once: true });
        checkReady();
        const to = setTimeout(()=>{ if(!done) reject(new Error('video not ready')); }, timeout);
      });
    }

    async function runCountdown(previewEl){
      // returns true if completed, false if aborted
      if(countdownActive) return false;
      countdownActive = true; countdownAbort = false;
      const { overlay, num } = createCountdownOverlay();
      previewEl.appendChild(overlay);
      // while countdown runs, keep preview flip recalculated (handles animations)
      let flipInterval = null;
      const _videoEl = previewEl.querySelector('video');
      if(_videoEl){
        try{ flipInterval = setInterval(()=>{ try{ recomputePreviewFlip(_videoEl); }catch(e){} }, 150); }catch(e){}
      }
      // numbers 3,2,1 with ~1s each
      const sequence = [3,2,1];
      for(const n of sequence){
        if(countdownAbort) break;
        num.textContent = String(n);
        await new Promise((res)=> setTimeout(res, 1000));
      }
      // remove overlay
      overlay.remove();
      if(flipInterval){ clearInterval(flipInterval); flipInterval = null; }
      const aborted = countdownAbort;
      countdownActive = false; countdownAbort = false;
      return !aborted;
    }

    async function captureOnce(){
      if(!cameraActive || !stream) return;
      // guard: don't capture beyond allowed
      if(photos.length >= maxPhotos) return;
      try{
        const video = preview.querySelector('video');
        if(!video) return;
        // reuse capture canvas to reduce allocations
        if(!captureCanvas){ captureCanvas = document.createElement('canvas'); captureCtx = captureCanvas.getContext('2d'); }
        const w = video.videoWidth || 1280;
        const h = video.videoHeight || 720;
        if(captureWidth !== w || captureHeight !== h){ captureCanvas.width = w; captureCanvas.height = h; captureWidth = w; captureHeight = h; }
        const ctx = captureCtx;
        // Ensure preview flip is up-to-date (handles animations during countdown)
        try{ recomputePreviewFlip(video); }catch(e){}

        // Decide whether to unflip the captured image based on the media track facingMode.
        // Relying on facingMode is more stable across CSS/animation transforms.
        let shouldUnflip = false;
        try{ shouldUnflip = isFrontFacing(stream); }catch(e){}

        if(previewCanvas && previewCanvasCtx){
          // capture from the unmirrored preview canvas for exact WYSIWYG
          ctx.drawImage(previewCanvas, 0, 0, captureCanvas.width, captureCanvas.height);
        } else if(shouldUnflip){
          ctx.save();
          ctx.translate(captureCanvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
          ctx.restore();
        } else {
          // normal draw from video
          ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
        }
        const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.85);
        photos.push(dataUrl);
        renderPreviews();
        updateControls();
      }catch(err){ console.error('capture error', err); }
    }

    btnStart.addEventListener('click', async function(){
      // prevent multiple triggers
      if(btnStart.disabled) return;
      btnStart.disabled = true; btnStart.setAttribute('aria-busy','true');
      // if camera not active, request and start then capture one frame
      if(!cameraActive){
        try{
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
          const video = document.createElement('video');
          video.autoplay = true; video.playsInline = true; video.muted = true; video.srcObject = stream;
          video.className = 'w-full h-auto rounded-md';
          // ensure camera preview is not mirrored: compute net horizontal scale across
          // the preview container's ancestors and then set an inline transform
          // on the video to cancel any ancestor mirroring. We also ensure this
          // is re-evaluated before capture so countdown/animations don't leave
          // the preview in a mirrored state.
          // ensure preview flip is computed once (recomputePreviewFlip already enforces inline transform)
          recomputePreviewFlip(video);
          // attach and wait until truly ready (avoid black frames)
          preview.innerHTML = ''; preview.appendChild(video);
          try{
            await waitForVideoReady(video, 4000);
          }catch(e){
            // if video didn't become ready, throw to outer handler
            throw e;
          }

          // decide whether preview should be unflipped (front-facing camera typical)
          let previewShouldUnflip = false;
          try{ previewShouldUnflip = isFrontFacing(stream); }catch(e){}

          // start canvas-based preview (WYSIWYG) and hide raw video element
          try{
            startPreviewLoop(video, previewShouldUnflip);
            // hide raw video visually but keep it playing (do NOT use display:none)
            try{ video.style.setProperty('opacity','0','important'); video.style.setProperty('pointer-events','none','important'); }catch(e){}
          }catch(e){}

          cameraActive = true;
          // run countdown then capture
          const ok = await runCountdown(preview);
          if(ok){ await captureOnce(); }
        }catch(err){
          console.error(err);
          // soft message in preview area; allow retry
          setStatus('idle');
          preview.innerHTML = '<div class="text-sm text-red-600">Cannot access camera. Please allow camera access or choose Gallery mode.</div>';
        } finally {
          btnStart.removeAttribute('aria-busy');
          updateControls();
        }
      } else {
        // already active -> run countdown then capture
        if(countdownActive) { btnStart.removeAttribute('aria-busy'); return; }
        const ok = await runCountdown(preview);
        if(ok){ await captureOnce(); }
        updateControls();
      }
    });

    btnRetake.addEventListener('click', function(){
      // abort any countdown
      countdownAbort = true;
      countdownActive = false;
      // reset photos and previews
      photos.length = 0;
      renderPreviews();
      // stop stream if active
      try{ const v = preview.querySelector('video'); stopPreviewLoop(v); }catch(e){}
      try{ if(stream){ stream.getTracks().forEach(t=>t.stop()); stream = null; } }catch(e){}
      // release capture canvas memory
      try{ captureCanvas = null; captureCtx = null; captureWidth = 0; captureHeight = 0; }catch(e){}
      cameraActive = false;
      // remove any leftover countdown overlay safely
      const ov = preview.querySelector('[data-countdown-overlay]'); if(ov) ov.remove();
      preview.innerHTML = '<div class="text-red-300">Camera preview will appear here</div>';
      // reset controls and status
      updateControls();
      setStatus('idle');
    });

    controls.appendChild(btnStart);
    controls.appendChild(btnRetake);
    wrap.appendChild(preview);
    wrap.appendChild(controls);
    content.appendChild(wrap);
    updateControls();
  }

  function createGalleryUI(){
    content.innerHTML = '';
    const boxes = parseInt(layout,10) || 2;
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl mx-auto';
    // photos array to mirror camera behavior; index-based
    const photos = new Array(boxes).fill(null);
    // gallery-level helpers
    function galleryUpdateControls(){
      const selectedCount = photos.filter(Boolean).length;
      if(selectedCount === 0) setStatus('idle');
      else if(selectedCount < boxes) setStatus(`taking photos (${selectedCount} / ${boxes})`);
      else setStatus('completed');

      if(selectedCount === boxes){ btnNext.disabled = false; btnNext.classList.add('cursor-pointer'); }
      else { btnNext.disabled = true; btnNext.classList.remove('cursor-pointer'); }

      try{ sessionStorage.setItem('potobut_photos', JSON.stringify(photos)); }catch(e){}

      // do not auto-navigate on gallery completion; allow user to review and retake
    }

    for(let i=0;i<boxes;i++){
      const box = document.createElement('label');
      box.className = 'flex flex-col items-center justify-center p-6 rounded-xl bg-red-100 text-[#0F172A] cursor-pointer border border-transparent';
      // stable placeholder (.slot-placeholder) so we can reliably replace it later
      box.innerHTML = '<input type="file" accept="image/*" class="hidden file-input" data-index="'+i+'">'
        + '<div class="w-full h-36 bg-white/60 rounded-lg flex items-center justify-center slot-placeholder"> <div class="text-red-400">+</div></div>'
        + '<div class="mt-2 text-sm">Upload photo</div>';
      const input = box.querySelector('input');
      // ensure only one change listener per input (we're creating inputs here)
      input.addEventListener('change', function(e){
        const file = e.target.files[0];
        if(!file) return;
        // create preview image (contain to avoid unwanted crop)
        const img = document.createElement('img');
        img.className = 'w-full h-36 object-contain rounded-lg';
        // read as data URL so it persists across navigation
        const reader = new FileReader();
        reader.onload = function(ev){
          img.src = ev.target.result;
          // store in photos array at index (replace, not push)
          const idx = parseInt(input.getAttribute('data-index'), 10);
          photos[idx] = img.src;
          // update gallery controls (persistence, status, auto-nav)
          galleryUpdateControls();
        };
        reader.readAsDataURL(file);
        // replace stable placeholder or existing preview (no stacking)
        const placeholder = box.querySelector('.slot-placeholder');
        if(placeholder){
          placeholder.replaceWith(img);
        } else {
          const existingImg = box.querySelector('img');
          if(existingImg) existingImg.replaceWith(img);
          else {
            // fallback: insert before caption
            const caption = box.querySelector('.mt-2');
            if(caption) box.insertBefore(img, caption);
            else box.appendChild(img);
          }
        }
        box.classList.add('ring-2','ring-red-500');
        // reset input value so same file can be re-selected later if needed (after reader finishes)
        reader.onloadend = function(){ try{ input.value = ''; }catch(e){} };
      });
      // native label behavior will trigger the file picker (input is inside label)
      grid.appendChild(box);
    }
    content.appendChild(grid);
    setStatus('idle');
  }

  // read mode preference
  try{ mode = localStorage.getItem('potobut_mode') || 'snap'; }catch(e){ mode = 'snap'; }

  if(mode === 'select'){
    createGalleryUI();
  } else {
    createCameraUI();
  }

  // safe navigation helpers (match earlier pattern)
  function safeNavigate(el, to){
    const blockKey = '__isNavigating'; if(window[blockKey]) return; window[blockKey]=true; try{ el.disabled=true; el.setAttribute('aria-busy','true'); }catch(e){}
    try{ window.history.replaceState({step:'poto'}, '', window.location.pathname); }catch(e){}
    const container = document.querySelector('.card-container'); if(container) container.classList.add('transition','duration-200','opacity-0');
    setTimeout(()=> window.location.href = to, 220);
  }

  if(btnBack){ btnBack.addEventListener('click', ()=>{ if(window.history.length>1){ window.history.back(); } else { safeNavigate(btnBack,'/mode'); } }); }

  if(btnNext){ btnNext.addEventListener('click', ()=>{ if(btnNext.disabled) return; // check conditions
    // if camera mode require cameraActive
    if(mode === 'snap' && !cameraActive) return;
    // if gallery mode ideally check uploads - kept simple: allow if not disabled
    safeNavigate(btnNext, '/edit');
  }); }

  // ensure AOS refresh
  if(window.AOS) AOS.refresh();

});
