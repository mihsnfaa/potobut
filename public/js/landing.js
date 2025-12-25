document.addEventListener('DOMContentLoaded', function () {
    const starsContainer = document.getElementById('stars');
    if (!starsContainer) return;

    const STAR_COUNT = 120;
    for (let i = 0; i < STAR_COUNT; i++) {
        const s = document.createElement('span');
        s.className = 'star';
        const size = Math.random() * 2 + 1; // 1-3px
        s.style.width = size + 'px';
        s.style.height = size + 'px';
        s.style.left = Math.random() * 100 + '%';
        s.style.top = Math.random() * 100 + '%';
        s.style.opacity = (Math.random() * 0.8 + 0.2).toString();
        s.style.transform = 'translateZ(0)';
        s.style.animation = `twinkle ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 3}s infinite`;
        starsContainer.appendChild(s);
    }

    // Button interactions
    const btn = document.getElementById('startBtn');
    if (btn) {
        btn.addEventListener('click', function (e) {
            // simple feedback animation
            btn.animate(
                [
                    { transform: 'scale(1)', opacity: 1 },
                    { transform: 'scale(0.98)', opacity: 0.9 },
                    { transform: 'scale(1)', opacity: 1 }
                ],
                { duration: 300 }
            );
            // You can change this to navigate or open modal
        });

        btn.addEventListener('mouseenter', function () {
            btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }], { duration: 180, fill: 'forwards' });
        });
        btn.addEventListener('mouseleave', function () {
            btn.animate([{ transform: 'scale(1.05)' }, { transform: 'scale(1)' }], { duration: 180, fill: 'forwards' });
        });
    }
});
