import { useRef, useState } from 'react';
import {
  MessageSquare,
  Mic,
  Search,
  Globe,
  FolderOpen,
  Calendar,
  StickyNote,
  Brain,
  CheckSquare,
  Zap,
  Focus,
  Settings,
  History,
  type LucideIcon,
} from 'lucide-react';
import { useAI } from '../context/AIContext';
import { sounds } from '../lib/sound';

interface DockItem {
  id: string;
  icon: LucideIcon;
  label: string;
  action?: () => void;
}

export default function Dock() {
  const { toggleFocus, focusMode, setCommandPaletteOpen } = useAI();
  const [hovered, setHovered] = useState<string | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const items: DockItem[] = [
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'voice', icon: Mic, label: 'Voice' },
    { id: 'search', icon: Search, label: 'Search', action: () => setCommandPaletteOpen(true) },
    { id: 'browser', icon: Globe, label: 'Browser' },
    { id: 'files', icon: FolderOpen, label: 'Files' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'notes', icon: StickyNote, label: 'Notes' },
    { id: 'memory', icon: Brain, label: 'Memory' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'automation', icon: Zap, label: 'Automation' },
    { id: 'focus', icon: Focus, label: 'Focus', action: () => { toggleFocus(); sounds.activate(); } },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'history', icon: History, label: 'History' },
  ];

  return (
    <div
      ref={dockRef}
      className={`flex items-end gap-1.5 glass-strong rounded-3xl px-3 py-2 transition-all duration-500 ${
        focusMode ? 'opacity-30 scale-90' : 'opacity-100'
      }`}
    >
      {items.map((item, i) => {
        const isHovered = hovered === item.id;
        const isNeighbor = hovered !== null;
        const distance = items.findIndex((x) => x.id === hovered) - i;
        const scale = isHovered
          ? 1.5
          : isNeighbor && Math.abs(distance) === 1
            ? 1.2
            : isNeighbor && Math.abs(distance) === 2
              ? 1.05
              : 1;

        return (
          <div key={item.id} className="relative flex flex-col items-center">
            {/* Tooltip */}
            {isHovered && (
              <div className="absolute -top-9 glass rounded-lg px-2.5 py-1 text-[11px] text-white/80 whitespace-nowrap animate-scale-in pointer-events-none">
                {item.label}
              </div>
            )}

            <button
              onMouseEnter={() => {
                setHovered(item.id);
                sounds.hover();
              }}
              onMouseLeave={() => setHovered(null)}
              onClick={() => {
                sounds.click();
                item.action?.();
              }}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:bg-white/10 ${
                item.id === 'focus' && focusMode
                  ? 'bg-cyan-accent/20 text-cyan-accent'
                  : 'text-white/60 hover:text-white/90'
              }`}
              style={{
                transform: `scale(${scale}) translateY(${isHovered ? -8 : 0}px)`,
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              aria-label={item.label}
            >
              <item.icon size={20} />
              {isHovered && (
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)',
                  }}
                />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
