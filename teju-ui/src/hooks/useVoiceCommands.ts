import { useEffect, useCallback, useRef } from 'react';
import { useAI } from '../context/AIContext';
import { sounds } from '../lib/sound';

interface SpeechRecognitionEvent extends Event {
  results: {
    length: number;
    [index: number]: {
      length: number;
      [index: number]: { transcript: string };
    };
  };
}

export function useVoiceCommands(onSubmit: (text: string) => void) {
  const {
    setState,
    voiceMode,
    setVoiceMode,
    transcript,
    setTranscript,
    soundEnabled,
  } = useAI();

  const recognitionRef = useRef<any>(null);
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  // Initialize speech recognition
  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setTranscript(text);
    };

    rec.onerror = () => {
      // ignore errors, keep listening
    };

    rec.onend = () => {
      // auto-restart if still in voice mode
      if (voiceModeRef.current) {
        try {
          rec.start();
        } catch {
          // already started
        }
      }
    };

    recognitionRef.current = rec;

    return () => {
      try {
        rec.stop();
      } catch {
        // noop
      }
    };
  }, [setTranscript]);

  const voiceModeRef = useRef(voiceMode);
  voiceModeRef.current = voiceMode;

  // Handle spacebar hold
  useEffect(() => {
    let isHolding = false;

    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Space' && !isHolding && !e.repeat) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        isHolding = true;
        startListening();
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.code === 'Space' && isHolding) {
        e.preventDefault();
        isHolding = false;
        stopListening();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const startListening = useCallback(() => {
    setVoiceMode(true);
    setState('listening');
    setTranscript('');
    if (soundRef.current) sounds.listening();
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.start();
      } catch {
        // already started
      }
    }
  }, [setVoiceMode, setState, setTranscript]);

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        // noop
      }
    }
    setVoiceMode(false);
    if (transcript.trim()) {
      setState('thinking');
      if (soundRef.current) sounds.thinking();
      onSubmitRef.current(transcript.trim());
    } else {
      setState('idle');
    }
  }, [transcript, setState, setVoiceMode]);

  return { startListening, stopListening };
}
