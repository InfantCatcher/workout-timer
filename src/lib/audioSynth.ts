let audioCtx: AudioContext | null = null;
let silentAudioElem: HTMLAudioElement | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playCountdownBeep(volume = 0.5, freq = 660, isFinal = false) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isFinal ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isFinal ? 880 : freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isFinal ? 0.4 : 0.2));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + (isFinal ? 0.45 : 0.25));
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}

export function playPhaseSwitchChime(volume = 0.6, isWorkPhase = true) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const freqs = isWorkPhase ? [523.25, 659.25, 783.99] : [783.99, 659.25, 523.25];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(volume, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.4);
    });
  } catch (e) {
    console.warn('Phase chime error:', e);
  }
}

export function playFanfare(volume = 0.7) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);

      gain.gain.setValueAtTime(volume, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + (i === notes.length - 1 ? 0.8 : 0.3));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + (i === notes.length - 1 ? 0.85 : 0.35));
    });
  } catch (e) {
    console.warn('Fanfare error:', e);
  }
}

// Mobile Background Session Persistence using MediaSession API and dynamic silent wave
export function enableBackgroundAudioKeepAlive() {
  if (typeof window === 'undefined') return;

  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Workout Timer Active',
        artist: 'Continuous Workout Timekeeper',
        album: 'Workout Session',
      });

      navigator.mediaSession.setActionHandler('play', () => {
        getAudioContext();
      });
      navigator.mediaSession.setActionHandler('pause', () => {});
    } catch {
      // Ignored if unsupported
    }
  }

  if (!silentAudioElem) {
    // Generate a 1-second silent WAV data URI
    const silentWavBase64 =
      'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    silentAudioElem = new Audio(silentWavBase64);
    silentAudioElem.loop = true;
  }

  silentAudioElem.play().catch(() => {
    // Browser autoplay check, handled on master play click
  });
}

export function disableBackgroundAudioKeepAlive() {
  if (silentAudioElem) {
    silentAudioElem.pause();
  }
}
