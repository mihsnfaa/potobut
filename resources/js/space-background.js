/* =========================================================
   POTOBUT – SPACE BACKGROUND (NO LIBRARY)
   Stars + Nebula + Parallax + Shooting Star
   Performance Friendly
========================================================= */

(function () {
  const DEFAULT_CONFIG = {
    enabled: true,

    // Base (NO WHITE)
    baseColor: '#050B18',

    // ⭐ Stars
    starCount: 260,
    starLayers: 3,
    // base fraction of screen (height) per second a star travels
    starSpeed: 0.03,
    starBrightness: 1.15,

    // 🌌 Nebula
    nebulaOpacity: 0.45,
    nebulaScale: 1.8,
    nebulaColors: [
      '#2563EB', // cosmic blue
      '#7C3AED', // nebula purple
      '#38BDF8', // galaxy cyan
      '#22D3EE'  // aurora
    ],

    // ☄️ Shooting star
    shootingStarEnabled: true,
    shootingStarFrequency: 0.004,

    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    autoDisableOnCamera: true
  };

  const Instance = {
    canvas: null,
    ctx: null,
    stars: [],
    nebulas: [],
    shootingStars: [],
    raf: null,
    lastTime: 0,
    config: { ...DEFAULT_CONFIG }
  };

  /* =========================
     INIT
  ========================= */

  function init(userConfig = {}) {
    destroy();

    Instance.config = { ...DEFAULT_CONFIG, ...userConfig };
    if (!Instance.config.enabled) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'space-background';
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';

    document.body.prepend(canvas);

    Instance.canvas = canvas;
    Instance.ctx = canvas.getContext('2d');

    resize();
    createStars();
    createNebulas();

    // initialize timing so first frame has small dt
    Instance.lastTime = performance.now();

    window.addEventListener('resize', resize);
    // stabilize animation clock when tab visibility changes
    document.addEventListener('visibilitychange', onVisibilityChange);

    Instance.raf = requestAnimationFrame(loop);
  }

  function destroy() {
    if (Instance.raf) cancelAnimationFrame(Instance.raf);
    if (Instance.canvas) Instance.canvas.remove();

    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', onVisibilityChange);

    Instance.stars = [];
    Instance.nebulas = [];
    Instance.shootingStars = [];
  }

  /* =========================
     RESIZE
  ========================= */

  function resize() {
    if (!Instance.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;

    // Set CSS size and backing buffer with DPR
    Instance.canvas.style.width = cssW + 'px';
    Instance.canvas.style.height = cssH + 'px';
    Instance.canvas.width = Math.max(1, Math.round(cssW * dpr));
    Instance.canvas.height = Math.max(1, Math.round(cssH * dpr));

    // Reset transform and scale to DPR so drawing uses CSS pixels
    Instance.ctx.setTransform(1, 0, 0, 1, 0, 0);
    Instance.ctx.scale(dpr, dpr);
  }

  /* =========================
     STARS
  ========================= */

  function createStars() {
    const { starCount, starLayers } = Instance.config;
    Instance.stars.length = 0;
    const starPalette = ['#2563EB', '#38BDF8', '#7C3AED'];
    const perLayer = Math.ceil(starCount / starLayers);
    const MAX_STARS = 600;
    const total = Math.min(starCount, MAX_STARS);
    for (let l = 0; l < starLayers; l++) {
      for (let i = 0; i < perLayer && Instance.stars.length < total; i++) {
        // speed is fraction of height per second; randomize per star
        const base = (l + 1) * (Instance.config.starSpeed || 0.03);
        const speed = base * (0.6 + Math.random() * 0.8);

        Instance.stars.push({
          x: Math.random(),
          y: Math.random(),
          r: Math.random() * 1.2 + 0.5, // CSS px
          speed: speed, // fraction per second
          brightness: Math.random() * 0.7 + 0.6,
          layer: l,
          color: starPalette[Math.floor(Math.random() * starPalette.length)]
        });
      }
    }
  }

  function drawStars(ctx, dt) {
    const cssW = Instance.canvas.clientWidth;
    const cssH = Instance.canvas.clientHeight;
    // dt is milliseconds; convert to seconds
    const dtSeconds = dt / 1000;

    for (let i = 0; i < Instance.stars.length; i++) {
      const s = Instance.stars[i];
      // update position using per-star speed (fraction of height per second)
      s.y += s.speed * dtSeconds;

      // wrap individually and preserve fractional offset to avoid mass alignment
      if (s.y > 1) {
        s.y = s.y - 1 + (Math.random() * 0.005); // small jitter on wrap
        // small horizontal jitter on wrap to avoid vertical lines
        s.x = (s.x + (Math.random() - 0.5) * 0.02 + 1) % 1;
      }

      const px = s.x * cssW;
      const py = s.y * cssH;

      const tw = Math.sin((Date.now() / 900) + s.x * 12) * 0.45 + 0.55;
      const alpha = (Instance.config.starBrightness || 0.8) * (0.45 + 0.55 * tw) * s.brightness;

      ctx.beginPath();
      ctx.fillStyle = hexToRgba(s.color, alpha);
      if (!Instance.config.reduceMotion) {
        ctx.shadowColor = hexToRgba(s.color, Math.min(0.9, alpha));
        ctx.shadowBlur = Math.min(8, s.r * 3);
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    // subtle color bloom (soft overlay)
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(56,189,248,0.03)';
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.restore();
  }

  /* =========================
     NEBULA
  ========================= */

  function createNebulas() {
    const count = 6;
    Instance.nebulas.length = 0;

    for (let i = 0; i < count; i++) {
      Instance.nebulas.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 0.4 + 0.3,
        color:
          Instance.config.nebulaColors[
            Math.floor(Math.random() * Instance.config.nebulaColors.length)
          ],
        drift: Math.random() * 0.00005 + 0.00002
      });
    }
  }

  function drawNebula(ctx, dt) {
    const cssW = Instance.canvas.clientWidth;
    const cssH = Instance.canvas.clientHeight;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (const n of Instance.nebulas) {
      n.x += n.drift * dt;
      if (n.x > 1.2) n.x = -0.2;

      const x = n.x * cssW;
      const y = n.y * cssH;
      const r = Math.min(cssW, cssH) * n.r * Instance.config.nebulaScale;

      const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, hexToRgba(n.color, 0.9));
      grd.addColorStop(0.25, hexToRgba(n.color, 0.45));
      grd.addColorStop(0.6, hexToRgba(n.color, 0.18));
      grd.addColorStop(1, hexToRgba(n.color, 0));

      ctx.fillStyle = grd;
      ctx.globalAlpha = Instance.config.nebulaOpacity;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /* =========================
     SHOOTING STAR
  ========================= */

  function spawnShootingStar() {
    Instance.shootingStars.push({
      x: Math.random(),
      y: Math.random() * 0.4,
      vx: Math.random() * 1.2 + 1,
      vy: Math.random() * 0.4 + 0.2,
      life: 0
    });
  }

  function drawShootingStars(ctx, dt) {
    if (Instance.config.shootingStarEnabled && Math.random() < Instance.config.shootingStarFrequency) {
      spawnShootingStar();
    }

    Instance.shootingStars = Instance.shootingStars.filter(s => {
      s.x += s.vx * dt * 0.0005;
      s.y += s.vy * dt * 0.0005;
      s.life += dt;

      const px = s.x * Instance.canvas.clientWidth;
      const py = s.y * Instance.canvas.clientHeight;

      ctx.strokeStyle = hexToRgba('#38BDF8', 0.9);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - 40, py - 10);
      ctx.stroke();

      return s.life < 800;
    });
  }

  /* =========================
     LOOP
  ========================= */

  function loop(time) {
    // Clamp deltaTime to avoid huge jumps after throttling/AFK
    const MAX_DT = 50; // ms
    let dt = time - Instance.lastTime;
    if (dt > MAX_DT) dt = MAX_DT;
    Instance.lastTime = time;

    const ctx = Instance.ctx;
    const cssW = Instance.canvas.clientWidth;
    const cssH = Instance.canvas.clientHeight;

    // fill with base color using CSS pixels
    ctx.fillStyle = Instance.config.baseColor;
    ctx.fillRect(0, 0, cssW, cssH);

    drawNebula(ctx, dt);
    drawStars(ctx, dt);
    drawShootingStars(ctx, dt);

    Instance.raf = requestAnimationFrame(loop);
  }

  function onVisibilityChange() {
    // Reset the clock when coming back to avoid a large dt burst
    if (document.visibilityState === 'visible') {
      Instance.lastTime = performance.now();
    }
  }

  function hexToRgba(hex, a) {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  /* =========================
     EXPORT
  ========================= */

  window.SpaceBackground = {
    init,
    destroy
  };

  // auto init
  document.addEventListener('DOMContentLoaded', () => {
    SpaceBackground.init();
  });
})();
