import { useEffect, useRef, useState } from 'react';
import { useAI } from '../context/AIContext';
import {
  Search,
  Focus,
  Mic,
  Trash2,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  ScanFace,
  Circle,
  type LucideIcon,
} from 'lucide-react';
import { sounds } from '../lib/sound';

interface Command {
  id: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
  action: () => void;
}

export default function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    toggleFocus,
    clearMessages,
    soundEnabled,
    toggleSound,
    setAvatarType,
    setState,
  } = useAI();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    {
      id: 'focus',
      label: 'Toggle Focus Mode',
      icon: Focus,
      shortcut: 'F',
      action: () => {
        toggleFocus();
        sounds.activate();
      },
    },
    {
      id: 'voice',
      label: 'Activate Voice Mode',
      icon: Mic,
      shortcut: 'SPACE',
      action: () => setState('listening'),
    },
    {
      id: 'clear',
      label: 'Clear Conversation',
      icon: Trash2,
      action: () => {
        clearMessages();
        sounds.click();
      },
    },
    {
      id: 'sound',
      label: soundEnabled ? 'Mute Sounds' : 'Enable Sounds',
      icon: soundEnabled ? VolumeX : Volume2,
      action: () => {
        toggleSound();
        sounds.click();
      },
    },
    {
      id: 'avatar-orb',
      label: 'Avatar: Orb',
      icon: Circle,
      action: () => {
        setAvatarType('orb');
        sounds.click();
      },
    },
    {
      id: 'avatar-robot',
      label: 'Avatar: Robot',
      icon: Bot,
      action: () => {
        setAvatarType('robot');
        sounds.click();
      },
    },
    {
      id: 'avatar-face',
      label: 'Avatar: Holographic Face',
      icon: ScanFace,
      action: () => {
        setAvatarType('face');
        sounds.click();
      },
    },
    {
      id: 'idle',
      label: 'Reset AI State',
      icon: Sparkles,
      action: () => setState('idle'),
    },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
        sounds.click();
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
      if (commandPaletteOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
        }
        if (e.key === 'Enter' && filtered[selectedIndex]) {
          e.preventDefault();
          filtered[selectedIndex].action();
          setCommandPaletteOpen(false);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commandPaletteOpen, setCommandPaletteOpen, filtered, selectedIndex]);

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] animate-fade-in"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      />
      <div
        className="relative glass-strong rounded-2xl w-full max-w-[520px] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <Search size={18} className="text-cyan-accent/60" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/30 outline-none"
          />
          <kbd className="text-[10px] text-white/30 px-1.5 py-0.5 rounded border border-white/10">
            ESC
          </kbd>
        </div>

        <div className="max-h-[320px] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <div className="text-center py-8 text-white/30 text-sm">
              No commands found
            </div>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => {
                cmd.action();
                setCommandPaletteOpen(false);
              }}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                i === selectedIndex
                  ? 'bg-cyan-accent/15 text-white/90'
                  : 'text-white/60 hover:bg-white/5'
              }`}
            >
              <cmd.icon size={16} className={i === selectedIndex ? 'text-cyan-accent' : 'text-white/40'} />
              <span className="text-sm flex-1">{cmd.label}</span>
              {cmd.shortcut && (
                <kbd className="text-[10px] text-white/30 px-1.5 py-0.5 rounded border border-white/10">
                  {cmd.shortcut}
                </kbd>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
