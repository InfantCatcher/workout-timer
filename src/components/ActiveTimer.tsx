'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WorkoutPlanData, TimerStep, AudioSettings } from '@/lib/types';
import {
  playCountdownBeep,
  playPhaseSwitchChime,
  playFanfare,
  enableBackgroundAudioKeepAlive,
  unlockMobileAudio,
} from '@/lib/audioSynth';
import { announcePhaseStart } from '@/lib/speech';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Volume2,
  ShieldCheck,
  Flame,
  Layers,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface ActiveTimerProps {
  plan: WorkoutPlanData;
  audioSettings: AudioSettings;
  onWorkoutComplete: (totalTime: number) => void;
  onExitTimer: () => void;
}

export default function ActiveTimer({
  plan,
  audioSettings,
  onWorkoutComplete,
  onExitTimer,
}: ActiveTimerProps) {
  // Ref to always access latest audioSettings mid-workout without needing timer reset
  const audioSettingsRef = useRef<AudioSettings>(audioSettings);
  useEffect(() => {
    audioSettingsRef.current = audioSettings;
  }, [audioSettings]);

  // Generate flat steps array from WorkoutPlanData
  const buildSteps = useCallback((): TimerStep[] => {
    const steps: TimerStep[] = [];
    let stepIdx = 0;

    // Initial prepare countdown
    steps.push({
      stepIndex: stepIdx++,
      phase: 'PREPARE',
      exerciseIndex: 0,
      exerciseName: plan.exercises[0]?.name || 'Workout',
      setNumber: 1,
      totalSets: plan.exercises[0]?.sets || 1,
      durationSeconds: 10,
    });

    plan.exercises.forEach((ex, exIdx) => {
      for (let s = 1; s <= ex.sets; s++) {
        // Work Step
        steps.push({
          stepIndex: stepIdx++,
          phase: 'WORK',
          exerciseIndex: exIdx,
          exerciseName: ex.name,
          setNumber: s,
          totalSets: ex.sets,
          durationSeconds: ex.workSeconds,
        });

        // Rest Step (if not last set of exercise, or if inter-exercise rest follows)
        if (s < ex.sets) {
          if (ex.restSeconds > 0) {
            steps.push({
              stepIndex: stepIdx++,
              phase: 'REST',
              exerciseIndex: exIdx,
              exerciseName: ex.name,
              setNumber: s,
              totalSets: ex.sets,
              durationSeconds: ex.restSeconds,
            });
          }
        } else if (exIdx < plan.exercises.length - 1 && plan.interExerciseRest > 0) {
          // Inter-exercise transition rest
          steps.push({
            stepIndex: stepIdx++,
            phase: 'EXERCISE_REST',
            exerciseIndex: exIdx + 1,
            exerciseName: plan.exercises[exIdx + 1].name,
            setNumber: 1,
            totalSets: plan.exercises[exIdx + 1].sets,
            durationSeconds: plan.interExerciseRest,
          });
        }
      }
    });

    // Populate nextStepPreview
    for (let i = 0; i < steps.length; i++) {
      if (i < steps.length - 1) {
        const next = steps[i + 1];
        if (next.phase === 'WORK') {
          steps[i].nextStepPreview = `Work: ${next.exerciseName} (Set ${next.setNumber}/${next.totalSets})`;
        } else if (next.phase === 'REST') {
          steps[i].nextStepPreview = `Rest (${next.durationSeconds}s)`;
        } else if (next.phase === 'EXERCISE_REST') {
          steps[i].nextStepPreview = `Transition Rest -> Next: ${next.exerciseName}`;
        }
      } else {
        steps[i].nextStepPreview = 'Final Countdown -> Workout Complete!';
      }
    }

    return steps;
  }, [plan]);

  const stepsRef = useRef<TimerStep[]>([]);
  useEffect(() => {
    stepsRef.current = buildSteps();
  }, [buildSteps]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  const totalWorkoutDuration = stepsRef.current.reduce((acc, step) => acc + step.durationSeconds, 0);

  const currentStep = stepsRef.current[currentStepIndex] || {
    phase: 'PREPARE',
    exerciseIndex: 0,
    exerciseName: 'Get Ready',
    setNumber: 1,
    totalSets: 1,
    durationSeconds: 10,
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Screen Wake Lock API handler
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        setWakeLockActive(true);
      } catch (err) {
        console.warn('Wake Lock error:', err);
      }
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setWakeLockActive(false);
      } catch {
        // Ignored
      }
    }
  };

  // Announce & chime initial step when switching phases using latest settings ref
  const triggerPhaseAnnouncements = useCallback((step: TimerStep) => {
    const currentAudio = audioSettingsRef.current;
    if (currentAudio.chimesEnabled) {
      playPhaseSwitchChime(currentAudio.volume, step.phase === 'WORK');
    }
    announcePhaseStart(step.phase, step.exerciseName, step.setNumber, step.totalSets, currentAudio);
  }, []);

  // Master Play / Pause Toggle
  const toggleTimer = () => {
    unlockMobileAudio();
    if (!isRunning) {
      setIsRunning(true);
      enableBackgroundAudioKeepAlive();
      requestWakeLock();
      triggerPhaseAnnouncements(currentStep);
    } else {
      setIsRunning(false);
      releaseWakeLock();
    }
  };

  // Main Timer Tick Loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          setTotalElapsed((t) => t + 1);
          const currentAudio = audioSettingsRef.current;

          if (prev <= 1) {
            // Move to next step
            if (currentStepIndex < stepsRef.current.length - 1) {
              const nextIdx = currentStepIndex + 1;
              const nextStep = stepsRef.current[nextIdx];
              setCurrentStepIndex(nextIdx);
              triggerPhaseAnnouncements(nextStep);
              return nextStep.durationSeconds;
            } else {
              // Finished entire workout!
              setIsRunning(false);
              releaseWakeLock();
              if (currentAudio.chimesEnabled) playFanfare(currentAudio.volume);
              announcePhaseStart('FINISHED', '', 0, 0, currentAudio);
              onWorkoutComplete(totalElapsed + 1);
              return 0;
            }
          }

          // Countdown Beeps on 3, 2, 1
          const nextVal = prev - 1;
          if (nextVal <= 3 && nextVal >= 1 && currentAudio.chimesEnabled) {
            playCountdownBeep(currentAudio.volume, 660, nextVal === 1);
          }

          return nextVal;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, currentStepIndex, triggerPhaseAnnouncements, onWorkoutComplete, totalElapsed]);

  // Synchronized Skip Step Functions: Updates currentStepIndex & recalculates macro progress
  const handleSkipNext = () => {
    unlockMobileAudio();
    if (currentStepIndex < stepsRef.current.length - 1) {
      const nextIdx = currentStepIndex + 1;
      const nextStep = stepsRef.current[nextIdx];
      setCurrentStepIndex(nextIdx);
      setTimeLeft(nextStep.durationSeconds);
      if (isRunning) triggerPhaseAnnouncements(nextStep);
    }
  };

  const handleSkipPrev = () => {
    unlockMobileAudio();
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      const prevStep = stepsRef.current[prevIdx];
      setCurrentStepIndex(prevIdx);
      setTimeLeft(prevStep.durationSeconds);
      if (isRunning) triggerPhaseAnnouncements(prevStep);
    }
  };

  // Timer Circle Progress Math
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / currentStep.durationSeconds) * 100));

  // Dynamic Overall Macro Workout Progress (Syncs accurately when steps are skipped)
  const elapsedPreviousStepsSecs = stepsRef.current
    .slice(0, currentStepIndex)
    .reduce((acc, step) => acc + step.durationSeconds, 0);
  const currentStepElapsedSecs = Math.max(0, currentStep.durationSeconds - timeLeft);
  const totalAccurateElapsedSecs = elapsedPreviousStepsSecs + currentStepElapsedSecs;
  const overallProgress = Math.min(
    100,
    Math.round((totalAccurateElapsedSecs / (totalWorkoutDuration || 1)) * 100)
  );

  // Determine current phase visual badge colors
  const getPhaseHeader = () => {
    switch (currentStep.phase) {
      case 'PREPARE':
        return { text: 'GET READY', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'WORK':
        return { text: 'WORK HARD', bg: 'bg-red-500/20 text-red-300 border-red-500/30' };
      case 'REST':
      case 'EXERCISE_REST':
        return { text: 'REST & RECOVER', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      default:
        return { text: 'ACTIVE', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
    }
  };

  const phaseThemeClass = `phase-theme-${currentStep.phase}`;
  const headerBadge = getPhaseHeader();

  return (
    <div className={`w-full min-h-[80vh] flex flex-col items-center justify-between py-4 px-2 ${phaseThemeClass}`}>
      {/* Top Navigation & Status Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between gap-2 mb-4 glass-panel p-3 border border-white/10">
        <button
          onClick={onExitTimer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Exit Setup</span>
        </button>

        {/* Dynamic Phase Tag */}
        <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${headerBadge.bg}`}>
          {headerBadge.text}
        </span>

        {/* Screen Wake Lock indicator */}
        <div
          className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
            wakeLockActive ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'
          }`}
          title="Prevents mobile screen sleep during workouts"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Screen Keep-Alive</span>
        </div>
      </div>

      {/* Main Center Display: Circular Timer Deck */}
      <div className="flex flex-col items-center text-center my-auto space-y-6 w-full max-w-md">
        {/* Exercise Name & Stage Indicator */}
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Exercise {currentStep.exerciseIndex + 1} of {plan.exercises.length}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
            {currentStep.exerciseName}
          </h2>
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-slate-900/80 border border-white/10 text-xs font-extrabold text-cyan-300">
            <span>Set {currentStep.setNumber} of {currentStep.totalSets}</span>
          </div>
        </div>

        {/* Large SVG Circular Timer Ring */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 260 260">
            {/* Background Track */}
            <circle
              cx="130"
              cy="130"
              r="110"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="14"
              fill="transparent"
            />
            {/* Animated Dynamic Progress Track */}
            <circle
              cx="130"
              cy="130"
              r="110"
              stroke="var(--current-accent)"
              strokeWidth="14"
              strokeDasharray="691"
              strokeDashoffset={691 - (691 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
              className={`timer-circle-glow ${isRunning && currentStep.phase === 'WORK' ? 'pulse-active' : ''}`}
            />
          </svg>

          {/* Time Remaining Counter inside Circle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter font-mono drop-shadow-lg">
              {timeLeft}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
              Seconds
            </span>
          </div>
        </div>

        {/* Up Next Preview Banner */}
        {currentStep.nextStepPreview && (
          <div className="flex items-center gap-2 bg-slate-900/80 border border-white/10 px-4 py-2 rounded-2xl text-xs text-slate-300">
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-400">Up Next:</span>
            <span className="font-bold text-white truncate max-w-[200px]">{currentStep.nextStepPreview}</span>
          </div>
        )}
      </div>

      {/* Bottom Deck: Controls & Macro Overall Progress */}
      <div className="w-full max-w-xl space-y-4 mt-6">
        {/* Overall Workout Progress Bar (Synced on set skipping) */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>Overall Progress</span>
            <span className="text-cyan-400">{overallProgress}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-900 border border-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Master Control Deck Buttons */}
        <div className="flex items-center justify-center gap-6 pt-2">
          {/* Skip Previous */}
          <button
            onClick={handleSkipPrev}
            className="btn btn-secondary btn-icon"
            title="Previous Step"
          >
            <SkipForward className="w-5 h-5 rotate-180" />
          </button>

          {/* MASTER PLAY / PAUSE BUTTON */}
          <button
            onClick={toggleTimer}
            className="btn-master-play"
            title={isRunning ? 'Pause Workout' : 'Start Continuous Workout'}
          >
            {isRunning ? (
              <Pause className="w-10 h-10 fill-current" />
            ) : (
              <Play className="w-10 h-10 fill-current ml-1" />
            )}
          </button>

          {/* Skip Next */}
          <button
            onClick={handleSkipNext}
            className="btn btn-secondary btn-icon"
            title="Skip to Next Step"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
