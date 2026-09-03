import { PRIZES, PRIZE_MAP, type PrizeEdits } from '../data/prizes';
import type { PrizeId } from '../types';

const STORAGE_KEY = 'claw_prizes_v1';

// Mutable runtime store so every component reading PRIZES stays in sync with edits.
const edits: Partial<Record<PrizeId, PrizeEdits>> = {};

type Listener = () => void;
const listeners: Listener[] = [];

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, PrizeEdits>;
      Object.keys(parsed).forEach((k) => {
        if (k === '1st' || k === '2nd' || k === '3rd') {
          const e = parsed[k];
          edits[k] = {
            title: typeof e.title === 'string' ? e.title : undefined,
            value: typeof e.value === 'string' ? e.value : undefined,
            description: typeof e.description === 'string' ? e.description : undefined,
            longDescription: typeof e.longDescription === 'string' ? e.longDescription : undefined,
            imageUrl: typeof e.imageUrl === 'string' ? e.imageUrl : '',
          };
        }
      });
      apply();
    }
  } catch {
    // ignore
  }
}

function apply() {
  (Object.keys(PRIZE_MAP) as PrizeId[]).forEach((id) => {
    const e = edits[id];
    if (!e) return;
    const p = PRIZE_MAP[id];
    if (e.title !== undefined) p.title = e.title;
    if (e.value !== undefined) p.value = e.value;
    if (e.description !== undefined) p.description = e.description;
    if (e.longDescription !== undefined) p.longDescription = e.longDescription;
    if (e.imageUrl !== undefined) p.imageUrl = e.imageUrl;
  });
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

export function getPrizeEdits(): Record<PrizeId, PrizeEdits> {
  return {
    '1st': { ...edits['1st'] },
    '2nd': { ...edits['2nd'] },
    '3rd': { ...edits['3rd'] },
  };
}

export function updatePrize(id: PrizeId, patch: PrizeEdits) {
  edits[id] = { ...(edits[id] || {}), ...patch };
  apply();
  save();
}

export function resetPrize(id: PrizeId) {
  delete edits[id];
  const defaults = PRIZES.find((p) => p.id === id);
  if (defaults) {
    Object.assign(PRIZE_MAP[id], {
      title: defaults.title,
      value: defaults.value,
      description: defaults.description,
      longDescription: defaults.longDescription,
      imageUrl: undefined,
    });
  } else {
    delete edits[id];
  }
  save();
}

export function subscribePrizes(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const i = listeners.indexOf(listener);
    if (i !== -1) listeners.splice(i, 1);
  };
}

// Initialize on import (client-side only).
if (typeof window !== 'undefined') {
  load();
}