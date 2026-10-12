import { BoardCoordinate, PlayerColor } from '../types/ludo';

export const COLOR_CONFIG: Record<
  PlayerColor,
  {
    name: string;
    primary: string;
    light: string;
    dark: string;
    bg: string;
    border: string;
    glow: string;
    text: string;
  }
> = {
  red: {
    name: 'Red',
    primary: '#E11D48',
    light: '#FFE4E6',
    dark: '#9F1239',
    bg: 'bg-rose-600',
    border: 'border-rose-600',
    glow: 'shadow-rose-500/50',
    text: 'text-rose-600',
  },
  green: {
    name: 'Green',
    primary: '#10B981',
    light: '#D1FAE5',
    dark: '#065F46',
    bg: 'bg-emerald-600',
    border: 'border-emerald-600',
    glow: 'shadow-emerald-500/50',
    text: 'text-emerald-600',
  },
  yellow: {
    name: 'Yellow',
    primary: '#F59E0B',
    light: '#FEF3C7',
    dark: '#92400E',
    bg: 'bg-amber-500',
    border: 'border-amber-500',
    glow: 'shadow-amber-500/50',
    text: 'text-amber-600',
  },
  blue: {
    name: 'Blue',
    primary: '#2563EB',
    light: '#DBEAFE',
    dark: '#1E40AF',
    bg: 'bg-blue-600',
    border: 'border-blue-600',
    glow: 'shadow-blue-500/50',
    text: 'text-blue-600',
  },
};

export const START_TRACK_INDEX: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// 52 track coordinates on 15x15 board
export const MAIN_TRACK: BoardCoordinate[] = [
  /* 0 - Red start */ { row: 6, col: 1 },
  /* 1 */ { row: 6, col: 2 },
  /* 2 */ { row: 6, col: 3 },
  /* 3 */ { row: 6, col: 4 },
  /* 4 */ { row: 6, col: 5 },
  /* 5 */ { row: 5, col: 6 },
  /* 6 */ { row: 4, col: 6 },
  /* 7 */ { row: 3, col: 6 },
  /* 8 - Red star */ { row: 2, col: 6 },
  /* 9 */ { row: 1, col: 6 },
  /* 10 */ { row: 0, col: 6 },
  /* 11 */ { row: 0, col: 7 },
  /* 12 */ { row: 0, col: 8 },
  /* 13 - Green start */ { row: 1, col: 8 },
  /* 14 */ { row: 2, col: 8 },
  /* 15 */ { row: 3, col: 8 },
  /* 16 */ { row: 4, col: 8 },
  /* 17 */ { row: 5, col: 8 },
  /* 18 */ { row: 6, col: 9 },
  /* 19 */ { row: 6, col: 10 },
  /* 20 */ { row: 6, col: 11 },
  /* 21 - Green star */ { row: 6, col: 12 },
  /* 22 */ { row: 6, col: 13 },
  /* 23 */ { row: 6, col: 14 },
  /* 24 */ { row: 7, col: 14 },
  /* 25 */ { row: 8, col: 14 },
  /* 26 - Yellow start */ { row: 8, col: 13 },
  /* 27 */ { row: 8, col: 12 },
  /* 28 */ { row: 8, col: 11 },
  /* 29 */ { row: 8, col: 10 },
  /* 30 */ { row: 8, col: 9 },
  /* 31 */ { row: 9, col: 8 },
  /* 32 */ { row: 10, col: 8 },
  /* 33 */ { row: 11, col: 8 },
  /* 34 - Yellow star */ { row: 12, col: 8 },
  /* 35 */ { row: 13, col: 8 },
  /* 36 */ { row: 14, col: 8 },
  /* 37 */ { row: 14, col: 7 },
  /* 38 */ { row: 14, col: 6 },
  /* 39 - Blue start */ { row: 13, col: 6 },
  /* 40 */ { row: 12, col: 6 },
  /* 41 */ { row: 11, col: 6 },
  /* 42 */ { row: 10, col: 6 },
  /* 43 */ { row: 9, col: 6 },
  /* 44 */ { row: 8, col: 5 },
  /* 45 */ { row: 8, col: 4 },
  /* 46 */ { row: 8, col: 3 },
  /* 47 - Blue star */ { row: 8, col: 2 },
  /* 48 */ { row: 8, col: 1 },
  /* 49 */ { row: 8, col: 0 },
  /* 50 */ { row: 7, col: 0 },
  /* 51 */ { row: 6, col: 0 },
];

