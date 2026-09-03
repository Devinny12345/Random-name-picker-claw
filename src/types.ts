export interface NameItem {
  id: string;
  name: string;
  colorIndex: number;
  icon?: string;
  isPicked?: boolean;
}

export type CapsuleTheme = 
  | 'school_supplies' 
  | 'school_stars' 
  | 'gachapon' 
  | 'plushies' 
  | 'candy_orbs' 
  | 'golden_eggs'
  | 'cyber_gems';

export type CraneState = 'idle' | 'moving_manual' | 'auto_targeting' | 'hunting' | 'lowering' | 'grabbing' | 'lifting' | 'returning' | 'dropping' | 'revealing';

export type PrizeId = '1st' | '2nd' | '3rd';

export interface WinnerHistoryItem {
  id: string;
  name: string;
  timestamp: Date;
  colorIndex: number;
  theme: CapsuleTheme;
  prizeId?: PrizeId | null;
  prizeLabel?: string | null;
}

export interface GameSettings {
  soundEnabled: boolean;
  volume: number;
  removeOnPick: boolean;
  speed: 'normal' | 'fast' | 'turbo';
  theme: CapsuleTheme;
  manualControl: boolean;
  hideNames: boolean; // Hide names on capsules (mystery mode)
  classroomTitle?: string; // e.g. "Room 101", "Class 4B", "Science Period 3"
  binCount: number; // Number of capsule balls that fall into and fill the bin
  prizes?: {
    '1st': { title: string; value: string; longDescription: string };
    '2nd': { title: string; value: string; longDescription: string };
    '3rd': { title: string; value: string; longDescription: string };
  };
}
