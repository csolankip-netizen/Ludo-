import React from 'react';
import { PlayerColor } from '../types/ludo';
import { COLOR_CONFIG } from '../utils/ludoBoard';

interface DiceProps {
  value: number | null;
  isRolling: boolean;
  canRoll: boolean;
  activeColor: PlayerColor;
  consecutiveSixes: number;
  onRoll: () => void;
  disabled?: boolean;
}

export const Dice: React.FC<DiceProps> = ({
  value,
  isRolling,
  canRoll,
  activeColor,
  consecutiveSixes,
  onRoll,
  disabled = false,
}) => {
  const colorCfg = COLOR_CONFIG[activeColor];

  // Dot coordinates for standard dice faces (grid 3x3)
  const renderDots = (num: number) => {
    const dots: { row: number; col: number }[] = [];
    if (num === 1) {
      dots.push({ row: 2, col: 2 });
    } else if (num === 2) {
      dots.push({ row: 1, col: 3 }, { row: 3, col: 1 });
    } else if (num === 3) {
      dots.push({ row: 1, col: 3 }, { row: 2, col: 2 }, { row: 3, col: 1 });
    } else if (num === 4) {
      dots.push({ row: 1, col: 1 }, { row: 1, col: 3 }, { row: 3, col: 1 }, { row: 3, col: 3 });
    } else if (num === 5) {
      dots.push({ row: 1, col: 1 }, { row: 1, col: 3 }, { row: 2, col: 2 }, { row: 3, col: 1 }, { row: 3, col: 3 });
    } else if (num === 6) {
      dots.push(
        { row: 1, col: 1 }, { row: 1, col: 3 },
        { row: 2, col: 1 }, { row: 2, col: 3 },
        { row: 3, col: 1 }, { row: 3, col: 3 }
      );
    }

    return (
      <div className="grid grid-cols-3 grid-rows-3 w-10 h-10 sm:w-12 sm:h-12 p-1.5 gap-1 place-items-center">
        {[1, 2, 3].map((r) =>
          [1, 2, 3].map((c) => {
            const hasDot = dots.some((d) => d.row === r && d.col === c);
            return (
              <div key={`${r}-${c}`} className="w-full h-full flex items-center justify-center">
                {hasDot && (
                  <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-inner"
                    style={{
                      backgroundColor: num === 6 || num === 1 ? colorCfg.primary : '#1E293B',
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  const displayVal = isRolling ? Math.floor(Math.random() * 6) + 1 : (value || 6);

  return (
    <div className="flex flex-col items-center select-none">
      <button
        type="button"
        disabled={disabled || !canRoll || isRolling}
        onClick={onRoll}
        aria-label={`Roll dice for ${colorCfg.name}`}
        className={`group relative p-2.5 sm:p-3 rounded-2xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 ${
          canRoll && !isRolling
            ? 'cursor-pointer hover:scale-105 active:scale-95 shadow-lg'
            : 'cursor-not-allowed opacity-90'
        }`}
        style={{
          boxShadow: canRoll && !isRolling ? `0 10px 25px -5px ${colorCfg.primary}40` : undefined,
        }}
      >
        {/* Dice Body with 3D appearance */}
        <div
          className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 bg-gradient-to-br from-white via-slate-50 to-slate-200 shadow-md transition-transform duration-300 ${
            isRolling ? 'animate-bounce rotate-12 scale-95' : ''
          }`}
          style={{
            borderColor: canRoll ? colorCfg.primary : '#E2E8F0',
          }}
        >
          {renderDots(displayVal)}

          {/* Corner bevel highlight */}
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none border border-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.06)]" />
        </div>

        {/* Pulse ring when rolling is expected */}
        {canRoll && !isRolling && (
          <span
            className="absolute inset-0 rounded-2xl pointer-events-none animate-ping opacity-25"
            style={{ backgroundColor: colorCfg.primary }}
          />
        )}
      </button>

      {/* Helper label under dice */}
      <div className="mt-2 text-center h-6">
        {isRolling ? (
          <span className="text-xs font-semibold text-slate-500 animate-pulse">Rolling...</span>
        ) : canRoll ? (
          <span
            className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ color: colorCfg.primary }}
          >
            Roll Now
          </span>
        ) : value ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span>Rolled <strong className="text-slate-900">{value}</strong></span>
            {value === 6 && (
              <span className="text-amber-600 font-bold">
                {consecutiveSixes === 1 ? '· Extra Roll!' : consecutiveSixes === 2 ? '· 2nd Six!' : '· 3rd Six!'}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400">Waiting</span>
        )}
      </div>
    </div>
  );
};
