document.addEventListener('DOMContentLoaded', function () {
  const cards = document.querySelectorAll('.mode-card');
  const status = document.getElementById('modeStatus');
  const btnNext = document.getElementById('btnNext');
  const btnBack = document.getElementById('btnBack');
  let selected = null;

  function updateUI(){
    cards.forEach(c => {
      const isActive = (c.dataset.value === selected);
      c.classList.remove('ring-2','ring-red-500','border-2','border-red-500','shadow-2xl','-translate-y-1');
      if(isActive){
        c.classList.add('ring-2','ring-red-500','border-2','border-red-500','shadow-2xl','-translate-y-1');
      }
    });
    if(!selected){
      status.textContent = 'Mode: none';
      if(btnNext){ btnNext.disabled = true; btnNext.classList.remove('hover:bg-red-600','active:bg-red-700','hover:shadow-xl','transition','transform','duration-200','ease-out','hover:-translate-y-1','cursor-pointer'); }
    } else {
      status.textContent = 'Mode: ' + (selected === 'snap' ? 'Take a Picture' : 'Choose from Gallery');
      if(btnNext){ btnNext.disabled = false; btnNext.classList.add('hover:bg-red-600','active:bg-red-700','hover:shadow-xl','transition','transform','duration-200','ease-out','hover:-translate-y-1','cursor-pointer'); }
    }
  }

  cards.forEach(card => {
    card.addEventListener('click', () => { selected = card.dataset.value; updateUI(); });
    card.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); } });
  });

  if(window.AOS) { AOS.refresh(); }

  updateUI();

  // safe navigation helper
  function safeNavigate(el, to, opts = {}){
    const blockKey = '__isNavigating';
    if(window[blockKey]) return;
    window[blockKey] = true;
    try{ el.disabled = true; el.setAttribute('aria-busy','true'); }catch(e){}
    try{ window.history.replaceState({step:'mode'}, '', window.location.pathname); }catch(e){}
    const container = document.querySelector('.card-container');
    if(container){ container.classList.add('transition','duration-200','opacity-0'); }
    setTimeout(()=>{ window.location.href = to; }, opts.delay || 220);
  }

  if(btnBack){
    btnBack.addEventListener('click', ()=>{
      if(window.history.length > 1){
        // go back safely
        const blockKey = '__isNavigating'; if(window[blockKey]) return; window[blockKey] = true; window.history.back();
      } else {
        safeNavigate(btnBack, '/pilih-layout');
      }
    });
  }

  if(btnNext){
    btnNext.addEventListener('click', ()=>{
      if(btnNext.disabled) return;
      safeNavigate(btnNext, '/poto');
    });
  }
});