export const SAFE_TRACK_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// Home columns (steps 51 to 55)
export const HOME_COLUMNS: Record<PlayerColor, BoardCoordinate[]> = {
  red: [
    { row: 7, col: 1 },
    { row: 7, col: 2 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
  ],
  green: [
    { row: 1, col: 7 },
    { row: 2, col: 7 },
    { row: 3, col: 7 },
    { row: 4, col: 7 },
    { row: 5, col: 7 },
  ],
  yellow: [
    { row: 7, col: 13 },
    { row: 7, col: 12 },
    { row: 7, col: 11 },
    { row: 7, col: 10 },
    { row: 7, col: 9 },
  ],
  blue: [
    { row: 13, col: 7 },
    { row: 12, col: 7 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 9, col: 7 },
  ],
};

// Finish center apex coordinate (step 56)
export const FINISH_COORDINATES: Record<PlayerColor, BoardCoordinate> = {
  red: { row: 7, col: 6.2 },
  green: { row: 6.2, col: 7 },
  yellow: { row: 7, col: 7.8 },
  blue: { row: 7.8, col: 7 },
};

// Yard base coordinates for each of the 4 tokens
export const YARD_COORDINATES: Record<PlayerColor, BoardCoordinate[]> = {
  red: [
    { row: 1.8, col: 1.8 },
    { row: 1.8, col: 4.2 },
    { row: 4.2, col: 1.8 },
    { row: 4.2, col: 4.2 },
  ],
  green: [
    { row: 1.8, col: 10.8 },
    { row: 1.8, col: 13.2 },
    { row: 4.2, col: 10.8 },
    { row: 4.2, col: 13.2 },
  ],
  yellow: [
    { row: 10.8, col: 10.8 },
    { row: 10.8, col: 13.2 },
    { row: 13.2, col: 10.8 },
    { row: 13.2, col: 13.2 },
  ],
  blue: [
    { row: 10.8, col: 1.8 },
    { row: 10.8, col: 4.2 },
    { row: 13.2, col: 1.8 },
    { row: 13.2, col: 4.2 },
  ],
};

export const TOTAL_STEPS_TO_HOME = 56;

/**
 * Calculates row and col for a token given its color and current step.
 */
export function getTokenCoordinate(
  color: PlayerColor,
  tokenId: number,
  step: number
): BoardCoordinate {
  if (step === -1) {
    return YARD_COORDINATES[color][tokenId];
  }
  if (step >= 0 && step <= 50) {
    const trackIdx = (START_TRACK_INDEX[color] + step) % 52;
    return MAIN_TRACK[trackIdx];
  }
  if (step >= 51 && step <= 55) {
    const homeIdx = step - 51;
    return HOME_COLUMNS[color][homeIdx];
  }
  return FINISH_COORDINATES[color];
}

/**
 * Determines whether a given step is a safe zone (safe star, home column, or finished)
 */
export function isSafeSquare(color: PlayerColor, step: number): boolean {
  if (step < 0) return true; // yard is safe
  if (step >= 51) return true; // home column and finish are always safe
  const trackIdx = (START_TRACK_INDEX[color] + step) % 52;
  return SAFE_TRACK_INDICES.has(trackIdx);
}

/**
 * Gets the main track index for a token if it is on the main track, or null.
 */
export function getMainTrackIndex(color: PlayerColor, step: number): number | null {
  if (step >= 0 && step <= 50) {
    return (START_TRACK_INDEX[color] + step) % 52;
  }
  return null;
}
