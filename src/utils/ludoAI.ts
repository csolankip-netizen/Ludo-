import { BotPersonality, GameSettings, PlayerColor, Token } from '../types/ludo';
import {
  getMainTrackIndex,
  isSafeSquare,
  SAFE_TRACK_INDICES,
  START_TRACK_INDEX,
  TOTAL_STEPS_TO_HOME,
} from './ludoBoard';

export interface MoveOption {
  tokenId: number;
  score: number;
  reason: string;
}

/**
 * Checks if a specific token can legally make a move with the rolled dice value.
 */
export function canTokenMove(
  token: Token,
  diceValue: number,
  settings: GameSettings
): boolean {
  if (token.isHome || token.step >= TOTAL_STEPS_TO_HOME) {
    return false; // Already finished
  }

  // Token is in yard
  if (token.step === -1) {
    if (settings.allowOneOrSixToStart) {
      return diceValue === 6 || diceValue === 1;
    }
    return diceValue === 6;
  }

  // Token is already active on track or home stretch
  const targetStep = token.step + diceValue;
  if (targetStep > TOTAL_STEPS_TO_HOME) {
    // If exact roll to finish is required, rolling higher than needed is invalid
    return !settings.exactRollToFinish;
  }

  return true;
}

/**
 * Evaluates best token move for an AI bot based on its personality.
 */
export function chooseBestBotMove(
  tokens: Token[],
  allTokens: Record<PlayerColor, Token[]>,
  activeColor: PlayerColor,
  diceValue: number,
  personality: BotPersonality,
  settings: GameSettings
): number | null {
  const validTokenIds = tokens
    .filter((t) => canTokenMove(t, diceValue, settings))
    .map((t) => t.id);

  if (validTokenIds.length === 0) return null;
  if (validTokenIds.length === 1) return validTokenIds[0];

  const scoredMoves: MoveOption[] = validTokenIds.map((tokenId) => {
    const token = tokens.find((t) => t.id === tokenId)!;
    const score = evaluateMoveScore(
      token,
      tokens,
      allTokens,
      activeColor,
      diceValue,
      personality,
      settings
    );
    return {
      tokenId,
      score: score.value,
      reason: score.reason,
    };
  });

  // Sort by score descending
  scoredMoves.sort((a, b) => b.score - a.score);

  return scoredMoves[0].tokenId;
}

