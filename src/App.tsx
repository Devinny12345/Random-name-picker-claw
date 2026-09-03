import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { NameItem, CapsuleTheme, CraneState, WinnerHistoryItem, GameSettings, PrizeId } from './types';
import { PRESET_GROUPS } from './data/presets';
import { RAFFLE_NAMES } from './data/raffleNames';
import { PRIZES, getPrize } from './data/prizes';
import { ClawMachine } from './components/ClawMachine';
import { ArcadeControls } from './components/ArcadeControls';
import { WinnerModal } from './components/WinnerModal';
import { NameEditorModal } from './components/NameEditorModal';
import { NamesPoolPanel } from './components/NamesPoolPanel';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SettingsDrawer } from './components/SettingsDrawer';
import { PrizeSelector } from './components/PrizeSelector';
import { PrizeReviewModal } from './components/PrizeReviewModal';
import { sound } from './utils/audio';
import { fetchLists, fetchListByCode, initDefaultList, saveNames, saveHistory, createList, renameList, deleteList, verifyPasscode, savePrizes } from './lib/poolApi';
import type { ListSummary, LoadedList } from './lib/convexClient';

// Debounce helper for expensive side-effects
function useDebouncedEffect(effect: () => void, deps: unknown[], ms: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(effect, ms);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, deps);
}

const STORAGE_KEY_ITEMS = 'claw_game_items_v1';
const STORAGE_KEY_HISTORY = 'claw_game_history_v1';
const STORAGE_KEY_SETTINGS = 'claw_game_settings_v1';

