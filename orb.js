(function () {
  const canvas = document.getElementById("orbCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w = 0, h = 0, cx = 0, cy = 0, R = 0;
  let t = 0, energy = 0.28, base = 0.28, visible = true, raf = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const narrow = w < 700;
    cx = w / 2; cy = h * (narrow ? 0.2 : 0.42); R = Math.min(w, h) * (narrow ? 0.16 : 0.2);
    if (reduce) frame();
  }

  function loop(R0, i, tt, e) {
    const N = 160;
    ctx.beginPath();
    for (let k = 0; k <= N; k++) {
      const a = (k / N) * Math.PI * 2;
      const n =
        Math.sin(a * 3 + tt * 0.9 + i * 1.3) * 0.5 +
        Math.sin(a * 5 - tt * 1.2 + i * 0.7) * 0.3 +
        Math.sin(a * 8 + tt * 0.6 + i * 2.1) * 0.2;
      const r = R0 + n * R * 0.16 * e * (1 + i * 0.12);
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    energy += (base - energy) * 0.04;

    [1.7, 2.4, 3.2].forEach((m, i) => {
      ctx.beginPath();
      ctx.arc(cx, cy, R * m, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(248,250,252,${0.07 - i * 0.015})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    const g = ctx.createLinearGradient(cx - R * 1.4, cy, cx + R * 1.4, cy);
    g.addColorStop(0, "#2563ff");
    g.addColorStop(0.5, "#9db8ff");
    g.addColorStop(1, "#38bdf8");

    for (let i = 0; i < 7; i++) {
      loop(R * (1 + i * 0.025), i, t, energy);
      ctx.strokeStyle = g;
      ctx.globalAlpha = 0.16 + (i / 7) * 0.34;
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = g;
    ctx.lineWidth = 2.4;
    ctx.shadowColor = "rgba(37,99,255,0.7)";
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    const span = Math.min(w * 0.78, R * 6.2);
    for (let x = -span / 2; x <= span / 2; x += 3) {
      const env = Math.exp(-Math.pow(x / (span * 0.32), 2));
      const y = Math.sin(x * 0.06 + t * 2.2) * 14 * env * (0.4 + energy) +
                Math.sin(x * 0.17 - t * 3.1) * 6 * env * energy;
      const px = cx + x, py = cy + y;
      x === -span / 2 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    const lg = ctx.createLinearGradient(cx - span / 2, 0, cx + span / 2, 0);
    lg.addColorStop(0, "rgba(37,99,255,0)");
    lg.addColorStop(0.5, "rgba(190,210,255,0.95)");
    lg.addColorStop(1, "rgba(56,189,248,0)");
    ctx.strokeStyle = lg;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }

  function tick() {
    t += 0.016;
    frame();
    raf = visible ? requestAnimationFrame(tick) : 0;
  }

  window.addEventListener("resize", resize);
  resize();
  if (reduce) return;

  new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(tick);
  }).observe(canvas);
  raf = requestAnimationFrame(tick);

  window.KevotOrb = {
    pulse() { energy = 1.1; },
    listening(on) { base = on ? 0.62 : 0.28; }
  };
})();
