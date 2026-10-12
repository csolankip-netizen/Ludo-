import React from 'react';
import { Bot, Crown, User } from 'lucide-react';
import { PlayerColor, PlayerConfig, Token } from '../types/ludo';
import { COLOR_CONFIG } from '../utils/ludoBoard';

interface PlayerCardProps {
  player: PlayerConfig;
  isActive: boolean;
  tokens: Token[];
  rank?: number; // 1, 2, 3 if finished
  isCompact?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isActive,
  tokens,
  rank,
  isCompact = false,
}) => {
  const colorCfg = COLOR_CONFIG[player.color];
  const finishedCount = tokens.filter((t) => t.isHome).length;
  const onBoardCount = tokens.filter((t) => t.step >= 0 && !t.isHome).length;
  const yardCount = tokens.filter((t) => t.step === -1).length;

  return (
    <div
      className={`relative rounded-xl transition-all duration-200 border ${
        isActive
          ? 'bg-white shadow-md border-slate-900 ring-2 ring-slate-900/10'
          : 'bg-slate-50/80 border-slate-200 opacity-90'
      } ${isCompact ? 'p-2.5' : 'p-3 sm:p-4'}`}
    >
      {/* Active turn indicator line */}
      {isActive && (
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
          style={{ backgroundColor: colorCfg.primary }}
        />
      )}

      {/* Header with avatar, name, and bot/human indicator */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Color token swatch / Avatar */}
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ backgroundColor: colorCfg.primary }}
          >
            {player.type === 'human' ? (
              <User className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </div>

          {/* Name & Player Type (Clean Unboxed Text Metadata) */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                {player.name}
              </span>
              {rank && (
                <span className="inline-flex items-center text-xs font-bold text-amber-600">
                  <Crown className="w-3.5 h-3.5 inline mr-0.5 text-amber-500 fill-amber-400" />
                  #{rank}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span>{player.type === 'human' ? 'Pass & Play' : 'Bot'}</span>
              {player.type === 'bot' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{player.botPersonality}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Turn Status */}
        {isActive && !rank && (
          <span
            className="text-[11px] font-bold uppercase tracking-wider shrink-0"
            style={{ color: colorCfg.primary }}
          >
            Turn
          </span>
        )}
      </div>

      {/* Tokens status counters */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span title="Tokens at home base">Base: <strong className="text-slate-900 tabular-nums">{yardCount}</strong></span>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span title="Tokens on board track">Active: <strong className="text-slate-900 tabular-nums">{onBoardCount}</strong></span>
        </div>

        {/* Home progress slots (4 slots) */}
        <div className="flex items-center gap-1" title={`${finishedCount} of 4 tokens safely banked in Home`}>
          {[0, 1, 2, 3].map((slotIdx) => {
            const isCompleted = slotIdx < finishedCount;
            return (
              <div
                key={slotIdx}
                className="w-2.5 h-2.5 rounded-full transition-colors duration-200"
                style={{
                  backgroundColor: isCompleted ? colorCfg.primary : '#E2E8F0',
                  border: isCompleted ? `1px solid ${colorCfg.dark}` : '1px solid #CBD5E1',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