export default function App() {
  // Initialize items from localStorage or raffle CSV (6656 names) for Windows local use
  const [items, setItems] = useState<NameItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If saved list is the old 24-item demo and raffle data exists, upgrade to raffle list once
        if (parsed.length < 100 && RAFFLE_NAMES.length > 1000) {
          // Keep user-edited small lists, but if it's exactly the demo preset, use raffle
          const demoNames = PRESET_GROUPS[0].names;
          const isDemo = parsed.length === demoNames.length && parsed.every((it: NameItem, i: number) => it.name === demoNames[i]);
          if (isDemo) {
            return RAFFLE_NAMES.map((name, idx) => ({
              id: `raffle-${idx}`,
              name,
              colorIndex: idx % 8,
            }));
          }
        }
        return parsed;
      }
    } catch {}
    // No saved data — use full raffle list for local Windows use, fallback to demo preset
    const source = RAFFLE_NAMES.length > 1000 ? RAFFLE_NAMES : PRESET_GROUPS[0].names;
    return source.map((name, idx) => ({
      id: `${RAFFLE_NAMES.length > 1000 ? 'raffle' : 'default'}-${idx}`,
      name,
      colorIndex: idx % 8,
    }));
  });

  // O(1) pool ref — mirrors `items` state for pick/swap-and-pop without triggering React re-renders
  const poolRef = useRef<NameItem[]>(items);
  useEffect(() => { poolRef.current = items; }, [items]);

  // History of winners
  const [history, setHistory] = useState<WinnerHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Settings
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          soundEnabled: true,
          volume: 0.6,
          removeOnPick: false,
          speed: 'normal',
          theme: 'school_supplies',
          manualControl: false,
          hideNames: true,
          binCount: 40,
          ...parsed,
          // enforce brand title if old classroom title is still the default
          classroomTitle: parsed.classroomTitle === 'Classroom Student Picker' ? 'NEXGEN BACK TO SCHOOL RAFFLE' : (parsed.classroomTitle || 'NEXGEN BACK TO SCHOOL RAFFLE'),
        };
      }
    } catch {
      // fallback
    }
    return {
      soundEnabled: true,
      volume: 0.6,
      removeOnPick: false,
      speed: 'normal',
      theme: 'school_supplies',
      manualControl: false,
      hideNames: true,
      classroomTitle: 'NEXGEN BACK TO SCHOOL RAFFLE',
      binCount: 40,
    };
  });

  // Crane & Claw State
  const [craneState, setCraneState] = useState<CraneState>('idle');
  const [carriagePercent, setCarriagePercent] = useState<number>(50); // 15% to 85%
  const [cableHeight, setCableHeight] = useState<number>(10); // 10% to 75%
  const [clawOpen, setClawOpen] = useState<boolean>(true);
  const [hookedItem, setHookedItem] = useState<NameItem | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [winnerModalItem, setWinnerModalItem] = useState<NameItem | null>(null);

  // Modals & Drawers
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPoolOpen, setIsPoolOpen] = useState<boolean>(false);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isPrizeReviewOpen, setIsPrizeReviewOpen] = useState<boolean>(false);
  const [winnerPrize, setWinnerPrize] = useState<PrizeId | null>(null);
  // Prize draw selection — freedom to start with 3rd, 2nd or 1st
  const [selectedPrize, setSelectedPrize] = useState<PrizeId | null>(() => {
    const saved = localStorage.getItem('claw_selected_prize_v1');
    if (saved && ['1st','2nd','3rd'].includes(saved)) return saved as PrizeId;
    return '3rd';
  });
  useEffect(() => {
    if (selectedPrize) localStorage.setItem('claw_selected_prize_v1', selectedPrize);
  }, [selectedPrize]);
  // Auto-advance to next undrawn prize after a draw (keeps freedom to manually override)
  useEffect(() => {
    if (!history.length) return;
    if (selectedPrize && history.some((h) => h.prizeId === selectedPrize)) {
      const next = (['3rd','2nd','1st'] as PrizeId[]).find((pid) => !history.some((h) => h.prizeId === pid));
      if (next) setSelectedPrize(next);
    }
  }, [history, selectedPrize]);

  const animationTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Clear pending animations
  const clearAllTimeouts = () => {
    animationTimeoutsRef.current.forEach((t) => clearTimeout(t));
    animationTimeoutsRef.current = [];
  };

  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  // Debounced localStorage saves — avoids serializing 3000 items on every keystroke
  useDebouncedEffect(() => {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items], 500);

  useDebouncedEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  }, [history], 500);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    sound.setMuted(!settings.soundEnabled);
    sound.setVolume(settings.volume);
  }, [settings]);

  // === Convex Cloud Pool (saved lists) ===
  const [passcode, setPasscode] = useState<string>(() => localStorage.getItem('claw_passcode_v1') || '');
  const [lists, setLists] = useState<ListSummary[]>([]);
  const [currentList, setCurrentList] = useState<LoadedList | null>(null);
  const [isCloudReady, setIsCloudReady] = useState<boolean>(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const passcodeRef = useRef(passcode);
  useEffect(() => { passcodeRef.current = passcode; }, [passcode]);

  // Initialize: ensure default list exists, restore last-used list into state
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await initDefaultList();
        if (cancelled) return;
        const listArr = await fetchLists();
        if (cancelled) return;
        setLists(listArr);
        const savedCode = localStorage.getItem('claw_current_list_code') || 'RAFFLE';
        const target = listArr.find((l) => l.listCode === savedCode)
          || listArr.find((l) => l.listCode === 'RAFFLE')
          || listArr[0];
        if (target) {
          const data = await fetchListByCode(target.listCode);
          if (!cancelled && data) {
            setCurrentList(data);
            setItems(data.names.map((n) => ({ id: n.id, name: n.name, colorIndex: n.colorIndex })));
            setHistory(data.history.map((h) => ({
              id: h.id, name: h.name, colorIndex: h.colorIndex, theme: h.theme as CapsuleTheme, timestamp: new Date(h.createdAt), prizeId: (h as any).prizeId as PrizeId | null ?? null, prizeLabel: (h as any).prizeLabel ?? null,
            })));
            if (data.prizes) {
              setSettings((s) => ({ ...s, prizes: data.prizes }));
            }
            localStorage.setItem('claw_current_list_code', target.listCode);
          }
        }

        if (!cancelled) setIsCloudReady(true);
      } catch {
        if (!cancelled) { setCloudError('Cloud unavailable'); setIsCloudReady(true); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Debounced cloud saves (only when unlocked with a valid passcode)
  useDebouncedEffect(() => {
    if (passcodeRef.current && currentList) {
      saveNames(currentList._id, items, passcodeRef.current).catch(() => {});
    }
  }, [items, currentList], 800);

  useDebouncedEffect(() => {
    if (passcodeRef.current && currentList) {
      saveHistory(currentList._id, history, passcodeRef.current).catch(() => {});
    }
  }, [history, currentList], 800);

  const handleSetPasscode = useCallback(async (code: string): Promise<boolean> => {
    const ok = await verifyPasscode(code);
    if (ok) {
      setPasscode(code);
      localStorage.setItem('claw_passcode_v1', code);
    }
    return ok;
  }, []);

  const handleSelectList = useCallback(async (listCode: string) => {
    const data = await fetchListByCode(listCode);
    if (!data) return;
    setCurrentList(data);
    setItems(data.names.map((n) => ({ id: n.id, name: n.name, colorIndex: n.colorIndex })));
    setHistory(data.history.map((h) => ({
      id: h.id, name: h.name, colorIndex: h.colorIndex, theme: h.theme as CapsuleTheme, timestamp: new Date(h.createdAt), prizeId: (h as any).prizeId as PrizeId | null ?? null, prizeLabel: (h as any).prizeLabel ?? null,
    })));
    localStorage.setItem('claw_current_list_code', listCode);
  }, []);

  const handleCreateList = useCallback(async (name: string): Promise<string> => {
    const id = await createList(name, passcodeRef.current);
    const listArr = await fetchLists();
    setLists(listArr);
    const created = listArr.find((l) => l._id === id);
    if (created) await handleSelectList(created.listCode);
    return id;
  }, [handleSelectList]);

  const handleDeleteList = useCallback(async (listId: string) => {
    await deleteList(listId, passcodeRef.current);
    const listArr = await fetchLists();
    setLists(listArr);
    const target = listArr.find((l) => l.listCode === 'RAFFLE') || listArr[0];
    if (target) await handleSelectList(target.listCode);
  }, [handleSelectList]);

  const handleRenameList = useCallback(async (listId: string, name: string) => {
    await renameList(listId, name, passcodeRef.current);
    const listArr = await fetchLists();
    setLists(listArr);
    const code = currentList?._id === listId ? currentList.listCode : null;
    if (code) { const data = await fetchListByCode(code); if (data) setCurrentList(data); }
  }, [currentList]);

  // Speed factor helper
  const getSpeedDelay = (baseMs: number) => {
    if (settings.speed === 'turbo') return Math.max(120, baseMs * 0.3);
    if (settings.speed === 'fast') return Math.max(200, baseMs * 0.55);
    return baseMs;
  };

  // Move manual Left
  const handleMoveLeft = useCallback(() => {
    if (craneState !== 'idle' && craneState !== 'moving_manual') return;
    setCraneState('moving_manual');
    setCarriagePercent((prev) => Math.max(18, prev - 4));
    setTimeout(() => {
      setCraneState('idle');
    }, 100);
  }, [craneState]);

  // Move manual Right
  const handleMoveRight = useCallback(() => {
    if (craneState !== 'idle' && craneState !== 'moving_manual') return;
    setCraneState('moving_manual');
    setCarriagePercent((prev) => Math.min(84, prev + 4));
    setTimeout(() => {
      setCraneState('idle');
    }, 100);
  }, [craneState]);

  // Prize selection helper
  const handleSelectPrize = useCallback((id: PrizeId) => {
    sound.playButtonClick();
    setSelectedPrize(id);
  }, []);

  // Trigger claw sequence — 12-20s dramatic arcade run
  const startClawSequence = useCallback(
    (manualTargetX?: number) => {
      const pool = poolRef.current;
      if (pool.length === 0) return;
      if (craneState !== 'idle' && craneState !== 'moving_manual') return;
      // Determine prize for this draw — freedom to pick 1st/2nd/3rd first, but auto-pick 3rd->2nd->1st if none selected
      let effectivePrize: PrizeId | null = selectedPrize;
      if (!effectivePrize) {
        const undrawn = (['3rd','2nd','1st'] as PrizeId[]).find((pid) => !history.some((h) => h.prizeId === pid));
        if (undrawn) {
          effectivePrize = undrawn;
          setSelectedPrize(undrawn);
        }
      }
      const prizeForThisDraw: PrizeId | null = effectivePrize;
      const prizeMetaForDraw = prizeForThisDraw ? getPrize(prizeForThisDraw, settings.prizes) : null;


      clearAllTimeouts();

      const randomIndex = Math.floor(Math.random() * pool.length);
      const chosenItem = pool[randomIndex];

      // Final secret drop spot - where it will actually grab
      const secretDropX = manualTargetX !== undefined
        ? Math.min(84, Math.max(18, manualTargetX))
        : 22 + Math.random() * 58;

      const schedule = (fn: () => void, ms: number) => {
        const t = setTimeout(fn, ms);
        animationTimeoutsRef.current.push(t);
      };

      // Phase 0: Rain pause — let capsules fall from the top before the hunt begins
      setCraneState('auto_targeting');
      setClawOpen(true);
      setHookedItem(null);
      // nudge centered first so hunt is symmetrical
      setCarriagePercent(50);

      let stepTime = getSpeedDelay(850); // rain settles

      // Phase 1: Dramatic hunt — 2 back-and-forth sweeps, then random final alignment
      const j = () => (Math.random() - 0.5) * 6;
      const huntStops: number[] = [
        18 + Math.random() * 4,           // sweep 1: far left
        84 - Math.random() * 4,           // sweep 1: far right
        22 + Math.random() * 6,           // sweep 2: left
        78 - Math.random() * 6,           // sweep 2: right
        secretDropX + j(),                // final hunt — aligns above the winner pile
      ];

      // enter hunting mode (slower, more dramatic easing)
      schedule(() => setCraneState('hunting'), getSpeedDelay(120));
      huntStops.forEach((x, idx) => {
        const isFinal = idx === huntStops.length - 1;
        const sweepMs = isFinal ? 950 : 1150 + Math.floor(Math.random() * 220);
        const hesitateMs = isFinal ? 420 : 180 + Math.floor(Math.random() * 140);
        schedule(() => {
          setCarriagePercent(Math.min(84, Math.max(16, x)));
          // tiny cable sway during hunt for extra animation
          if (!isFinal && idx % 2 === 0) setCableHeight(12 + Math.random() * 4);
          // soft motor tick
          if (idx < 3) sound.playClawDrop();
        }, stepTime);
        stepTime += getSpeedDelay(sweepMs);
        // hesitation — carriage pauses, lights flicker
        if (!isFinal) {
          schedule(() => setCraneState('hunting'), stepTime - getSpeedDelay(60));
          stepTime += getSpeedDelay(hesitateMs);
        }
      });

      // Phase 2: Tension pause before the drop (hand hovers)
      stepTime += getSpeedDelay(520);
      schedule(() => {
        setCraneState('hunting');
        setCableHeight(14);
      }, stepTime);
      stepTime += getSpeedDelay(380);

      // Phase 3: Drop all the way to the items — deep, smooth, realistic
      schedule(() => {
        setCraneState('lowering');
        setCableHeight(118);
        setClawOpen(true);
        sound.playClawDrop();
      }, stepTime);
      stepTime += getSpeedDelay(820);

      // Phase 4: Clamp — dramatic close with slight settle
      schedule(() => {
        setCraneState('grabbing');
        setClawOpen(false);
        setHookedItem(chosenItem);
        sound.playClawGrab();
      }, stepTime);
      stepTime += getSpeedDelay(520);

      // extra squeeze pause
      schedule(() => setCraneState('grabbing'), stepTime);
      stepTime += getSpeedDelay(280);

      // Phase 5: Lift — slow, heavy with prize
      schedule(() => {
        setCraneState('lifting');
        setCableHeight(10);
        sound.playClawLift();
      }, stepTime);
      stepTime += getSpeedDelay(1050);

      // hang moment at top
      stepTime += getSpeedDelay(420);

      // Phase 6: Traverse to WINNER CHUTE — aligned exactly with chute center (9.2%)
      schedule(() => {
        setCraneState('returning');
        setCarriagePercent(9.2); // winner chute center — must match ClawMachine OUTLET_CENTER_PCT
      }, stepTime);
      stepTime += getSpeedDelay(1650);

      // arrive + sway over chute mouth
      schedule(() => setCarriagePercent(9.0), stepTime);
      stepTime += getSpeedDelay(180);
      schedule(() => setCarriagePercent(9.2), stepTime);
      stepTime += getSpeedDelay(160);

      // Phase 7: Drop into chute — chute swallows capsule
      schedule(() => {
        setCraneState('dropping');
        setClawOpen(true);
        setHookedItem(null);
        sound.playDropChute();
      }, stepTime);
      stepTime += getSpeedDelay(520);

      // capsule tumbles in chute
      stepTime += getSpeedDelay(380);

      // Phase 8: Reveal — winner pops (with prize)
      schedule(() => {
        setCraneState('revealing');
        setWinnerModalItem(chosenItem);
        setWinnerPrize(prizeForThisDraw);
        const newHistoryItem: WinnerHistoryItem = {
          id: `${Date.now()}`,
          name: chosenItem.name,
          timestamp: new Date(),
          colorIndex: chosenItem.colorIndex,
          theme: settings.theme,
          prizeId: prizeForThisDraw ?? null,
          prizeLabel: prizeMetaForDraw ? `${prizeMetaForDraw.placeLabel} • ${prizeMetaForDraw.value}` : null,
        };
        setHistory((prev) => [newHistoryItem, ...prev]);

        if (settings.removeOnPick) {
          pool[randomIndex] = pool[pool.length - 1];
          pool.pop();
          setItems([...pool]);
        }
        setCraneState('idle');
      }, stepTime);
    },
    [craneState, settings.speed, settings.theme, settings.removeOnPick, selectedPrize, history]
  );

  // Trigger from Big Grab Button
  const handleTriggerGrab = () => {
    if (settings.manualControl) {
      startClawSequence(carriagePercent);
    } else {
      startClawSequence();
    }
  };

  // Remove winner manually from modal using O(1) swap-and-pop
  const handleRemoveWinner = (item: NameItem) => {
    const pool = poolRef.current;
    const idx = pool.findIndex((i) => i.id === item.id);
    if (idx !== -1) {
      pool[idx] = pool[pool.length - 1];
      pool.pop();
      setItems([...pool]);
    }
  };

  // Restore winner from history
  const handleRestoreWinner = (historyItem: WinnerHistoryItem) => {
    // Check if already in items
    if (!items.some((i) => i.name === historyItem.name)) {
      const restored: NameItem = {
        id: `${Date.now()}-${Math.random()}`,
        name: historyItem.name,
        colorIndex: historyItem.colorIndex,
      };
      setItems((prev) => [...prev, restored]);
    }
  };

  // Effective display title — fall back to required brand title
  const displayTitle = (settings.classroomTitle && settings.classroomTitle.trim()) || 'NEXGEN BACK TO SCHOOL RAFFLE';

  return (
    <div className="relative w-screen h-screen chalkboard-bg--navy text-white flex flex-col overflow-hidden">
      {/* Chalk dust vignette */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.45]" style={{ background: 'radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.55) 100%)' }} />
      <div className="absolute inset-0 pointer-events-none opacity-15" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E")` }} />

      {/* Top Brand Header — clean chalkboard with wood ledge */}
      <header className="relative z-10 w-full max-w-[1500px] mx-auto px-3 sm:px-4 pt-3 sm:pt-4">
        <div className="relative wood-frame rounded-[18px] p-[3px]">
          <div className="chalkboard-bg--navy rounded-[15px] border border-white/10 px-3 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between gap-3 overflow-hidden">
            {/* subtle chalk streak */}
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 48%, transparent 100%)', height: 1, top: 18 }} />

            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <img
                src="/brand/nexgen-white.png"
                alt="NexGen"
                className="h-9 sm:h-11 w-auto object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                draggable={false}
              />
              <div className="hidden sm:block w-px h-9 bg-white/15 shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="nexgen-headline text-[13px] sm:text-[18px] lg:text-[22px] truncate text-white">
                  {displayTitle}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="hidden sm:inline-flex items-center gap-1.5 nexgen-label text-[11px] text-white/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8CB23E] shadow-[0_0_8px_rgba(140,178,62,0.8)]" />
                    Back to School Raffle
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#009CFF] text-white nexgen-label text-[10px] shadow">LIVE DRAW</span>
                  <span className="hidden md:inline text-[11px] text-white/45 font-medium">• {items.length} entries in drum</span>
                </div>
                {/* brand swoosh */}
                <div className="brand-swoosh w-28 sm:w-44 mt-2 opacity-90" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="hidden lg:flex items-center gap-1.5 bg-white text-[#01173B] rounded-full px-3 py-1.5 border-2 border-[#01173B] shadow">
                <span className="w-2 h-2 rounded-full bg-[#8CB23E] animate-pulse" />
                <span className="text-[11px] font-black tracking-widest uppercase">{items.length} IN DRUM</span>
              </div>
              {/* EDIT POOL — always visible */}
              <button
                id="btn-open-pool-header"
                onClick={() => { sound.playButtonClick(); setIsPoolOpen(true); }}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-white text-[#01173B] font-black text-xs sm:text-sm border-[3px] border-[#01173B] shadow hover:bg-[#f7f8f9] hover:border-[#0A568C] leading-none"
                title="Edit names pool"
              >
                <span className="w-7 h-7 rounded-lg bg-[#0A568C] text-white flex items-center justify-center text-[12px] leading-none shrink-0">◧</span>
                <span className="hidden sm:inline">EDIT POOL</span>
                <span className="sm:hidden">POOL</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#0A568C] text-white text-[11px] leading-none">{items.length}</span>
              </button>
              <button
                onClick={() => { sound.playButtonClick(); setIsSettingsOpen(true); }}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#8CB23E] hover:bg-[#9bc552] text-[#01173B] font-black text-xs sm:text-sm border-2 border-[#01173B] shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
              >
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">⚙︎</span>
                <span className="hidden sm:inline">⚙︎</span>
              </button>
            </div>
          </div>
        </div>
        {/* wood ledge shadow */}
        <div className="h-2 mx-2 rounded-b-xl bg-gradient-to-b from-[#2c1e14]/60 to-transparent blur-[1px] -mt-1" />
      </header>

      {/* Prize Selector — pick 1st/2nd/3rd first, freedom in any order, SVG display */}
      <div className="relative z-10 w-full py-2 sm:py-3">
        <PrizeSelector
          selectedPrize={selectedPrize}
          onSelectPrize={handleSelectPrize}
          history={history}
          onReview={() => setIsPrizeReviewOpen(true)}
          disabled={craneState !== 'idle' && craneState !== 'moving_manual'}
        />
      </div>

      {/* Main Arcade Claw Machine Viewport — 16:9 */}
      <main className="w-full flex-1 flex items-center justify-center px-2 sm:px-4 py-2 sm:py-3 relative z-10 min-h-0">
        <ClawMachine
          totalRemaining={items.length}
          binCount={settings.binCount}
          craneState={craneState}
          carriagePercent={carriagePercent}
          cableHeight={cableHeight}
          clawOpen={clawOpen}
          hookedItem={hookedItem}
          theme={settings.theme}
          speedMode={settings.speed}
          hideNames={settings.hideNames}
          classroomTitle={displayTitle}
          onClawClick={() => {
            if (craneState === 'idle') handleTriggerGrab();
          }}
        />
      </main>

      {/* Bottom — minimal chalk control bar */}
      <footer className="w-full flex justify-center z-10 px-3 pb-3 sm:pb-4 pt-1 shrink-0">
        <ArcadeControls
          craneState={craneState}
          manualMode={settings.manualControl}
          onToggleManualMode={(manual) => setSettings((s) => ({ ...s, manualControl: manual }))}
          onMoveLeft={handleMoveLeft}
          onMoveRight={handleMoveRight}
          onTriggerGrab={handleTriggerGrab}
          itemsCount={items.length}
        />
      </footer>

      {/* Settings Drawer — houses all former SettingsBar controls */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(patch) => {
          setSettings((s) => ({ ...s, ...patch }));
          if (patch.prizes && currentList && passcode) {
            savePrizes(currentList._id, patch.prizes, passcode).catch(console.error);
          }
        }}
        onOpenPool={() => { setIsSettingsOpen(false); setTimeout(() => setIsPoolOpen(true), 180); }}
        onOpenHistory={() => { setIsSettingsOpen(false); setTimeout(() => setIsHistoryOpen(true), 180); }}
        historyCount={history.length}
        totalItems={items.length}
        isCloudReady={isCloudReady}
        cloudError={cloudError}
        isUnlocked={!!passcode}
        currentListName={currentList?.name ?? null}
      />

      {/* Winner Pop-up Celebration Modal — with prize SVG display */}
       <WinnerModal
         winner={winnerModalItem}
         prize={winnerPrize ? getPrize(winnerPrize, settings.prizes) : null}
         theme={settings.theme}
         totalRemaining={items.length}
         onClose={() => { setWinnerModalItem(null); setWinnerPrize(null); }}

        onRemoveWinner={handleRemoveWinner}
        onKeepWinner={() => {}}
        onPickAgain={() => {
          setTimeout(() => {
            handleTriggerGrab();
          }, 300);
        }}
        onReview={() => { setWinnerModalItem(null); setIsPrizeReviewOpen(true); }}
      />

      {/* Names Pool Side Panel */}
      <NamesPoolPanel
        isOpen={isPoolOpen}
        onClose={() => setIsPoolOpen(false)}
        items={items}
        onUpdateItems={setItems}
        hideNames={settings.hideNames}
        onToggleHideNames={(hide) => setSettings((s) => ({ ...s, hideNames: hide }))}
        onOpenBulkEditor={() => {
          setIsPoolOpen(false);
          setIsEditorOpen(true);
        }}
        isCloudReady={isCloudReady}
        cloudError={cloudError}
        lists={lists}
        currentList={currentList}
        isUnlocked={!!passcode}
        onSetPasscode={handleSetPasscode}
        onSelectList={handleSelectList}
        onCreateList={handleCreateList}
        onDeleteList={handleDeleteList}
        onRenameList={handleRenameList}
      />

      {/* Name Editor Modal (Bulk paste / list) */}
      <NameEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        items={items}
        onSaveItems={setItems}
      />

      {/* Draw History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onRestoreWinner={handleRestoreWinner}
        onClearHistory={() => setHistory([])}
      />

      {/* Prize Review Modal — SVG display + review all winners by place */}
      <PrizeReviewModal
        isOpen={isPrizeReviewOpen}
        onClose={() => setIsPrizeReviewOpen(false)}
        history={history}
        onRestoreWinner={handleRestoreWinner}
      />
    </div>
  );
}
