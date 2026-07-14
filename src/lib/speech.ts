import { AudioSettings } from './types';

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices();
}

export function speakText(text: string, settings: AudioSettings) {
  if (!settings.speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    const synth = window.speechSynthesis;
    synth.cancel(); // Stop prior speeches for immediate prompt delivery

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = settings.volume;
    utterance.rate = settings.speechRate || 1.0;
    utterance.pitch = settings.speechPitch || 1.0;

    if (settings.voiceURI) {
      const voices = synth.getVoices();
      const selected = voices.find((v) => v.voiceURI === settings.voiceURI);
      if (selected) {
        utterance.voice = selected;
      }
    }

    synth.speak(utterance);
  } catch (e) {
    console.warn('SpeechSynthesis error:', e);
  }
}

export function announcePhaseStart(
  phase: 'PREPARE' | 'WORK' | 'REST' | 'EXERCISE_REST' | 'FINISHED',
  exerciseName: string,
  setNumber: number,
  totalSets: number,
  settings: AudioSettings
) {
  if (!settings.speechEnabled) return;

  switch (phase) {
    case 'PREPARE':
      speakText(`Get ready for ${exerciseName}`, settings);
      break;
    case 'WORK':
      speakText(`${exerciseName}, Set ${setNumber} of ${totalSets}`, settings);
      break;
    case 'REST':
      speakText(`Rest`, settings);
      break;
    case 'EXERCISE_REST':
      speakText(`Great job! Rest before next exercise: ${exerciseName}`, settings);
      break;
    case 'FINISHED':
      speakText(`Workout completed! Excellent work!`, settings);
      break;
  }
}
