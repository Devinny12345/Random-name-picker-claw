import React from 'react';
import { Trophy, CheckCircle2, Eye } from 'lucide-react';
import { PRIZES, getPrize, type Prize } from '../data/prizes';
import { PrizeSVG } from './PrizeSVGs';
import type { PrizeId, WinnerHistoryItem } from '../types';

interface PrizeSelectorProps {
  selectedPrize: PrizeId | null;
  onSelectPrize: (id: PrizeId) => void;
  history: WinnerHistoryItem[];
  onReview: () => void;
  disabled?: boolean;
}

export const PrizeSelector: React.FC<PrizeSelectorProps> = ({
  selectedPrize,
  onSelectPrize,
  history,
  onReview,
  disabled,
}) => {
  const winnerFor = (id: PrizeId) => history.find((h) => h.prizeId === id) ?? null;

  const allDrawn = PRIZES.every((p) => winnerFor(p.id as PrizeId));

  return (
    <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#8CB23E]" />
          <span className="nexgen-label text-[11px] sm:text-xs text-white/80 tracking-widest">SELECT PRIZE TO DRAW</span>
          <span className="hidden sm:inline text-[11px] text-white/45">• freedom to start with 3rd, 2nd or 1st</span>
        </div>
        <button
          onClick={onReview}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#01173B] border-2 border-[#01173B] text-[11px] font-black hover:bg-[#f0f4f8] nexgen-label"
        >
          <Eye className="w-3.5 h-3.5 text-[#0A568C]" />
          REVIEW WINNERS
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
        {PRIZES.map((prize) => {
          const winner = winnerFor(prize.id as PrizeId);
          const isSelected = selectedPrize === prize.id;
          const isWon = !!winner;
          return (
            <button
              key={prize.id}
              onClick={() => !disabled && onSelectPrize(prize.id as PrizeId)}
              disabled={disabled}
              className={`relative text-left rounded-[16px] border-[3px] overflow-hidden transition-all
                ${isSelected ? 'border-[#009CFF] bg-white shadow-[0_8px_24px_rgba(0,156,255,0.35)] scale-[1.01]' : 'border-[#01173B] bg-white hover:border-[#0A568C] hover:shadow-[0_6px_18px_rgba(0,0,0,0.15)]'}
                ${isWon ? 'opacity-95' : ''}
                ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* top accent bar */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${prize.badgeColor}`} />
              <div className="p-3 sm:p-3.5 flex gap-3">
                {/* SVG */}
                <div className={`w-[92px] h-[84px] sm:w-[104px] sm:h-[96px] rounded-xl border-2 ${isSelected ? 'border-[#009CFF] bg-[#f0f9ff]' : 'border-[#01173B]/10 bg-[#f7f8f9]'} flex items-center justify-center shrink-0 overflow-hidden p-1`}>
                  <PrizeSVG prizeId={prize.id} className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-white text-[10px] font-black tracking-widest bg-gradient-to-r ${prize.badgeColor} border border-white shadow-sm`}>
                      {prize.placeLabel}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[#01173B] text-white text-[10px] font-black">
                      {prize.value}
                    </span>
                    {isSelected && !isWon && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#009CFF] text-white text-[10px] font-black">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> SELECTED
                      </span>
                    )}
                    {isWon && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#8CB23E] text-[#01173B] text-[10px] font-black border border-[#01173B]/10">
                        <CheckCircle2 className="w-3 h-3" /> WON
                      </span>
                    )}
                  </div>
                  <div className="nexgen-headline text-[13px] sm:text-[14px] text-[#01173B] mt-1 leading-tight truncate">{prize.title}</div>
                  <div className="text-[11px] leading-[1.3] text-[#01173B]/70 mt-0.5 line-clamp-2">{prize.longDescription}</div>
                  <div className="mt-2">
                    {isWon ? (
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${prize.badgeColor} border-2 border-[#01173B] text-[#01173B] text-xs font-black max-w-full`}>
                        <span className="truncate">🏆 {winner!.name}</span>
                      </div>
                    ) : (
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${isSelected ? 'bg-[#0A568C] text-white' : 'bg-[#f0f4f8] text-[#01173B] border border-[#01173B]/10'} text-[11px] font-black nexgen-label`}>
                        {isSelected ? 'READY TO DRAW' : 'TAP TO SELECT'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* selected ring */}
              {isSelected && (
                <div className="absolute inset-0 rounded-[13px] pointer-events-none border-2 border-[#009CFF]/0" />
              )}
            </button>
          );
        })}
      </div>
      {allDrawn && (
        <div className="mt-2 text-center text-[11px] font-black tracking-widest text-[#8CB23E]">ALL PRIZES DRAWN • Review winners or clear history to re-draw</div>
      )}
      {!selectedPrize && !allDrawn && (
        <div className="mt-2 text-center text-[11px] font-medium text-white/60">Tap a prize above, then hit <span className="font-black text-white">GRAB WINNER</span> — you can start with 3rd, 2nd or 1st in any order.</div>
      )}
    </div>
  );
};
