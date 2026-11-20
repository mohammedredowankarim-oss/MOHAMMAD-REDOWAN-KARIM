// Synthesized Web Audio API Music Box & Microphone Blow Detection

interface MelodyNote {
  freq: number;
  duration: number; // seconds
  delay: number; // start offset in seconds
}

// Frequencies in Hz (C4 major / F4 major warm register)
const NOTES: Record<string, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  Bb4: 466.16,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
};

const HAPPY_BIRTHDAY_MELODY: MelodyNote[] = [
  // "Happy birthday to you"
  { freq: NOTES.C4, duration: 0.32, delay: 0.0 },
  { freq: NOTES.C4, duration: 0.22, delay: 0.34 },
  { freq: NOTES.D4, duration: 0.52, delay: 0.58 },
  { freq: NOTES.C4, duration: 0.52, delay: 1.14 },
  { freq: NOTES.F4, duration: 0.52, delay: 1.7 },
  { freq: NOTES.E4, duration: 0.92, delay: 2.26 },

  // "Happy birthday to you"
  { freq: NOTES.C4, duration: 0.32, delay: 3.3 },
  { freq: NOTES.C4, duration: 0.22, delay: 3.64 },
  { freq: NOTES.D4, duration: 0.52, delay: 3.88 },
  { freq: NOTES.C4, duration: 0.52, delay: 4.44 },
  { freq: NOTES.G4, duration: 0.52, delay: 5.0 },
  { freq: NOTES.F4, duration: 0.92, delay: 5.56 },

  // "Happy birthday dear friend"
  { freq: NOTES.C4, duration: 0.32, delay: 6.6 },
  { freq: NOTES.C4, duration: 0.22, delay: 6.94 },
  { freq: NOTES.C5, duration: 0.52, delay: 7.18 },
  { freq: NOTES.A4, duration: 0.52, delay: 7.74 },
  { freq: NOTES.F4, duration: 0.52, delay: 8.3 },
  { freq: NOTES.E4, duration: 0.52, delay: 8.86 },
  { freq: NOTES.D4, duration: 0.92, delay: 9.42 },

  // "Happy birthday to you"
  { freq: NOTES.Bb4, duration: 0.32, delay: 10.46 },
  { freq: NOTES.Bb4, duration: 0.22, delay: 10.8 },
  { freq: NOTES.A4, duration: 0.52, delay: 11.04 },
  { freq: NOTES.F4, duration: 0.52, delay: 11.6 },
  { freq: NOTES.G4, duration: 0.52, delay: 12.16 },
  { freq: NOTES.F4, duration: 1.35, delay: 12.72 },
];

export interface MelodyController {
  stop: () => void;
}

export function playHappyBirthdayMelody(onComplete?: () => void): MelodyController {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) {
    onComplete?.();
    return { stop: () => {} };
  }

  const ctx = new AudioCtx();
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.32, ctx.currentTime);
  masterGain.connect(ctx.destination);

  let stopped = false;
  const activeOscs: OscillatorNode[] = [];

  const startTime = ctx.currentTime + 0.06;

  HAPPY_BIRTHDAY_MELODY.forEach((note) => {
    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const noteGain = ctx.createGain();

    // Warm celesta / music-box timbre
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.freq, startTime + note.delay);

    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(note.freq * 2, startTime + note.delay);

    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.14, startTime + note.delay);

    const t0 = startTime + note.delay;
    const tEnd = t0 + note.duration;

    noteGain.gain.setValueAtTime(0.0001, t0);
    noteGain.gain.exponentialRampToValueAtTime(0.6, t0 + 0.025);
    noteGain.gain.exponentialRampToValueAtTime(0.001, tEnd + 0.35);

    osc.connect(noteGain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(t0);
    overtone.start(t0);
    osc.stop(tEnd + 0.4);
    overtone.stop(tEnd + 0.4);

    activeOscs.push(osc, overtone);
  });

  const totalDurationMs = (14.2) * 1000;
  const timer = window.setTimeout(() => {
    if (!stopped) {
      stopped = true;
      ctx.close().catch(() => {});
      onComplete?.();
    }
  }, totalDurationMs);

  return {
    stop: () => {
      if (stopped) return;
      stopped = true;
      window.clearTimeout(timer);
      activeOscs.forEach((osc) => {
        try {
          osc.stop();
        } catch {
          // already stopped
        }
      });
      ctx.close().catch(() => {});
    },
  };
}

export function playCelebrationChime(): void {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const chord = [NOTES.F4, NOTES.A4, NOTES.C5, NOTES.F5];
  const now = ctx.currentTime;

  chord.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);
    gain.gain.setValueAtTime(0.001, now + idx * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.22, now + idx * 0.08 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 1.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 1.15);
  });

  window.setTimeout(() => {
    ctx.close().catch(() => {});
  }, 1600);
}

export interface MicBlowListener {
  stop: () => void;
}

export async function startMicBlowListener(
  onIntensity: (level: number) => void,
  onBlowDetected: () => void
): Promise<MicBlowListener> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Microphone access is not supported in this browser.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  let rafId = 0;
  let sustainedBlowFrames = 0;
  let stopped = false;

  const tick = () => {
    if (stopped) return;
    analyser.getByteFrequencyData(dataArray);

    // Focus on lower-mid breath turbulence bins
    let sum = 0;
    const sampleBins = Math.min(24, dataArray.length);
    for (let i = 1; i < sampleBins; i++) {
      sum += dataArray[i];
    }
    const avg = sum / (sampleBins - 1);
    const normalized = Math.min(1, avg / 140);
    onIntensity(normalized);

    if (avg > 58) {
      sustainedBlowFrames += 1;
      if (sustainedBlowFrames >= 12) {
        stopped = true;
        cleanup();
        onBlowDetected();
        return;
      }
    } else {
      sustainedBlowFrames = Math.max(0, sustainedBlowFrames - 1);
    }

    rafId = requestAnimationFrame(tick);
  };

  const cleanup = () => {
    cancelAnimationFrame(rafId);
    stream.getTracks().forEach((track) => track.stop());
    ctx.close().catch(() => {});
  };

  rafId = requestAnimationFrame(tick);

  return {
    stop: () => {
      if (stopped) return;
      stopped = true;
      cleanup();
    },
  };
}
