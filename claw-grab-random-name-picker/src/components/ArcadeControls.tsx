import React, { useState, useEffect } from 'react';
import { Play, ChevronLeft, ChevronRight, Gamepad2, Zap } from 'lucide-react';
import { CraneState } from '../types';
import { sound } from '../utils/audio';

interface ArcadeControlsProps {
  craneState: CraneState;
  manualMode: boolean;
  onToggleManualMode: (manual: boolean) => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onTriggerGrab: () => void;
  itemsCount: number;
}

export const ArcadeControls: React.FC<ArcadeControlsProps> = ({
  craneState,
  manualMode,
  onToggleManualMode,
  onMoveLeft,
  onMoveRight,
  onTriggerGrab,
  itemsCount,
}) => {
  const [joystickAngle, setJoystickAngle] = useState(0);
  const isBusy = craneState !== 'idle' && craneState !== 'moving_manual';

  // Keyboard shortcut listener for arcade gameplay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setJoystickAngle(-25);
        sound.playMoveBeep();
        onMoveLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setJoystickAngle(25);
        sound.playMoveBeep();
        onMoveRight();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!isBusy && itemsCount > 0) {
          sound.playCoin();
          onTriggerGrab();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(e.key)) {
        setJoystickAngle(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isBusy, itemsCount, onMoveLeft, onMoveRight, onTriggerGrab]);

  // Brand-matched chalk control deck: wood ledge + brand-card
  return (
    <div className="w-full max-w-3xl wood-frame rounded-[22px] p-[3px] shadow-[0_10px_28px_rgba(0,0,0,0.45)]">
      <div className="brand-card p-2.5 sm:p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Mode Selection */}
        <div className="flex items-center gap-1 bg-[#f0f4f8] p-1 rounded-xl border-2 border-[#01173B]/10">
          <button
            id="btn-auto-mode"
            onClick={() => {
              sound.playButtonClick();
              onToggleManualMode(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all nexgen-label ${
              !manualMode
                ? 'bg-[#0A568C] text-white shadow'
                : 'text-[#01173B]/60 hover:text-[#01173B]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 brand-icon" />
            <span>AUTO GRAB</span>
          </button>

          <button
            id="btn-manual-mode"
            onClick={() => {
              sound.playButtonClick();
              onToggleManualMode(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all nexgen-label ${
              manualMode
                ? 'bg-[#8CB23E] text-[#01173B] shadow'
                : 'text-[#01173B]/60 hover:text-[#01173B]'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 brand-icon" />
            <span>MANUAL</span>
          </button>
        </div>

        {/* Middle: Joystick / Directional Pad */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-move-left"
            disabled={isBusy || itemsCount === 0}
            onMouseDown={() => {
              setJoystickAngle(-25);
              sound.playMoveBeep();
              onMoveLeft();
            }}
            onMouseUp={() => setJoystickAngle(0)}
            onTouchStart={() => {
              setJoystickAngle(-25);
              sound.playMoveBeep();
              onMoveLeft();
            }}
            onTouchEnd={() => setJoystickAngle(0)}
            className="w-11 h-11 rounded-xl bg-white hover:bg-[#f0f4f8] active:bg-[#009CFF] active:text-white disabled:opacity-40 disabled:cursor-not-allowed border-2 border-[#01173B] flex items-center justify-center text-[#01173B] shadow-sm transition-transform active:scale-95"
            title="Move Claw Left (Left Arrow or A key)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Retro Joystick Visual */}
          <div className="relative w-[64px] h-[64px] bg-[#01173B] rounded-full border-[3px] border-[#0A568C] flex items-center justify-center shadow-inner overflow-hidden">
            <div className="absolute inset-[3px] rounded-full border border-white/10 pointer-events-none" />
            <div className="w-10 h-10 rounded-full bg-[#0A568C] border-2 border-white/15" />
            <div
              className="absolute top-1/2 left-1/2 w-6 h-6 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 origin-bottom"
              style={{
                transform: `translate(-50%, -100%) rotate(${joystickAngle}deg)`,
              }}
            >
              <div className="w-1.5 h-6 bg-white/85 mx-auto rounded-full" />
              <div className="w-7 h-7 -mt-1 bg-gradient-to-tr from-[#0A568C] to-[#009CFF] rounded-full border-2 border-white shadow-md mx-auto" />
            </div>
          </div>

          <button
            id="btn-move-right"
            disabled={isBusy || itemsCount === 0}
            onMouseDown={() => {
              setJoystickAngle(25);
              sound.playMoveBeep();
              onMoveRight();
            }}
            onMouseUp={() => setJoystickAngle(0)}
            onTouchStart={() => {
              setJoystickAngle(25);
              sound.playMoveBeep();
              onMoveRight();
            }}
            onTouchEnd={() => setJoystickAngle(0)}
            className="w-11 h-11 rounded-xl bg-white hover:bg-[#f0f4f8] active:bg-[#009CFF] active:text-white disabled:opacity-40 disabled:cursor-not-allowed border-2 border-[#01173B] flex items-center justify-center text-[#01173B] shadow-sm transition-transform active:scale-95"
            title="Move Claw Right (Right Arrow or D key)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Giant GRAB Button */}
        <div className="shrink-0">
          <button
            id="btn-trigger-grab"
            disabled={isBusy || itemsCount === 0}
            onClick={() => {
              sound.playCoin();
              onTriggerGrab();
            }}
            className={`relative group px-6 sm:px-8 py-3.5 rounded-2xl nexgen-headline text-[14px] sm:text-[15px] text-white flex items-center gap-2.5 transition-all duration-150 active:translate-y-1 border-b-[4px] ${
              isBusy || itemsCount === 0
                ? 'bg-[#01173B]/20 border-[#01173B]/30 text-[#01173B]/40 cursor-not-allowed'
                : 'bg-[#0A568C] hover:bg-[#0d6ab0] border-[#01173B] shadow-[0_8px_20px_rgba(10,86,140,0.35)] active:shadow-none'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{isBusy ? 'GRABBING...' : manualMode ? 'DROP CLAW' : 'GRAB WINNER!'}</span>
            {!isBusy && itemsCount > 0 && <span className="hidden sm:inline-flex w-2 h-2 rounded-full bg-[#8CB23E] shadow-[0_0_8px_#8CB23E] animate-pulse" />}
          </button>
        </div>
      </div>
    </div>
  );
};
