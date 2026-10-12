export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type PlayerType = 'human' | 'bot';

export type BotPersonality = 'tactician' | 'hunter' | 'casual';

export interface PlayerConfig {
  id: string;
  color: PlayerColor;
  name: string;
  type: PlayerType;
  botPersonality: BotPersonality;
  avatarSeed: number;
}

export interface Token {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  step: number; // -1: in yard (base), 0: at starting square, 1..50: outer track, 51..55: home column, 56: finished in center
  isHome: boolean;
}

export interface GameSettings {
  allowOneOrSixToStart: boolean; // default false (only 6 exits base)
  exactRollToFinish: boolean; // default true (exact roll required to enter center)
  threeConsecutiveSixesPenalty: boolean; // default true (3rd six skips turn)
  bonusRollOnCapture: boolean; // default true
  bonusRollOnHome: boolean; // default true
  animationSpeed: 'normal' | 'fast' | 'instant'; // default 'normal'
  soundEnabled: boolean;
  theme: 'classic' | 'royal' | 'midnight';
}

export interface MoveLog {
  id: string;
  timestamp: number;
  playerColor: PlayerColor;
  playerName: string;
  diceValue: number;
  action: 'spawn' | 'move' | 'capture' | 'home' | 'skip';
  capturedColor?: PlayerColor;
  fromStep?: number;
  toStep?: number;
  tokenId?: number;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: Record<PlayerColor, number>;
  totalCaptures: Record<PlayerColor, number>;
  totalSixes: Record<PlayerColor, number>;
  totalMoves: Record<PlayerColor, number>;
}

export interface BoardCoordinate {
  row: number;
  col: number;
}
