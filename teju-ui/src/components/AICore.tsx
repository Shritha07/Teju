import { useEffect, useRef } from 'react';
import { useAI } from '../context/AIContext';

const AVATAR_SRC = '/images/Screenshot_2026-07-12_at_15.21.23.png';

// Diameter of the avatar circle in px — rings scale around this
const AVATAR_D = 220;
// Total canvas / component size — rings live in this space
const CORE_SIZE = 460;

export default function AICore() {
  const { state, voiceMode } = useAI();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Canvas: orbiting particles + pulse waves
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const S = CORE_SIZE;
    canvas.width = S * dpr;
    canvas.height = S * dpr;
    canvas.style.width = `${S}px`;
    canvas.style.height = `${S}px`;
    ctx.scale(dpr, dpr);

    let time = 0;
    let raf = 0;
    const orbitR = AVATAR_D / 2 + 28; // orbit just outside avatar edge
    const orbiters = Array.from({ length: 10 }, (_, i) => ({
      angle: (i / 10) * Math.PI * 2,
      speed: 0.004 + Math.random() * 0.008,
      radius: orbitR + Math.random() * 22,
      size: 1.5 + Math.random() * 2,
    }));

    function draw() {
      time += 0.016;
      const st = stateRef.current;
      ctx.clearRect(0, 0, S, S);
      const cx = S / 2;
      const cy = S / 2;
      const speedMul =
        st === 'responding' ? 2.5 : st === 'thinking' ? 0.4 : st === 'listening' ? 1.6 : 1;
      const color = st === 'thinking' ? '108,99,255' : st === 'responding' ? '31,138,112' : '56,189,248';

      // Inner glow behind video
      const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, AVATAR_D / 2 + 20);
      innerGlow.addColorStop(0, `rgba(${color},0.18)`);
      innerGlow.addColorStop(0.6, `rgba(${color},0.08)`);
      innerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, AVATAR_D / 2 + 20, 0, Math.PI * 2);
      ctx.fill();

      // Energy sparks close to avatar rim
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 14; i++) {
        const a = time * 1.8 + (i / 14) * Math.PI * 2;
        const r = AVATAR_D / 2 + 4 + Math.sin(time * 3 + i) * 10;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        const alpha = (Math.sin(time * 4 + i) + 1) * 0.18;
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Orbiting particles
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      orbiters.forEach((o) => {
        o.angle += o.speed * speedMul;
        const x = cx + Math.cos(o.angle) * o.radius;
        const y = cy + Math.sin(o.angle) * o.radius;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, o.size * 5);
        glow.addColorStop(0, `rgba(${color}, 0.9)`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, o.size * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(200,240,255,0.95)';
        ctx.beginPath();
        ctx.arc(x, y, o.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Pulse waves (responding / listening)
      if (st === 'responding' || st === 'listening') {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < 3; i++) {
          const phase = (time * 0.45 + i / 3) % 1;
          const r = AVATAR_D / 2 + 10 + phase * 130;
          const alpha = (1 - phase) * 0.28;
          ctx.strokeStyle = `rgba(${color}, ${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  const ringSpeed =
    state === 'responding' ? '6s' : state === 'thinking' ? '30s' : state === 'listening' ? '10s' : '18s';
  const ringSpeedRev =
    state === 'responding' ? '8s' : state === 'thinking' ? '40s' : state === 'listening' ? '14s' : '24s';

  const coreScale = voiceMode ? 1.12 : 1;
  const avatarColor =
    state === 'listening' ? '#38BDF8' : state === 'thinking' ? '#6C63FF' : state === 'responding' ? '#1F8A70' : '#38BDF8';

  // Ring mask percentages relative to CORE_SIZE
  // Avatar circle occupies AVATAR_D/CORE_SIZE = 220/460 ≈ 47.8% of total
  // We want rings to sit outside the avatar (>50% radius = outside center)
  const outerRingInner = 49;   // % — just outside avatar
  const outerRingOuter = 52;
  const midRingInner = 45;
  const midRingOuter = 48;

  return (
    <div
      className="relative flex items-center justify-center transition-transform duration-700 ease-out"
      style={{ transform: `scale(${coreScale})`, width: CORE_SIZE, height: CORE_SIZE }}
    >
      {/* Canvas: particles and pulses, behind everything */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />

      {/* ── OUTER RING (clockwise) ── */}
      <div
        className="absolute inset-0 rounded-full animate-spin-slow pointer-events-none"
        style={{
          zIndex: 2,
          animationDuration: ringSpeed,
          background: `conic-gradient(from 0deg, transparent 0%, ${avatarColor}cc 12%, transparent 28%, ${avatarColor}77 50%, transparent 64%, ${avatarColor}55 84%, transparent 100%)`,
          mask: `radial-gradient(circle, transparent ${outerRingInner - 1}%, black ${outerRingInner}%, black ${outerRingOuter}%, transparent ${outerRingOuter + 1}%)`,
          WebkitMask: `radial-gradient(circle, transparent ${outerRingInner - 1}%, black ${outerRingInner}%, black ${outerRingOuter}%, transparent ${outerRingOuter + 1}%)`,
          filter: `drop-shadow(0 0 10px ${avatarColor}88)`,
        }}
      />

      {/* ── MID RING (counter-clockwise, inset 28px) ── */}
      <div
        className="absolute rounded-full animate-spin-reverse pointer-events-none"
        style={{
          zIndex: 2,
          inset: 28,
          animationDuration: ringSpeedRev,
          background: `conic-gradient(from 90deg, transparent 0%, ${avatarColor}aa 10%, transparent 24%, ${avatarColor}55 46%, transparent 60%, ${avatarColor}77 80%, transparent 100%)`,
          mask: `radial-gradient(circle, transparent ${midRingInner - 1}%, black ${midRingInner}%, black ${midRingOuter}%, transparent ${midRingOuter + 1}%)`,
          WebkitMask: `radial-gradient(circle, transparent ${midRingInner - 1}%, black ${midRingInner}%, black ${midRingOuter}%, transparent ${midRingOuter + 1}%)`,
          filter: `drop-shadow(0 0 7px ${avatarColor}66)`,
        }}
      />

      {/* ── INNER ENERGY RING (pulsing) ── */}
      <div
        className="absolute rounded-full animate-pulse-ring pointer-events-none"
        style={{
          zIndex: 2,
          inset: CORE_SIZE / 2 - AVATAR_D / 2 - 16,
          border: `1px solid ${avatarColor}66`,
          boxShadow: `0 0 24px ${avatarColor}44, inset 0 0 16px ${avatarColor}22`,
        }}
      />

      {/* ── HOLOGRAPHIC VIDEO AVATAR ── */}
      <div
        className="absolute z-10 flex items-center justify-center"
        style={{
          width: AVATAR_D,
          height: AVATAR_D,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Circular clip + bloom layers */}
        <div
          className="relative"
          style={{
            width: AVATAR_D,
            height: AVATAR_D,
            borderRadius: '50%',
            overflow: 'hidden',
          }}
        >
          {/* Soft cyan bloom — outermost glow ring */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: -18,
              borderRadius: '50%',
              background: `radial-gradient(circle, transparent 46%, ${avatarColor}55 60%, ${avatarColor}22 75%, transparent 88%)`,
              filter: 'blur(6px)',
              zIndex: 20,
            }}
          />

          {/* Feathered edge vignette — blends video into bg */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: '50%',
              background: `radial-gradient(circle, transparent 62%, rgba(5,13,26,0.45) 80%, rgba(5,13,26,0.90) 95%)`,
              zIndex: 15,
            }}
          />

          {/* Subtle scanline overlay for holographic feel */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: '50%',
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(56,189,248,0.03) 3px, rgba(56,189,248,0.03) 4px)`,
              zIndex: 14,
            }}
          />

          {/* HOLOGRAPHIC IMAGE */}
          <img
            src={AVATAR_SRC}
            alt="Teju AI"
            className="absolute inset-0 w-full h-full"
            style={{
              objectFit: 'cover',
              objectPosition: 'center top',
              borderRadius: '50%',
            }}
          />
        </div>

        {/* Outer bloom glow that bleeds outside the clip boundary */}
        <div
          className="absolute pointer-events-none animate-breathe"
          style={{
            inset: -12,
            borderRadius: '50%',
            boxShadow: `0 0 40px ${avatarColor}55, 0 0 80px ${avatarColor}22`,
            zIndex: 8,
          }}
        />
      </div>

      {/* Equalizer when responding */}
      {state === 'responding' && (
        <div className="absolute flex items-end gap-1 h-8 z-20" style={{ bottom: CORE_SIZE / 2 - AVATAR_D / 2 - 36 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1 rounded-full"
              style={{
                background: avatarColor,
                animation: `eq 0.6s ease-in-out ${i * 0.1}s infinite alternate`,
                height: '100%',
              }}
            />
          ))}
        </div>
      )}

      {/* Scanning line when thinking */}
      {state === 'thinking' && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            width: AVATAR_D,
            height: AVATAR_D,
            borderRadius: '50%',
            overflow: 'hidden',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            className="absolute left-0 right-0 h-0.5"
            style={{
              background: `linear-gradient(90deg, transparent, ${avatarColor}cc, transparent)`,
              animation: 'scan 2s ease-in-out infinite',
              boxShadow: `0 0 10px ${avatarColor}`,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes eq {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
        @keyframes scan {
          0% { top: 20%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 80%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

