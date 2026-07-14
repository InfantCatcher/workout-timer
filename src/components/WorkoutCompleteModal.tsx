'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Flame, RotateCcw, CheckCircle, Sparkles } from 'lucide-react';

interface WorkoutCompleteModalProps {
  isOpen: boolean;
  totalTimeSeconds: number;
  exerciseCount: number;
  onRestart: () => void;
  onEdit: () => void;
}

export default function WorkoutCompleteModal({
  isOpen,
  totalTimeSeconds,
  exerciseCount,
  onRestart,
  onEdit,
}: WorkoutCompleteModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Trigger celebratory confetti cannons
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatMinutes = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel p-6 sm:p-8 border border-cyan-500/30 text-center shadow-2xl rounded-3xl overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />

        {/* Trophy Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-black shadow-lg shadow-yellow-500/30 mb-4 animate-bounce">
          <Trophy className="w-8 h-8 stroke-[2.5]" />
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight">WORKOUT COMPLETE!</h2>
        <p className="text-xs text-slate-300 mt-1">Fantastic endurance! You crushed your timing plan.</p>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5 text-center">
            <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Time</span>
            <span className="text-lg font-black text-cyan-300">{formatMinutes(totalTimeSeconds)}</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5 text-center">
            <Flame className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Exercises</span>
            <span className="text-lg font-black text-red-300">{exerciseCount} Moves</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5">
          <button onClick={onRestart} className="w-full btn btn-primary py-3 text-sm">
            <RotateCcw className="w-4 h-4" />
            <span>Repeat Workout</span>
          </button>
          <button onClick={onEdit} className="w-full btn btn-secondary py-3 text-xs">
            <span>Return to Setup Phase</span>
          </button>
        </div>
      </div>
    </div>
  );
}
