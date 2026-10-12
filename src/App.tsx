import React, { useEffect, useRef, useState } from 'react';
import {
  BotPersonality,
  GameSettings,
  GameStats,
  MoveLog,
  PlayerColor,
  PlayerConfig,
  Token,
} from './types/ludo';
import { sound } from './utils/audio';
import {
  canTokenMove,
  chooseBestBotMove,
} from './utils/ludoAI';
import {
  COLOR_CONFIG,
  getMainTrackIndex,
  isSafeSquare,
  SAFE_TRACK_INDICES,
  START_TRACK_INDEX,
  TOTAL_STEPS_TO_HOME,
} from './utils/ludoBoard';
import { LudoBoard } from './components/LudoBoard';
import { Dice } from './components/Dice';
import { PlayerCard } from './components/PlayerCard';
import { GameControls } from './components/GameControls';
import { GameSetup } from './components/GameSetup';
import { RulesModal } from './components/RulesModal';
import { SettingsModal } from './components/SettingsModal';
import { StatsModal } from './components/StatsModal';
import { VictoryModal } from './components/VictoryModal';

const DEFAULT_SETTINGS: GameSettings = {
  allowOneOrSixToStart: false,
  exactRollToFinish: true,
  threeConsecutiveSixesPenalty: true,
  bonusRollOnCapture: true,
  bonusRollOnHome: true,
  animationSpeed: 'normal',
  soundEnabled: true,
  theme: 'classic',
};

const DEFAULT_PLAYERS: PlayerConfig[] = [
  { id: 'p-red', color: 'red', name: 'Player 1', type: 'human', botPersonality: 'tactician', avatarSeed: 1 },
  { id: 'p-green', color: 'green', name: 'Green Bot', type: 'bot', botPersonality: 'casual', avatarSeed: 2 },
  { id: 'p-yellow', color: 'yellow', name: 'Yellow Bot', type: 'bot', botPersonality: 'tactician', avatarSeed: 3 },
  { id: 'p-blue', color: 'blue', name: 'Blue Bot', type: 'bot', botPersonality: 'hunter', avatarSeed: 4 },
];

const INITIAL_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: { red: 0, green: 0, yellow: 0, blue: 0 },
  totalCaptures: { red: 0, green: 0, yellow: 0, blue: 0 },
  totalSixes: { red: 0, green: 0, yellow: 0, blue: 0 },
  totalMoves: { red: 0, green: 0, yellow: 0, blue: 0 },
};

function createInitialTokens(colors: PlayerColor[]): Record<PlayerColor, Token[]> {
  const initial: Record<PlayerColor, Token[]> = {
    red: [],
    green: [],
    yellow: [],
    blue: [],
  };

  colors.forEach((color) => {
    initial[color] = [0, 1, 2, 3].map((id) => ({
      id,
      color,
      step: -1, // in yard
      isHome: false,
    }));
  });

  return initial;
}

