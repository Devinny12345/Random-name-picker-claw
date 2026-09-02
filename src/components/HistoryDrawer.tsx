import React, { useState } from 'react';
import { X, History, RotateCcw, Copy, Check, Trash2 } from 'lucide-react';
import { WinnerHistoryItem } from '../types';
import { sound } from '../utils/audio';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: WinnerHistoryItem[];
  onRestoreWinner: (item: WinnerHistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onRestoreWinner,
  onClearHistory,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyHistory = () => {
    sound.playButtonClick();
    const text = history
      .map((h, i) => `${i + 1}. ${h.name} (${new Date(h.timestamp).toLocaleTimeString()})`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[55] flex justify-end bg-[#01173B]/70 backdrop-blur-[2px]">
      <div className="w-full max-w-md bg-white border-l-[3px] border-[#01173B] h-full shadow-[-18px_0_50px_rgba(1,23,59,0.35)] flex flex-col animate-slideLeft relative overflow-hidden">
        {/* Header Badge — overlapping */}
        <div className="absolute top-0 left-6 brand-badge px-4 py-1.5 flex items-center gap-2 z-10">
          <span className="brand-badge__logo text-[11px]">NEXGEN</span>
          <span className="w-px h-3 bg-white/20" />
          <span className="brand-badge__tier text-[11px]">HISTORY</span>
        </div>
        <div className="absolute top-7 left-6 right-6 h-[3px] brand-swoosh opacity-60" />
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 pt-10 pb-4 border-b-[3px] border-[#01173B] bg-white">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#0A568C] brand-icon" />
            <h3 className="nexgen-headline text-base text-[#01173B]">DRAW HISTORY ({history.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#01173B] text-white hover:bg-black border-2 border-[#01173B]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-[#f0f4f8] border-b-[3px] border-[#01173B]/10">
          <button
            onClick={handleCopyHistory}
            disabled={history.length === 0}
            className="flex items-center gap-1 nexgen-label text-[11px] text-[#01173B] hover:text-[#0A568C] disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#8CB23E]" /> : <Copy className="w-3.5 h-3.5 text-[#0A568C] brand-icon" />}
            <span>{copied ? 'COPIED LOG' : 'COPY ALL'}</span>
          </button>

          <button
            onClick={() => {
              sound.playButtonClick();
              if (confirm('Clear all draw history?')) {
                onClearHistory();
              }
            }}
            disabled={history.length === 0}
            className="flex items-center gap-1 nexgen-label text-[11px] text-red-500 hover:text-red-600 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>CLEAR HISTORY</span>
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#f7f8f9]">
          {history.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white border-[3px] border-[#01173B] flex items-center justify-center mb-3">
                <History className="w-6 h-6 text-[#0A568C] brand-icon" />
              </div>
              <p className="nexgen-headline text-sm text-[#01173B]">NO DRAWS YET</p>
              <p className="text-xs text-[#01173B]/60 mt-1">Grab a capsule to start logging winners!</p>
            </div>
          ) : (
            history.map((h, idx) => (
              <div
                key={h.id}
                className="flex items-center justify-between p-3 brand-card brand-card--sm"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#01173B] text-white nexgen-label text-xs font-black flex items-center justify-center border-2 border-[#01173B]">
                    {history.length - idx}
                  </span>
                  <div>
                    <h4 className="nexgen-label text-sm text-[#01173B]">{h.name}</h4>
                    <span className="text-[11px] text-[#0A568C] font-medium">
                      {new Date(h.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playButtonClick();
                    onRestoreWinner(h);
                  }}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-[#f0f4f8] text-[#0A568C] text-[11px] font-black border-2 border-[#01173B] flex items-center gap-1 nexgen-label"
                  title="Put back in the claw machine pool"
                >
                  <RotateCcw className="w-3 h-3 brand-icon" />
                  <span>RE-ADD</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t-[3px] border-[#01173B] bg-white">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-[#01173B] hover:bg-black text-white font-black text-xs border-2 border-[#01173B] nexgen-label"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
