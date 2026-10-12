import React from 'react';
import { X, Shield, Award, Sparkles, RefreshCw, Dices } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">How to Play Ludo</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
          {/* Objective */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-1">Objective</h3>
            <p>
              Be the first player to guide all 4 of your colored tokens out of your Yard, around the 52-square perimeter track, into your Home corridor, and safely into the central Home triangle!
            </p>
          </div>

          {/* Section 1: Rolling & Leaving the Yard */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <Dices className="w-4 h-4 text-slate-700" />
              <span>1. Exiting the Base & Rolling a 6</span>
            </div>
            <p>
              • A token starts inside the Yard. To release a token onto your starting square, you must roll a <strong>6</strong> (or 1 in Fast Start mode).
            </p>
            <p>
              • Rolling a <strong>6</strong> grants you an immediate bonus roll!
            </p>
            <p>
              • <em>Three 6s Rule:</em> Rolling three consecutive 6s in one turn cancels your turn to prevent runaway streaks.
            </p>
          </div>

          {/* Section 2: Moving & Capturing */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>2. Capturing Opponents</span>
            </div>
            <p>
              • If your token lands on a square occupied by an opponent's token, the opponent's token is <strong>knocked out</strong> and sent back to their Yard!
            </p>
            <p>
              • Successfully capturing an opponent rewards you with an <strong>extra roll</strong>.
            </p>
            <p>
              • Multiple tokens of the same color can stack together safely on the same square.
            </p>
          </div>

          {/* Section 3: Safe Squares (Stars) */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>3. Safe Squares (Star Cells ★)</span>
            </div>
            <p>
              • There are <strong>8 Safe Squares</strong> marked with stars (including the 4 starting squares and the 4 star-marked track cells).
            </p>
            <p>
              • Tokens sitting on a Safe Star square <em>cannot</em> be captured by opponents! Multiple players can share a star square peacefully.
            </p>
          </div>

          {/* Section 4: Home Stretch & Winning */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <RefreshCw className="w-4 h-4 text-emerald-500" />
              <span>4. Entering Home & Victory</span>
            </div>
            <p>
              • After completing a full clockwise circuit around the board, your tokens enter your colored Home Column. Opponents cannot enter your home stretch.
            </p>
            <p>
              • In standard rules, an <strong>exact roll</strong> is required to land directly in the center triangle.
            </p>
            <p>
              • Banking a token in Home gives you another bonus roll! The first player to bring all 4 tokens to Home wins the match!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Got it, Let's Play
          </button>
        </div>
      </div>
    </div>
  );
};
