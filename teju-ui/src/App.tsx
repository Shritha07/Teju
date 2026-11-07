import { useState, useCallback, useEffect } from 'react';
import { AIProvider, useAI } from './context/AIContext';
import { useVoiceCommands } from './hooks/useVoiceCommands';
import CinematicBackground from './components/CinematicBackground';
import AICore from './components/AICore';
import ChatPanel from './components/ChatPanel';
import Dock from './components/Dock';
import CommandPalette from './components/CommandPalette';
import AIStatusIndicator from './components/AIStatusIndicator';
import {
  ClockWidget,
  WeatherWidget,
  DateWidget,
  SystemStatsWidget,
  NewsWidget,
} from './components/Widgets';
import {
  FocusOverlay,
  VoiceOverlay,
  Notifications,
  StartupAnimation,
  CursorTrail,
} from './components/Overlays';
import { startAmbient, stopAmbient, setSoundEnabled } from './lib/sound';
import { generateResponse, streamResponse } from './lib/aiEngine';

function AppContent() {
  const {
    state,
    setState,
    addMessage,
    updateMessage,
    soundEnabled,
    reduceMotion,
    focusMode,
  } = useAI();

  const [booted, setBooted] = useState(false);

  useEffect(() => {
    if (soundEnabled) startAmbient();
    return () => stopAmbient();
  }, [soundEnabled]);

  useEffect(() => {
    setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    document.body.classList.toggle('reduce-motion', reduceMotion);
  }, [reduceMotion]);

  const handleSubmit = useCallback(
    async (text: string) => {
      addMessage({
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      });
      setState('thinking');

      await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

      const responseText = generateResponse(text);
      const assistantId = crypto.randomUUID();
      addMessage({
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        streaming: true,
      });
      setState('responding');

      let accumulated = '';
      for await (const token of streamResponse(responseText)) {
        accumulated += token;
        updateMessage(assistantId, accumulated);
      }
      setState('idle');
    },
    [addMessage, updateMessage, setState],
  );

  useVoiceCommands(handleSubmit);

  if (!booted) {
    return <StartupAnimation onComplete={() => setBooted(true)} />;
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden font-display">
      <CinematicBackground />
      <CursorTrail />
      <Notifications />
      <FocusOverlay />
      <VoiceOverlay />
      <CommandPalette />

      {/* Main layout */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top bar */}
        <header
          className={`flex items-start justify-between px-6 pt-5 transition-all duration-500 ${
            focusMode ? 'opacity-20' : 'opacity-100'
          }`}
        >
          <div className="flex flex-col gap-3">
            <ClockWidget />
          </div>

          {/* Center status */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <h1 className="text-sm font-light tracking-[0.4em] text-white/40">
              Teju
            </h1>
            <AIStatusIndicator />
          </div>

          <div className="flex flex-col items-end gap-3">
            <WeatherWidget />
            <NewsWidget />
          </div>
        </header>

        {/* Center stage */}
        <main className="flex-1 flex items-center justify-center relative">
          {/* AI Core centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`transition-all duration-700 ${
                state === 'listening' ? 'scale-110' : 'scale-100'
              }`}
            >
              <AICore />
            </div>
          </div>

          {/* Chat panel floating on the right */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <ChatPanel />
          </div>
        </main>

        {/* Bottom area */}
        <footer
          className={`flex items-end justify-between px-6 pb-5 transition-all duration-500 ${
            focusMode ? 'opacity-30' : 'opacity-100'
          }`}
        >
          <div className="flex flex-col gap-3">
            <DateWidget />
            <SystemStatsWidget />
          </div>

          {/* Center dock */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-5">
            <Dock />
          </div>

          {/* Right spacer for balance */}
          <div className="w-[200px]" />
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AIProvider>
      <AppContent />
    </AIProvider>
  );
}
