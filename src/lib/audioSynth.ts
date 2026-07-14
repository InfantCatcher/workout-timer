let audioCtx: AudioContext | null = null;
let silentAudioElem: HTMLAudioElement | null = null;
let keepAliveTimer: NodeJS.Timeout | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// User-gesture touch unlocker specifically for iOS Safari
export function unlockMobileAudio() {
  try {
    const ctx = getAudioContext();

    // Create & trigger 0.0001s silent oscillator note to permanently unlock Web Audio on mobile
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(0);
    osc.stop(ctx.currentTime + 0.01);

    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch (e) {
    console.warn('Audio unlock error:', e);
  }
}

export function playCountdownBeep(volume = 0.5, freq = 660, isFinal = false) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isFinal ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isFinal ? 880 : freq, ctx.currentTime);

    const targetVol = Math.max(0.01, volume);
    gain.gain.setValueAtTime(targetVol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (isFinal ? 0.4 : 0.2));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + (isFinal ? 0.45 : 0.25));
  } catch (e) {
    console.warn('Web Audio countdown beep error:', e);
  }
}

export function playPhaseSwitchChime(volume = 0.6, isWorkPhase = true) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const freqs = isWorkPhase ? [523.25, 659.25, 783.99] : [783.99, 659.25, 523.25];
    const targetVol = Math.max(0.01, volume);

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(targetVol, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.35);

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
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const targetVol = Math.max(0.01, volume);

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);

      gain.gain.setValueAtTime(targetVol, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.15 + (i === notes.length - 1 ? 0.8 : 0.3));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + (i === notes.length - 1 ? 0.85 : 0.35));
    });
  } catch (e) {
    console.warn('Fanfare error:', e);
  }
}

// iPhone & Mobile Lock-Screen Continuous Audio Engine
export function enableBackgroundAudioKeepAlive() {
  if (typeof window === 'undefined') return;

  unlockMobileAudio();

  // Register OS MediaSession metadata & action handlers
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'PulseTime Workout Active',
        artist: 'Continuous Workout Timekeeper',
        album: 'Workout Session',
      });

      navigator.mediaSession.setActionHandler('play', () => {
        unlockMobileAudio();
      });
      navigator.mediaSession.setActionHandler('pause', () => {});
    } catch {
      // Ignored
    }
  }

  // Set up persistent silent HTML5 audio loop with dynamic stream keep-alive
  if (!silentAudioElem) {
    const ctx = getAudioContext();
    try {
      const dest = ctx.createMediaStreamDestination();
      silentAudioElem = new Audio();
      silentAudioElem.srcObject = dest.stream;
      silentAudioElem.setAttribute('playsinline', 'true');
      silentAudioElem.loop = true;
    } catch {
      // Data URI Fallback
      const silentWavBase64 =
        'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
      silentAudioElem = new Audio(silentWavBase64);
      silentAudioElem.loop = true;
    }
  }

  silentAudioElem.play().catch(() => {
    // Autoplay policy fallback
  });

  // Periodic heartbeat oscillator pulse to keep iOS audio session process awake indefinitely
  if (!keepAliveTimer) {
    keepAliveTimer = setInterval(() => {
      try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.0001; // Sub-audible pulse to retain iOS audio focus
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } catch {
        // Ignored
      }
    }, 4500);
  }
}

export function disableBackgroundAudioKeepAlive() {
  if (silentAudioElem) {
    silentAudioElem.pause();
  }
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}
