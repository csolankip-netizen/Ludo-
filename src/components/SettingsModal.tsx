import React from 'react';
import { X, Sliders, Volume2, VolumeX, Zap } from 'lucide-react';
import { GameSettings } from '../types/ludo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSave: (updated: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Game Settings</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Sound FX */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-slate-700" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span className="font-semibold text-slate-900">Audio Sound Effects</span>
            </div>
            <button
              type="button"
              onClick={() => onSave({ soundEnabled: !settings.soundEnabled })}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                settings.soundEnabled
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {settings.soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          {/* Animation Speed */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Animation Speed</span>
              </div>
              <span className="text-slate-500 capitalize">{settings.animationSpeed}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['normal', 'fast', 'instant'] as const).map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => onSave({ animationSpeed: spd })}
                  className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                    settings.animationSpeed === spd
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {spd}
                </button>
              ))}
            </div>
          </div>

          {/* Rules Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Gameplay Rules
            </div>

            <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <span className="text-slate-700 font-medium">Exact roll to enter Home</span>
              <input
                type="checkbox"
                checked={settings.exactRollToFinish}
                onChange={(e) => onSave({ exactRollToFinish: e.target.checked })}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 accent-slate-900"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <span className="text-slate-700 font-medium">Exit Yard on 1 or 6</span>
              <input
                type="checkbox"
                checked={settings.allowOneOrSixToStart}
                onChange={(e) => onSave({ allowOneOrSixToStart: e.target.checked })}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 accent-slate-900"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <span className="text-slate-700 font-medium">3 Consecutive 6s Penalty</span>
              <input
                type="checkbox"
                checked={settings.threeConsecutiveSixesPenalty}
                onChange={(e) => onSave({ threeConsecutiveSixesPenalty: e.target.checked })}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 accent-slate-900"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
