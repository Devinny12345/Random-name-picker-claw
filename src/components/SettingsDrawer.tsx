import React from 'react';
import { X, Volume2, VolumeX, Eye, EyeOff, CheckSquare, Square, Layers, History, Minus, Plus, Settings, Zap, User, Tv } from 'lucide-react';
import { CapsuleTheme, GameSettings } from '../types';
import { sound } from '../utils/audio';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (patch: Partial<GameSettings>) => void;
  onOpenPool: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  totalItems: number;
  onToggleFullscreen?: () => void;
  isCloudReady?: boolean;
  cloudError?: string | null;
  isUnlocked?: boolean;
  currentListName?: string | null;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenPool,
  onOpenHistory,
  historyCount,
  totalItems,
  isCloudReady,
  cloudError,
  isUnlocked,
  currentListName,
}) => {
  if (!isOpen) return null;

  const themes: { id: CapsuleTheme; label: string; icon: string }[] = [
    { id: 'school_supplies', label: 'School Supplies', icon: '🍎' },
    { id: 'school_stars', label: 'Class Stars', icon: '⭐' },
    { id: 'gachapon', label: 'Gachapon', icon: '🔴' },
    { id: 'plushies', label: 'Mascots', icon: '🧸' },
    { id: 'golden_eggs', label: 'Gold Eggs', icon: '🥚' },
    { id: 'candy_orbs', label: 'Rewards', icon: '🍬' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* scrim */}
      <div className="absolute inset-0 bg-[#01173B]/70 backdrop-blur-[2px]" onClick={onClose} />
      {/* panel */}
      <div className="relative w-full max-w-[420px] h-full bg-[#01173B] border-l-[4px] border-[#8CB23E] shadow-[-18px_0_50px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden">
        {/* chalkboard header */}
        <div className="relative chalkboard-bg--navy px-5 py-4 border-b-[3px] border-[#8CB23E]/40">
          <div className="absolute inset-0 wood-frame opacity-10 pointer-events-none rounded-none" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A568C] border-2 border-white/20 flex items-center justify-center shadow-[0_2px_10px_rgba(0,156,255,0.35)]">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="nexgen-headline text-[15px] text-white">SETTINGS</h2>
                <p className="nexgen-label text-[11px] text-white/60">NEXGEN BACK TO SCHOOL RAFFLE</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => { sound.playButtonClick(); onOpenPool(); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0A568C] hover:bg-[#0d6ab0] text-white font-black text-xs border-2 border-white/15 shadow"
            >
              <Layers className="w-4 h-4" />
              Pool <span className="px-1.5 py-0.5 rounded-full bg-white text-[#0A568C] text-[11px]">{totalItems}</span>
            </button>
            <button
              onClick={() => { sound.playButtonClick(); onOpenHistory(); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#8CB23E] hover:bg-[#9bc552] text-[#01173B] font-black text-xs border-2 border-white/15 shadow"
            >
              <History className="w-4 h-4" />
              History {historyCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-[#01173B] text-white text-[10px]">{historyCount}</span>}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 bg-[#f7f8f9]">
          {/* Prize Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <label className="text-[11px] font-black tracking-widest text-[#01173B] uppercase">Prize Customization</label>
            </div>
            {(['1st', '2nd', '3rd'] as const).map((id) => (
              <div key={id} className="rounded-2xl bg-white border-[3px] border-[#01173B] p-4 shadow-[0_4px_16px_rgba(1,23,59,0.12)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-full text-white ${id === '1st' ? 'bg-amber-500' : id === '2nd' ? 'bg-slate-400' : 'bg-orange-600'} shadow-sm`}>
                    {id.toUpperCase()} PLACE
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#01173B]/60 uppercase">Prize Title</label>
                    <input
                      value={settings.prizes?.[id]?.title || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        onUpdateSettings({
                          prizes: {
                            ...settings.prizes,
                            [id]: { ...settings.prizes?.[id], title: val }
                          }
                        });
                      }}
                      className="mt-1 w-full bg-[#f0f4f8] border-2 border-[#01173B]/10 rounded-xl px-3 py-2 text-sm font-bold text-[#01173B] focus:outline-none focus:border-[#0A568C]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#01173B]/60 uppercase">Prize Value</label>
                    <input
                      value={settings.prizes?.[id]?.value || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        onUpdateSettings({
                          prizes: {
                            ...settings.prizes,
                            [id]: { ...settings.prizes?.[id], value: val }
                          }
                        });
                      }}
                      className="mt-1 w-full bg-[#f0f4f8] border-2 border-[#01173B]/10 rounded-xl px-3 py-2 text-sm font-bold text-[#01173B] focus:outline-none focus:border-[#0A568C]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#01173B]/60 uppercase">Description</label>
                    <textarea
                      value={settings.prizes?.[id]?.longDescription || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        onUpdateSettings({
                          prizes: {
                            ...settings.prizes,
                            [id]: { ...settings.prizes?.[id], longDescription: val }
                          }
                        });
                      }}
                      className="mt-1 w-full bg-[#f0f4f8] border-2 border-[#01173B]/10 rounded-xl px-3 py-2 text-sm font-bold text-[#01173B] focus:outline-none focus:border-[#0A568C"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Classroom Title */}
          <div className="rounded-2xl bg-white border-[3px] border-[#01173B] p-4 shadow-[0_4px_16px_rgba(1,23,59,0.12)]">
            <label className="text-[11px] font-black tracking-widest text-[#01173B] uppercase">Event Title</label>
            <input
              value={settings.classroomTitle || ''}
              onChange={(e) => onUpdateSettings({ classroomTitle: e.target.value })}
              placeholder="NEXGEN BACK TO SCHOOL RAFFLE"
              className="mt-2 w-full bg-[#f0f4f8] border-2 border-[#0A568C]/15 rounded-xl px-3 py-2.5 text-sm font-bold text-[#01173B] placeholder:text-[#01173B]/40 focus:outline-none focus:border-[#0A568C]"
            />
            <p className="mt-1.5 text-[11px] text-[#0A568C]/70">Shown on the chalkboard header. Logo uses NEXGEN white.</p>
          </div>

          {/* Theme */}
          <div className="rounded-2xl bg-white border-[3px] border-[#01173B] p-4 shadow-[0_4px_16px_rgba(1,23,59,0.12)]">
            <label className="text-[11px] font-black tracking-widest text-[#01173B] uppercase flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#8CB23E]" />Capsule Style</label>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { sound.playButtonClick(); onUpdateSettings({ theme: t.id }); }}
                  className={`px-2 py-2.5 rounded-xl text-xs flex flex-col items-center gap-1 border-2 transition-all ${settings.theme === t.id ? 'bg-[#0A568C] text-white border-[#0A568C] shadow' : 'bg-[#f0f4f8] text-[#01173B] border-[#01173B]/10 hover:border-[#0A568C]/30'}`}
                >
                  <span className="text-lg leading-none">{t.icon}</span>
                  <span className="text-[11px] font-bold leading-tight text-center">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Speed + Bin */}
          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-2xl bg-white border-[3px] border-[#01173B] p-4 shadow-[0_4px_16px_rgba(1,23,59,0.12)]">
              <label className="text-[11px] font-black tracking-widest text-[#01173B] uppercase flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-[#009CFF]" /> Machine Speed</label>
              <div className="flex gap-1.5 mt-3 bg-[#f0f4f8] p-1 rounded-xl border border-[#01173B]/10">
                {(['normal', 'fast', 'turbo'] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => { sound.playButtonClick(); onUpdateSettings({ speed: spd }); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-black capitalize transition-all ${settings.speed === spd ? 'bg-[#01173B] text-white shadow' : 'text-[#01173B]/55 hover:text-[#01173B]'}`}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white border-[3px] border-[#01173B] p-4 shadow-[0_4px_16px_rgba(1,23,59,0.12)]">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black tracking-widest text-[#01173B] uppercase">Items in Bin</label>
                <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-[#8CB23E] text-[#01173B] border border-[#01173B]/15">{settings.binCount} capsules</span>
              </div>
              <div className="flex items-center justify-between mt-3 bg-[#01173B] rounded-xl p-1.5 border-2 border-[#01173B]">
                <button
                  onClick={() => { sound.playButtonClick(); onUpdateSettings({ binCount: Math.max(8, settings.binCount - 4) }); }}
                  className="w-10 h-10 rounded-lg bg-white text-[#01173B] flex items-center justify-center hover:bg-[#f0f4f8] border border-[#01173B]/15"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-black text-white tracking-tight">{settings.binCount}</div>
                  <div className="text-[10px] tracking-widest font-bold text-white/55 uppercase">capsules fall</div>
                </div>
                <button
                  onClick={() => { sound.playButtonClick(); onUpdateSettings({ binCount: Math.min(120, settings.binCount + 4) }); }}
                  className="w-10 h-10 rounded-lg bg-[#009CFF] text-white flex items-center justify-center hover:bg-[#0aa8ff] border border-white/15 shadow"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <input
                type="range"
                min={8}
                max={120}
                step={4}
                value={settings.binCount}
                onChange={(e) => onUpdateSettings({ binCount: parseInt(e.target.value, 10) })}
                className="w-full mt-3 accent-[#0A568C]"
              />
              <div className="flex justify-between text-[10px] font-bold text-[#01173B]/45 uppercase tracking-widest">
                <span>8 sparse</span>
                <span>120 packed</span>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="rounded-2xl bg-white border-[3px] border-[#01173B] p-4 shadow-[0_4px_16px_rgba(1,23,59,0.12)] space-y-3">
            <label className="text-[11px] font-black tracking-widest text-[#01173B] uppercase">Game Rules</label>

            <button
              onClick={() => { sound.playButtonClick(); onUpdateSettings({ hideNames: !settings.hideNames }); }}
              className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${settings.hideNames ? 'bg-[#01173B] border-[#01173B] text-white' : 'bg-[#f0f4f8] border-[#01173B]/10 text-[#01173B]'}`}
            >
              <span className="flex items-center gap-2.5 font-bold text-xs">
                {settings.hideNames ? <EyeOff className="w-4 h-4 text-[#8CB23E]" /> : <Eye className="w-4 h-4 text-[#0A568C]" />}
                Mystery Capsules
              </span>
              <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${settings.hideNames ? 'bg-[#8CB23E] text-[#01173B] border-white/15' : 'bg-white text-[#01173B]/60 border-[#01173B]/10'}`}>
                {settings.hideNames ? 'HIDDEN ?' : 'VISIBLE'}
              </span>
            </button>

            <button
              onClick={() => { sound.playButtonClick(); onUpdateSettings({ removeOnPick: !settings.removeOnPick }); }}
              className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${settings.removeOnPick ? 'bg-[#01173B] border-[#01173B] text-white' : 'bg-[#f0f4f8] border-[#01173B]/10 text-[#01173B]'}`}
            >
              <span className="flex items-center gap-2.5 font-bold text-xs">
                {settings.removeOnPick ? <CheckSquare className="w-4 h-4 text-[#009CFF]" /> : <Square className="w-4 h-4 text-[#01173B]/40" />}
                Remove winner after draw
              </span>
              <span className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-all ${settings.removeOnPick ? 'bg-[#8CB23E] justify-end' : 'bg-[#01173B]/15 justify-start'}`}>
                <span className="w-5 h-5 rounded-full bg-white shadow block" />
              </span>
            </button>

            <button
              onClick={() => { sound.playButtonClick(); onUpdateSettings({ manualControl: !settings.manualControl }); }}
              className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${settings.manualControl ? 'bg-[#0A568C] border-[#0A568C] text-white' : 'bg-[#f0f4f8] border-[#01173B]/10 text-[#01173B]'}`}
            >
              <span className="font-bold text-xs">Manual joystick control</span>
              <span className={`text-[11px] font-black px-2 py-1 rounded-full ${settings.manualControl ? 'bg-white text-[#0A568C]' : 'bg-[#01173B]/10 text-[#01173B]/60'}`}>{settings.manualControl ? 'ON' : 'AUTO'}</span>
            </button>
          </div>

          {/* Sound */}
          <div className="rounded-2xl bg-white border-[3px] border-[#01173B] p-4 shadow-[0_4px_16px_rgba(1,23,59,0.12)]">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black tracking-widest text-[#01173B] uppercase flex items-center gap-2">
                {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#8CB23E]" /> : <VolumeX className="w-3.5 h-3.5 text-[#01173B]/40" />}
                Sound
              </label>
              <button
                onClick={() => {
                  const next = !settings.soundEnabled;
                  sound.setMuted(!next);
                  onUpdateSettings({ soundEnabled: next });
                  if (next) sound.playButtonClick();
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-black border-2 ${settings.soundEnabled ? 'bg-[#8CB23E] text-[#01173B] border-[#01173B]' : 'bg-[#f0f4f8] text-[#01173B]/50 border-[#01173B]/15'}`}
              >
                {settings.soundEnabled ? 'ON' : 'MUTED'}
              </button>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-[11px] font-bold text-[#01173B]/50">Vol</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.volume}
                onChange={(e) => { const v = parseFloat(e.target.value); sound.setVolume(v); onUpdateSettings({ volume: v }); }}
                className="flex-1 accent-[#0A568C]"
              />
              <span className="text-xs font-black text-[#0A568C] w-8 text-right">{Math.round(settings.volume * 100)}%</span>
            </div>
          </div>

          {/* Tier Card Preview — demonstrates Card Shell + Header Badge + Iconography spec */}
          <div className="space-y-3">
            <p className="nexgen-label text-[11px] text-[#01173B]/60">TIER PREVIEW • CARD SPEC</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Standard tier */}
              <div className="relative brand-card overflow-visible p-4 pt-6">
                <div className="absolute -top-[10px] left-4 brand-badge px-3 py-1 flex items-center gap-1.5">
                  <span className="brand-badge__logo text-[10px]">NEXGEN</span>
                  <span className="brand-badge__tier text-[10px]">STANDARD</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-5 h-5 brand-icon" />
                  <span className="nexgen-tier text-[13px] text-[#01173B]">5 USERS</span>
                </div>
                <p className="text-[11px] font-bold text-[#01173B]/60 mt-1">Flat geometric • Nexgen Navy</p>
              </div>
              {/* Premium tier */}
              <div className="relative brand-card overflow-visible p-4 pt-6">
                <div className="absolute -top-[10px] left-4 brand-badge px-3 py-1 flex items-center gap-1.5">
                  <span className="brand-badge__logo text-[10px]">NEXGEN</span>
                  <span className="brand-badge__tier text-[10px]">PREMIUM</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Tv className="w-5 h-5 brand-icon" />
                  <span className="nexgen-tier text-[13px] text-[#01173B]">TV + USERS</span>
                </div>
                <p className="text-[11px] font-bold text-[#01173B]/60 mt-1">Flat • #0A568C uniform</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#0A568C]/10 border-2 border-[#0A568C]/15 p-3 flex gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0A568C] flex items-center justify-center text-white shrink-0">✦</div>
            <p className="text-[11px] leading-[1.45] text-[#01173B]/75 font-medium">
              Brand palette: <span className="font-black text-[#0A568C]">Nexgen Navy #0A568C</span> · <span className="font-black text-[#6d8f2f]">Orbit Green #8CB23E</span> · <span className="font-black text-[#01173B]">Midnight #01173B</span> · <span className="font-black text-[#009CFF]">Cyan #009CFF</span>
            </p>
          </div>
        </div>

        {/* Cloud Sync status */}
        <div className="px-4 pb-1">
          <div className="rounded-xl bg-[#f0f4f8] border-2 border-[#01173B]/15 p-3">
            <p className="nexgen-label text-[10px] text-[#0A568C] mb-1.5">CLOUD SYNC (CONVEX)</p>
            <div className="flex items-center gap-2 text-[12px] font-bold text-[#01173B]">
              <span className={`w-2.5 h-2.5 rounded-full ${!isCloudReady ? 'bg-[#8CB23E] animate-pulse' : cloudError ? 'bg-red-500' : isUnlocked ? 'bg-[#8CB23E]' : 'bg-[#01173B]/30'}`} />
              <span>
                {!isCloudReady
                  ? 'Syncing…'
                  : cloudError
                    ? 'Cloud unavailable'
                    : isUnlocked
                      ? `Unlocked — “${currentListName ?? 'list'}” auto-saves`
                      : 'Locked — use EDIT POOL to enter passcode'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t-2 border-[#01173B]/10 bg-white flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-[#01173B] text-white font-black text-xs tracking-widest uppercase border-2 border-[#01173B] shadow hover:bg-black">
            Done — Back to Raffle
          </button>
        </div>
      </div>
    </div>
  );
};
