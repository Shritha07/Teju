import { useAI } from '../context/AIContext';
import { Radio, Loader, MessageSquare, Sparkles } from 'lucide-react';

const stateConfig = {
  idle: { label: 'Idle', icon: Sparkles, color: '#38BDF8' },
  listening: { label: 'Listening', icon: Radio, color: '#38BDF8' },
  thinking: { label: 'Thinking', icon: Loader, color: '#6C63FF' },
  responding: { label: 'Responding', icon: MessageSquare, color: '#1F8A70' },
  typing: { label: 'Typing', icon: MessageSquare, color: '#1F8A70' },
};

export default function AIStatusIndicator() {
  const { state, focusMode } = useAI();
  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <div
      className={`glass rounded-full px-4 py-2 flex items-center gap-2.5 transition-all duration-500 ${
        focusMode ? 'opacity-30 scale-90' : 'opacity-100'
      }`}
    >
      <div className="relative">
        <Icon
          size={14}
          className="animate-breathe"
          style={{ color: config.color }}
        />
        <div
          className="absolute inset-0 blur-sm"
          style={{ color: config.color }}
        >
          <Icon size={14} />
        </div>
      </div>
      <span
        className="text-xs font-medium tracking-wide"
        style={{ color: config.color }}
      >
        {config.label}
      </span>
      <div className="flex gap-0.5 ml-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-0.5 h-0.5 rounded-full"
            style={{
              background: config.color,
              opacity: state === 'idle' ? 0.2 : 0.4 + (i / 3) * 0.6,
              animation:
                state === 'idle' ? 'none' : `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