function evaluateMoveScore(
  token: Token,
  myTokens: Token[],
  allTokens: Record<PlayerColor, Token[]>,
  myColor: PlayerColor,
  diceValue: number,
  personality: BotPersonality,
  settings: GameSettings
): { value: number; reason: string } {
  let score = 0;
  let reason = 'Normal move';

  // 1. Spawning out of yard
  if (token.step === -1) {
    const tokensOnBoard = myTokens.filter((t) => t.step >= 0 && !t.isHome).length;
    const spawnWeight = personality === 'hunter' ? 140 : personality === 'tactician' ? 120 : 60;
    // Extra incentive if we have 0 or 1 active tokens
    const incentive = tokensOnBoard === 0 ? 50 : tokensOnBoard === 1 ? 25 : 0;
    return {
      value: spawnWeight + incentive + Math.random() * 5,
      reason: 'Spawn onto board',
    };
  }

  const currentStep = token.step;
  const targetStep = currentStep + diceValue;

  // 2. Finishing token into home
  if (targetStep === TOTAL_STEPS_TO_HOME) {
    const homeWeight = personality === 'hunter' ? 180 : personality === 'tactician' ? 220 : 90;
    return {
      value: homeWeight + Math.random() * 5,
      reason: 'Bank token home',
    };
  }

  // 3. Advancing inside home stretch (step 51..55)
  if (targetStep >= 51) {
    score += 50 + targetStep;
    reason = 'Advance in home corridor';
  }

  // 4. Checking capture potential on main track
  if (targetStep <= 50) {
    const targetTrackIdx = (START_TRACK_INDEX[myColor] + targetStep) % 52;
    const isTargetSafe = SAFE_TRACK_INDICES.has(targetTrackIdx);

    if (!isTargetSafe) {
      // Check if any opponent token is on this target square
      let capturedOpponent: { color: PlayerColor; token: Token } | null = null;
      for (const otherColor of Object.keys(allTokens) as PlayerColor[]) {
        if (otherColor === myColor) continue;
        for (const oppToken of allTokens[otherColor]) {
          if (oppToken.step >= 0 && oppToken.step <= 50 && !oppToken.isHome) {
            const oppTrackIdx = getMainTrackIndex(otherColor, oppToken.step);
            if (oppTrackIdx === targetTrackIdx) {
              capturedOpponent = { color: otherColor, token: oppToken };
              break;
            }
          }
        }
        if (capturedOpponent) break;
      }

      if (capturedOpponent) {
        const captureWeight =
          personality === 'hunter' ? 260 : personality === 'tactician' ? 210 : 80;
        // Bonus for capturing an advanced token
        const oppAdvanceBonus = capturedOpponent.token.step * 1.5;
        score += captureWeight + oppAdvanceBonus;
        reason = `Capture opponent ${capturedOpponent.color}`;
      }
    } else {
      // Moving to a safe star square!
      const safeBonus = personality === 'tactician' ? 75 : personality === 'hunter' ? 30 : 20;
      score += safeBonus;
      reason = 'Move to safe star';
    }

    // 5. Threat analysis for Tactician & Hunter (Avoiding being captured, or escaping danger)
    if (personality === 'tactician' || personality === 'hunter') {
      const currentTrackIdx = getMainTrackIndex(myColor, currentStep);
      const isCurrentlySafe = isSafeSquare(myColor, currentStep);

      // Check if we are currently threatened by an opponent 1..6 steps behind us
      if (!isCurrentlySafe && currentTrackIdx !== null) {
        let isChased = false;
        (Object.keys(allTokens) as PlayerColor[]).forEach((otherColor) => {
          if (otherColor === myColor) return;
          allTokens[otherColor].forEach((oppToken) => {
            if (oppToken.step >= 0 && oppToken.step <= 50 && !oppToken.isHome) {
              const oppTrackIdx = getMainTrackIndex(otherColor, oppToken.step);
              if (oppTrackIdx !== null) {
                const distanceBehind = (currentTrackIdx - oppTrackIdx + 52) % 52;
                if (distanceBehind >= 1 && distanceBehind <= 6) {
                  isChased = true;
                }
              }
            }
          });
        });

        if (isChased) {
          score += 65; // Escape bonus!
          reason = 'Escape pursuing opponent';
        }
      }

      // Check if destination puts us in danger (an opponent 1..6 steps behind destination)
      if (!isSafeSquare(myColor, targetStep)) {
        let isEnteringDanger = false;
        (Object.keys(allTokens) as PlayerColor[]).forEach((otherColor) => {
          if (otherColor === myColor) return;
          allTokens[otherColor].forEach((oppToken) => {
            if (oppToken.step >= 0 && oppToken.step <= 50 && !oppToken.isHome) {
              const oppTrackIdx = getMainTrackIndex(otherColor, oppToken.step);
              if (oppTrackIdx !== null) {
                const distanceBehind = (targetTrackIdx - oppTrackIdx + 52) % 52;
                if (distanceBehind >= 1 && distanceBehind <= 6) {
                  isEnteringDanger = true;
                }
              }
            }
          });
        });

        if (isEnteringDanger && personality === 'tactician') {
          score -= 40; // Penalty for placing token in line of fire
        }
      }
    }
  }

  // General forward progress points
  score += targetStep * 0.8;

  // Add small jitter to avoid completely deterministic ties
  score += Math.random() * 4;

  return { value: score, reason };
}
