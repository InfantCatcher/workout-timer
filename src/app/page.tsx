'use client';

import React, { useEffect, useState } from 'react';
import { UserSession, WorkoutPlanData, AudioSettings } from '@/lib/types';
import { DEFAULT_PRESETS } from '@/lib/defaultPresets';
import Header from '@/components/Header';
import RoutineEditor from '@/components/RoutineEditor';
import ActiveTimer from '@/components/ActiveTimer';
import AuthModal from '@/components/AuthModal';
import AudioSettingsModal from '@/components/AudioSettingsModal';
import PresetsModal from '@/components/PresetsModal';
import WorkoutCompleteModal from '@/components/WorkoutCompleteModal';

export default function Home() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlanData>(DEFAULT_PRESETS[0]);
  const [savedPlans, setSavedPlans] = useState<WorkoutPlanData[]>([]);
  const [view, setView] = useState<'SETUP' | 'TIMER'>('SETUP');

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [completedSeconds, setCompletedSeconds] = useState(0);

  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    speechEnabled: true,
    chimesEnabled: true,
    volume: 0.8,
    voiceURI: null,
    speechRate: 1.0,
    speechPitch: 1.0,
  });

  // Check user session & load saved plans on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            fetchUserPlans();
          }
        }
      } catch {
        // Fallback offline mode
      }
    };

    // Load local storage routine backup if available
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('pulse_current_plan');
      if (cached) {
        try {
          setCurrentPlan(JSON.parse(cached));
        } catch {
          // Ignored
        }
      }
      const cachedAudio = localStorage.getItem('pulse_audio_settings');
      if (cachedAudio) {
        try {
          setAudioSettings(JSON.parse(cachedAudio));
        } catch {
          // Ignored
        }
      }
    }

    fetchUser();
  }, []);

  const fetchUserPlans = async () => {
    try {
      const res = await fetch('/api/workouts');
      if (res.ok) {
        const data = await res.json();
        if (data.plans) {
          setSavedPlans(data.plans);
        }
      }
    } catch {
      // Ignored
    }
  };

  const handleUpdatePlan = (updated: WorkoutPlanData) => {
    setCurrentPlan(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulse_current_plan', JSON.stringify(updated));
    }
  };

  const handleSaveToDb = async () => {
    setIsSaving(true);
    try {
      if (currentPlan.id && !currentPlan.id.startsWith('preset-')) {
        // PUT update
        const res = await fetch(`/api/workouts/${currentPlan.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentPlan),
        });
        if (res.ok) {
          fetchUserPlans();
        }
      } else {
        // POST new
        const res = await fetch('/api/workouts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentPlan),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.plan) {
            setCurrentPlan(data.plan);
          }
          fetchUserPlans();
        }
      }
    } catch (e) {
      console.warn('Save plan error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSavedPlan = async (planId: string) => {
    try {
      await fetch(`/api/workouts/${planId}`, { method: 'DELETE' });
      setSavedPlans((prev) => prev.filter((p) => p.id !== planId));
    } catch {
      // Ignored
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setSavedPlans([]);
  };

  const handleSaveAudioSettings = (newSettings: AudioSettings) => {
    setAudioSettings(newSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulse_audio_settings', JSON.stringify(newSettings));
    }
  };

  const handleCreateNewBlankPlan = () => {
    const blank: WorkoutPlanData = {
      title: 'Custom Workout',
      interExerciseRest: 30,
      exercises: [
        { name: 'Jumping Jacks', sets: 3, workSeconds: 40, restSeconds: 20 },
        { name: 'Push-ups', sets: 3, workSeconds: 30, restSeconds: 15 },
      ],
    };
    handleUpdatePlan(blank);
  };

  const handleWorkoutComplete = (totalSecs: number) => {
    setCompletedSeconds(totalSecs);
    setIsCompleteOpen(true);
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 text-white selection:bg-cyan-500 selection:text-black">
      {/* Top Header Bar */}
      <Header
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
        activePlanTitle={currentPlan.title}
        onSelectPresetsModal={() => setIsPresetsOpen(true)}
      />

      {/* Main Container View Switch */}
      <div className="container-main flex-1 flex flex-col justify-center">
        {view === 'SETUP' ? (
          <RoutineEditor
            plan={currentPlan}
            onUpdatePlan={handleUpdatePlan}
            onSaveToDb={handleSaveToDb}
            onStartWorkout={() => setView('TIMER')}
            isSaving={isSaving}
            isLoggedIn={!!user}
          />
        ) : (
          <ActiveTimer
            plan={currentPlan}
            audioSettings={audioSettings}
            onWorkoutComplete={handleWorkoutComplete}
            onExitTimer={() => setView('SETUP')}
          />
        )}
      </div>

      {/* Dialog Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          fetchUserPlans();
        }}
      />

      <AudioSettingsModal
        isOpen={isAudioSettingsOpen}
        onClose={() => setIsAudioSettingsOpen(false)}
        settings={audioSettings}
        onSaveSettings={handleSaveAudioSettings}
      />

      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        savedPlans={savedPlans}
        onSelectPlan={handleUpdatePlan}
        onDeletePlan={handleDeleteSavedPlan}
        onCreateNewPlan={handleCreateNewBlankPlan}
      />

      <WorkoutCompleteModal
        isOpen={isCompleteOpen}
        totalTimeSeconds={completedSeconds}
        exerciseCount={currentPlan.exercises.length}
        onRestart={() => {
          setIsCompleteOpen(false);
          setView('TIMER');
        }}
        onEdit={() => {
          setIsCompleteOpen(false);
          setView('SETUP');
        }}
      />
    </main>
  );
}
