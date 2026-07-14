'use client';

import React, { useState } from 'react';
import { WorkoutPlanData, ExerciseItem } from '@/lib/types';
import {
  Play,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Save,
  Flame,
  Dumbbell,
  Clock,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';

interface RoutineEditorProps {
  plan: WorkoutPlanData;
  onUpdatePlan: (updated: WorkoutPlanData) => void;
  onSaveToDb: () => void;
  onStartWorkout: () => void;
  isSaving: boolean;
  isLoggedIn: boolean;
}

export default function RoutineEditor({
  plan,
  onUpdatePlan,
  onSaveToDb,
  onStartWorkout,
  isSaving,
  isLoggedIn,
}: RoutineEditorProps) {
  const [editingTitle, setEditingTitle] = useState(false);

  const calculateTotalSeconds = () => {
    let total = 0;
    plan.exercises.forEach((ex, idx) => {
      // Sets work + rest
      const setWorkRest = ex.sets * (ex.workSeconds + ex.restSeconds) - ex.restSeconds; // Last set rest is exercise transition rest
      total += Math.max(0, setWorkRest);
      if (idx < plan.exercises.length - 1) {
        total += plan.interExerciseRest;
      }
    });
    return total;
  };

  const formatTotalTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs > 0 ? `${secs}s` : ''}`;
  };

  const handleExerciseChange = (index: number, field: keyof ExerciseItem, value: string | number) => {
    const newExercises = [...plan.exercises];
    newExercises[index] = {
      ...newExercises[index],
      [field]: value,
    };
    onUpdatePlan({ ...plan, exercises: newExercises });
  };

  const handleAddExercise = () => {
    const newEx: ExerciseItem = {
      id: `ex-new-${Date.now()}`,
      name: `Exercise ${plan.exercises.length + 1}`,
      sets: 3,
      workSeconds: 40,
      restSeconds: 20,
      orderIndex: plan.exercises.length,
    };
    onUpdatePlan({ ...plan, exercises: [...plan.exercises, newEx] });
  };

  const handleRemoveExercise = (index: number) => {
    if (plan.exercises.length <= 1) return;
    const newExercises = plan.exercises.filter((_, i) => i !== index);
    onUpdatePlan({ ...plan, exercises: newExercises });
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === plan.exercises.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const newExercises = [...plan.exercises];
    const temp = newExercises[index];
    newExercises[index] = newExercises[targetIdx];
    newExercises[targetIdx] = temp;
    onUpdatePlan({ ...plan, exercises: newExercises });
  };

  const totalDurationSeconds = calculateTotalSeconds();

  return (
    <div className="w-full space-y-6">
      {/* Overview Macro Header Banner */}
      <div className="glass-panel p-6 border border-white/10 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br from-cyan-500/20 to-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800/50 px-2.5 py-0.5 rounded-full">
                SETUP PHASE
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                {plan.exercises.length} Exercises Configured
              </span>
            </div>

            {/* Editable Routine Title */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={plan.title}
                onChange={(e) => onUpdatePlan({ ...plan, title: e.target.value })}
                className="text-2xl sm:text-3xl font-extrabold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-cyan-400 focus:outline-none transition-all py-1 max-w-full"
                placeholder="Routine Name..."
              />
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-lg">
              Set up timing parameters per exercise and rest period below. When ready, trigger the master start timer deck.
            </p>
          </div>

          {/* Stat Badges & Action CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 bg-slate-900/80 border border-white/10 px-4 py-2.5 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Total Duration</span>
                <span className="text-lg font-extrabold text-cyan-300">{formatTotalTime(totalDurationSeconds)}</span>
              </div>
            </div>

            {/* Save to DB button */}
            <button
              onClick={onSaveToDb}
              disabled={isSaving}
              className="btn btn-secondary text-xs"
              title={isLoggedIn ? 'Save plan to user account database' : 'Save plan locally'}
            >
              <Save className="w-4 h-4 text-cyan-400" />
              <span>{isSaving ? 'Saving...' : 'Save Routine'}</span>
            </button>

            {/* MASTER START BUTTON */}
            <button
              onClick={onStartWorkout}
              className="btn btn-primary text-sm px-6 shadow-xl shadow-cyan-500/30 font-extrabold uppercase tracking-wide"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Workout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Macro Inter-Exercise Rest Parameter */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/5 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Inter-Exercise Transition Rest</h3>
            <p className="text-xs text-slate-400">Rest duration between different exercise movements</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="5"
            max="300"
            value={plan.interExerciseRest}
            onChange={(e) =>
              onUpdatePlan({ ...plan, interExerciseRest: Math.max(0, parseInt(e.target.value) || 0) })
            }
            className="glass-input w-24 text-center text-sm font-bold text-purple-300"
          />
          <span className="text-xs text-slate-400 font-semibold">seconds</span>
        </div>
      </div>

      {/* Micro Setup: Per Exercise Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-cyan-400" />
            <span>Exercises & Set Timers ({plan.exercises.length})</span>
          </h3>

          <button
            onClick={handleAddExercise}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Exercise</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {plan.exercises.map((ex, idx) => (
            <div
              key={ex.id || `ex-${idx}`}
              className="glass-panel p-5 border border-white/10 hover:border-cyan-500/30 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Exercise Name & Reorder */}
                <div className="flex items-center gap-3 flex-1">
                  <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 font-black text-xs border border-cyan-500/20 shrink-0">
                    #{idx + 1}
                  </span>

                  <input
                    type="text"
                    value={ex.name}
                    onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)}
                    className="glass-input font-bold text-base text-white hover:bg-white/10 transition-all flex-1"
                    placeholder="Exercise name (e.g. Push-ups)"
                  />
                </div>

                {/* Per-Exercise Timing Inputs (Micro Config) */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Sets */}
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 text-center">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Sets
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={ex.sets}
                      onChange={(e) =>
                        handleExerciseChange(idx, 'sets', Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-full text-center bg-transparent text-sm font-black text-cyan-300 focus:outline-none"
                    />
                  </div>

                  {/* Work Duration */}
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 text-center">
                    <label className="block text-[10px] font-bold text-red-400 uppercase mb-1 flex items-center justify-center gap-1">
                      <Flame className="w-3 h-3" />
                      <span>Work (s)</span>
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="600"
                      value={ex.workSeconds}
                      onChange={(e) =>
                        handleExerciseChange(
                          idx,
                          'workSeconds',
                          Math.max(5, parseInt(e.target.value) || 5)
                        )
                      }
                      className="w-full text-center bg-transparent text-sm font-black text-red-300 focus:outline-none"
                    />
                  </div>

                  {/* Rest Duration */}
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 text-center">
                    <label className="block text-[10px] font-bold text-emerald-400 uppercase mb-1 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Rest (s)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="600"
                      value={ex.restSeconds}
                      onChange={(e) =>
                        handleExerciseChange(
                          idx,
                          'restSeconds',
                          Math.max(0, parseInt(e.target.value) || 0)
                        )
                      }
                      className="w-full text-center bg-transparent text-sm font-black text-emerald-300 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Move Up/Down & Remove Buttons */}
                <div className="flex items-center gap-1 justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                  <button
                    onClick={() => handleMoveExercise(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 transition-all"
                    title="Move Up"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveExercise(idx, 'down')}
                    disabled={idx === plan.exercises.length - 1}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 transition-all"
                    title="Move Down"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveExercise(idx)}
                    disabled={plan.exercises.length <= 1}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 disabled:opacity-20 transition-all ml-1"
                    title="Delete Exercise"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
