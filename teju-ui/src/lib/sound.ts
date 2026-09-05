let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

let enabled = true;
export function setSoundEnabled(v: boolean) {
  enabled = v;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.04,
  delay = 0,
) {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export const sounds = {
  click: () => tone(880, 0.06, 'sine', 0.03),
  hover: () => tone(660, 0.04, 'sine', 0.015),
  activate: () => {
    tone(440, 0.15, 'sine', 0.04);
    tone(660, 0.2, 'sine', 0.03, 0.05);
    tone(880, 0.25, 'sine', 0.025, 0.1);
  },
  listening: () => {
    tone(300, 0.3, 'sine', 0.03);
    tone(450, 0.4, 'sine', 0.02, 0.08);
  },
  thinking: () => {
    tone(220, 0.5, 'triangle', 0.03);
    tone(330, 0.6, 'triangle', 0.02, 0.15);
  },
  respond: () => {
    tone(523, 0.12, 'sine', 0.035);
    tone(659, 0.15, 'sine', 0.03, 0.06);
    tone(784, 0.2, 'sine', 0.025, 0.12);
  },
  notification: () => {
    tone(784, 0.1, 'sine', 0.03);
    tone(1047, 0.15, 'sine', 0.025, 0.05);
  },
  startup: () => {
    tone(196, 0.4, 'sine', 0.04);
    tone(261, 0.4, 'sine', 0.035, 0.1);
    tone(392, 0.5, 'sine', 0.03, 0.2);
    tone(523, 0.6, 'sine', 0.025, 0.3);
  },
  shutdown: () => {
    tone(523, 0.3, 'sine', 0.035);
    tone(392, 0.35, 'sine', 0.03, 0.1);
    tone(261, 0.4, 'sine', 0.025, 0.2);
    tone(196, 0.5, 'sine', 0.02, 0.3);
  },
};

// Ambient hum loop
let ambientNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let ambientStarted = false;

export function startAmbient() {
  if (!enabled || ambientStarted) return;
  const ctx = getCtx();
  if (!ctx) return;
  ambientStarted = true;
  const freqs = [55, 82.5, 110];
  freqs.forEach((f) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = f;
    g.gain.value = 0.008;
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    ambientNodes.push({ osc, gain: g });
  });
}

export function stopAmbient() {
  ambientNodes.forEach(({ osc, gain }) => {
    gain.gain.exponentialRampToValueAtTime(0.0001, getCtx()!.currentTime + 0.5);
    osc.stop(getCtx()!.currentTime + 0.6);
  });
  ambientNodes = [];
  ambientStarted = false;
}
