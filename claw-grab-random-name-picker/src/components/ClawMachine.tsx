import React, { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import { NameItem, CapsuleTheme, CraneState } from '../types';
import { CAPSULE_PALETTES } from '../data/presets';

interface ClawMachineProps {
  totalRemaining: number;
  binCount: number;
  craneState: CraneState;
  carriagePercent: number;
  cableHeight: number;
  clawOpen: boolean;
  hookedItem: NameItem | null;
  targetItemIndex?: number | null;
  theme: CapsuleTheme;
  onClawClick?: () => void;
  speedMode: 'normal' | 'fast' | 'turbo';
  hideNames?: boolean;
  classroomTitle?: string;
}

// Pre-computed visual capsule slots for the physical pit — one per capsule in the bin
interface VisualBall {
  x: number;
  y: number;
  rot: number;
  scale: number;
  colorIndex: number;
  iconIndex: number;
}

// Build `count` capsule slots spread across the pit (rows are denser with more capsules)
function buildPitBalls(count: number): VisualBall[] {
  const n = Math.max(1, count);
  const cols = Math.max(4, Math.min(8, Math.ceil(Math.sqrt(n * 1.6))));
  const rows = Math.ceil(n / cols);
  const out: VisualBall[] = [];
  for (let idx = 0; idx < n; idx++) {
    const hash = (idx * 9301 + 49297) % 233280;
    const rnd1 = (hash % 1000) / 1000;
    const rnd2 = ((hash * 7) % 1000) / 1000;
    const rnd3 = ((hash * 13) % 1000) / 1000;

    const row = Math.floor(idx / cols);
    const col = idx % cols;
    const baseX = 18 + (col / (cols - 1)) * 64;
    const baseY = 65 + (row * 5.2);

    out.push({
      x: Math.min(84, Math.max(16, baseX + (rnd1 - 0.5) * 7)),
      y: Math.min(88, Math.max(62, baseY + (rnd2 - 0.5) * 4.5)),
      rot: (rnd3 - 0.5) * 28,
      scale: 0.95 + rnd1 * 0.1,
      colorIndex: idx % 8,
      iconIndex: idx % 10,
    });
  }
  return out;
}

// Render capsule skin based on theme
function renderCapsuleGraphic(colorIndex: number, iconIndex: number, label = '?', isHooked = false, theme: CapsuleTheme, hideNames: boolean) {
  const palette = CAPSULE_PALETTES[colorIndex % CAPSULE_PALETTES.length];
  const displayLabel = hideNames ? '?' : label;

  if (theme === 'school_supplies') {
    const schoolIcons = ['🍎', '✏️', '📚', '🎒', '🎨', '📐', '🖍️', '⭐', '🏆', '🧪'];
    const icon = schoolIcons[iconIndex % schoolIcons.length];
    return (
      <div
        className={`relative w-15 h-15 rounded-2xl flex flex-col items-center justify-between p-1 shadow-lg bg-gradient-to-b ${palette.bg} border-2 ${palette.border} transition-transform ${
          isHooked ? 'scale-110 ring-4 ring-amber-300 animate-pulse' : ''
        }`}
        style={{ boxShadow: '0 6px 14px rgba(0,0,0,0.45)' }}
      >
        <div className="absolute top-0.5 right-1 text-xs opacity-90">{icon}</div>
        <div className="w-full flex justify-center pt-1">
          <span className="text-xl leading-none drop-shadow-sm">{icon}</span>
        </div>
        <div className="w-full bg-slate-950/80 rounded-md py-0.5 px-1 border border-white/20 flex items-center justify-center">
          <span className={`font-black text-white px-0.5 text-center truncate max-w-[50px] drop-shadow font-sans ${hideNames ? 'text-xs text-amber-300' : 'text-[9px]'}`}>
            {displayLabel}
          </span>
        </div>
      </div>
    );
  }

  if (theme === 'school_stars') {
    return (
      <div
        className={`relative w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform ${
          isHooked ? 'scale-110 ring-4 ring-yellow-200 animate-bounce' : ''
        }`}
        style={{
          background: 'radial-gradient(circle at 35% 30%, #fef08a 0%, #f59e0b 60%, #b45309 100%)',
          boxShadow: '0 6px 14px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.8)',
        }}
      >
        <div className="text-base leading-none drop-shadow-xs">⭐</div>
        <span className={`font-black text-amber-950 px-1 text-center truncate max-w-[48px] drop-shadow-sm font-sans z-10 ${hideNames ? 'text-sm font-extrabold' : 'text-[9px]'}`}>
          {hideNames ? '⭐ ?' : displayLabel}
        </span>
      </div>
    );
  }

  if (theme === 'golden_eggs') {
    return (
      <div
        className={`relative w-14 h-16 rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-amber-300/80 transition-transform ${
          isHooked ? 'scale-110 animate-pulse ring-4 ring-amber-300' : ''
        }`}
        style={{
          background: 'radial-gradient(circle at 35% 30%, #fef08a 0%, #eab308 50%, #854d0e 100%)',
          boxShadow: '0 6px 14px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.7)',
        }}
      >
        <div className="absolute top-1.5 left-2 w-3 h-5 bg-white/60 rounded-full blur-[1px] transform -rotate-20" />
        <span className={`font-black text-amber-950 px-1 text-center truncate max-w-[48px] drop-shadow-sm font-sans z-10 ${hideNames ? 'text-base' : 'text-[10px]'}`}>
          {hideNames ? '✨ ?' : displayLabel}
        </span>
      </div>
    );
  }

  if (theme === 'plushies') {
    const plushEmojis = ['🧸', '🐰', '🐼', '🦁', '🦊', '🐱', '🐶', '🦄', '🐸', '🐨'];
    const emoji = plushEmojis[iconIndex % plushEmojis.length];
    return (
      <div
        className={`relative w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg bg-gradient-to-b ${palette.bg} border-2 ${palette.border} transition-transform ${
          isHooked ? 'scale-110 ring-4 ring-yellow-400' : ''
        }`}
        style={{ boxShadow: '0 6px 12px rgba(0,0,0,0.35)' }}
      >
        <span className="text-xl leading-none">{emoji}</span>
        <span className={`font-extrabold text-white px-1 text-center truncate max-w-[46px] drop-shadow font-sans ${hideNames ? 'text-xs' : 'text-[9px]'}`}>
          {displayLabel}
        </span>
      </div>
    );
  }

  if (theme === 'cyber_gems') {
    return (
      <div
        className={`relative w-14 h-14 rotate-45 flex items-center justify-center shadow-lg bg-gradient-to-br ${palette.bg} border-2 border-cyan-300 transition-transform ${
          isHooked ? 'scale-110 ring-4 ring-cyan-400' : ''
        }`}
        style={{ boxShadow: `0 0 16px ${palette.glow}, inset 0 0 8px rgba(255,255,255,0.6)` }}
      >
        <span className={`-rotate-45 font-black tracking-wider text-white px-1 text-center truncate max-w-[44px] uppercase drop-shadow font-mono ${hideNames ? 'text-sm' : 'text-[9px]'}`}>
          {displayLabel}
        </span>
      </div>
    );
  }

  if (theme === 'candy_orbs') {    return (
      <div
        className={`relative w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg bg-gradient-to-br ${palette.bg} border-2 border-white/80 transition-transform ${
          isHooked ? 'scale-110 ring-4 ring-white' : ''
        }`}
        style={{
          boxShadow: '0 6px 12px rgba(0,0,0,0.35), inset 0 -4px 8px rgba(0,0,0,0.3)',
        }}
      >
        <div className="absolute top-1 left-2.5 w-3 h-2 bg-white/70 rounded-full blur-[0.5px]" />
        <span className={`font-black text-white px-1 text-center truncate max-w-[46px] drop-shadow-md ${hideNames ? 'text-xs' : 'text-[10px]'}`}>
          {hideNames ? '🍬 ?' : `🍬 ${displayLabel}`}
        </span>
      </div>
    );
  }

  // Default: Classic Gachapon Capsule
  return (
    <div
      className={`relative w-14 h-14 rounded-full flex flex-col items-center justify-center overflow-hidden border-2 border-white/40 shadow-xl transition-transform ${
        isHooked ? 'scale-110 ring-4 ring-yellow-300 animate-pulse' : ''
      }`}
      style={{ boxShadow: '0 6px 14px rgba(0,0,0,0.45)' }}
    >
      <div className={`w-full h-1/2 bg-gradient-to-r ${palette.bg} relative border-b border-black/20`}>
        <div className="absolute top-1 left-2.5 w-3.5 h-1.5 bg-white/60 rounded-full blur-[0.5px]" />
      </div>
      <div className="w-full h-1/2 bg-slate-100/90 flex items-center justify-center px-1">
        {hideNames ? (
          <div className="flex items-center justify-center">
            <span className="text-xs font-black text-slate-800 drop-shadow-xs">❓</span>
          </div>
        ) : (
          <div className="bg-amber-100 border border-amber-300/80 rounded px-1 max-w-[46px] shadow-sm">
            <span className="text-[9px] font-bold text-slate-800 truncate block text-center">
              {displayLabel}
            </span>
          </div>
        )}
      </div>
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/80 shadow-xs" />
    </div>
  );
}

export type { ClawMachineProps };

type Body = { x: number; y: number; vx: number; vy: number; r: number; rot: number; scale: number; colorIndex: number; iconIndex: number; wobble: number };

const ClawMachineInner: React.FC<ClawMachineProps> = ({
  totalRemaining,
  binCount,
  craneState,
  carriagePercent,
  cableHeight,
  clawOpen,
  hookedItem,
  theme,
  onClawClick,
  hideNames = true,
  classroomTitle = 'Classroom Student Picker',
  speedMode,
}) => {
  const chamberRef = useRef<HTMLDivElement>(null);
  const ballRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bodiesRef = useRef<Body[]>([]);
  const rafRef = useRef<number | null>(null);
  const [chamberH, setChamberH] = useState(0);

  const BALL_RADIUS = 28;
  const GRAVITY = 0.62;
  const RESTITUTION = 0.38;
  const GROUND_FRICTION = 0.74;
  const WALL_DAMP = 0.70;
  const AIR_DRAG = 0.998;
  const FLOOR_H = 16;
  const OUTLET_CENTER_PCT = 9.2; // winner chute center — must match App.tsx -> carriagePercent 9.2 on return
  const [floorHit, setFloorHit] = useState(false);

  // Capsule slot layout for the bin — regenerated when the requested bin count changes
  const pitBalls = useMemo(() => buildPitBalls(binCount), [binCount]);

  // Track chamber height for dynamic cable reach
  useEffect(() => {
    const el = chamberRef.current;
    if (!el) return;
    const upd = () => setChamberH(el.clientHeight);
    upd();
    const ro = new ResizeObserver(upd);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Cable length — tip of claw (not hub) collides with floor, never passes through
  const cablePx = useMemo(() => {
    if (chamberH === 0) return Math.max(12, cableHeight * 3.4);
    // geometry: carriage bottom ≈40px from chamber top, hub 24 + prongs 34 = 58 from cable end to tip
    // tipY = 40 + cablePx + 58 = cablePx + 98 ; floor top = chamberH - 16
    // so max cable that lets tip *meet* floor: H -16 -98 = H -114
    const minH = 24;
    const maxH = Math.max(120, chamberH - 114); // tip meets floor, no penetration
    const t = Math.max(0, Math.min(1, (cableHeight - 10) / (118 - 10)));
    return minH + t * (maxH - minH);
  }, [chamberH, cableHeight]);

  // Falling capsule visual for outlet drop
  const [falling, setFalling] = useState<null | { item: NameItem; startX: number; startY: number; targetX: number; targetY: number; active: boolean }>(null);
  const prevHookedRef = useRef<NameItem | null>(null);
  useEffect(() => { if (hookedItem) prevHookedRef.current = hookedItem; }, [hookedItem]);
  useEffect(() => {
    if (craneState === 'dropping' && prevHookedRef.current && chamberH > 0) {
      const startX = carriagePercent;
      const startY = cablePx + 52;
      const targetX = OUTLET_CENTER_PCT;
      const targetY = chamberH - 38;
      setFalling({ item: prevHookedRef.current, startX, startY, targetX, targetY, active: false });
      requestAnimationFrame(() => requestAnimationFrame(() => setFalling(f => f ? { ...f, active: true } : f)));
      const t = setTimeout(() => setFalling(null), 1150);
      return () => clearTimeout(t);
    }
    if (craneState === 'idle' || craneState === 'auto_targeting') setFalling(null);
  }, [craneState, carriagePercent, cablePx, chamberH]);

  const initBodies = useCallback((W: number, H: number) => {
    const arr: Body[] = pitBalls.map((b, idx) => {
      const scale = b.scale;
      const r = BALL_RADIUS * scale;
      const colJitter = (Math.random() - 0.5) * 36;
      const x = (b.x / 100) * W + colJitter;
      // SPAWN FROM VERY TOP of the chamber (above visible area) so they rain full length
      const y = -160 - Math.random() * 420 - (idx % 6) * 22;
      const vx = (Math.random() - 0.5) * 3.2;
      const vy = Math.random() * 2.2 + 0.5;
      return { x, y, vx, vy, r, rot: b.rot, scale, colorIndex: b.colorIndex, iconIndex: b.iconIndex, wobble: Math.random() * Math.PI * 2 };
    });
    bodiesRef.current = arr;
  }, [pitBalls]);

  const resettle = useCallback(() => {
    const chamber = chamberRef.current;
    if (!chamber) return;
    const W = chamber.clientWidth;
    const bodies = bodiesRef.current;
    bodies.forEach((b, i) => {
      const column = (pitBalls[i].x / 100) * W + (Math.random() - 0.5) * 28;
      // Full re-rain from top of screen (~80% of balls)
      if (Math.random() < 0.78) {
        b.x = column;
        b.y = -140 - Math.random() * 420 - Math.random() * 180;
        b.vx = (Math.random() - 0.5) * 5;
        b.vy = Math.random() * 3;
      } else {
        b.vx += (Math.random() - 0.5) * 7;
        b.vy -= Math.random() * 5 + 1.2;
        // give it a little pop so settled pile shakes
        b.y -= Math.random() * 6;
      }
      b.wobble = Math.random() * Math.PI * 2;
    });
    if (rafRef.current == null) startLoop();
  }, [pitBalls]);

  const startLoop = useCallback(() => {
    const chamber = chamberRef.current;
    if (!chamber) return;
    let lastT = performance.now();
    let idleFrames = 0;

    const step = (now: number) => {
      const dt = Math.min(32, now - lastT) / 16.66;
      lastT = now;
      const W = chamber.clientWidth;
      const H = chamber.clientHeight;
      const bodies = bodiesRef.current;
      let maxV = 0;

      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        b.vy += GRAVITY * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.vx *= Math.pow(AIR_DRAG, dt);
        b.vy *= Math.pow(AIR_DRAG, dt);
        b.wobble += Math.abs(b.vx) * 0.05 + 0.018;
        maxV = Math.max(maxV, Math.abs(b.vx) + Math.abs(b.vy));

        const groundY = H - FLOOR_H - b.r;
        if (b.y > groundY) {
          b.y = groundY;
          if (b.vy > 0.35) {
            b.vy = -b.vy * RESTITUTION;
            b.vx *= GROUND_FRICTION;
          } else {
            b.vy = 0;
            b.vx *= 0.91;
            if (Math.abs(b.vx) < 0.05) b.vx = 0;
          }
        }
        if (b.x - b.r < 2) {
          b.x = b.r + 2;
          b.vx = -b.vx * WALL_DAMP;
        } else if (b.x + b.r > W - 2) {
          b.x = W - 2 - b.r;
          b.vx = -b.vx * WALL_DAMP;
        }
        // keep from escaping far above (but allow well above chamber during rain)
        if (b.y < -520) {
          b.y = -520;
          b.vy = Math.abs(b.vy) * 0.25;
        }
      }

      // ball-ball
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i], b = bodies[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          const minD = a.r + b.r - 1.5;
          if (dist < minD && dist > 0.01) {
            const overlap = (minD - dist) * 0.5;
            const nx = dx / dist, ny = dy / dist;
            a.x -= nx * overlap; a.y -= ny * overlap;
            b.x += nx * overlap; b.y += ny * overlap;
            const dvx = b.vx - a.vx, dvy = b.vy - a.vy;
            const dot = dvx * nx + dvy * ny;
            if (dot < 0) {
              const imp = dot * 0.80;
              a.vx += imp * nx; a.vy += imp * ny;
              b.vx -= imp * nx; b.vy -= imp * ny;
              const tx = -ny, ty = nx;
              const td = dvx * tx + dvy * ty;
              const fImp = td * 0.045;
              a.vx += fImp * tx; a.vy += fImp * ty;
              b.vx -= fImp * tx; b.vy -= fImp * ty;
            }
          }
        }
      }

      for (let i = 0; i < bodies.length; i++) {
        const el = ballRefs.current[i];
        const b = bodies[i];
        if (!el) continue;
        const tilt = Math.sin(b.wobble) * 2.5;
        el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) translate(-50%, -50%) rotate(${b.rot + tilt}deg) scale(${b.scale})`;
        // Fade in once they enter the chamber
        el.style.opacity = b.y < -60 ? '0' : '1';
        el.style.willChange = 'transform';
      }

      if (maxV < 0.13) idleFrames++; else idleFrames = 0;
      if (idleFrames > 130) {
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
  }, []);

  // Floor collision thud — claw tip meets floor, floor compresses + balls jostle
  useEffect(() => {
    if (craneState === 'lowering') {
      const t = setTimeout(() => {
        setFloorHit(true);
        const bodies = bodiesRef.current;
        bodies.forEach((b) => {
          if (Math.random() < 0.35) {
            b.vx += (Math.random() - 0.5) * 4;
            b.vy -= Math.random() * 2;
          }
        });
        if (rafRef.current == null) startLoop();
        setTimeout(() => setFloorHit(false), 220);
      }, 710);
      return () => clearTimeout(t);
    }
  }, [craneState, startLoop]);

  useEffect(() => {
    const chamber = chamberRef.current;
    if (!chamber || totalRemaining === 0) return;
    const init = () => {
      const W = chamber.clientWidth, H = chamber.clientHeight;
      if (W === 0 || H === 0) { setTimeout(init, 60); return; }
      initBodies(W, H);
      startLoop();
    };
    requestAnimationFrame(init);
    const ro = new ResizeObserver(() => {
      const W = chamber.clientWidth, H = chamber.clientHeight;
      initBodies(W, H);
      if (rafRef.current == null) startLoop();
    });
    ro.observe(chamber);
    return () => { ro.disconnect(); if (rafRef.current != null) cancelAnimationFrame(rafRef.current); rafRef.current = null; };
  }, [totalRemaining, initBodies, startLoop, pitBalls]);

  const prevCraneRef = useRef<CraneState>(craneState);
  useEffect(() => {
    const prev = prevCraneRef.current;
    if ((prev === 'idle' || prev === 'moving_manual') && (craneState === 'auto_targeting' || craneState === 'lowering')) {
      resettle();
    }
    prevCraneRef.current = craneState;
  }, [craneState, resettle]);

  useEffect(() => { if (chamberRef.current) resettle(); }, [theme]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none flex-1 py-1">
      <div className="relative aspect-[16/9] w-full max-w-[calc(100vh*1.22)] h-auto min-h-[340px] rounded-[22px] p-[4px] wood-frame flex flex-col overflow-hidden">
        {/* inner chalkboard surface */}
        <div className="relative flex-1 flex flex-col chalkboard-bg--navy rounded-[18px] border border-white/10 overflow-hidden p-2.5 sm:p-3">
          {/* wood grain top highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-white/20 pointer-events-none" />
          {/* chalk dust header bar */}
          <div className="relative h-[44px] sm:h-[48px] rounded-xl border-2 border-white/12 bg-[#0A568C]/22 backdrop-blur-[1px] flex items-center justify-between px-3 sm:px-4 mb-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] shrink-0 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.9) 0 1px, transparent 1px 26px)` }} />
            <div className="flex items-center gap-2 z-10 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#8CB23E] shadow-[0_0_10px_rgba(140,178,62,0.9)] animate-pulse shrink-0" />
              <span className="w-2 h-2 rounded-full bg-[#009CFF] shadow-[0_0_10px_rgba(0,156,255,0.9)] hidden sm:block shrink-0" />
              <span className="hidden sm:inline text-[10px] font-black tracking-[0.18em] text-white/65 uppercase">Prize Drum</span>
            </div>
            <div className="flex items-center gap-2 z-10 text-center min-w-0 flex-1 justify-center px-2">
              <img src="/brand/nexgen-white.png" alt="NexGen" className="h-5 sm:h-6 w-auto object-contain opacity-95 hidden sm:block" draggable={false} />
              <h2 className="chalk-text font-black tracking-[0.07em] uppercase text-[11px] sm:text-[12px] lg:text-[13px] truncate max-w-[42vw] sm:max-w-none">
                {classroomTitle}
              </h2>
            </div>
            <div className="flex items-center gap-2 z-10 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-[#01173B] border-2 border-[#01173B] shadow text-[11px] font-black tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8CB23E]" />
                {totalRemaining.toLocaleString()} ENTRIES
              </span>
            </div>
          </div>

        {/* Chalkboard Chamber — full-height physics world with chalk grid */}
        <div 
          ref={chamberRef}
          className="relative flex-1 bg-[#061a2e] rounded-xl border-2 border-white/15 shadow-[inset_0_0_40px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] overflow-hidden cursor-crosshair min-h-[340px] flex flex-col"
          onClick={onClawClick}
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.06) 0%, transparent 55%),
              radial-gradient(ellipse at 72% 78%, rgba(0,156,255,0.08) 0%, transparent 50%),
              linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 18%)
            `,
          }}
        >
          {/* chalk grid */}
          <div className="absolute inset-0 opacity-[0.10] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
          {/* soft vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 62%, rgba(0,0,0,0.42) 100%)' }} />
          {/* top rail — brushed aluminum but brand-tinted */}
          <div className="absolute top-2 inset-x-3 h-3.5 bg-gradient-to-b from-[#d8e2ea] via-[#a9b8c7] to-[#7d90a6] rounded-full border border-white/35 shadow-[0_2px_8px_rgba(0,0,0,0.35)] flex items-center z-10 overflow-hidden">
            <div className="w-full h-[2px] bg-[#0A568C]/35 shadow-[0_0_6px_rgba(10,86,140,0.4)]" />
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)]" />
          </div>

          {/* WINNER CHUTE — solid, opaque, perfectly aligned with drop point */}
          <div
            className="absolute bottom-0 z-30 flex flex-col items-center justify-end pointer-events-none"
            style={{
              left: `${OUTLET_CENTER_PCT}%`,
              transform: 'translateX(-50%)',
              width: '112px',
            }}
          >
            {/* chute body — solid brand navy, not dashed, fully opaque */}
            <div className="w-[112px] h-[108px] bg-[#01173B] border-[3px] border-[#8CB23E] rounded-t-[18px] shadow-[0_8px_22px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-8px_18px_rgba(0,0,0,0.35)] flex flex-col items-center justify-end p-2 relative overflow-hidden">
              {/* inner highlight */}
              <div className="absolute inset-[3px] rounded-t-[14px] border border-white/12 pointer-events-none" />
              <div className="absolute top-0 inset-x-0 h-[1px] bg-white/18" />
              {/* blue accent strip */}
              <div className="w-full h-2 rounded-full bg-gradient-to-r from-[#0A568C] via-[#009CFF] to-[#0A568C] shadow-[0_0_10px_rgba(0,156,255,0.55)] mb-1.5" />
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8CB23E] animate-pulse" />
                <span className="text-[10px] font-black tracking-[0.14em] text-white uppercase">WINNER</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#009CFF] animate-pulse" />
              </div>
              <span className="text-[10px] font-black tracking-[0.14em] text-[#8CB23E] uppercase -mt-0.5">CHUTE</span>
              <div className="mt-1 text-[11px] leading-none opacity-90">⬇️</div>
              {/* bottom lip */}
              <div className="absolute -bottom-[1px] inset-x-2 h-[3px] bg-[#8CB23E] rounded-full opacity-90" />
            </div>
            {/* chute throat glow */}
            <div className="w-[74px] h-[10px] -mt-1 bg-[#009CFF]/25 blur-[6px] rounded-full" />
          </div>

          {/* Claw Assembly - dynamic cable reach to floor (tip collides with floor, never passes through) */}
          <div
            className="absolute top-2.5 z-40 pointer-events-none transition-all"
            style={{
              left: `${carriagePercent}%`,
              transform: floorHit ? 'translateX(-50%) translateY(-6px)' : 'translateX(-50%)',
              transitionDuration: floorHit ? '90ms' : craneState === 'idle' || craneState === 'moving_manual' ? '80ms' : craneState === 'hunting' ? '980ms' : craneState === 'returning' ? '1400ms' : craneState === 'lowering' || craneState === 'lifting' ? '720ms' : '520ms',
              transitionTimingFunction: floorHit ? 'ease-out' : craneState === 'hunting' ? 'cubic-bezier(0.45, 0, 0.55, 1)' : craneState === 'returning' ? 'cubic-bezier(0.22, 1, 0.36, 1)' : 'ease-out',
            }}
          >
            <div className="relative -top-1.5 w-16 h-9 bg-gradient-to-b from-[#0A568C] via-[#0d6ab0] to-[#094063] rounded-lg border-2 border-white/20 shadow-lg flex flex-col items-center justify-center">
              <div className="w-11 h-1.5 bg-[#01173B]/60 rounded-full mb-0.5" />
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#8CB23E] shadow-[0_0_7px_rgba(140,178,62,0.8)] animate-pulse" />
                <span className="text-[7px] font-black text-white tracking-[0.18em]">CLAW</span>
                <div className="w-2.5 h-2.5 rounded-full bg-[#009CFF] shadow-[0_0_7px_rgba(0,156,255,0.8)]" />
              </div>
            </div>

            <div className="relative w-full flex flex-col items-center">
              <div
                className="w-[3px] bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 shadow-sm border-x border-slate-500/40 transition-all ease-in-out"
                style={{
                  height: `${cablePx}px`,
                  transitionDuration: craneState === 'idle' ? '0ms' : '520ms',
                }}
              />
              <div className="relative -mt-1 flex flex-col items-center">
                <div className="w-9 h-6 bg-gradient-to-b from-[#d8e2ea] via-[#a9b8c7] to-[#7d90a6] rounded-md border-2 border-white/35 shadow flex flex-col items-center justify-center">
                  <div className="w-3 h-2.5 rounded-sm bg-[#01173B] shadow-inner border border-white/15" />
                  <div className="w-2 h-2 rounded-full bg-[#8CB23E] shadow-[0_0_6px_rgba(140,178,62,0.9)] border border-white/40" />
                </div>
                <div className="relative w-20 h-14 flex justify-between px-0.5 -mt-0.5">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-4 h-6 bg-gradient-to-br from-[#d8e2ea] to-[#8aa0b8] rounded-t-lg border border-white/30 shadow-md origin-bottom transition-transform duration-200"
                      style={{ transform: `rotate(${clawOpen ? -18 : 10}deg)` }}
                    />
                    <div
                      className="w-3.5 h-7 bg-gradient-to-b from-[#8aa0b8] to-[#5d758f] rounded-b-xl origin-top transition-transform duration-200 border border-white/10"
                      style={{ transform: `rotate(${clawOpen ? 34 : -6}deg)` }}
                    >
                      <div className="w-2 h-1.5 mx-auto mt-5 rounded-full bg-[#8CB23E] shadow-[0_0_6px_rgba(140,178,62,0.8)]" />
                    </div>
                  </div>
                  <div className="w-1.5 h-8 self-start mt-4 bg-gradient-to-b from-[#a9b8c7] to-[#6b829b] rounded-b opacity-95 border-x border-white/15" />
                  <div className="flex flex-col items-center">
                    <div
                      className="w-4 h-6 bg-gradient-to-bl from-[#d8e2ea] to-[#8aa0b8] rounded-t-lg border border-white/30 shadow-md origin-bottom transition-transform duration-200"
                      style={{ transform: `rotate(${clawOpen ? 18 : -10}deg)` }}
                    />
                    <div
                      className="w-3.5 h-7 bg-gradient-to-b from-[#8aa0b8] to-[#5d758f] rounded-b-xl origin-top transition-transform duration-200 border border-white/10"
                      style={{ transform: `rotate(${clawOpen ? -34 : 6}deg)` }}
                    >
                      <div className="w-2 h-1.5 mx-auto mt-5 rounded-full bg-[#009CFF] shadow-[0_0_6px_rgba(0,156,255,0.8)]" />
                    </div>
                  </div>
                </div>
                {hookedItem && (
                  <div className="absolute top-9 z-40 transition-transform">
                    {renderCapsuleGraphic(hookedItem.colorIndex, hookedItem.colorIndex, hookedItem.name, true, theme, hideNames)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Floor plate — chalk tray wood + green felt, collides */}
          <div
            className="absolute bottom-0 inset-x-0 h-[16px] bg-gradient-to-b from-[#5c3d2e] via-[#3d2b1f] to-[#2c1e14] border-t-[3px] border-[#8CB23E]/40 shadow-[0_-6px_20px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.18)] z-10 pointer-events-none"
            style={{
              transformOrigin: 'bottom',
              transform: floorHit ? 'scaleY(0.68) translateY(1px)' : 'scaleY(1)',
              transition: floorHit ? 'transform 90ms ease-out' : 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
              filter: floorHit ? 'brightness(1.25)' : undefined,
            }}
          >
            <div className="absolute inset-x-0 top-[2px] h-[1px] bg-white/22" />
            <div className="absolute inset-x-0 bottom-[2px] h-[1px] bg-black/45" />
            <div className="absolute inset-x-0 top-0 h-[3px] bg-[#8CB23E]/20" />
          </div>
          <div className="absolute bottom-[16px] inset-x-0 h-10 bg-gradient-to-t from-[#8CB23E]/10 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 top-0 w-[3px] bg-gradient-to-r from-slate-800 to-slate-600/60 opacity-20 pointer-events-none z-10" />
          <div className="absolute bottom-0 right-0 top-0 w-[3px] bg-gradient-to-l from-slate-800 to-slate-600/60 opacity-20 pointer-events-none z-10" />

          {/* Physics balls - now full-chamber rain from top */}
          <div className="absolute inset-0 z-0">
            {totalRemaining === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-20">
                <span className="text-4xl mb-2">🎉</span>
                <p className="chalk-text text-sm font-black tracking-wide">All Names Have Been Picked!</p>
                <p className="text-xs text-white/60 mt-1">Open Settings → Entries to load a fresh drum.</p>
              </div>
            ) : (
              pitBalls.map((b, idx) => {
                return (
                  <div
                    key={idx}
                    ref={(el) => { ballRefs.current[idx] = el; }}
                    className="absolute left-0 top-0 select-none"
                    style={{
                      transform: `translate3d(${(b.x / 100) * 320}px, -200px, 0) translate(-50%, -50%) rotate(${b.rot}deg) scale(${b.scale})`,
                      opacity: 0,
                    }}
                  >
                    <div className="pointer-events-auto">
                      {renderCapsuleGraphic(b.colorIndex, b.iconIndex, '?', false, theme, hideNames)}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Falling winning capsule - visual drop into far far left outlet */}
          {falling && (
            <div
              className="absolute z-[45] pointer-events-none drop-shadow-xl"
              style={{
                left: falling.active ? `${falling.targetX}%` : `${falling.startX}%`,
                top: falling.active ? `${falling.targetY}px` : `${falling.startY}px`,
                transform: 'translate(-50%, -50%)',
                transition: falling.active
                  ? 'left 750ms cubic-bezier(0.55,0.055,0.675,0.19), top 750ms cubic-bezier(0.55,0.055,0.675,0.19)'
                  : 'none',
                filter: falling.active ? 'drop-shadow(0 12px 18px rgba(0,0,0,0.55))' : undefined,
              }}
            >
              <div
                style={{
                  transform: falling.active ? 'rotate(720deg) scale(0.94)' : 'rotate(0deg) scale(1.08)',
                  transition: 'transform 750ms cubic-bezier(0.25,0.46,0.45,0.94)',
                }}
              >
                {renderCapsuleGraphic(falling.item.colorIndex, falling.item.colorIndex, falling.item.name, false, theme, false)}
              </div>
              {/* trail glow */}
              {falling.active && <div className="absolute inset-0 -z-10 bg-amber-400/20 blur-xl rounded-full scale-150" />}
            </div>
          )}
        </div>

        <div className="h-9 mt-2 bg-white rounded-xl border-[3px] border-[#01173B] flex items-center justify-between px-3 shadow-[0_2px_10px_rgba(0,0,0,0.18)]">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-1 h-3.5 bg-[#01173B]/15 rounded-full" />
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-black tracking-[0.12em] text-[#0A568C] uppercase">
              1 CREDIT = 1 DRAW
            </span>
            <div className="w-3.5 h-5 bg-[#01173B] border-2 border-[#8CB23E] rounded-[3px] flex items-center justify-center shadow">
              <div className="w-0.5 h-2.5 bg-[#8CB23E] animate-pulse rounded-full" />
            </div>
            <span className="hidden sm:inline text-[10px] font-bold tracking-widest text-[#01173B]/55 uppercase">Orbit Ready</span>
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-1 h-3.5 bg-[#01173B]/15 rounded-full" />
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export const ClawMachine = React.memo(ClawMachineInner);
