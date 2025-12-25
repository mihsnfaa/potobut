document.addEventListener('DOMContentLoaded', function () {
  const cards = document.querySelectorAll('.layout-card');
  const selectedStatus = document.getElementById('selectedStatus');
  const btnNext = document.getElementById('btnNext');
  const btnBack = document.getElementById('btnBack');
  let selected = null;

  function updateUI(){
    cards.forEach(c => {
      const isActive = (c.dataset.value === selected);
      // remove any previous utility classes
      c.classList.remove('ring-2','ring-red-500','border-2','border-red-500','shadow-2xl','-translate-y-1');
      if(isActive){
        c.classList.add('ring-2','ring-red-500','border-2','border-red-500','shadow-2xl','-translate-y-1');
      }
    });
    if(!selected){
      selectedStatus.textContent = 'Selected: none';
      if(btnNext){
        btnNext.disabled = true;
        // remove active/hover classes
        btnNext.classList.remove('hover:bg-red-600','active:bg-red-700','hover:shadow-xl','transition','transform','duration-200','ease-out','hover:-translate-y-1','cursor-pointer');
      }
    } else {
      selectedStatus.textContent = 'Selected: ' + selected + ' photos';
      if(btnNext){
        btnNext.disabled = false;
        // add active/hover classes similar to start button
        btnNext.classList.add('hover:bg-red-600','active:bg-red-700','hover:shadow-xl','transition','transform','duration-200','ease-out','hover:-translate-y-1','cursor-pointer');
      }
    }
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      selected = card.dataset.value;
      updateUI();
    });
    card.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });

  // ensure AOS refresh if available
  if(window.AOS) { AOS.refresh(); }

  // initial UI
  updateUI();

  // navigation helper to prevent spam clicks and history pollution
  function safeNavigate(el, navigateTo, options = {}){
    const blockKey = '__isNavigating';
    const delay = options.delay || 220;
    if(window[blockKey]) return;
    window[blockKey] = true;
    try{ el.disabled = true; el.setAttribute('aria-busy','true'); }catch(e){}
    // replace current history entry state (avoid repeated pushes)
    try{ window.history.replaceState({step:'pilih-layout'}, '', window.location.pathname); }catch(e){}
    const container = document.querySelector('.card-container');
    if(container){ container.classList.add('transition','duration-200','opacity-0'); }
    setTimeout(()=>{
      // use location.href to create a single history entry; guard prevents duplicates
      window.location.href = navigateTo;
    }, delay);
  }

  if(btnBack){
    btnBack.addEventListener('click', ()=>{
      // prefer history.back if possible, with guard
      const blockKey = '__isNavigating';
      if(window[blockKey]) return;
      window[blockKey] = true;
      try{ btnBack.disabled = true; btnBack.setAttribute('aria-busy','true'); }catch(e){}
      if(window.history.length > 1){
        // go back one entry
        window.history.back();
      } else {
        // fallback to replace to avoid adding history spam
        safeNavigate(btnBack, '/');
      }
    });
  }

  if(btnNext){
    btnNext.addEventListener('click', ()=>{
      if(btnNext.disabled) return;
      safeNavigate(btnNext, '/mode');
    });
  }
});
