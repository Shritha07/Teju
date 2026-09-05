import { useEffect, useState } from 'react';
import { useAI } from '../context/AIContext';
import { Cloud, Wind, Droplets, Cpu, Activity, Wifi, Newspaper, ChevronRight } from 'lucide-react';
import { sounds } from '../lib/sound';

export function ClockWidget() {
  const [time, setTime] = useState(new Date());
  const { focusMode } = useAI();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return (
    <div
      className={`glass rounded-2xl px-5 py-3.5 transition-all duration-500 animate-float-soft ${
        focusMode ? 'opacity-20 scale-90' : 'opacity-100'
      } hover:scale-105 hover:border-cyan-accent/30 cursor-default`}
      onMouseEnter={() => sounds.hover()}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-0.5 font-display tabular-nums">
          <Digit value={Math.floor(displayHours / 10)} />
          <Digit value={displayHours % 10} />
          <span className="text-white/30 text-2xl mx-0.5 animate-pulse">:</span>
          <Digit value={Math.floor(minutes / 10)} />
          <Digit value={minutes % 10} />
        </div>
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] font-medium text-cyan-accent/70 tracking-wider">
            {ampm}
          </span>
          <span className="text-[10px] text-white/40 tabular-nums">
            {String(seconds).padStart(2, '0')}s
          </span>
        </div>
      </div>
    </div>
  );
}

function Digit({ value }: { value: number }) {
  return (
    <span className="text-2xl font-light text-white/90 glow-text">
      {value}
    </span>
  );
}

export function WeatherWidget() {
  const { focusMode } = useAI();
  const [temp] = useState(21);
  const [humidity] = useState(64);
  const [wind] = useState(12);
  const [location] = useState('San Francisco');

  return (
    <div
      className={`glass rounded-2xl px-5 py-3.5 transition-all duration-500 animate-float-soft ${
        focusMode ? 'opacity-20 scale-90' : 'opacity-100'
      } hover:scale-105 hover:border-cyan-accent/30 cursor-default`}
      style={{ animationDelay: '1s' }}
      onMouseEnter={() => sounds.hover()}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Cloud size={32} className="text-cyan-accent/70" />
          <div className="absolute inset-0 blur-md">
            <Cloud size={32} className="text-cyan-accent/40" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-light text-white/90">{temp}</span>
            <span className="text-sm text-white/40">°C</span>
          </div>
          <div className="text-[10px] text-white/40">{location}</div>
        </div>
      </div>
      <div className="flex gap-3 mt-2 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1 text-[10px] text-white/50">
          <Droplets size={10} className="text-cyan-accent/60" />
          {humidity}%
        </div>
        <div className="flex items-center gap-1 text-[10px] text-white/50">
          <Wind size={10} className="text-cyan-accent/60" />
          {wind}km/h
        </div>
      </div>
    </div>
  );
}

export function DateWidget() {
  const { focusMode } = useAI();
  const [date] = useState(new Date());

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div
      className={`glass rounded-2xl px-5 py-3.5 transition-all duration-500 animate-float-soft ${
        focusMode ? 'opacity-20 scale-90' : 'opacity-100'
      } hover:scale-105 hover:border-cyan-accent/30 cursor-default`}
      style={{ animationDelay: '2s' }}
      onMouseEnter={() => sounds.hover()}
    >
      <div className="flex flex-col">
        <span className="text-xs text-cyan-accent/70 font-medium tracking-wide">
          {days[date.getDay()]}
        </span>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-2xl font-light text-white/90">
            {date.getDate()}
          </span>
          <span className="text-sm text-white/50">
            {months[date.getMonth()]}
          </span>
          <span className="text-xs text-white/30">{date.getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}

export function NewsWidget() {
  const { focusMode } = useAI();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const headlines = [
    { category: 'AI', text: 'New neural architecture achieves 99% efficiency on edge devices' },
    { category: 'SPACE', text: 'James Webb telescope captures stunning new exoplanet images' },
    { category: 'TECH', text: 'Quantum computing breakthrough announced by leading researchers' },
    { category: 'CLIMATE', text: 'Global renewable energy adoption hits record milestone' },
    { category: 'SCIENCE', text: 'Scientists discover new method for carbon capture at scale' },
    { category: 'INNOVATION', text: 'Next-gen battery technology promises 3x longer lifespan' },
  ];

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % headlines.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, headlines.length]);

  const current = headlines[currentIndex];

  return (
    <div
      className={`glass rounded-2xl px-4 py-3 transition-all duration-500 animate-float-soft ${
        focusMode ? 'opacity-20 scale-90' : 'opacity-100'
      } hover:scale-105 hover:border-cyan-accent/30 cursor-default w-[220px]`}
      style={{ animationDelay: '4s' }}
      onMouseEnter={() => { setIsPaused(true); sounds.hover(); }}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-2 mb-2">
        <Newspaper size={14} className="text-cyan-accent/70" />
        <span className="text-[10px] font-medium text-cyan-accent/70 tracking-wider uppercase">
          News Feed
        </span>
        <div className="ml-auto flex gap-0.5">
          {headlines.map((_, i) => (
            <div
              key={i}
              className={`h-0.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-3 bg-cyan-accent' : 'w-1 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="overflow-hidden h-[44px] relative">
        <div
          key={currentIndex}
          className="animate-slide-up"
        >
          <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald/20 text-emerald-glow mb-1 mr-1.5 align-middle">
            {current.category}
          </span>
          <span className="text-[11px] text-white/70 leading-tight">
            {current.text}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        <span className="text-[9px] text-white/30">Updated just now</span>
        <ChevronRight size={10} className="text-white/30" />
      </div>
    </div>
  );
}

export function SystemStatsWidget() {
  const { focusMode } = useAI();
  const [stats, setStats] = useState({ cpu: 32, ram: 58, network: 45, gpu: 28 });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        cpu: Math.max(10, Math.min(95, prev.cpu + (Math.random() - 0.5) * 15)),
        ram: Math.max(20, Math.min(90, prev.ram + (Math.random() - 0.5) * 8)),
        network: Math.max(5, Math.min(95, prev.network + (Math.random() - 0.5) * 20)),
        gpu: Math.max(5, Math.min(85, prev.gpu + (Math.random() - 0.5) * 12)),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const bars = [
    { label: 'CPU', value: stats.cpu, icon: Cpu, color: '#38BDF8' },
    { label: 'RAM', value: stats.ram, icon: Activity, color: '#1F8A70' },
    { label: 'NET', value: stats.network, icon: Wifi, color: '#6C63FF' },
    { label: 'GPU', value: stats.gpu, icon: Activity, color: '#38BDF8' },
  ];

  return (
    <div
      className={`glass rounded-2xl px-4 py-3 transition-all duration-500 animate-float-soft ${
        focusMode ? 'opacity-20 scale-90' : 'opacity-100'
      } hover:scale-105 hover:border-cyan-accent/30 cursor-default`}
      style={{ animationDelay: '3s' }}
      onMouseEnter={() => sounds.hover()}
    >
      <div className="space-y-2">
        {bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-2">
            <bar.icon size={12} className="text-white/40" />
            <span className="text-[10px] text-white/50 w-7">{bar.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${bar.value}%`,
                  background: `linear-gradient(90deg, ${bar.color}88, ${bar.color})`,
                  boxShadow: `0 0 6px ${bar.color}66`,
                }}
              />
            </div>
            <span className="text-[10px] text-white/40 tabular-nums w-7 text-right">
              {Math.round(bar.value)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
