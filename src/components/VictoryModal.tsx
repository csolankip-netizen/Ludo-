import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Crown, Play, RefreshCw, Trophy } from 'lucide-react';
import { PlayerColor, PlayerConfig } from '../types/ludo';
import { COLOR_CONFIG } from '../utils/ludoBoard';

interface VictoryModalProps {
  winner: PlayerConfig;
  rankings: PlayerConfig[];
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  rankings,
  onPlayAgain,
  onNewGame,
}) => {
  const winnerCfg = COLOR_CONFIG[winner.color];

  useEffect(() => {
    // Launch fireworks confetti
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#E11D48', '#10B981', '#F59E0B', '#2563EB'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#E11D48', '#10B981', '#F59E0B', '#2563EB'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-center">
        {/* Banner with winner color glow */}
        <div
          className="p-8 text-white relative overflow-hidden"
          style={{ backgroundColor: winnerCfg.primary }}
        >
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-lg border border-white/30 mb-3 animate-bounce">
              <Trophy className="w-9 h-9 text-amber-300 fill-amber-300" />
            </div>

            <span className="text-xs uppercase tracking-widest font-black text-white/80">
              Match Champion
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              {winner.name} Wins!
            </h2>
            <p className="text-xs text-white/90 mt-1">
              Successfully guided all 4 {winnerCfg.name} tokens safely Home!
            </p>
          </div>
        </div>

        {/* Rankings Breakdown */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-left">
              Final Standings
            </span>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
              {rankings.map((p, idx) => {
                const cfg = COLOR_CONFIG[p.color];
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-4 py-2.5 text-xs text-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-400 w-4 text-left">
                        #{idx + 1}
                      </span>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cfg.primary }}
                      />
                      <span className="font-semibold text-slate-900">{p.name}</span>
                    </div>

                    <span className="text-slate-500 text-[11px]">
                      {idx === 0 ? '🏆 1st Place' : p.type === 'bot' ? 'Bot' : 'Player'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              onClick={onPlayAgain}
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Rematch</span>
            </button>

            <button
              type="button"
              onClick={onNewGame}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
            >
              <Play className="w-4 h-4" />
              <span>New Setup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
