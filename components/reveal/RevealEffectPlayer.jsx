'use client';

import { useEffect, useRef, useState } from 'react';
import { effectDurationMs } from '../../lib/revealEffects';
import { startAnimeFireworks } from './animeFireworks';

function useAutoComplete(active, effectId, onComplete) {
  useEffect(() => {
    if (!active || !onComplete) return undefined;
    const ms = effectDurationMs(effectId);
    const t = window.setTimeout(() => onComplete(), ms);
    return () => window.clearTimeout(t);
  }, [active, effectId, onComplete]);
}

function ConfettiCanvas({ active }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active || !ref.current) return undefined;
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = rect.width;
    const h = rect.height;
    const particles = [];

    for (let i = 0; i < 120; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      particles.push({
        x: w * (0.3 + Math.random() * 0.4),
        y: h * 0.1,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
        decay: 0.008 + Math.random() * 0.012,
        size: 4 + Math.random() * 6,
        hue: Math.random() * 360,
        gravity: 0.12,
      });
    }

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of particles) {
        if (p.life <= 0) continue;
        alive += 1;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.life -= p.decay;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = `hsl(${p.hue}, 85%, 58%)`;
        ctx.fillRect(p.x, p.y, p.size, p.size * 0.6);
      }
      ctx.globalAlpha = 1;
      if (alive > 0) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={ref}
      className="reveal-fx-canvas pointer-events-none absolute inset-0 z-30 h-full w-full"
      aria-hidden
    />
  );
}

function FireworksCanvas({ active }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active || !ref.current) return undefined;
    return startAnimeFireworks(ref.current, active);
  }, [active]);

  if (!active) return null;
  return (
    <>
      <div className="reveal-fireworks-glow pointer-events-none absolute inset-0 z-20" aria-hidden />
      <canvas
        ref={ref}
        className="reveal-fx-canvas pointer-events-none absolute inset-0 z-30 h-full w-full"
        aria-hidden
      />
    </>
  );
}

function CssEffect({ effectId }) {
  switch (effectId) {
    case 'treasure-chest':
      return (
        <div className="reveal-fx-layer reveal-fx-treasure" aria-hidden>
          <div className="reveal-treasure-chest">
            <div className="reveal-treasure-lid" />
            <div className="reveal-treasure-glow" />
          </div>
        </div>
      );
    case 'slot-machine':
      return (
        <div className="reveal-fx-layer reveal-fx-slot" aria-hidden>
          <div className="reveal-slot">
            <span className="reveal-slot-reel">7</span>
            <span className="reveal-slot-reel reveal-slot-reel-delay">7</span>
            <span className="reveal-slot-reel reveal-slot-reel-delay2">7</span>
          </div>
          <p className="reveal-slot-win">JACKPOT!</p>
        </div>
      );
    case 'crystal-ball':
      return (
        <div className="reveal-fx-layer reveal-fx-crystal" aria-hidden>
          <div className="reveal-crystal-orb">
            <div className="reveal-crystal-smoke" />
            <div className="reveal-crystal-smoke reveal-crystal-smoke-2" />
          </div>
        </div>
      );
    case 'pop-balloon':
      return (
        <div className="reveal-fx-layer reveal-fx-balloon" aria-hidden>
          <div className="reveal-balloon" />
          <div className="reveal-balloon-pop" />
        </div>
      );
    case 'electric-shock':
      return (
        <div className="reveal-fx-layer reveal-fx-electric" aria-hidden>
          <motionZap className="reveal-zap reveal-zap-1" />
          <motionZap className="reveal-zap reveal-zap-2" />
          <motionZap className="reveal-zap reveal-zap-3" />
        </div>
      );
    case 'applause':
      return (
        <div className="reveal-fx-layer reveal-fx-applause" aria-hidden>
          {['👏', '🙌', '👏', '🙌', '👏'].map((hand, i) => (
            <span
              key={i}
              className="reveal-hand"
              style={{ '--hand-i': i }}
            >
              {hand}
            </span>
          ))}
        </div>
      );
    case 'break-ice':
      return (
        <div className="reveal-fx-layer reveal-fx-ice" aria-hidden>
          <div className="reveal-ice-sheet" />
          <motionShard className="reveal-ice-shard reveal-ice-shard-1" />
          <motionShard className="reveal-ice-shard reveal-ice-shard-2" />
          <motionShard className="reveal-ice-shard reveal-ice-shard-3" />
        </div>
      );
    case 'dynamite':
      return <DynamiteCountdown />;
    case 'spotlight':
      return (
        <div className="reveal-fx-layer reveal-fx-spotlight" aria-hidden>
          <div className="reveal-spotlight-dim" />
          <div className="reveal-spotlight-beam" />
        </div>
      );
    case 'card-flip':
      return (
        <div className="reveal-fx-layer reveal-fx-card-flip" aria-hidden>
          <div className="reveal-flip-shimmer" />
        </div>
      );
    default:
      return null;
  }
}

function motionZap({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 200" fill="none">
      <path
        d="M60 0 L45 70 L75 70 L35 200 L85 80 L55 80 Z"
        fill="rgba(120,220,255,0.9)"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="2"
      />
    </svg>
  );
}

function motionShard({ className }) {
  return <motionZap className={className} />;
}

function DynamiteCountdown() {
  const [tick, setTick] = useState(3);
  useEffect(() => {
    const steps = [3, 2, 1, 0];
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      if (i >= steps.length) {
        window.clearInterval(id);
        setTick(0);
        return;
      }
      setTick(steps[i]);
    }, 700);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="reveal-fx-layer reveal-fx-dynamite" aria-hidden>
      <div className="reveal-dynamite-stick" />
      {tick > 0 ? (
        <span className="reveal-dynamite-count">{tick}</span>
      ) : (
        <span className="reveal-dynamite-boom">BOOM!</span>
      )}
    </div>
  );
}

/**
 * Plays a full-screen (within bounds) reveal animation. Calls onComplete when done.
 */
export default function RevealEffectPlayer({
  effectId = 'fireworks',
  active = false,
  onComplete,
  className = '',
}) {
  useAutoComplete(active, effectId, onComplete);

  if (!active) return null;

  return (
    <div
      className={`reveal-fx-root pointer-events-none absolute inset-0 z-40 overflow-hidden ${
        effectId === 'fireworks' ? 'reveal-fx-fireworks' : ''
      } ${className}`}
      aria-hidden
    >
      {effectId === 'fireworks' ? <FireworksCanvas active={active} /> : null}
      {effectId === 'confetti' ? <ConfettiCanvas active={active} /> : null}
      <CssEffect effectId={effectId} />
    </div>
  );
}