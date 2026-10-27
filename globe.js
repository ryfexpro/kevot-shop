(function () {
  const cv = document.getElementById("globeCanvas");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const N = 3200, GOLD = Math.PI * (3 - Math.sqrt(5));
  const pts = [];
  const landAt = (x, y, z) => {
    const n = Math.sin(x * 3.1 + 1.7) * Math.cos(y * 2.7 - 0.4) + Math.sin(z * 3.7 + 0.9) * Math.cos(x * 2.3 + 2.1) +
      0.55 * Math.sin((x + y + z) * 5.3 + 0.6) + 0.3 * Math.sin(y * 7.1 + x * 3);
    return n > 0.3 ? 1 : 0;
  };
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = GOLD * i;
    const x = Math.cos(th) * r, z = Math.sin(th) * r;
    pts.push([x, y, z, landAt(x, y, z)]);
  }
  const names = ["Londra", "New York", "Dubai", "Tokyo", "Sydney", "San Paolo", "Singapore"];
  const ll = (lat, lon) => { const a = (lat * Math.PI) / 180, o = (lon * Math.PI) / 180; return [Math.cos(a) * Math.sin(o), Math.sin(a), Math.cos(a) * Math.cos(o)]; };
  const home = ll(46.07, 11.12);
  const cities = [ll(51.5, -0.1), ll(40.7, -74), ll(25.2, 55.3), ll(35.7, 139.7), ll(-33.9, 151.2), ll(-23.5, -46.6), ll(1.35, 103.8)];
  const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const stars = Array.from({ length: 170 }, () => ({ x: Math.random(), y: Math.random() * 0.8, s: Math.random() * 1.3 + 0.3, ph: Math.random() * 6.28 }));
  const TILT = 0.55;

  let W = 0, H = 0, R = 0, cx = 0, cy = 0, t0 = performance.now(), visible = true, raf = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.max(W * 0.58, 620); cx = W / 2; cy = H * 0.66 + R;
    if (reduce) draw(0);
  }

  function rot(v, ry) {
    const c = Math.cos(ry), s = Math.sin(ry);
    const x = v[0] * c + v[2] * s, z = -v[0] * s + v[2] * c;
    const ct = Math.cos(TILT), st = Math.sin(TILT);
    return [x, v[1] * ct - z * st, v[1] * st + z * ct];
  }
  const proj = (v) => [cx + v[0] * R, cy - v[1] * R];

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    stars.forEach((s) => {
      ctx.globalAlpha = 0.25 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.2 + s.ph));
      ctx.fillStyle = "#cfe0ff";
      ctx.fillRect(s.x * W, s.y * H, s.s, s.s);
    });
    ctx.globalAlpha = 1;

    const glow = ctx.createRadialGradient(cx, cy, R * 0.97, cx, cy, R * 1.1);
    glow.addColorStop(0, "rgba(79,139,255,0.55)");
    glow.addColorStop(0.35, "rgba(60,80,230,0.28)");
    glow.addColorStop(1, "rgba(37,99,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.1, 0, Math.PI * 2); ctx.fill();

    const body = ctx.createRadialGradient(cx, cy - R * 0.5, R * 0.2, cx, cy, R);
    body.addColorStop(0, "#0b0e2e"); body.addColorStop(1, "#04040c");
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    const inner = ctx.createRadialGradient(cx, cy, R * 0.72, cx, cy, R);
    inner.addColorStop(0, "rgba(79,139,255,0)"); inner.addColorStop(1, "rgba(79,139,255,0.32)");
    ctx.fillStyle = inner;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

    const ry = -0.19 + Math.sin(t * 0.1) * 0.55;
    ctx.lineWidth = 1; ctx.strokeStyle = "rgba(120,160,255,0.16)";
    for (let lat = -60; lat <= 80; lat += 20) {
      ctx.beginPath(); let pen = false;
      for (let lon = -180; lon <= 180; lon += 6) {
        const v = rot(ll(lat, lon), ry);
        if (v[2] > 0) { const [x, y] = proj(v); pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; } else pen = false;
      }
      ctx.stroke();
    }
    for (let lon = -180; lon < 180; lon += 20) {
      ctx.beginPath(); let pen = false;
      for (let lat = -88; lat <= 88; lat += 5) {
        const v = rot(ll(lat, lon), ry);
        if (v[2] > 0) { const [x, y] = proj(v); pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; } else pen = false;
      }
      ctx.stroke();
    }
    for (let i = 0; i < N; i++) {
      const v = rot(pts[i], ry);
      if (v[2] <= 0) continue;
      const [x, y] = proj(v);
      if (y < -10 || y > H + 10) continue;
      const land = pts[i][3];
      ctx.globalAlpha = (land ? 0.45 : 0.16) + (land ? 0.55 : 0.4) * Math.pow(v[2], 1.1);
      ctx.fillStyle = land ? "#d6e3ff" : "#6f8fe8";
      const s = land ? 1.7 + 2.3 * v[2] : 0.9 + 1.2 * v[2];
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;

    cities.forEach((c, k) => {
      const seg = 36; let prev = null;
      ctx.beginPath();
      for (let i = 0; i <= seg; i++) {
        const u = i / seg;
        const m = norm([home[0] * (1 - u) + c[0] * u, home[1] * (1 - u) + c[1] * u, home[2] * (1 - u) + c[2] * u]);
        const lift = 1 + 0.2 * Math.sin(Math.PI * u);
        const v = rot([m[0] * lift, m[1] * lift, m[2] * lift], ry);
        const [x, y] = proj(v);
        if (v[2] > 0.02) { if (prev) ctx.lineTo(x, y); else ctx.moveTo(x, y); prev = [x, y]; } else prev = null;
      }
      ctx.strokeStyle = "rgba(143,176,255,0.38)"; ctx.lineWidth = 1; ctx.stroke();
      const u = ((t * 0.18 + k * 0.17) % 1);
      const m = norm([home[0] * (1 - u) + c[0] * u, home[1] * (1 - u) + c[1] * u, home[2] * (1 - u) + c[2] * u]);
      const lift = 1 + 0.2 * Math.sin(Math.PI * u);
      const v = rot([m[0] * lift, m[1] * lift, m[2] * lift], ry);
      if (v[2] > 0.02) { const [x, y] = proj(v); ctx.fillStyle = "#fff"; ctx.shadowColor = "#4f8bff"; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(x, y, 2, 0, 7); ctx.fill(); ctx.shadowBlur = 0; }
      const e = rot(c, ry);
      if (e[2] > 0.02) {
        const [x, y] = proj(e); ctx.fillStyle = "rgba(143,176,255,0.95)"; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fill();
        if (e[2] > 0.3) { ctx.font = "600 11px Inter, sans-serif"; ctx.fillStyle = "rgba(235,242,255," + Math.min(1, e[2]) * 0.85 + ")"; ctx.fillText(names[k].toUpperCase(), x + 8, y - 8); }
      }
    });

    const h = rot(home, ry);
    if (h[2] > 0) {
      const [x, y] = proj(h), ph = (t * 0.7) % 1;
      ctx.strokeStyle = `rgba(143,176,255,${(1 - ph) * 0.8})`; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(x, y, 5 + ph * 22, 0, 7); ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.shadowColor = "#4f8bff"; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      ctx.font = "700 12px Inter, sans-serif"; ctx.fillStyle = "#fff"; ctx.fillText("KEVOT · TRENTINO", x + 12, y - 10);
    }

    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(160,190,255,0.85)"; ctx.lineWidth = 1.6;
    ctx.shadowColor = "rgba(79,139,255,0.9)"; ctx.shadowBlur = 26; ctx.stroke(); ctx.shadowBlur = 0;
  }

  function loop(now) { draw((now - t0) / 1000); raf = visible ? requestAnimationFrame(loop) : 0; }
  window.addEventListener("resize", resize);
  resize();
  if (reduce) return;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }).observe(cv);
  raf = requestAnimationFrame(loop);
})();
