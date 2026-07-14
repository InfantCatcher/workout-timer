'use client';

import React, { useEffect, useState } from 'react';
import { AudioSettings } from '@/lib/types';
import { getAvailableVoices, speakText } from '@/lib/speech';
import { playCountdownBeep, playPhaseSwitchChime } from '@/lib/audioSynth';
import { X, Volume2, Mic, Play, Check, Sliders } from 'lucide-react';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AudioSettings;
  onSaveSettings: (settings: AudioSettings) => void;
}

export default function AudioSettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}: AudioSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<AudioSettings>(settings);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const v = getAvailableVoices();
        setVoices(v);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  if (!isOpen) return null;

  const handleTestSpeech = () => {
    speakText('Exercise 1: Push-ups, Set 1. Get ready!', localSettings);
  };

  const handleTestChime = () => {
    playPhaseSwitchChime(localSettings.volume, true);
    setTimeout(() => {
      playCountdownBeep(localSettings.volume, 660, true);
    }, 400);
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Audio & Voice Alerts</h2>
            <p className="text-xs text-slate-400">Configure sound chimes and text-to-speech voiceovers.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Audio Chimes Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">Audio Chimes & Beeps</h4>
                <p className="text-xs text-slate-400">3-2-1 countdown signals & phase chimes</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.chimesEnabled}
                onChange={(e) => setLocalSettings({ ...localSettings, chimesEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {/* Voice Announcements Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-cyan-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">Voice Announcements (TTS)</h4>
                <p className="text-xs text-slate-400">Spoken exercise names & set numbers</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.speechEnabled}
                onChange={(e) => setLocalSettings({ ...localSettings, speechEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {/* Master Volume */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-300">Master Volume ({Math.round(localSettings.volume * 100)}%)</label>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={localSettings.volume}
              onChange={(e) => setLocalSettings({ ...localSettings, volume: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Voice Selection */}
          {localSettings.speechEnabled && voices.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Speech Engine Voice</label>
              <select
                value={localSettings.voiceURI || ''}
                onChange={(e) => setLocalSettings({ ...localSettings, voiceURI: e.target.value || null })}
                className="glass-input bg-slate-900 border border-white/10"
              >
                <option value="">System Default Voice</option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Audio Testing Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleTestChime}
              className="btn btn-secondary text-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Test Chime</span>
            </button>
            <button
              onClick={handleTestSpeech}
              disabled={!localSettings.speechEnabled}
              className="btn btn-secondary text-xs disabled:opacity-40"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Test Voice</span>
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-white/10 pt-4">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            <Check className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
