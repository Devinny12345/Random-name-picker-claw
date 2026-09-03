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
    value: 'Brand New Laptop',
    title: 'Brand New Laptop + 6 Months Free Internet',
    description: 'Brand new laptop + 6 months of free internet',
    longDescription: 'Brand new laptop with 6 months of free internet service included.',
    badgeColor: 'from-amber-400 to-yellow-500',
    ringColor: 'border-amber-400',
    accent: '#f59e0b',
    order: 1,
  },
  {
    id: '2nd',
    placeLabel: '2ND PLACE',
    shortLabel: '2nd',
    value: 'New Printer',
    title: 'Brand New Printer',
    description: 'Brand new printer',
    longDescription: 'Brand new printer for all your printing needs.',
    badgeColor: 'from-slate-300 to-slate-400',
    ringColor: 'border-slate-300',
    accent: '#94a3b8',
    order: 2,
  },
  {
    id: '3rd',
    placeLabel: '3RD PLACE',
    shortLabel: '3rd',
    value: 'School Supplies Gift Basket',
    title: 'School Supplies Gift Basket',
    description: 'School supplies gift basket filled with essentials',
    longDescription: 'School supplies gift basket filled with everything you need for the school year.',
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

export function getPrize(id: PrizeId | string | null | undefined): Prize | null {
  if (!id) return null;
  return (PRIZE_MAP as Record<string, Prize>)[id] ?? null;
}
