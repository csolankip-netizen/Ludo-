import React, { useState } from 'react';
import { GameSettings, PlayerColor, Token } from '../types/ludo';
import { canTokenMove } from '../utils/ludoAI';
import {
  COLOR_CONFIG,
  getTokenCoordinate,
  HOME_COLUMNS,
  MAIN_TRACK,
  SAFE_TRACK_INDICES,
  START_TRACK_INDEX,
  TOTAL_STEPS_TO_HOME,
} from '../utils/ludoBoard';

interface LudoBoardProps {
  tokens: Record<PlayerColor, Token[]>;
  activeColor: PlayerColor;
  diceValue: number | null;
  settings: GameSettings;
  onTokenClick: (token: Token) => void;
  hoveredTokenId: { color: PlayerColor; id: number } | null;
  onHoverToken: (token: { color: PlayerColor; id: number } | null) => void;
  isBotThinking: boolean;
  activeColors: PlayerColor[];
}

export const LudoBoard: React.FC<LudoBoardProps> = ({
  tokens,
  activeColor,
  diceValue,
  settings,
  onTokenClick,
  hoveredTokenId,
  onHoverToken,
  isBotThinking,
  activeColors,
}) => {
  // Safe track coordinate lookup string "row,col"
  const safeCoords = new Set(
    Array.from(SAFE_TRACK_INDICES).map((idx) => {
      const coord = MAIN_TRACK[idx];
      return `${coord.row},${coord.col}`;
    })
  );

  // Group active tokens by their row,col coordinates to handle stacking
  const tokensByCoord: Record<string, { color: PlayerColor; token: Token }[]> = {};

  activeColors.forEach((color) => {
    tokens[color]?.forEach((token) => {
      const coord = getTokenCoordinate(color, token.id, token.step);
      // Round to 1 decimal place to group
      const key = `${Math.round(coord.row * 10) / 10},${Math.round(coord.col * 10) / 10}`;
      if (!tokensByCoord[key]) {
        tokensByCoord[key] = [];
      }
      tokensByCoord[key].push({ color, token });
    });
  });

  // Calculate destination coordinate if a token is hovered and can move
  let previewCoord: { row: number; col: number } | null = null;
  if (hoveredTokenId && diceValue !== null) {
    const token = tokens[hoveredTokenId.color]?.find((t) => t.id === hoveredTokenId.id);
    if (token && canTokenMove(token, diceValue, settings)) {
      const nextStep = token.step === -1 ? 0 : token.step + diceValue;
      if (nextStep <= TOTAL_STEPS_TO_HOME) {
        previewCoord = getTokenCoordinate(hoveredTokenId.color, token.id, nextStep);
      }
    }
  }

  // Helper to determine board square styling for cell at row, col (0..14)
  const getCellDetails = (row: number, col: number) => {
    // 1. Red Yard (0..5, 0..5)
    if (row < 6 && col < 6) return null;
    // 2. Green Yard (0..5, 9..14)
    if (row < 6 && col > 8) return null;
    // 3. Blue Yard (9..14, 0..5)
    if (row > 8 && col < 6) return null;
    // 4. Yellow Yard (9..14, 9..14)
    if (row > 8 && col > 8) return null;
    // 5. Center finish area (6..8, 6..8)
    if (row >= 6 && row <= 8 && col >= 6 && col <= 8) return null;

    // Red Start
    if (row === 6 && col === 1) return { bg: '#E11D48', isStart: true, color: 'red' };
    // Green Start
    if (row === 1 && col === 8) return { bg: '#10B981', isStart: true, color: 'green' };
    // Yellow Start
    if (row === 8 && col === 13) return { bg: '#F59E0B', isStart: true, color: 'yellow' };
    // Blue Start
    if (row === 13 && col === 6) return { bg: '#2563EB', isStart: true, color: 'blue' };

    // Home runs
    // Red home run: row 7, col 1..5
    if (row === 7 && col >= 1 && col <= 5) return { bg: '#FFE4E6', isHomeRun: true, color: 'red' };
    // Green home run: col 7, row 1..5
    if (col === 7 && row >= 1 && row <= 5) return { bg: '#D1FAE5', isHomeRun: true, color: 'green' };
    // Yellow home run: row 7, col 9..13
    if (row === 7 && col >= 9 && col <= 13) return { bg: '#FEF3C7', isHomeRun: true, color: 'yellow' };
    // Blue home run: col 7, row 9..13
    if (col === 7 && row >= 9 && row <= 13) return { bg: '#DBEAFE', isHomeRun: true, color: 'blue' };

    // Check safe star
    const isSafe = safeCoords.has(`${row},${col}`);
    return { bg: '#FFFFFF', isSafe };
  };

  return (
    <div className="relative w-full aspect-square max-w-[560px] mx-auto select-none rounded-2xl bg-amber-950 p-2 sm:p-3 shadow-2xl border-4 border-amber-900/60">
      {/* Wooden / Felt Table Inset */}
      <div className="relative w-full h-full rounded-xl bg-white shadow-inner overflow-hidden border border-slate-300">
        {/* SVG Board Grid Layer */}
        <svg
          viewBox="0 0 15 15"
          className="w-full h-full block"
          style={{ shapeRendering: 'geometricPrecision' }}
        >
          {/* DEFINITIONS & GRADIENTS */}
          <defs>
            <radialGradient id="tokenGlowRed" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="100%" stopColor="#E11D48" />
            </radialGradient>
            <radialGradient id="tokenGlowGreen" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#10B981" />
            </radialGradient>
            <radialGradient id="tokenGlowYellow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
            <radialGradient id="tokenGlowBlue" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#2563EB" />
            </radialGradient>
          </defs>

          {/* 1. CORNER YARDS / BASES (6x6 cells each) */}
          {/* Red Yard (Top Left: 0..6, 0..6) */}
          <rect x="0" y="0" width="6" height="6" fill="#FFE4E6" stroke="#9F1239" strokeWidth="0.08" />
          <rect x="0.8" y="0.8" width="4.4" height="4.4" rx="0.5" fill="#FFFFFF" stroke="#E11D48" strokeWidth="0.12" />
          <text x="3" y="3.15" fontSize="0.38" textAnchor="middle" fill="#E11D48" fontWeight="800" letterSpacing="0.06em" className="select-none opacity-85">
            RED BASE
          </text>
          {/* Red Yard Token Circles */}
          <circle cx="1.8" cy="1.8" r="0.8" fill="#FFE4E6" stroke="#E11D48" strokeWidth="0.06" />
          <circle cx="1.8" cy="4.2" r="0.8" fill="#FFE4E6" stroke="#E11D48" strokeWidth="0.06" />
          <circle cx="4.2" cy="1.8" r="0.8" fill="#FFE4E6" stroke="#E11D48" strokeWidth="0.06" />
          <circle cx="4.2" cy="4.2" r="0.8" fill="#FFE4E6" stroke="#E11D48" strokeWidth="0.06" />

          {/* Green Yard (Top Right: 9..15, 0..6) */}
          <rect x="9" y="0" width="6" height="6" fill="#D1FAE5" stroke="#065F46" strokeWidth="0.08" />
          <rect x="9.8" y="0.8" width="4.4" height="4.4" rx="0.5" fill="#FFFFFF" stroke="#10B981" strokeWidth="0.12" />
          <text x="12" y="3.15" fontSize="0.38" textAnchor="middle" fill="#10B981" fontWeight="800" letterSpacing="0.06em" className="select-none opacity-85">
            GREEN BASE
          </text>
          {/* Green Yard Token Circles */}
          <circle cx="10.8" cy="1.8" r="0.8" fill="#D1FAE5" stroke="#10B981" strokeWidth="0.06" />
          <circle cx="10.8" cy="4.2" r="0.8" fill="#D1FAE5" stroke="#10B981" strokeWidth="0.06" />
          <circle cx="13.2" cy="1.8" r="0.8" fill="#D1FAE5" stroke="#10B981" strokeWidth="0.06" />
          <circle cx="13.2" cy="4.2" r="0.8" fill="#D1FAE5" stroke="#10B981" strokeWidth="0.06" />

          {/* Yellow Yard (Bottom Right: 9..15, 9..15) */}
          <rect x="9" y="9" width="6" height="6" fill="#FEF3C7" stroke="#92400E" strokeWidth="0.08" />
          <rect x="9.8" y="9.8" width="4.4" height="4.4" rx="0.5" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="0.12" />
          <text x="12" y="12.15" fontSize="0.38" textAnchor="middle" fill="#D97706" fontWeight="800" letterSpacing="0.06em" className="select-none opacity-85">
            YELLOW BASE
          </text>
          {/* Yellow Yard Token Circles */}
          <circle cx="10.8" cy="10.8" r="0.8" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.06" />
          <circle cx="10.8" cy="13.2" r="0.8" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.06" />
          <circle cx="13.2" cy="10.8" r="0.8" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.06" />
          <circle cx="13.2" cy="13.2" r="0.8" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.06" />

          {/* Blue Yard (Bottom Left: 0..6, 9..15) */}
          <rect x="0" y="9" width="6" height="6" fill="#DBEAFE" stroke="#1E40AF" strokeWidth="0.08" />
          <rect x="0.8" y="9.8" width="4.4" height="4.4" rx="0.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="0.12" />
          <text x="3" y="12.15" fontSize="0.38" textAnchor="middle" fill="#2563EB" fontWeight="800" letterSpacing="0.06em" className="select-none opacity-85">
            BLUE BASE
          </text>
          {/* Blue Yard Token Circles */}
          <circle cx="1.8" cy="10.8" r="0.8" fill="#DBEAFE" stroke="#2563EB" strokeWidth="0.06" />
          <circle cx="1.8" cy="13.2" r="0.8" fill="#DBEAFE" stroke="#2563EB" strokeWidth="0.06" />
          <circle cx="4.2" cy="10.8" r="0.8" fill="#DBEAFE" stroke="#2563EB" strokeWidth="0.06" />
          <circle cx="4.2" cy="13.2" r="0.8" fill="#DBEAFE" stroke="#2563EB" strokeWidth="0.06" />

          {/* 2. TRACK CELLS (Outside yards and center) */}
          {Array.from({ length: 15 }).map((_, r) =>
            Array.from({ length: 15 }).map((__, c) => {
              const details = getCellDetails(r, c);
              if (!details) return null;

              return (
                <g key={`cell-${r}-${c}`}>
                  <rect
                    x={c}
                    y={r}
                    width="1"
                    height="1"
                    fill={details.bg}
                    stroke="#CBD5E1"
                    strokeWidth="0.04"
                  />
                  {/* Safe star marker */}
                  {details.isSafe && (
                    <text
                      x={c + 0.5}
                      y={r + 0.68}
                      fontSize="0.55"
                      textAnchor="middle"
                      fill="#64748B"
                      className="font-bold select-none"
                    >
                      ★
                    </text>
                  )}
                  {/* Start star marker */}
                  {details.isStart && (
                    <text
                      x={c + 0.5}
                      y={r + 0.68}
                      fontSize="0.6"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      className="font-black select-none"
                    >
                      ★
                    </text>
                  )}
                </g>
              );
            })
          )}

          {/* 3. CENTER FINISH TRIANGLES (6..9, 6..9) */}
          {/* Red Triangle (Left) */}
          <polygon points="6,6 7.5,7.5 6,9" fill="#E11D48" stroke="#9F1239" strokeWidth="0.05" />
          {/* Green Triangle (Top) */}
          <polygon points="6,6 7.5,7.5 9,6" fill="#10B981" stroke="#065F46" strokeWidth="0.05" />
          {/* Yellow Triangle (Right) */}
          <polygon points="9,6 7.5,7.5 9,9" fill="#F59E0B" stroke="#92400E" strokeWidth="0.05" />
          {/* Blue Triangle (Bottom) */}
          <polygon points="6,9 7.5,7.5 9,9" fill="#2563EB" stroke="#1E40AF" strokeWidth="0.05" />

          {/* Center Golden Star Badge */}
          <circle cx="7.5" cy="7.5" r="0.65" fill="#FEF08A" stroke="#CA8A04" strokeWidth="0.06" />
          <text
            x="7.5"
            y="7.72"
            fontSize="0.65"
            textAnchor="middle"
            fill="#854D0E"
            className="font-black select-none"
          >
            ★
          </text>

          {/* PREVIEW DESTINATION HIGHLIGHT */}
          {previewCoord && (
            <rect
              x={Math.round(previewCoord.col)}
              y={Math.round(previewCoord.row)}
              width="1"
              height="1"
              fill="rgba(59, 130, 246, 0.25)"
              stroke="#2563EB"
              strokeWidth="0.08"
              strokeDasharray="0.15 0.1"
              className="animate-pulse"
            />
          )}

          {/* 4. TOKENS LAYER */}
          {Object.entries(tokensByCoord).map(([coordKey, tokenList]) => {
            const count = tokenList.length;

            return tokenList.map(({ color, token }, index) => {
              const baseCoord = getTokenCoordinate(color, token.id, token.step);
              const isCurrentPlayer = color === activeColor;
              const isTurnActive = isCurrentPlayer && !isBotThinking;
              const isEligible = isTurnActive && diceValue !== null && canTokenMove(token, diceValue, settings);
              const isHovered =
                hoveredTokenId?.color === color && hoveredTokenId?.id === token.id;

              // Calculate slight offset if multiple tokens share the exact cell
              let offsetX = 0;
              let offsetY = 0;
              let scale = 1;

              if (count > 1) {
                scale = count === 2 ? 0.75 : 0.6;
                const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
                const radius = count === 2 ? 0.22 : 0.28;
                offsetX = Math.cos(angle) * radius;
                offsetY = Math.sin(angle) * radius;
              }

              // Finished tokens cluster nicely in center
              if (token.isHome) {
                scale = 0.55;
              }

              const cx = (token.step === -1 ? baseCoord.col : Math.floor(baseCoord.col) + 0.5) + offsetX;
              const cy = (token.step === -1 ? baseCoord.row : Math.floor(baseCoord.row) + 0.5) + offsetY;
              const radius = 0.38 * scale;

              const colorCfg = COLOR_CONFIG[color];

              return (
                <g
                  key={`${color}-${token.id}`}
                  className={`transition-all duration-200 ${
                    isEligible ? 'cursor-pointer' : 'cursor-default'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isEligible) {
                      onTokenClick(token);
                    }
                  }}
                  onMouseEnter={() => {
                    if (isEligible) {
                      onHoverToken({ color, id: token.id });
                    }
                  }}
                  onMouseLeave={() => {
                    if (hoveredTokenId?.color === color && hoveredTokenId?.id === token.id) {
                      onHoverToken(null);
                    }
                  }}
                >
                  {/* Pulse ring around eligible tokens */}
                  {isEligible && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius + 0.16}
                      fill="none"
                      stroke={colorCfg.primary}
                      strokeWidth="0.07"
                      className="animate-ping opacity-75 pointer-events-none"
                    />
                  )}

                  {/* Outer selection glow */}
                  {(isEligible || isHovered) && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius + 0.08}
                      fill="none"
                      stroke={isHovered ? '#1E293B' : colorCfg.primary}
                      strokeWidth="0.06"
                    />
                  )}

                  {/* Drop shadow underneath token */}
                  <ellipse
                    cx={cx}
                    cy={cy + radius * 0.4}
                    rx={radius * 0.9}
                    ry={radius * 0.4}
                    fill="rgba(0,0,0,0.22)"
                  />

                  {/* Token Body Base */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill={`url(#tokenGlow${color.charAt(0).toUpperCase() + color.slice(1)})`}
                    stroke="#FFFFFF"
                    strokeWidth="0.06"
                  />

                  {/* Inner ring & crown badge */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius * 0.62}
                    fill={colorCfg.dark}
                    opacity="0.35"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius * 0.35}
                    fill="#FFFFFF"
                    opacity="0.9"
                  />

                  {/* Highlight bevel reflection */}
                  <circle
                    cx={cx - radius * 0.3}
                    cy={cy - radius * 0.3}
                    r={radius * 0.22}
                    fill="#FFFFFF"
                    opacity="0.75"
                  />
                </g>
              );
            });
          })}
        </svg>
      </div>
    </div>
  );
};
