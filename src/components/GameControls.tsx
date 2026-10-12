import React from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
  BookOpen,
  Settings as SettingsIcon,
  BarChart2,
  ListRestart,
} from 'lucide-react';
import { GameSettings, MoveLog } from '../types/ludo';

interface GameControlsProps {
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onNewGame: () => void;
  onRestartCurrent: () => void;
  canUndo: boolean;
  onUndo: () => void;
  lastLog?: MoveLog;
}

export const GameControls: React.FC<GameControlsProps> = ({
  settings,
  onUpdateSettings,
  onOpenRules,
  onOpenSettings,
  onOpenStats,
  onNewGame,
  onRestartCurrent,
  canUndo,
  onUndo,
  lastLog,
}) => {
  const toggleSound = () => {
    onUpdateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const cycleSpeed = () => {
    const nextSpeed =
      settings.animationSpeed === 'normal'
        ? 'fast'
        : settings.animationSpeed === 'fast'
        ? 'instant'
        : 'normal';
    onUpdateSettings({ animationSpeed: nextSpeed });
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Event commentary banner */}
      <div className="bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs flex items-center justify-between gap-3 shadow-sm min-h-[36px]">
        <div className="flex items-center gap-2 truncate">
          <span className="text-slate-400 font-medium shrink-0">Status:</span>
          {lastLog ? (
            <span className="truncate">
              <strong>{lastLog.playerName}</strong>{' '}
              {lastLog.action === 'spawn' && `mobilized a token from base on roll ${lastLog.diceValue}`}
              {lastLog.action === 'move' && `moved token ${lastLog.diceValue} spaces`}
              {lastLog.action === 'capture' && `captured ${lastLog.capturedColor}'s token! ⚔️ Bonus turn awarded!`}
              {lastLog.action === 'home' && `banked a token into Home! 🏆 Bonus turn awarded!`}
              {lastLog.action === 'skip' && `had no valid moves with roll ${lastLog.diceValue}`}
            </span>
          ) : (
            <span className="text-slate-300">Roll the dice to make your move</span>
          )}
        </div>

        {/* Speed button */}
        <button
          type="button"
          onClick={cycleSpeed}
          title={`Animation speed: ${settings.animationSpeed}. Click to cycle`}
          className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 uppercase tracking-wider shrink-0 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{settings.animationSpeed}</span>
        </button>
      </div>

      {/* Main button toolbar */}
      <div className="flex items-center justify-between gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleSound}
            aria-label={settings.soundEnabled ? 'Mute sound' : 'Unmute sound'}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            title={settings.soundEnabled ? 'Mute sound FX' : 'Enable sound FX'}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenRules}
            aria-label="How to play & Rules"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            title="Rules & Safe Squares"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenStats}
            aria-label="View statistics"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            title="Match & Career Statistics"
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Game settings"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            title="Custom Rules & AI Bot Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {canUndo && (
            <button
              type="button"
              onClick={onUndo}
              aria-label="Undo move"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              title="Undo last move"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onRestartCurrent}
            aria-label="Restart match"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            title="Restart current match"
          >
            <ListRestart className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onNewGame}
            className="px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-white rounded-lg transition-colors whitespace-nowrap"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};
