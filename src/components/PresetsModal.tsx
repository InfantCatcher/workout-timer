'use client';

import React from 'react';
import { WorkoutPlanData } from '@/lib/types';
import { DEFAULT_PRESETS } from '@/lib/defaultPresets';
import { X, Sparkles, Folder, Check, Trash2, Plus } from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPlans: WorkoutPlanData[];
  onSelectPlan: (plan: WorkoutPlanData) => void;
  onDeletePlan?: (planId: string) => void;
  onCreateNewPlan: () => void;
}

export default function PresetsModal({
  isOpen,
  onClose,
  savedPlans,
  onSelectPlan,
  onDeletePlan,
  onCreateNewPlan,
}: PresetsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl rounded-3xl max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Workout Routines</h2>
              <p className="text-xs text-slate-400">Choose a template or select your saved account routines.</p>
            </div>
          </div>

          <button
            onClick={() => {
              onCreateNewPlan();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Custom</span>
          </button>
        </div>

        {/* Saved Account Routines */}
        {savedPlans.length > 0 && (
          <div className="mb-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <span>My Saved Routines ({savedPlans.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="glass-panel p-4 border border-white/10 hover:border-cyan-500/50 transition-all flex flex-col justify-between group cursor-pointer"
                  onClick={() => {
                    onSelectPlan(plan);
                    onClose();
                  }}
                >
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {plan.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {plan.exercises.length} Exercises • {plan.interExerciseRest}s Transition
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                    <span className="text-[10px] text-cyan-400 font-semibold uppercase">Select Routine</span>
                    {onDeletePlan && plan.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePlan(plan.id!);
                        }}
                        className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                        title="Delete saved routine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Built-in Preset Templates */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Built-in Workout Presets</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEFAULT_PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPlan(preset);
                  onClose();
                }}
                className="glass-panel p-4 border border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {preset.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {preset.exercises.length} Exercises
                  </span>
                  <span className="text-[10px] font-bold text-cyan-400 group-hover:underline">
                    Load Preset &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
