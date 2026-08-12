'use client';

import { useEffect, useRef, useState } from 'react';
import StarRow from './StarRow';

const BRUSH = 28;
const REVEAL_AT = 0.4;

function drawCover(ctx, width, height) {
  // Metallic gold foil coat
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#9a7410');
  gradient.addColorStop(0.18, '#e8c547');
  gradient.addColorStop(0.35, '#fff1a8');
  gradient.addColorStop(0.5, '#d4af37');
  gradient.addColorStop(0.68, '#f7e7a1');
  gradient.addColorStop(0.85, '#b8860b');
  gradient.addColorStop(1, '#8a6a12');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 180; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.1})`;
    ctx.fillRect(x, y, 1 + Math.random() * 2.5, 10 + Math.random() * 55);
  }
  for (let i = 0; i < 60; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillStyle = `rgba(80,50,0,${0.04 + Math.random() * 0.08})`;
    ctx.fillRect(x, y, 2, 18 + Math.random() * 40);
  }

  ctx.fillStyle = '#111';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '600 20px Georgia, "Times New Roman", serif';
  ctx.fillText('Blue Top Villa', width / 2, height * 0.16);

  drawStars(ctx, width / 2, height * 0.26, 5, 7, '#5c4208');
  drawLine(ctx, width * 0.22, height * 0.32, width * 0.78, 'rgba(17,17,17,0.45)');

  ctx.font = '800 42px "Helvetica Neue", Helvetica, Arial, sans-serif';
  ctx.fillText('GOLDEN', width / 2, height * 0.42);
  ctx.fillText('TICKET', width / 2, height * 0.52);

  drawLine(ctx, width * 0.22, height * 0.6, width * 0.78, 'rgba(17,17,17,0.45)');
  drawStars(ctx, width / 2, height * 0.68, 5, 7, '#5c4208');

  ctx.font = '500 20px "Helvetica Neue", Helvetica, Arial, sans-serif';
  ctx.fillText('Scratch to reveal', width / 2, height * 0.78);

  drawStars(ctx, width / 2, height * 0.88, 5, 7, '#5c4208');
}

function drawStars(ctx, cx, cy, count, size, color) {
  const gap = size * 2.4;
  const start = cx - ((count - 1) * gap) / 2;
  for (let i = 0; i < count; i += 1) {
    star(ctx, start + i * gap, cy, size, color);
  }
}

function star(ctx, x, y, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const a = (Math.PI / 2) * 3 + (i * 2 * Math.PI) / 5;
    const b = a + Math.PI / 5;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.lineTo(x + Math.cos(b) * (r * 0.4), y + Math.sin(b) * (r * 0.4));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawLine(ctx, x1, y, x2, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
}

function pointerPos(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * canvas.clientWidth,
    y: ((clientY - rect.top) / rect.height) * canvas.clientHeight,
  };
}

function haptic(pattern = 12) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch {
    // ignore unsupported environments
  }
}

export default function ScratchTicket({
  offerTitle,
  offerSubtitle,
  promoCode,
  onRevealed,
  disabled = false,
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const scratching = useRef(false);
  const last = useRef(null);
  const done = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [ready, setReady] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;

    const paint = () => {
      const cssW = wrap.clientWidth;
      const cssH = wrap.clientHeight;
      if (cssW < 10 || cssH < 10) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawCover(ctx, cssW, cssH);

      done.current = false;
      setRevealed(false);
      setCelebrate(false);
      setReady(true);
      canvas.style.opacity = '1';
      canvas.style.pointerEvents = disabled ? 'none' : 'auto';
    };

    paint();
    const ro = new ResizeObserver(() => {
      if (!done.current) paint();
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [disabled]);

  function erase(x, y) {
    const canvas = canvasRef.current;
    if (!canvas || disabled || done.current || !ready) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const dpr = canvas.width / canvas.clientWidth;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = BRUSH * 2;

    const prev = last.current;
    ctx.beginPath();
    if (prev) {
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(x, y);
    } else {
      ctx.moveTo(x, y);
      ctx.lineTo(x + 0.01, y + 0.01);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, BRUSH, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    last.current = { x, y };
    measure(ctx);
  }

  function measure(ctx) {
    if (done.current) return;
    const canvas = canvasRef.current;
    const sample = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = sample;
    let clear = 0;
    const step = 32;
    for (let i = 3; i < data.length; i += step) {
      if (data[i] < 40) clear += 1;
    }
    const ratio = clear / (data.length / step);
    if (ratio >= REVEAL_AT) finishReveal();
  }

  function finishReveal() {
    const canvas = canvasRef.current;
    if (!canvas || done.current) return;
    done.current = true;
    setRevealed(true);
    setCelebrate(true);
    haptic([10, 30, 18]);
    onRevealed?.();

    let opacity = 1;
    const fade = () => {
      opacity -= 0.07;
      if (opacity <= 0) {
        const ctx = canvas.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.opacity = '0';
        canvas.style.pointerEvents = 'none';
        return;
      }
      canvas.style.opacity = String(opacity);
      requestAnimationFrame(fade);
    };
    requestAnimationFrame(fade);
  }

  function start(clientX, clientY) {
    if (disabled || done.current || !ready) return;
    scratching.current = true;
    last.current = null;
    const p = pointerPos(canvasRef.current, clientX, clientY);
    erase(p.x, p.y);
  }

  function move(clientX, clientY) {
    if (!scratching.current) return;
    const p = pointerPos(canvasRef.current, clientX, clientY);
    erase(p.x, p.y);
  }

  function end() {
    scratching.current = false;
    last.current = null;
  }

  // Non-passive touchmove so preventDefault stops page scroll while scratching
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || disabled) return undefined;

    const onTouchStart = (e) => {
      if (done.current || !ready) return;
      const t = e.touches[0];
      if (!t) return;
      scratching.current = true;
      last.current = null;
      const p = pointerPos(canvas, t.clientX, t.clientY);
      erase(p.x, p.y);
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      if (!scratching.current) return;
      const t = e.touches[0];
      if (!t) return;
      const p = pointerPos(canvas, t.clientX, t.clientY);
      erase(p.x, p.y);
    };

    const onTouchEnd = () => {
      scratching.current = false;
      last.current = null;
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [disabled, ready]);

  return (
    <div
      ref={wrapRef}
      className={`scratch-surface relative mx-auto aspect-[320/460] w-full max-w-sm select-none sm:max-w-md ${
        celebrate ? 'ticket-celebrate' : ''
      }`}
    >
      <div
        className={`ticket-mask absolute inset-0 overflow-hidden shadow-2xl shadow-cyan-500/10 ring-1 ring-cyan-400/25 transition-transform duration-500 ${
          celebrate ? 'scale-[1.02]' : 'scale-100'
        }`}
      >
        <div className="gold-foil foil-animate absolute inset-0" />

        <div
          className={`absolute inset-[7%] flex flex-col items-center justify-center rounded-[18px] bg-[#2a2a2a] px-5 text-center transition-all duration-500 ${
            revealed ? 'reveal-pop opacity-100' : 'opacity-90'
          }`}
          aria-hidden={!revealed}
        >
          <StarRow color="#e8c547" size={12} />
          <p className="mt-2 text-[24px] font-extrabold tracking-wide text-[#e8c547] sm:text-[26px]">
            GOLDEN TICKET
          </p>
          <StarRow color="#e8c547" size={12} className="mt-2" />
          <p className="mt-5 text-[48px] font-extrabold leading-none text-[#e8c547] sm:text-[54px]">
            {offerTitle}
          </p>
          <p className="mt-3 text-[14px] leading-snug text-white/90">{offerSubtitle}</p>
          <div className="mt-5 rounded-full bg-white px-5 py-2 text-[14px] font-semibold text-[#222]">
            Promo code: {promoCode}
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
          onMouseDown={(e) => start(e.clientX, e.clientY)}
          onMouseMove={(e) => move(e.clientX, e.clientY)}
          onMouseUp={end}
          onMouseLeave={end}
        />
      </div>

      {!revealed && !disabled && (
        <p className="pointer-events-none absolute -bottom-7 left-0 right-0 text-center text-xs text-cyan-200/55">
          Scratch the gold foil
        </p>
      )}
    </div>
  );
}
