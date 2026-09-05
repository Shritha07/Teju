import { useEffect, useRef, useState } from 'react';
import { useAI } from '../context/AIContext';
import { sounds } from '../lib/sound';
import { X } from 'lucide-react';

export function FocusOverlay() {
  const { focusMode } = useAI();
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (!focusMode) return;
    function onMouse(e: MouseEvent) {
      setMouse({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    }
    window.addEventListener('mousemove', onMouse);
    return () => window.removeEventListener('mousemove', onMouse);
  }, [focusMode]);

  if (!focusMode) return null;

  return (
    <div
      className="fixed inset-0 z-30 pointer-events-none transition-opacity duration-700"
      style={{
        background: `radial-gradient(circle 300px at ${mouse.x * 100}% ${mouse.y * 100}%, transparent 0%, rgba(5, 8, 20, 0.75) 100%)`,
      }}
    />
  );
}

export function VoiceOverlay() {
  const { voiceMode, transcript, state } = useAI();

  if (!voiceMode && state !== 'listening') return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none animate-fade-in">
      <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-md" />
      <div className="relative flex flex-col items-center gap-6">
        {/* Circular waveform */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {Array.from({ length: 40 }).map((_, i) => {
            const angle = (i / 40) * Math.PI * 2;
            const delay = (i / 40) * 0.5;
            return (
              <div
                key={i}
                className="absolute w-1 rounded-full bg-cyan-accent/60"
                style={{
                  height: `${20 + Math.sin(Date.now() / 200 + i) * 30 + 20}px`,
                  transform: `rotate(${angle}rad) translateY(-130px)`,
                  transformOrigin: 'center',
                  animation: `wave-bar 0.8s ease-in-out ${delay}s infinite alternate`,
                }}
              />
            );
          })}
          <div className="w-20 h-20 rounded-full glass-strong flex items-center justify-center animate-breathe">
            <MicIcon />
          </div>
        </div>

        {/* Transcript */}
        <div className="glass-strong rounded-2xl px-6 py-3 max-w-md text-center min-h-[60px] flex items-center">
          <p className="text-white/80 text-sm">
            {transcript || (
              <span className="text-white/30">Listening...</span>
            )}
          </p>
        </div>
        <p className="text-xs text-white/30">Release SPACE to send</p>
      </div>
      <style>{`
        @keyframes wave-bar {
          0% { opacity: 0.3; transform: rotate(var(--angle)) translateY(-130px) scaleY(0.5); }
          100% { opacity: 1; transform: rotate(var(--angle)) translateY(-130px) scaleY(1.2); }
        }
      `}</style>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-cyan-accent">
      <path
        d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Notifications() {
  const [notifications, setNotifications] = useState<
    Array<{ id: string; title: string; message: string; icon: string }>
  >([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          title: 'System Ready',
          message: 'Teju AI core is fully operational',
          icon: 'sparkles',
        },
      ]);
    }, 4000);

    const interval = setInterval(() => {
      const messages = [
        { title: 'Memory Synced', message: 'Context updated across sessions', icon: 'brain' },
        { title: 'Automation Active', message: '3 background tasks running', icon: 'zap' },
        { title: 'Cloud Connected', message: 'Sync complete at 21:04', icon: 'cloud' },
      ];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      setNotifications((prev) => [
        ...prev.slice(-2),
        { id: crypto.randomUUID(), ...msg },
      ]);
      sounds.notification();
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex flex-col gap-2 items-center">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-3 animate-slide-up max-w-sm"
          style={{ animation: 'slide-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards' }}
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-accent/15 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-cyan-accent animate-breathe" />
          </div>
          <div>
            <p className="text-xs font-medium text-white/90">{n.title}</p>
            <p className="text-[11px] text-white/50">{n.message}</p>
          </div>
          <button
            onClick={() =>
              setNotifications((prev) => prev.filter((x) => x.id !== n.id))
            }
            className="ml-2 p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function StartupAnimation({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    sounds.startup();
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setFadeOut(true);
          setTimeout(onComplete, 800);
          return 100;
        }
        return p + 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-navy-900 transition-opacity duration-700 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated rings */}
      <div className="relative w-40 h-40 mb-8">
        <div
          className="absolute inset-0 rounded-full border-2 border-cyan-accent/20"
          style={{ animation: 'spin 2s linear infinite' }}
        />
        <div
          className="absolute inset-4 rounded-full border border-violet-glow/30"
          style={{ animation: 'spin 3s linear infinite reverse' }}
        />
        <div className="absolute inset-8 rounded-full border border-emerald/30 animate-pulse-ring" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-accent/30 to-violet-glow/20 animate-breathe" />
        </div>
      </div>

      <h1 className="text-3xl font-light text-white/90 tracking-[0.3em] mb-2 glow-text">
        NEXUS
      </h1>
      <p className="text-xs text-white/30 tracking-widest mb-8">
        AI OPERATING SYSTEM
      </p>

      {/* Progress bar */}
      <div className="w-48 h-0.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-accent to-violet-glow transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[10px] text-white/30 mt-3 tabular-nums">
        Initializing {progress}%
      </p>
    </div>
  );
}

export function CursorTrail() {
  const [trails, setTrails] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const idRef = useRef(0);

  useEffect(() => {
    let lastTime = 0;
    function onMouse(e: MouseEvent) {
      const now = Date.now();
      if (now - lastTime < 40) return;
      lastTime = now;
      const id = idRef.current++;
      setTrails((prev) => [...prev.slice(-15), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setTrails((prev) => prev.filter((t) => t.id !== id));
      }, 600);
    }
    window.addEventListener('mousemove', onMouse);
    return () => window.removeEventListener('mousemove', onMouse);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none">
      {trails.map((t, i) => (
        <div
          key={t.id}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: t.x,
            top: t.y,
            transform: 'translate(-50%, -50%)',
            background: `rgba(56, 189, 248, ${(i / trails.length) * 0.5})`,
            boxShadow: '0 0 6px rgba(56, 189, 248, 0.4)',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
          }}
        />
      ))}
    </div>
  );
}
