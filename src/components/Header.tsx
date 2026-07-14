'use client';

import React from 'react';
import { UserSession } from '@/lib/types';
import { Timer, Volume2, User, LogOut, Sparkles, FolderHeart } from 'lucide-react';

interface HeaderProps {
  user: UserSession | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAudioSettings: () => void;
  activePlanTitle: string;
  onSelectPresetsModal: () => void;
}

export default function Header({
  user,
  onOpenAuth,
  onLogout,
  onOpenAudioSettings,
  activePlanTitle,
  onSelectPresetsModal,
}: HeaderProps) {
  return (
    <header className="w-full border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-black shadow-lg shadow-cyan-500/20">
            <Timer className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-white leading-none">
              PULSE<span className="text-cyan-400 font-normal">TIME</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Workout Timekeeper
            </p>
          </div>
        </div>

        {/* Routine Name Indicator / Preset Switcher */}
        <button
          onClick={onSelectPresetsModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-all max-w-[200px] sm:max-w-xs truncate"
        >
          <FolderHeart className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">{activePlanTitle || 'Select Plan'}</span>
          <span className="text-[10px] text-cyan-400/80 uppercase font-bold tracking-wider ml-1 bg-cyan-950/60 px-1.5 py-0.5 rounded">
            Routines
          </span>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Audio & Speech Settings */}
          <button
            onClick={onOpenAudioSettings}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-400 border border-white/5 transition-all"
            title="Audio & Speech Voice Settings"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* User Account / Auth Status */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-white/10">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-white leading-tight">{user.name || user.email.split('@')[0]}</span>
                <span className="text-[10px] text-slate-400">Account Active</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all"
            >
              <User className="w-4 h-4" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