export default function App() {
  const [view, setView] = useState<'SETUP' | 'PLAYING'>('SETUP');
  const [players, setPlayers] = useState<PlayerConfig[]>(DEFAULT_PLAYERS);
  const [tokens, setTokens] = useState<Record<PlayerColor, Token[]>>(() =>
    createInitialTokens(['red', 'green', 'yellow', 'blue'])
  );
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [canRoll, setCanRoll] = useState<boolean>(true);
  const [consecutiveSixes, setConsecutiveSixes] = useState<number>(0);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [rankings, setRankings] = useState<PlayerConfig[]>([]);
  const [winner, setWinner] = useState<PlayerConfig | null>(null);

  // Settings & Stats
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [logs, setLogs] = useState<MoveLog[]>([]);

  // Modals
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Token Hover Preview
  const [hoveredToken, setHoveredToken] = useState<{ color: PlayerColor; id: number } | null>(null);

  // Undo snapshot (for pass & play)
  const [previousState, setPreviousState] = useState<{
    tokens: Record<PlayerColor, Token[]>;
    activePlayerIndex: number;
    diceValue: number | null;
  } | null>(null);

  // Load saved state from LocalStorage on mount
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem('ludo_stats_v1');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }

      const savedSettings = localStorage.getItem('ludo_settings_v1');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
        sound.setMuted(!parsed.soundEnabled);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Update sound mute status
  useEffect(() => {
    sound.setMuted(!settings.soundEnabled);
    try {
      localStorage.setItem('ludo_settings_v1', JSON.stringify(settings));
    } catch {}
  }, [settings.soundEnabled]);

  const activePlayer = players[activePlayerIndex] || players[0];
  const activeColors = players.map((p) => p.color);

  // Bot Auto-turn orchestration
  useEffect(() => {
    if (view !== 'PLAYING' || winner) return;

    if (activePlayer.type === 'bot' && !isBotThinking) {
      // Bot needs to roll
      if (canRoll && !isRolling) {
        setIsBotThinking(true);
        const delay = settings.animationSpeed === 'instant' ? 150 : 600;
        const timer = setTimeout(() => {
          handleRollDice();
        }, delay);
        return () => clearTimeout(timer);
      }

      // Bot has rolled and needs to make a move
      if (diceValue !== null && !isRolling) {
        const delay = settings.animationSpeed === 'instant' ? 150 : 700;
        const timer = setTimeout(() => {
          executeBotDecision();
        }, delay);
        return () => clearTimeout(timer);
      }
    }
  }, [activePlayerIndex, canRoll, diceValue, isRolling, view, winner, isBotThinking]);

  // Roll Dice Action
  const handleRollDice = () => {
    if (!canRoll || isRolling || winner) return;

    setIsRolling(true);
    setCanRoll(false);
    if (settings.soundEnabled) {
      sound.playDiceRoll();
    }

    const rollDuration = settings.animationSpeed === 'instant' ? 100 : 500;

    setTimeout(() => {
      const rolled = Math.floor(Math.random() * 6) + 1;
      setDiceValue(rolled);
      setIsRolling(false);
      if (settings.soundEnabled) {
        sound.playDiceStop();
      }

      // Record stats
      setStats((prev) => {
        const updated = {
          ...prev,
          totalSixes: {
            ...prev.totalSixes,
            [activePlayer.color]:
              rolled === 6
                ? (prev.totalSixes[activePlayer.color] || 0) + 1
                : prev.totalSixes[activePlayer.color] || 0,
          },
        };
        try {
          localStorage.setItem('ludo_stats_v1', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Handle three 6s penalty
      let nextSixStreak = rolled === 6 ? consecutiveSixes + 1 : 0;
      if (rolled === 6 && nextSixStreak === 3 && settings.threeConsecutiveSixesPenalty) {
        // Penalty: turn forfeited!
        setConsecutiveSixes(0);
        addLog({
          playerColor: activePlayer.color,
          playerName: activePlayer.name,
          diceValue: 6,
          action: 'skip',
        });
        setTimeout(() => {
          passTurn();
        }, 800);
        return;
      }
      setConsecutiveSixes(nextSixStreak);

      // Check if active player has any legal moves
      const playerTokens = tokens[activePlayer.color];
      const validMoves = playerTokens.filter((t) => canTokenMove(t, rolled, settings));

      if (validMoves.length === 0) {
        // No moves available, skip to next player
        addLog({
          playerColor: activePlayer.color,
          playerName: activePlayer.name,
          diceValue: rolled,
          action: 'skip',
        });
        setTimeout(() => {
          passTurn();
        }, settings.animationSpeed === 'instant' ? 200 : 800);
      } else {
        // For human with exactly 1 move, if it's convenient we could auto-play,
        // but letting the user tap feels tactile and satisfying.
        if (activePlayer.type === 'human') {
          setIsBotThinking(false);
        }
      }
    }, rollDuration);
  };

  // Bot Move Execution
  const executeBotDecision = () => {
    if (diceValue === null) return;
    const playerTokens = tokens[activePlayer.color];
    const bestTokenId = chooseBestBotMove(
      playerTokens,
      tokens,
      activePlayer.color,
      diceValue,
      activePlayer.botPersonality,
      settings
    );

    if (bestTokenId !== null) {
      const chosenToken = playerTokens.find((t) => t.id === bestTokenId);
      if (chosenToken) {
        handleMoveToken(chosenToken, diceValue);
      } else {
        passTurn();
      }
    } else {
      passTurn();
    }
  };

  // Move Token Action
  const handleMoveToken = (token: Token, roll: number) => {
    // Snapshot for undo
    setPreviousState({
      tokens: JSON.parse(JSON.stringify(tokens)),
      activePlayerIndex,
      diceValue,
    });

    const isSpawning = token.step === -1;
    let targetStep = isSpawning ? 0 : token.step + roll;

    if (targetStep > TOTAL_STEPS_TO_HOME && settings.exactRollToFinish) {
      return; // Invalid
    }

    const isFinished = targetStep >= TOTAL_STEPS_TO_HOME;
    let capturedOpponent: { color: PlayerColor; id: number } | null = null;
    let grantExtraTurn = roll === 6;

    // Check Capture on track
    if (!isSpawning && targetStep <= 50) {
      const targetTrackIdx = (START_TRACK_INDEX[token.color] + targetStep) % 52;
      const isTargetSafe = SAFE_TRACK_INDICES.has(targetTrackIdx);

      if (!isTargetSafe) {
        for (const otherColor of activeColors) {
          if (otherColor === token.color) continue;
          for (const oppToken of tokens[otherColor]) {
            if (oppToken.step >= 0 && oppToken.step <= 50 && !oppToken.isHome) {
              const oppTrack = getMainTrackIndex(otherColor, oppToken.step);
              if (oppTrack === targetTrackIdx) {
                capturedOpponent = { color: otherColor, id: oppToken.id };
                break;
              }
            }
          }
          if (capturedOpponent) break;
        }
      }
    }

    // Sound FX
    if (settings.soundEnabled) {
      if (isSpawning) {
        sound.playSpawn();
      } else if (capturedOpponent) {
        sound.playCapture();
      } else if (isFinished) {
        sound.playHomeFinish();
      } else if (isSafeSquare(token.color, targetStep)) {
        sound.playSafeStar();
      } else {
        sound.playStep();
      }
    }

    if (capturedOpponent && settings.bonusRollOnCapture) {
      grantExtraTurn = true;
    }
    if (isFinished && settings.bonusRollOnHome) {
      grantExtraTurn = true;
    }

    // Apply token updates
    setTokens((prev) => {
      const updated = { ...prev };

      // Update current token
      updated[token.color] = updated[token.color].map((t) =>
        t.id === token.id
          ? {
              ...t,
              step: targetStep,
              isHome: isFinished,
            }
          : t
      );

      // Knock out captured opponent
      if (capturedOpponent) {
        const { color: oppColor, id: oppId } = capturedOpponent;
        updated[oppColor] = updated[oppColor].map((t) =>
          t.id === oppId ? { ...t, step: -1, isHome: false } : t
        );
      }

      return updated;
    });

    // Update Logs
    addLog({
      playerColor: token.color,
      playerName: activePlayer.name,
      diceValue: roll,
      action: isSpawning ? 'spawn' : capturedOpponent ? 'capture' : isFinished ? 'home' : 'move',
      capturedColor: capturedOpponent?.color,
      fromStep: token.step,
      toStep: targetStep,
      tokenId: token.id,
    });

    // Update Career Stats
    setStats((prev) => {
      const updated = {
        ...prev,
        totalMoves: {
          ...prev.totalMoves,
          [activePlayer.color]: (prev.totalMoves[activePlayer.color] || 0) + 1,
        },
        totalCaptures: {
          ...prev.totalCaptures,
          [activePlayer.color]: capturedOpponent
            ? (prev.totalCaptures[activePlayer.color] || 0) + 1
            : prev.totalCaptures[activePlayer.color] || 0,
        },
      };
      try {
        localStorage.setItem('ludo_stats_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Check Victory condition: all 4 tokens finished
    const updatedTokensForPlayer = tokens[token.color].map((t) =>
      t.id === token.id ? { ...t, step: targetStep, isHome: isFinished } : t
    );
    const hasPlayerWon = updatedTokensForPlayer.every((t) => t.isHome);

    if (hasPlayerWon && !rankings.some((p) => p.color === activePlayer.color)) {
      const newRankings = [...rankings, activePlayer];
      setRankings(newRankings);

      if (!winner) {
        setWinner(activePlayer);
        if (settings.soundEnabled) {
          sound.playVictory();
        }
        // Record win in stats
        setStats((prev) => {
          const updated = {
            ...prev,
            gamesPlayed: prev.gamesPlayed + 1,
            gamesWon: {
              ...prev.gamesWon,
              [activePlayer.color]: (prev.gamesWon[activePlayer.color] || 0) + 1,
            },
          };
          try {
            localStorage.setItem('ludo_stats_v1', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    }

    // Turn transition
    setDiceValue(null);
    setHoveredToken(null);

    if (grantExtraTurn && !hasPlayerWon) {
      // Player gets bonus roll!
      setCanRoll(true);
      setIsBotThinking(false);
    } else {
      setConsecutiveSixes(0);
      passTurn();
    }
  };

  const passTurn = () => {
    setDiceValue(null);
    setCanRoll(true);
    setIsBotThinking(false);
    setHoveredToken(null);

    // Find next player who hasn't finished all tokens
    let nextIndex = (activePlayerIndex + 1) % players.length;
    let attempts = 0;
    while (
      rankings.some((p) => p.color === players[nextIndex].color) &&
      attempts < players.length
    ) {
      nextIndex = (nextIndex + 1) % players.length;
      attempts++;
    }

    setActivePlayerIndex(nextIndex);

    // Turn notification sound if next player is human
    if (players[nextIndex].type === 'human' && settings.soundEnabled) {
      sound.playTurnNotification();
    }
  };

  const addLog = (entry: Omit<MoveLog, 'id' | 'timestamp'>) => {
    setLogs((prev) => [
      {
        ...entry,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
      },
      ...prev.slice(0, 20),
    ]);
  };

  const handleQuickRestart = () => {
    setTokens(createInitialTokens(activeColors));
    setActivePlayerIndex(0);
    setDiceValue(null);
    setCanRoll(true);
    setIsRolling(false);
    setConsecutiveSixes(0);
    setIsBotThinking(false);
    setWinner(null);
    setRankings([]);
    setPreviousState(null);
  };

  const handleStartGame = (configuredPlayers: PlayerConfig[], newSettings: GameSettings) => {
    setPlayers(configuredPlayers);
    setSettings(newSettings);
    const colors = configuredPlayers.map((p) => p.color);
    setTokens(createInitialTokens(colors));
    setActivePlayerIndex(0);
    setDiceValue(null);
    setCanRoll(true);
    setIsRolling(false);
    setConsecutiveSixes(0);
    setIsBotThinking(false);
    setWinner(null);
    setRankings([]);
    setPreviousState(null);
    setView('PLAYING');
  };

  const handleUndo = () => {
    if (!previousState) return;
    setTokens(previousState.tokens);
    setActivePlayerIndex(previousState.activePlayerIndex);
    setDiceValue(previousState.diceValue);
    setCanRoll(previousState.diceValue === null);
    setPreviousState(null);
  };

  const handleResetStats = () => {
    setStats(INITIAL_STATS);
    try {
      localStorage.removeItem('ludo_stats_v1');
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-['Plus_Jakarta_Sans'] antialiased">
      {/* 1. TOP BAR CONTRACT */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => setView('SETUP')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 font-['Outfit'] hover:text-slate-700 transition-colors cursor-pointer"
        >
          Ludo Master
        </button>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setView('SETUP')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              view === 'SETUP' ? 'text-slate-950 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Player Selection
          </button>
          {view === 'PLAYING' && (
            <button
              type="button"
              onClick={handleQuickRestart}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Reset Board
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsRulesOpen(true)}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Game Rules
          </button>
          <button
            type="button"
            onClick={() => setIsStatsOpen(true)}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Statistics
          </button>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Settings
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {view === 'PLAYING' ? (
            <button
              type="button"
              onClick={() => setView('SETUP')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              Change Players
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsRulesOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              Rules & Guide
            </button>
          )}
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 flex flex-col justify-center">
        {view === 'SETUP' ? (
          <GameSetup
            currentSettings={settings}
            onStartGame={handleStartGame}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Player Cards (Top Seats) */}
            <div className="lg:col-span-3 flex flex-col gap-3 order-2 lg:order-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden lg:block">
                Participants
              </span>

              {players.slice(0, 2).map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isActive={players[activePlayerIndex]?.id === player.id}
                  tokens={tokens[player.color]}
                  rank={
                    rankings.findIndex((p) => p.color === player.color) !== -1
                      ? rankings.findIndex((p) => p.color === player.color) + 1
                      : undefined
                  }
                />
              ))}

              {/* Game Controls Toolbar in Desktop Left Sidebar */}
              <div className="hidden lg:block mt-2">
                <GameControls
                  settings={settings}
                  onUpdateSettings={(up) => setSettings((s) => ({ ...s, ...up }))}
                  onOpenRules={() => setIsRulesOpen(true)}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onOpenStats={() => setIsStatsOpen(true)}
                  onNewGame={() => setView('SETUP')}
                  onRestartCurrent={handleQuickRestart}
                  canUndo={!!previousState}
                  onUndo={handleUndo}
                  lastLog={logs[0]}
                />
              </div>
            </div>

            {/* Center Column: The Authentic 15x15 Ludo Board */}
            <div className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2">
              <LudoBoard
                tokens={tokens}
                activeColor={activePlayer.color}
                diceValue={diceValue}
                settings={settings}
                onTokenClick={(token) => {
                  if (diceValue !== null && activePlayer.type === 'human') {
                    handleMoveToken(token, diceValue);
                  }
                }}
                hoveredTokenId={hoveredToken}
                onHoverToken={setHoveredToken}
                isBotThinking={isBotThinking}
                activeColors={activeColors}
              />

              {/* Mobile Game Controls Bar */}
              <div className="lg:hidden w-full mt-3">
                <GameControls
                  settings={settings}
                  onUpdateSettings={(up) => setSettings((s) => ({ ...s, ...up }))}
                  onOpenRules={() => setIsRulesOpen(true)}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onOpenStats={() => setIsStatsOpen(true)}
                  onNewGame={() => setView('SETUP')}
                  onRestartCurrent={handleQuickRestart}
                  canUndo={!!previousState}
                  onUndo={handleUndo}
                  lastLog={logs[0]}
                />
              </div>
            </div>

            {/* Right Column: Dice Hub & Remaining Seats */}
            <div className="lg:col-span-3 flex flex-col gap-3 order-3">
              {/* Interactive Dice Station */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-md flex flex-col items-center">
                <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                  <span className="font-semibold text-slate-500">Current Turn</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: COLOR_CONFIG[activePlayer.color].primary }}
                    />
                    <span>{activePlayer.name}</span>
                  </div>
                </div>

                <div className="my-3 py-1 flex justify-center">
                  <Dice
                    value={diceValue}
                    isRolling={isRolling}
                    canRoll={canRoll && activePlayer.type === 'human' && !isBotThinking}
                    activeColor={activePlayer.color}
                    consecutiveSixes={consecutiveSixes}
                    onRoll={handleRollDice}
                    disabled={activePlayer.type === 'bot' || !canRoll}
                  />
                </div>

                {/* Helper prompt */}
                <div className="text-center text-xs text-slate-500 min-h-[32px] flex items-center justify-center">
                  {isBotThinking ? (
                    <span className="italic animate-pulse">Bot calculating strategic move...</span>
                  ) : activePlayer.type === 'human' && canRoll ? (
                    <span>Click the dice or tap above to roll</span>
                  ) : activePlayer.type === 'human' && diceValue !== null ? (
                    <span>Select a glowing token on the board to move</span>
                  ) : (
                    <span>Waiting for move</span>
                  )}
                </div>
              </div>

              {/* Bottom Seats (Yellow & Blue) */}
              {players.slice(2).map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isActive={players[activePlayerIndex]?.id === player.id}
                  tokens={tokens[player.color]}
                  rank={
                    rankings.findIndex((p) => p.color === player.color) !== -1
                      ? rankings.findIndex((p) => p.color === player.color) + 1
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 3. MODALS */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(up) => setSettings((s) => ({ ...s, ...up }))}
      />
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        onResetStats={handleResetStats}
      />
      {winner && (
        <VictoryModal
          winner={winner}
          rankings={rankings}
          onPlayAgain={handleQuickRestart}
          onNewGame={() => setView('SETUP')}
        />
      )}
    </div>
  );
}
