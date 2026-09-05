import { useEffect, useRef } from 'react';
import { useAI } from '../context/AIContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  depth: number;
  hue: number;
}

export default function CinematicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, focusMode } = useAI();
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const stateRef = useRef(state);
  stateRef.current = state;
  const focusRef = useRef(focusMode);
  focusRef.current = focusMode;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const PARTICLE_COUNT = 90;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const depth = Math.random();
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: depth * 2.5 + 0.5,
        opacity: depth * 0.5 + 0.1,
        depth,
        hue: Math.random() > 0.5 ? 200 : 170,
      });
    }

    // Fog blobs
    const fogBlobs = Array.from({ length: 5 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 200 + Math.random() * 200,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      hue: [200, 170, 250, 160][i % 4],
    }));

    let time = 0;
    let raf = 0;

    function draw() {
      time += 0.003;
      const mouse = mouseRef.current;
      const st = stateRef.current;
      const focus = focusRef.current;
      const blurAmount = st === 'listening' ? 4 : 0;
      const dim = focus ? 0.5 : 1;

      // Base gradient
      const grad = ctx.createRadialGradient(
        w * (0.3 + mouse.x * 0.1),
        h * (0.3 + mouse.y * 0.1),
        0,
        w / 2,
        h / 2,
        Math.max(w, h),
      );
      const baseAlpha = focus ? 0.95 : 1;
      grad.addColorStop(0, `rgba(14, 42, 77, ${0.9 * baseAlpha * dim})`);
      grad.addColorStop(0.5, `rgba(8, 20, 40, ${0.95 * baseAlpha * dim})`);
      grad.addColorStop(1, `rgba(5, 8, 20, ${1 * baseAlpha * dim})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Animated gradient overlay
      const g2 = ctx.createLinearGradient(
        0,
        h * (0.2 + Math.sin(time) * 0.1),
        w,
        h * (0.8 + Math.cos(time * 0.7) * 0.1),
      );
      const emeraldIntensity = st === 'responding' ? 0.08 : 0.04;
      g2.addColorStop(0, `rgba(31, 138, 112, ${emeraldIntensity * dim})`);
      g2.addColorStop(0.5, `rgba(56, 189, 248, ${0.03 * dim})`);
      g2.addColorStop(1, `rgba(108, 99, 255, ${0.04 * dim})`);
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      // Fog blobs
      ctx.save();
      ctx.filter = `blur(${40 + blurAmount}px)`;
      fogBlobs.forEach((blob) => {
        blob.x += blob.vx;
        blob.y += blob.vy;
        if (blob.x < -blob.r) blob.x = w + blob.r;
        if (blob.x > w + blob.r) blob.x = -blob.r;
        if (blob.y < -blob.r) blob.y = h + blob.r;
        if (blob.y > h + blob.r) blob.y = -blob.r;

        const fg = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          blob.r,
        );
        fg.addColorStop(0, `hsla(${blob.hue}, 70%, 50%, ${0.08 * dim})`);
        fg.addColorStop(1, 'transparent');
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Light rays
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 3; i++) {
        const rayX = w * (0.2 + i * 0.3) + Math.sin(time + i) * 50;
        const rayGrad = ctx.createLinearGradient(rayX, 0, rayX + 100, h);
        rayGrad.addColorStop(0, 'transparent');
        rayGrad.addColorStop(0.5, `rgba(56, 189, 248, ${0.02 * dim})`);
        rayGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = rayGrad;
        ctx.fillRect(rayX, 0, 120, h);
      }
      ctx.restore();

      // Particles
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        // Parallax offset
        const px = p.x + (mouse.x - 0.5) * 40 * p.depth;
        const py = p.y + (mouse.y - 0.5) * 40 * p.depth;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const pulse =
          st === 'listening'
            ? 0.5 + Math.sin(time * 4 + p.depth * 10) * 0.5
            : 1;
        const glow = ctx.createRadialGradient(px, py, 0, px, py, p.size * 4);
        glow.addColorStop(
          0,
          `hsla(${p.hue}, 80%, 70%, ${p.opacity * pulse * dim})`,
        );
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${p.hue}, 90%, 85%, ${p.opacity * pulse * dim})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Vignette
      const vig = ctx.createRadialGradient(
        w / 2,
        h / 2,
        Math.min(w, h) * 0.3,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.8,
      );
      vig.addColorStop(0, 'transparent');
      vig.addColorStop(1, `rgba(0, 0, 0, ${0.4 * dim})`);
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(draw);
    }
    draw();

    function handleResize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    function handleMouse(e: MouseEvent) {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    }
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouse);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full"
      aria-hidden
    />
  );
}
