import { useEffect, useState } from 'react';
import { AIProvider, useAI } from './context/AIContext';

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

import {
  startAmbient,
  stopAmbient,
  setSoundEnabled,
} from './lib/sound';

function AppContent() {
  const {
    state,
    soundEnabled,
    reduceMotion,
    focusMode,
  } = useAI();

  const [booted, setBooted] = useState(false);

  useEffect(() => {
    if (soundEnabled) {
      startAmbient();
    }

    return () => stopAmbient();
  }, [soundEnabled]);

  useEffect(() => {
    setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    document.body.classList.toggle('reduce-motion', reduceMotion);
  }, [reduceMotion]);

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

      <div className="relative z-10 h-full flex flex-col">

        {/* ---------- Header ---------- */}

        <header
          className={`flex items-start justify-between px-6 pt-5 transition-all duration-500 ${
            focusMode ? 'opacity-20' : 'opacity-100'
          }`}
        >
          <div className="flex flex-col gap-3">
            <ClockWidget />
          </div>

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

        {/* ---------- Main ---------- */}

        <main className="flex-1 flex items-center justify-center relative">

          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`transition-all duration-700 ${
                state === 'listening'
                  ? 'scale-110'
                  : 'scale-100'
              }`}
            >
              <AICore />
            </div>
          </div>

          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <ChatPanel />
          </div>

        </main>

        {/* ---------- Footer ---------- */}

        <footer
          className={`flex items-end justify-between px-6 pb-5 transition-all duration-500 ${
            focusMode ? 'opacity-30' : 'opacity-100'
          }`}
        >
          <div className="flex flex-col gap-3">
            <DateWidget />
            <SystemStatsWidget />
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 bottom-5">
            <Dock />
          </div>

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