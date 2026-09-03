import React from 'react';
import { X, Trophy, RotateCcw, Award } from 'lucide-react';
import { PRIZES, getPrize } from '../data/prizes';
import { PrizeSVG } from './PrizeSVGs';
import type { WinnerHistoryItem } from '../types';
import { sound } from '../utils/audio';

interface PrizeReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: WinnerHistoryItem[];
  onRestoreWinner?: (item: WinnerHistoryItem) => void;
}

export const PrizeReviewModal: React.FC<PrizeReviewModalProps> = ({ isOpen, onClose, history, onRestoreWinner }) => {
  if (!isOpen) return null;

  const winnerFor = (id: string) => history.find((h) => h.prizeId === id) ?? null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#01173B]/78 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[88vh] overflow-hidden brand-card p-0 flex flex-col animate-scaleUp">
        {/* Header badge */}
        <div className="absolute -top-[1px] left-6 brand-badge px-4 py-1.5 flex items-center gap-2 z-10">
          <span className="brand-badge__logo text-[11px]">NEXGEN</span>
          <span className="w-px h-3 bg-white/20" />
          <span className="brand-badge__tier text-[11px]">PRIZE REVIEW</span>
          <span className="w-2 h-2 rounded-full bg-[#8CB23E] shadow-[0_0_6px_rgba(140,178,62,0.8)]" />
        </div>
        <div className="absolute top-7 left-6 right-6 h-[3px] brand-swoosh opacity-70" />

        <div className="flex items-center justify-between px-5 pt-10 pb-4 border-b-[3px] border-[#01173B] bg-white shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#0A568C]" />
            <h3 className="nexgen-headline text-base text-[#01173B]">PRIZE WINNERS REVIEW</h3>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-[#f0f4f8] border border-[#01173B]/10 text-[11px] font-black text-[#01173B]">{history.filter(h=>h.prizeId).length} / 3 AWARDED</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-[#01173B] text-white hover:bg-black border-2 border-[#01173B]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#f7f8f9] space-y-3">
          {PRIZES.map((prize) => {
            const winner = winnerFor(prize.id);
            return (
              <div key={prize.id} className={`relative rounded-[16px] border-[3px] overflow-hidden ${winner ? 'border-[#8CB23E] bg-white' : 'border-[#01173B]/15 bg-white'}`}>
                <div className={`h-1.5 w-full bg-gradient-to-r ${prize.badgeColor}`} />
                <div className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="w-[112px] h-[96px] rounded-xl border-2 border-[#01173B]/10 bg-[#f7f8f9] flex items-center justify-center shrink-0 p-1">
                    <PrizeSVG prizeId={prize.id} className="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-white text-[10px] font-black tracking-widest bg-gradient-to-r ${prize.badgeColor} border border-white shadow`}>{prize.placeLabel}</span>
                      <span className="inline-flex px-1.5 py-0.5 rounded-full bg-[#01173B] text-white text-[10px] font-black">{prize.value}</span>
                      {winner ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#8CB23E] text-[#01173B] text-[10px] font-black"><Trophy className="w-3 h-3" /> AWARDED</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-100 text-[#01173B] border border-amber-300 text-[10px] font-black">NOT YET DRAWN</span>
                      )}
                    </div>
                    <div className="nexgen-headline text-[15px] text-[#01173B] mt-1">{prize.title}</div>
                    <div className="text-[11px] text-[#01173B]/70 mt-0.5">{prize.longDescription}</div>
                    <div className="mt-3">
                      {winner ? (
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className={`px-3 py-2 rounded-xl bg-gradient-to-br ${prize.badgeColor} border-2 border-[#01173B] text-[#01173B] shadow`}>
                            <div className="text-[10px] font-black tracking-widest opacity-70">WINNER</div>
                            <div className="nexgen-headline text-lg leading-none">{winner.name}</div>
                            <div className="text-[11px] font-medium opacity-80">{new Date(winner.timestamp).toLocaleString()}</div>
                          </div>
                          {onRestoreWinner && (
                            <button
                              onClick={() => { sound.playButtonClick(); onRestoreWinner(winner); }}
                              className="px-3 py-1.5 rounded-full bg-white hover:bg-[#f0f4f8] text-[#0A568C] text-[11px] font-black border-2 border-[#01173B] flex items-center gap-1 nexgen-label"
                            >
                              <RotateCcw className="w-3 h-3" /> RE-ADD TO DRUM
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs font-medium text-[#01173B]/60 italic">No winner yet — select this prize and hit GRAB WINNER to draw.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Overall winners list by draw order */}
          <div className="rounded-[16px] border-[3px] border-[#01173B] bg-white overflow-hidden">
            <div className="px-4 py-2 bg-[#01173B] text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#8CB23E]" />
              <span className="nexgen-label text-xs tracking-widest">DRAW ORDER</span>
              <span className="ml-auto text-[11px] font-medium opacity-70">{history.length} total draws</span>
            </div>
            <div className="p-3 space-y-2 max-h-[260px] overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-center py-6 text-sm text-[#01173B]/60">No draws yet. Select a prize and grab a winner!</div>
              ) : (
                history.map((h, idx) => {
                  const prize = getPrize(h.prizeId);
                  return (
                    <div key={h.id} className="flex items-center justify-between p-2.5 rounded-xl border-2 border-[#01173B]/10 bg-[#f7f8f9]">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-[#01173B] text-white text-xs font-black flex items-center justify-center border-2 border-[#01173B] shrink-0">{history.length - idx}</span>
                        <div className="min-w-0">
                          <div className="nexgen-label text-sm text-[#01173B] truncate">{h.name}</div>
                          <div className="text-[11px] text-[#0A568C] flex items-center gap-1.5 flex-wrap">
                            <span>{new Date(h.timestamp).toLocaleString()}</span>
                            {prize ? (
                              <span className={`inline-flex px-1.5 py-0.5 rounded-full text-white text-[10px] font-black bg-gradient-to-r ${prize.badgeColor} border border-white`}>{prize.placeLabel} • {prize.value}</span>
                            ) : (
                              <span className="inline-flex px-1.5 py-0.5 rounded-full bg-white border border-[#01173B]/10 text-[10px] font-black text-[#01173B]/60">NO PRIZE</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 ml-2 w-12 h-12 rounded-lg border border-[#01173B]/10 bg-white flex items-center justify-center overflow-hidden p-1">
                        {prize ? <PrizeSVG prizeId={prize.id} className="w-full h-full" /> : <Award className="w-5 h-5 text-[#01173B]/40" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t-[3px] border-[#01173B] bg-white flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full bg-[#01173B] hover:bg-black text-white font-black text-xs border-2 border-[#01173B] nexgen-label">
            CLOSE REVIEW
          </button>
        </div>
      </div>
    </div>
  );
};
