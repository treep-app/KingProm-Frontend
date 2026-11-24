/**
 * Canvas anime-style fireworks — rockets, radial bursts, spark trails, screen flashes.
 */

const PALETTES = [
  ['#ff4d8d', '#ff9ac4', '#ffffff'],
  ['#38e8ff', '#6bc5ff', '#e8fbff'],
  ['#ffd54a', '#ffb347', '#fff6d6'],
  ['#a78bff', '#d4b8ff', '#ffffff'],
  ['#4dff9a', '#7dffc4', '#eafff5'],
];

function pickPalette() {
  return PALETTES[Math.floor(Math.random() * PALETTES.length)];
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function spawnRocket(rockets, w, h, delay) {
  const x = rand(w * 0.18, w * 0.82);
  rockets.push({
    x,
    y: h + 6,
    targetY: rand(h * 0.22, h * 0.48),
    vy: -rand(7.5, 10.5),
    delay,
    spent: false,
    hue: pickPalette(),
    trail: [],
  });
}

function explodeAt(particles, x, y, palette, scale = 1) {
  const count = Math.floor(rand(48, 72) * scale);
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + rand(-0.08, 0.08);
    const speed = rand(2.8, 7.2) * scale;
    const color = palette[Math.floor(Math.random() * palette.length)];
    particles.push({
      kind: 'spark',
      x,
      y,
      px: x,
      py: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: rand(0.012, 0.022),
      size: rand(1.2, 2.8) * scale,
      gravity: rand(0.04, 0.08),
      drag: 0.982,
      color,
      twinkle: Math.random() > 0.35,
    });
  }

  for (let i = 0; i < Math.floor(rand(6, 12) * scale); i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = rand(1.2, 3.2) * scale;
    particles.push({
      kind: 'star',
      x,
      y,
      px: x,
      py: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: rand(0.018, 0.028),
      size: rand(4, 7) * scale,
      gravity: 0.03,
      drag: 0.975,
      color: palette[0],
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.12, 0.12),
    });
  }
}

function drawStar(ctx, x, y, r, rot, color, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 4; i += 1) {
    const a = (Math.PI / 2) * i;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.lineTo(Math.cos(a + Math.PI / 4) * (r * 0.35), Math.sin(a + Math.PI / 4) * (r * 0.35));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} active
 * @returns {() => void} cleanup
 */
export function startAnimeFireworks(canvas, active) {
  if (!active || !canvas) return () => {};

  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = rect.width;
  const h = rect.height;
  const rockets = [];
  const particles = [];
  const pendingBursts = [];
  let flash = 0;
  let frame = 0;
  let raf = 0;
  let cancelled = false;

  const launchTimes = [0, 200, 380, 620, 880, 1150];
  for (const t of launchTimes) {
    spawnRocket(rockets, w, h, t);
  }

  const tick = () => {
    if (cancelled) return;
    frame += 1;

    ctx.fillStyle = 'rgba(8, 12, 28, 0.22)';
    ctx.fillRect(0, 0, w, h);

    for (let bi = pendingBursts.length - 1; bi >= 0; bi -= 1) {
      const burst = pendingBursts[bi];
      burst.at -= 1;
      if (burst.at <= 0) {
        explodeAt(particles, burst.x, burst.y, burst.palette, burst.scale);
        pendingBursts.splice(bi, 1);
      }
    }

    for (const rocket of rockets) {
      if (rocket.spent || frame < rocket.delay) continue;

      rocket.trail.push({ x: rocket.x, y: rocket.y });
      if (rocket.trail.length > 14) rocket.trail.shift();

      rocket.y += rocket.vy;
      rocket.vy *= 0.992;

      for (let i = 0; i < rocket.trail.length; i += 1) {
        const t = rocket.trail[i];
        const a = (i + 1) / rocket.trail.length;
        ctx.globalAlpha = a * 0.55;
        ctx.fillStyle = rocket.hue[1];
        ctx.beginPath();
        ctx.arc(t.x, t.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff8f0';
      ctx.beginPath();
      ctx.arc(rocket.x, rocket.y, 2.2, 0, Math.PI * 2);
      ctx.fill();

      if (rocket.y <= rocket.targetY) {
        explodeAt(particles, rocket.x, rocket.y, rocket.hue, 1.05);
        if (Math.random() > 0.4) {
          pendingBursts.push({
            at: Math.floor(rand(5, 11)),
            x: rocket.x + rand(-28, 28),
            y: rocket.y + rand(-22, 10),
            palette: rocket.hue,
            scale: 0.55,
          });
        }
        flash = Math.min(1, flash + 0.35);
        rocket.spent = true;
      }
    }

    ctx.globalCompositeOperation = 'lighter';
    let alive = 0;

    for (const p of particles) {
      if (p.life <= 0) continue;
      alive += 1;

      const nx = p.x + p.vx;
      const ny = p.y + p.vy;

      ctx.globalAlpha = Math.max(0, p.life * 0.85);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.kind === 'star' ? 1.4 : 2;
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      p.px = p.x;
      p.py = p.y;
      p.x = nx;
      p.y = ny;
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.life -= p.decay;

      if (p.kind === 'star') {
        p.rot += p.vr;
        drawStar(ctx, p.x, p.y, p.size, p.rot, p.color, Math.max(0, p.life));
      } else {
        const r = p.twinkle && frame % 6 < 3 ? p.size * 1.6 : p.size;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    if (flash > 0) {
      ctx.fillStyle = `rgba(255, 245, 220, ${flash * 0.28})`;
      ctx.fillRect(0, 0, w, h);
      flash *= 0.88;
    }

    const rocketsLive = rockets.some((r) => !r.spent && frame >= r.delay);
    if (alive > 0 || rocketsLive || pendingBursts.length > 0 || frame < 1500) {
      raf = requestAnimationFrame(tick);
    }
  };

  raf = requestAnimationFrame(tick);
  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
  };
}