import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  History, 
  CheckSquare, 
  Square, 
  Layers, 
  Eye, 
  EyeOff,
  Minus,
  Plus
} from 'lucide-react';
import { CapsuleTheme, GameSettings } from '../types';
import { sound } from '../utils/audio';

interface SettingsBarProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onOpenPool: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  totalItems: number;
}

export const SettingsBar: React.FC<SettingsBarProps> = ({
  settings,
  onUpdateSettings,
  onOpenPool,
  onOpenHistory,
  historyCount,
  totalItems,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    sound.playButtonClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const themes: { id: CapsuleTheme; label: string; icon: string }[] = [
    { id: 'school_supplies', label: 'School Supplies', icon: '🍎' },
    { id: 'school_stars', label: 'Class Stars', icon: '⭐' },
    { id: 'gachapon', label: 'Gachapon', icon: '🔴' },
    { id: 'plushies', label: 'Mascots', icon: '🧸' },
    { id: 'golden_eggs', label: 'Gold Eggs', icon: '🥚' },
    { id: 'candy_orbs', label: 'Rewards', icon: '🍬' },
  ];

  return (
    <header className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-lg flex flex-wrap items-center justify-between gap-2 sm:gap-3 backdrop-blur-md">
      {/* Left: Names Pool Trigger & History */}
      <div className="flex items-center space-x-2">
        <button
          id="btn-open-names-pool"
          onClick={() => {
            sound.playButtonClick();
            onOpenPool();
          }}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 group"
        >
          <Layers className="w-4 h-4" />
          <span>Names Pool</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-bold">
            {totalItems}
          </span>
        </button>

        <button
          id="btn-open-history"
          onClick={() => {
            sound.playButtonClick();
            onOpenHistory();
          }}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
        >
          <History className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">History</span>
          {historyCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold">
              {historyCount}
            </span>
          )}
        </button>
      </div>

      {/* Middle: Theme Picker & Speed */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Theme Selector */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sound.playButtonClick();
                onUpdateSettings({ theme: t.id });
              }}
              title={t.label}
              className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition-all ${
                settings.theme === t.id
                  ? 'bg-slate-800 text-amber-300 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 opacity-70 hover:opacity-100'
              }`}
            >
              <span>{t.icon}</span>
              <span className="hidden md:inline text-[11px]">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Speed Toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
          {(['normal', 'fast', 'turbo'] as const).map((spd) => (
            <button
              key={spd}
              onClick={() => {
                sound.playButtonClick();
                onUpdateSettings({ speed: spd });
              }}
              className={`px-2 py-1 rounded-lg capitalize font-medium transition-all ${
                settings.speed === spd
                  ? 'bg-slate-800 text-cyan-300 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {spd}
            </button>
          ))}
        </div>

        {/* Bin Size — how many capsules fall into the bin */}
        <div
          className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800"
          title="How many capsules fall into the bin"
        >
          <span className="px-1.5 text-[10px] text-slate-500 font-semibold hidden lg:inline">
            BIN
          </span>
          <button
            onClick={() => {
              sound.playButtonClick();
              onUpdateSettings({ binCount: Math.max(8, settings.binCount - 4) });
            }}
            className="px-1.5 py-1 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title="Fewer capsules"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-9 text-center text-[12px] font-bold text-amber-300 tabular-nums">
            {settings.binCount}
          </span>
          <button
            onClick={() => {
              sound.playButtonClick();
              onUpdateSettings({ binCount: Math.min(120, settings.binCount + 4) });
            }}
            className="px-1.5 py-1 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title="More capsules"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Mystery Mode, Auto-Remove, Sound, Fullscreen */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Hide Names / Mystery Toggle */}
        <button
          id="btn-toggle-hide-names"
          onClick={() => {
            sound.playButtonClick();
            onUpdateSettings({ hideNames: !settings.hideNames });
          }}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            settings.hideNames
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-slate-800/80 border-slate-700 text-slate-300'
          }`}
          title={settings.hideNames ? 'Mystery Mode Active: Capsule names hidden in machine' : 'Capsule names visible in machine'}
        >
          {settings.hideNames ? (
            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span className="hidden lg:inline text-[11px]">
            {settings.hideNames ? 'Mystery (Hidden)' : 'Visible'}
          </span>
        </button>

        {/* Remove on pick toggle */}
        <button
          onClick={() => {
            sound.playButtonClick();
            onUpdateSettings({ removeOnPick: !settings.removeOnPick });
          }}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs transition-all ${
            settings.removeOnPick
              ? 'bg-red-500/20 border-red-500/50 text-red-300'
              : 'bg-slate-800/50 border-slate-700 text-slate-400'
          }`}
          title="Auto-remove winner from pool after drawing"
        >
          {settings.removeOnPick ? (
            <CheckSquare className="w-3.5 h-3.5 text-red-400" />
          ) : (
            <Square className="w-3.5 h-3.5" />
          )}
          <span className="hidden xl:inline text-[11px]">Auto-Remove</span>
        </button>

        {/* Sound Toggle */}
        <button
          id="btn-toggle-sound"
          onClick={() => {
            const nextSound = !settings.soundEnabled;
            sound.setMuted(!nextSound);
            onUpdateSettings({ soundEnabled: nextSound });
            if (nextSound) sound.playButtonClick();
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          title={settings.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
        >
          {settings.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-green-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* Fullscreen Button */}
        <button
          id="btn-fullscreen"
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-cyan-400" />
          ) : (
            <Maximize2 className="w-4 h-4 text-slate-300" />
          )}
        </button>
      </div>
    </header>
  );
};
