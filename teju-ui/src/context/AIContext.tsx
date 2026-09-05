import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { AIState, ChatMessage } from '../types';

interface AIContextValue {
  state: AIState;
  setState: (s: AIState) => void;
  messages: ChatMessage[];
  addMessage: (m: ChatMessage) => void;
  updateMessage: (id: string, content: string) => void;
  togglePin: (id: string) => void;
  clearMessages: () => void;
  focusMode: boolean;
  toggleFocus: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  reduceMotion: boolean;
  toggleReduceMotion: () => void;
  voiceMode: boolean;
  setVoiceMode: (v: boolean) => void;
  transcript: string;
  setTranscript: (t: string) => void;
  lastInput: string;
  setLastInput: (s: string) => void;
  avatarType: 'orb' | 'robot' | 'face';
  setAvatarType: (t: 'orb' | 'robot' | 'face') => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (v: boolean) => void;
}

const AIContext = createContext<AIContextValue | null>(null);

export function AIProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AIState>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [focusMode, setFocusMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastInput, setLastInput] = useState('');
  const [avatarType, setAvatarType] = useState<'orb' | 'robot' | 'face'>('orb');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const addMessage = useCallback((m: ChatMessage) => {
    setMessages((prev) => [...prev, m]);
  }, []);

  const updateMessage = useCallback((id: string, content: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content } : m)),
    );
  }, []);

  const togglePin = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m)),
    );
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);
  const toggleFocus = useCallback(() => setFocusMode((f) => !f), []);
  const toggleSound = useCallback(() => setSoundEnabled((s) => !s), []);
  const toggleReduceMotion = useCallback(
    () => setReduceMotion((r) => !r),
    [],
  );

  return (
    <AIContext.Provider
      value={{
        state,
        setState,
        messages,
        addMessage,
        updateMessage,
        togglePin,
        clearMessages,
        focusMode,
        toggleFocus,
        soundEnabled,
        toggleSound,
        reduceMotion,
        toggleReduceMotion,
        voiceMode,
        setVoiceMode,
        transcript,
        setTranscript,
        lastInput,
        setLastInput,
        avatarType,
        setAvatarType,
        commandPaletteOpen,
        setCommandPaletteOpen,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI must be used within AIProvider');
  return ctx;
}
