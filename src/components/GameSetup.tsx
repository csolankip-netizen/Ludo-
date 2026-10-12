import React, { useState } from 'react';
import { Bot, Play, User, Users, Sparkles, Swords, Shuffle } from 'lucide-react';
import { BotPersonality, GameSettings, PlayerColor, PlayerConfig, PlayerType } from '../types/ludo';
import { COLOR_CONFIG } from '../utils/ludoBoard';

interface GameSetupProps {
  onStartGame: (players: PlayerConfig[], settings: GameSettings) => void;
  currentSettings: GameSettings;
}

export const GameSetup: React.FC<GameSetupProps> = ({
  onStartGame,
  currentSettings,
}) => {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4);
  const [twoPlayerLayout, setTwoPlayerLayout] = useState<'opposite' | 'adjacent'>('opposite');

  // Configuration for 4 seats
  const [seatConfigs, setSeatConfigs] = useState<
    Record<PlayerColor, { name: string; type: PlayerType; botPersonality: BotPersonality }>
  >({
    red: { name: 'You (Player 1)', type: 'human', botPersonality: 'tactician' },
    green: { name: 'Green Bot', type: 'bot', botPersonality: 'casual' },
    yellow: { name: 'Yellow Bot', type: 'bot', botPersonality: 'tactician' },
    blue: { name: 'Blue Bot', type: 'bot', botPersonality: 'hunter' },
  });

  const [settings, setSettings] = useState<GameSettings>({ ...currentSettings });

  // Quick preset handlers
  const applyPreset = (preset: 'vs3bots' | 'pass2' | 'pass4' | '2v2') => {
    if (preset === 'vs3bots') {
      setPlayerCount(4);
      setSeatConfigs({
        red: { name: 'You', type: 'human', botPersonality: 'tactician' },
        green: { name: 'Green Bot', type: 'bot', botPersonality: 'casual' },
        yellow: { name: 'Yellow Bot', type: 'bot', botPersonality: 'tactician' },
        blue: { name: 'Blue Bot', type: 'bot', botPersonality: 'hunter' },
      });
    } else if (preset === 'pass2') {
      setPlayerCount(2);
      setTwoPlayerLayout('opposite');
      setSeatConfigs({
        red: { name: 'Player 1', type: 'human', botPersonality: 'tactician' },
        green: { name: 'Green Bot', type: 'bot', botPersonality: 'casual' },
        yellow: { name: 'Player 2', type: 'human', botPersonality: 'tactician' },
        blue: { name: 'Blue Bot', type: 'bot', botPersonality: 'hunter' },
      });
    } else if (preset === 'pass4') {
      setPlayerCount(4);
      setSeatConfigs({
        red: { name: 'Player 1', type: 'human', botPersonality: 'tactician' },
        green: { name: 'Player 2', type: 'human', botPersonality: 'casual' },
        yellow: { name: 'Player 3', type: 'human', botPersonality: 'tactician' },
        blue: { name: 'Player 4', type: 'human', botPersonality: 'hunter' },
      });
    } else if (preset === '2v2') {
      setPlayerCount(4);
      setSeatConfigs({
        red: { name: 'Player 1', type: 'human', botPersonality: 'tactician' },
        green: { name: 'Green Bot', type: 'bot', botPersonality: 'tactician' },
        yellow: { name: 'Player 2', type: 'human', botPersonality: 'tactician' },
        blue: { name: 'Blue Bot', type: 'bot', botPersonality: 'hunter' },
      });
    }
  };

  // Determine active colors based on playerCount and layout
  const getActiveColors = (): PlayerColor[] => {
    if (playerCount === 4) return ['red', 'green', 'yellow', 'blue'];
    if (playerCount === 3) return ['red', 'green', 'yellow'];
    // 2 players:
    return twoPlayerLayout === 'opposite' ? ['red', 'yellow'] : ['red', 'green'];
  };

  const activeColors = getActiveColors();

  const handleSeatTypeChange = (color: PlayerColor, type: PlayerType) => {
    setSeatConfigs((prev) => {
      const currentName = prev[color].name;
      let newName = currentName;
      if (type === 'human' && currentName.toLowerCase().includes('bot')) {
        newName = `${COLOR_CONFIG[color].name} Player`;
      } else if (type === 'bot' && (currentName.toLowerCase().includes('player') || currentName.toLowerCase().includes('you'))) {
        newName = `${COLOR_CONFIG[color].name} Bot`;
      }

      return {
        ...prev,
        [color]: {
          ...prev[color],
          type,
          name: newName,
        },
      };
    });
  };

  const handleStart = () => {
    const finalPlayers: PlayerConfig[] = activeColors.map((color, idx) => ({
      id: `player-${color}`,
      color,
      name: seatConfigs[color].name || `${COLOR_CONFIG[color].name} Player`,
      type: seatConfigs[color].type,
      botPersonality: seatConfigs[color].botPersonality,
      avatarSeed: idx + 1,
    }));

    onStartGame(finalPlayers, settings);
  };

  return (
    <div className="max-w-3xl mx-auto w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Title & Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 text-center relative">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Outfit']">
          Player Selection
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-300">
          Configure players and AI bots for each of the four home bases
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Quick Presets */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Quick Game Modes
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => applyPreset('vs3bots')}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                <Bot className="w-4 h-4 text-emerald-600" />
                <span>1 vs 3 Bots</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Play solo against 3 smart AI bots</p>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('pass2')}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                <Users className="w-4 h-4 text-blue-600" />
                <span>2 Players</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Pass & Play duel between 2 players</p>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('2v2')}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                <Swords className="w-4 h-4 text-amber-600" />
                <span>2 Humans + 2 Bots</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Mixed match with 2 friends and 2 bots</p>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('pass4')}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                <Users className="w-4 h-4 text-rose-600" />
                <span>4 Players</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">4 local friends on one device</p>
            </button>
          </div>
        </div>

        {/* Player Count Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Active Bases & Player Count
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {([2, 3, 4] as const).map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setPlayerCount(count)}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                  playerCount === count
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{count} Bases Active</span>
                </div>
              </button>
            ))}
          </div>

          {/* 2 Player Layout Options */}
          {playerCount === 2 && (
            <div className="mt-2.5 flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium px-2">2-Player Positions:</span>
              <button
                type="button"
                onClick={() => setTwoPlayerLayout('opposite')}
                className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer ${
                  twoPlayerLayout === 'opposite'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Opposite (Red vs Yellow)
              </button>
              <button
                type="button"
                onClick={() => setTwoPlayerLayout('adjacent')}
                className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer ${
                  twoPlayerLayout === 'adjacent'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Adjacent (Red vs Green)
              </button>
            </div>
          )}
        </div>

        {/* 4 Home Bases Configuration */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Home Bases Configuration
            </label>
            <span className="text-[11px] text-slate-500">
              Set each base to Human or AI Bot
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {activeColors.map((color) => {
              const cfg = seatConfigs[color];
              const colorInfo = COLOR_CONFIG[color];

              return (
                <div
                  key={color}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full shadow-xs"
                        style={{ backgroundColor: colorInfo.primary }}
                      />
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {colorInfo.name} Base
                      </span>
                    </div>

                    {/* Human / Bot Switch */}
                    <div className="flex items-center p-0.5 bg-slate-200 rounded-lg">
                      <button
                        type="button"
                        onClick={() => handleSeatTypeChange(color, 'human')}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                          cfg.type === 'human'
                            ? 'bg-white text-slate-900 shadow-xs font-semibold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <User className="w-3 h-3" />
                        Human
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSeatTypeChange(color, 'bot')}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                          cfg.type === 'bot'
                            ? 'bg-white text-slate-900 shadow-xs font-semibold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Bot className="w-3 h-3" />
                        AI Bot
                      </button>
                    </div>
                  </div>

                  {/* Player Name Input */}
                  <div>
                    <input
                      type="text"
                      maxLength={18}
                      value={cfg.name}
                      onChange={(e) =>
                        setSeatConfigs((prev) => ({
                          ...prev,
                          [color]: { ...prev[color], name: e.target.value },
                        }))
                      }
                      placeholder={`${colorInfo.name} Player Name`}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  {/* Bot Personality (if bot) */}
                  {cfg.type === 'bot' && (
                    <div className="pt-0.5">
                      <div className="text-[11px] font-medium text-slate-500 mb-1 flex items-center justify-between">
                        <span>AI Bot Personality:</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {(['casual', 'tactician', 'hunter'] as const).map((pers) => (
                          <button
                            key={pers}
                            type="button"
                            onClick={() =>
                              setSeatConfigs((prev) => ({
                                ...prev,
                                [color]: { ...prev[color], botPersonality: pers },
                              }))
                            }
                            className={`px-1.5 py-1 text-[11px] font-medium rounded-md capitalize transition-colors text-center border cursor-pointer ${
                              cfg.botPersonality === pers
                                ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {pers === 'casual' && 'Friendly'}
                            {pers === 'tactician' && 'Tactician'}
                            {pers === 'hunter' && 'Aggressive'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Game CTA Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm sm:text-base transition-all duration-150 shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Start Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};
