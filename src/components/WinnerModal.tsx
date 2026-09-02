import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Trash2, CheckCircle2, RotateCcw } from 'lucide-react';
import { NameItem, CapsuleTheme } from '../types';
import { CAPSULE_PALETTES } from '../data/presets';
import { sound } from '../utils/audio';

interface WinnerModalProps {
  winner: NameItem | null;
  theme: CapsuleTheme;
  totalRemaining: number;
  onClose: () => void;
  onRemoveWinner: (item: NameItem) => void;
  onKeepWinner: () => void;
  onPickAgain: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  theme,
  totalRemaining,
  onClose,
  onRemoveWinner,
  onKeepWinner,
  onPickAgain,
}) => {
  useEffect(() => {
    if (winner) {
      sound.playFanfare();

      // Lightweight celebration — single soft burst, far fewer particles
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
        zIndex: 9999,
        gravity: 0.9,
        scalar: 0.8,
        disableForReducedMotion: true,
      });
    }
  }, [winner]);

  if (!winner) return null;

  const palette = CAPSULE_PALETTES[winner.colorIndex % CAPSULE_PALETTES.length];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#01173B]/78 backdrop-blur-md animate-fadeIn">
      {/* Card Shell: Pure White + 3px Midnight Navy, 22px radius */}
      <div className="relative w-full max-w-lg brand-card p-6 sm:p-7 flex flex-col items-center text-center overflow-visible animate-scaleUp">
          {/* Header Badge: Overlapping top-left pill — Midnight Navy, white logo + cyan tier */}
          <div className="absolute -top-[1px] left-6 brand-badge px-4 py-1.5 flex items-center gap-2">
            <span className="brand-badge__logo text-[11px]">NEXGEN</span>
            <span className="w-px h-3 bg-white/20" />
            <span className="brand-badge__tier text-[11px]">WINNER</span>
            <span className="w-2 h-2 rounded-full bg-[#8CB23E] shadow-[0_0_6px_rgba(140,178,62,0.8)]" />
          </div>
          {/* brand swoosh under badge */}
          <div className="absolute top-7 left-6 right-6 h-[3px] brand-swoosh opacity-70" />

          {/* Trophy — icon in brand palette */}
          <div className="relative mt-4 mb-3 w-16 h-16 rounded-2xl bg-[#01173B] border-[3px] border-[#8CB23E] flex items-center justify-center shadow-[0_6px_18px_rgba(1,23,59,0.35)] transform -rotate-2">
            <Trophy className="w-8 h-8 text-[#8CB23E]" />
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#009CFF] border-2 border-white flex items-center justify-center text-[10px]">✦</span>
          </div>

          <span className="nexgen-label text-[11px] text-[#0A568C] mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#8CB23E] animate-pulse brand-icon" />
            WINNER CHUTE • NEXGEN RAFFLE
            <Sparkles className="w-3.5 h-3.5 text-[#8CB23E] animate-pulse brand-icon" />
          </span>

          {/* Winner Highlight Box — Orbit frame */}
          <div
            className={`w-full my-4 py-6 px-4 rounded-2xl bg-gradient-to-br ${palette.bg} border-[3px] ${palette.border} shadow-[0_8px_26px_rgba(0,0,0,0.16)] flex flex-col items-center justify-center transform transition-transform`}
            style={{ boxShadow: `0 10px 30px ${palette.glow}, inset 0 1px 0 rgba(255,255,255,0.22)` }}
          >
            <div className="nexgen-tier text-[11px] text-white/90 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> SELECTED WINNER
            </div>
            <h2 className="nexgen-headline text-3xl sm:text-4xl md:text-5xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] break-words max-w-full px-2">
              {winner.name}
            </h2>
            <div className="mt-3 h-1 w-20 rounded-full bg-white/85 shadow-sm" />
          </div>

          <p className="text-xs font-medium text-[#01173B]/60 mb-5">
            {totalRemaining} {totalRemaining === 1 ? 'entry' : 'entries'} remaining in the drum • <span className="font-black text-[#0A568C]">NEXGEN</span> <span className="text-[#8CB23E] font-black">BACK TO SCHOOL</span>
          </p>

          {/* Action Controls — brand */}
          <div className="w-full flex flex-col sm:flex-row items-center gap-2.5">
            <button
              id="btn-remove-winner"
              onClick={() => {
                sound.playButtonClick();
                onRemoveWinner(winner);
                onClose();
              }}
              className="w-full sm:flex-1 py-3 px-3 rounded-xl bg-white hover:bg-red-50 border-2 border-[#01173B]/12 hover:border-red-300 text-[#01173B] hover:text-red-600 font-black text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove</span>
            </button>

            <button
              id="btn-keep-winner"
              onClick={() => {
                sound.playButtonClick();
                onKeepWinner();
                onClose();
              }}
              className="w-full sm:flex-1 py-3 px-3 rounded-xl bg-[#f0f4f8] hover:bg-white border-2 border-[#01173B]/10 text-[#01173B] font-black text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-[#0A568C]" />
              <span>Keep</span>
            </button>

            <button
              id="btn-pick-again"
              onClick={() => {
                sound.playCoin();
                onClose();
                onPickAgain();
              }}
              className="w-full sm:flex-1 py-3 px-3 rounded-xl bg-[#0A568C] hover:bg-[#0d6ab0] text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-[0_6px_16px_rgba(10,86,140,0.35)] border-2 border-[#01173B] transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Draw Next</span>
            </button>
          </div>
          <p className="mt-3 text-[10px] font-bold tracking-widest uppercase text-[#01173B]/35">Chalk • Orbit Green • Midnight Navy</p>
      </div>
    </div>
  );
};
