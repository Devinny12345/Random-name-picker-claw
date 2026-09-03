import type { PrizeId } from '../types';

export interface Prize {
  id: PrizeId;
  placeLabel: string; // 1ST PLACE
  shortLabel: string; // 1st
  value: string; // $2,100+ Value
  title: string;
  description: string;
  longDescription: string;
  badgeColor: string; // tailwind / hex for badge
  ringColor: string;
  accent: string;
  order: number; // 1 for 1st, 3 for 3rd - for sorting 3->1
}

export const PRIZES: Prize[] = [
  {
    id: '1st',
    placeLabel: '1ST PLACE',
    shortLabel: '1st',
    value: '$2,100+ Value',
    title: 'HP Laptop Bundle',
    description: 'HP Laptop (Intel Core i3, 8GB RAM, 256GB storage) + mouse & mouse pad',
    longDescription: 'HP Laptop (Intel Core i3, 8 GB RAM, 256 GB storage), mouse & mouse pad, and 1 year of free Nexgen Internet in select locations.',
    badgeColor: 'from-amber-400 to-yellow-500',
    ringColor: 'border-amber-400',
    accent: '#f59e0b',
    order: 1,
  },
  {
    id: '2nd',
    placeLabel: '2ND PLACE',
    shortLabel: '2nd',
    value: '$800+ Value',
    title: 'Blackview Tablet',
    description: 'Blackview Tablet + 3 months free Nexgen TV',
    longDescription: 'Blackview Tablet and 3 months of free Nexgen TV.',
    badgeColor: 'from-slate-300 to-slate-400',
    ringColor: 'border-slate-300',
    accent: '#94a3b8',
    order: 2,
  },
  {
    id: '3rd',
    placeLabel: '3RD PLACE',
    shortLabel: '3rd',
    value: '$100+ Value',
    title: 'SoundCore + Backpack',
    description: 'SoundCore A25i Earphones + backpack filled with school supplies',
    longDescription: 'SoundCore A25i Earphones and a backpack filled with school supplies.',
    badgeColor: 'from-amber-600 to-orange-700',
    ringColor: 'border-orange-400',
    accent: '#d97706',
    order: 3,
  },
];

export const PRIZE_MAP: Record<PrizeId, Prize> = {
  '1st': PRIZES[0],
  '2nd': PRIZES[1],
  '3rd': PRIZES[2],
};

export function getPrize(id: PrizeId | string | null | undefined, overrides?: any): Prize | null {
  if (!id) return null;
  const basePrize = (PRIZE_MAP as Record<string, Prize>)[id] ?? null;
  if (!basePrize) return null;

  if (overrides && overrides[id]) {
    return {
      ...basePrize,
      ...overrides[id],
    };
  }
  return basePrize;
}
