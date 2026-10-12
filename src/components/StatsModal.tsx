import React from 'react';
import { X, BarChart2, Trophy, Crosshair, Dices, RotateCcw } from 'lucide-react';
import { GameStats, PlayerColor } from '../types/ludo';
import { COLOR_CONFIG } from '../utils/ludoBoard';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  onResetStats: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onResetStats,
}) => {
  if (!isOpen) return null;

  const colors: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Career Statistics</h2>
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
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Games Played
              </span>
              <span className="text-2xl font-black text-slate-900 tabular-nums">
                {stats.gamesPlayed}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Captures Made
              </span>
              <span className="text-2xl font-black text-slate-900 tabular-nums">
                {Object.values(stats.totalCaptures).reduce((a, b) => a + b, 0)}
              </span>
            </div>
          </div>

          {/* Color Breakdown Table */}
          <div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
              Performance by Color
            </span>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                    <th className="py-2.5 px-3">Color</th>
                    <th className="py-2.5 px-3 text-right">Victories</th>
                    <th className="py-2.5 px-3 text-right">Captures</th>
                    <th className="py-2.5 px-3 text-right">Sixes</th>
                    <th className="py-2.5 px-3 text-right">Moves</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {colors.map((color) => {
                    const cfg = COLOR_CONFIG[color];
                    return (
                      <tr key={color} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: cfg.primary }}
                          />
                          <span>{cfg.name}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-900 tabular-nums">
                          {stats.gamesWon[color]}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums">
                          {stats.totalCaptures[color]}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums">
                          {stats.totalSixes[color]}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums">
                          {stats.totalMoves[color]}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onResetStats}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Stats</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
