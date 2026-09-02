import React, { useState, useMemo } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Shuffle, 
  ArrowDownAZ, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Sparkles, 
  Search, 
  RotateCcw,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { NameItem } from '../types';
import { PRESET_GROUPS, CAPSULE_PALETTES } from '../data/presets';
import { sound } from '../utils/audio';
import type { ListSummary, LoadedList } from '../lib/convexClient';
import { Lock, Unlock, FolderPlus, Trash2 as TrashIcon, Pencil } from 'lucide-react';

interface NamesPoolPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: NameItem[];
  onUpdateItems: (items: NameItem[]) => void;
  hideNames: boolean;
  onToggleHideNames: (hide: boolean) => void;
  onOpenBulkEditor: () => void;
  isCloudReady: boolean;
  cloudError: string | null;
  lists: ListSummary[];
  currentList: LoadedList | null;
  isUnlocked: boolean;
  onSetPasscode: (passcode: string) => Promise<boolean>;
  onSelectList: (listCode: string) => Promise<void>;
  onCreateList: (name: string) => Promise<string>;
  onDeleteList: (listId: string) => Promise<void>;
  onRenameList: (listId: string, name: string) => Promise<void>;
}

export const NamesPoolPanel: React.FC<NamesPoolPanelProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateItems,
  hideNames,
  onToggleHideNames,
  onOpenBulkEditor,
  isCloudReady,
  cloudError,
  lists,
  currentList,
  isUnlocked,
  onSetPasscode,
  onSelectList,
  onCreateList,
  onDeleteList,
  onRenameList,
}) => {
  const [newName, setNewName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authMsg, setAuthMsg] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  if (!isOpen) return null;

  const handleUnlock = async () => {
    if (!passcodeInput.trim()) return;
    setAuthBusy(true);
    const ok = await onSetPasscode(passcodeInput.trim());
    setAuthBusy(false);
    if (ok) {
      setAuthMsg('Unlocked — edits now save to Convex cloud.');
      setPasscodeInput('');
    } else {
      setAuthMsg('Incorrect passcode. Try again.');
    }
  };

  const handleCreateNewList = async () => {
    if (!newListName.trim()) return;
    await onCreateList(newListName.trim());
    setNewListName('');
    setAuthMsg('Created a new saved list.');
  };

  const handleAddName = () => {
    if (!newName.trim()) return;
    sound.playButtonClick();
    const newItem: NameItem = {
      id: `${Date.now()}-${Math.random()}`,
      name: newName.trim(),
      colorIndex: items.length % CAPSULE_PALETTES.length,
    };
    onUpdateItems([...items, newItem]);
    setNewName('');
  };

  const handleRemoveItem = (id: string) => {
    sound.playButtonClick();
    onUpdateItems(items.filter((it) => it.id !== id));
  };

  const handleShuffle = () => {
    sound.playButtonClick();
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    onUpdateItems(shuffled);
  };

  const handleSortAZ = () => {
    sound.playButtonClick();
    const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
    onUpdateItems(sorted);
  };

  const handleResetDefault = () => {
    sound.playButtonClick();
    const defaultItems = PRESET_GROUPS[0].names.map((name, idx) => ({
      id: `default-${Date.now()}-${idx}`,
      name,
      colorIndex: idx % 8,
    }));
    onUpdateItems(defaultItems);
  };

  const handleClearPool = () => {
    sound.playButtonClick();
    if (confirm('Clear all student names from the classroom claw machine?')) {
      onUpdateItems([]);
    }
  };

  const handleSelectPreset = (presetNames: string[]) => {
    sound.playButtonClick();
    const newItems = presetNames.map((name, idx) => ({
      id: `${Date.now()}-${idx}`,
      name,
      colorIndex: idx % 8,
    }));
    onUpdateItems(newItems);
  };

  const [limit, setLimit] = useState(80);

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [items, searchQuery]);

  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, limit);
  }, [filteredItems, limit]);

  return (
    <div className="fixed inset-0 z-[55] flex justify-end bg-[#01173B]/70 backdrop-blur-[2px] animate-fadeIn">
      <div className="w-full max-w-md md:max-w-lg bg-white border-l-[3px] border-[#01173B] h-full shadow-[ -18px_0_50px_rgba(1,23,59,0.35)] flex flex-col animate-slideLeft relative overflow-hidden">
        {/* Header Badge — overlapping top-left pill */}
        <div className="absolute top-0 left-6 brand-badge px-4 py-1.5 flex items-center gap-2 z-10">
          <span className="brand-badge__logo text-[11px]">NEXGEN</span>
          <span className="w-px h-3 bg-white/20" />
          <span className="brand-badge__tier text-[11px]">EDIT POOL</span>
        </div>
        <div className="absolute top-7 left-6 right-6 h-[3px] brand-swoosh opacity-60" />
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-10 pb-3.5 border-b-[3px] border-[#01173B] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0A568C] border-2 border-[#01173B] flex items-center justify-center text-white shadow brand-icon">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="nexgen-headline text-[16px] text-[#01173B] leading-none">EDIT POOL</h3>
              <p className="nexgen-label text-[11px] text-[#0A568C]">
                {items.length} {items.length === 1 ? 'ENTRY' : 'ENTRIES'} • IN DRUM
              </p>
            </div>
          </div>
           
          <button
            id="btn-close-pool"
            onClick={onClose}
            className="p-2 rounded-full bg-[#01173B] text-white hover:bg-black border-2 border-[#01173B] shadow"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Mystery Mode Toggle Banner */}
        <div className="px-5 py-2.5 bg-[#f0f4f8] border-b-[3px] border-[#01173B]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hideNames ? (
              <EyeOff className="w-4 h-4 text-[#0A568C] brand-icon" />
            ) : (
              <Eye className="w-4 h-4 text-[#0A568C] brand-icon" />
            )}
            <span className="nexgen-label text-[11px] text-[#01173B]">
              {hideNames ? 'MYSTERY: HIDDEN ?' : 'VISIBLE: NAMES SHOWN'}
            </span>
          </div>
          <button
            onClick={() => {
              sound.playButtonClick();
              onToggleHideNames(!hideNames);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-black transition-all border-2 ${
              hideNames
                ? 'bg-[#01173B] text-white border-[#01173B] shadow'
                : 'bg-white text-[#01173B] border-[#01173B]/15'
            }`}
          >
            {hideNames ? 'MYSTERY ON' : 'SHOW NAMES'}
          </button>
        </div>

        {/* Cloud Sync / Saved Lists */}
        <div className="px-5 py-3 bg-white border-b-[3px] border-[#01173B]/10">
          <div className="flex items-center justify-between mb-2">
            <span className="nexgen-label text-[11px] text-[#0A568C] flex items-center gap-1.5">
              <FolderPlus className="w-4 h-4 brand-icon" />
              SAVED LISTS
            </span>
            <span className={`nexgen-label text-[10px] ${isUnlocked ? 'text-[#8CB23E]' : 'text-[#01173B]/45'}`}>
              {!isCloudReady
                ? 'SYNCING…'
                : cloudError
                  ? cloudError.toUpperCase()
                  : isUnlocked
                    ? '● CLOUD UNLOCKED'
                    : 'LOCKED — ENTER PASSCODE'}
            </span>
          </div>

          {!isUnlocked ? (
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Passcode (nexgen2026)"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                className="flex-1 bg-[#f0f4f8] border-[3px] border-[#01173B] rounded-xl px-3 py-2 text-sm font-bold text-[#01173B] placeholder:text-[#01173B]/40 focus:outline-none focus:border-[#0A568C]"
              />
              <button
                onClick={handleUnlock}
                disabled={authBusy || !passcodeInput.trim()}
                className="px-4 py-2 rounded-xl bg-[#0A568C] hover:bg-[#0d6ab0] disabled:opacity-40 text-white font-black text-xs flex items-center gap-1.5 shadow border-2 border-[#01173B] nexgen-label"
              >
                <Lock className="w-3.5 h-3.5" />
                UNLOCK
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#8CB23E]">
              <Unlock className="w-3.5 h-3.5" />
              <span>Edits auto-save to cloud list “{currentList?.name ?? '…'}”</span>
            </div>
          )}
          {authMsg && <p className="mt-2 text-[11px] font-bold text-[#0A568C]">{authMsg}</p>}

          {/* List switcher */}
          {isCloudReady && !cloudError && lists.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {lists.map((l) => {
                const active = currentList?._id === l._id;
                return (
                  <div
                    key={l._id}
                    className={`flex items-center justify-between gap-2 rounded-xl border-[3px] px-3 py-2 transition-colors ${
                      active ? 'bg-[#0A568C] text-white border-[#01173B]' : 'bg-white text-[#01173B] border-[#01173B]/20 hover:border-[#0A568C]'
                    }`}
                  >
                    <button
                      onClick={() => { if (!active) onSelectList(l.listCode); }}
                      className="flex items-center gap-2 min-w-0 flex-1 text-left"
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-[#8CB23E]' : 'bg-[#009CFF]'}`} />
                      <span className="text-xs font-black truncate nexgen-label">{l.name}</span>
                      <span className={`text-[10px] font-bold ${active ? 'text-white/70' : 'text-[#01173B]/45'}`}>{l.count}</span>
                    </button>
                    {active && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => { const n = prompt('Rename list', l.name); if (n) onRenameList(l._id, n); }}
                          className={`p-1 rounded ${active ? 'text-white/80 hover:bg-white/20' : 'text-[#01173B]/60 hover:bg-[#f0f4f8]'}`}
                          title="Rename"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {l.listCode !== 'RAFFLE' && (
                          <button
                            onClick={() => { if (confirm(`Delete list “${l.name}”?`)) onDeleteList(l._id); }}
                            className={`p-1 rounded ${active ? 'text-white/80 hover:bg-white/20' : 'text-red-500/70 hover:bg-red-50'}`}
                            title="Delete"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Create new list */}
          {isCloudReady && !cloudError && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="New list name…"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNewList()}
                className="flex-1 bg-[#f0f4f8] border-[3px] border-[#01173B] rounded-xl px-3 py-2 text-xs font-bold text-[#01173B] placeholder:text-[#01173B]/40 focus:outline-none focus:border-[#0A568C]"
              />
              <button
                onClick={handleCreateNewList}
                disabled={!newListName.trim() || !isUnlocked}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#f0f4f8] text-[#01173B] text-xs font-black border-[3px] border-[#01173B] nexgen-label disabled:opacity-40 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-[#0A568C]" />
                CREATE
              </button>
            </div>
          )}
        </div>

        {/* Add Name Input */}
        <div className="p-4 border-b-[3px] border-[#01173B]/10 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add entry name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddName()}
              className="flex-1 bg-[#f0f4f8] border-[3px] border-[#01173B] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#01173B] placeholder:text-[#01173B]/40 focus:outline-none focus:border-[#0A568C] brand-card--sm"
            />
            <button
              onClick={handleAddName}
              disabled={!newName.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#0A568C] hover:bg-[#0d6ab0] disabled:opacity-40 text-white font-black text-xs flex items-center gap-1.5 shadow border-2 border-[#01173B] transition-all active:scale-95 nexgen-label"
            >
              <Plus className="w-4 h-4" />
              <span>ADD</span>
            </button>
          </div>

          {/* Quick presets row */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            <span className="nexgen-label text-[#01173B]/60 whitespace-nowrap">PRESETS:</span>
            {PRESET_GROUPS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.names)}
                className="px-2.5 py-1.5 rounded-full bg-white hover:bg-[#f0f4f8] text-[#01173B] hover:text-[#0A568C] border-[2px] border-[#01173B] whitespace-nowrap transition-colors nexgen-label text-[11px]"
                title={`Load ${preset.title} (${preset.names.length} items)`}
              >
                {preset.title.split(' ')[0]} {preset.title.split(' ')[1] || ''}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="px-4 py-2.5 bg-[#f0f4f8] border-b-[3px] border-[#01173B]/10 flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#0A568C] brand-icon" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-[3px] border-[#01173B] rounded-full pl-9 pr-3 py-2 text-[12px] font-bold text-[#01173B] focus:outline-none focus:border-[#0A568C] placeholder:text-[#01173B]/40"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShuffle}
              className="p-2 rounded-xl bg-white hover:bg-[#f0f4f8] text-[#01173B] border-[2px] border-[#01173B] shadow-sm"
              title="Shuffle"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#0A568C] brand-icon" />
            </button>
            <button
              onClick={handleSortAZ}
              className="p-2 rounded-xl bg-white hover:bg-[#f0f4f8] text-[#01173B] border-[2px] border-[#01173B] shadow-sm"
              title="Sort A-Z"
            >
              <ArrowDownAZ className="w-3.5 h-3.5 text-[#0A568C] brand-icon" />
            </button>
            <button
              onClick={handleResetDefault}
              className="p-2 rounded-xl bg-white hover:bg-[#f0f4f8] text-[#01173B] border-[2px] border-[#01173B] shadow-sm"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#0A568C] brand-icon" />
            </button>
          </div>
        </div>

        {/* Names List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#f7f8f9]">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white border-[3px] border-[#01173B] flex items-center justify-center mb-3">
                <span className="text-2xl">📋</span>
              </div>
              <p className="nexgen-headline text-sm text-[#01173B]">POOL IS EMPTY</p>
              <p className="text-xs text-[#01173B]/60 mt-1">Add names, upload a roster, or load a preset.</p>
              <button onClick={() => handleResetDefault()} className="mt-4 px-4 py-2 rounded-full bg-[#0A568C] text-white font-black text-xs border-2 border-[#01173B] nexgen-label">LOAD CLASS ROSTER (24)</button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#01173B]/60">
              No entries matching "{searchQuery}"
            </div>
          ) : (
            <>
              {displayedItems.map((item, idx) => {
                const palette = CAPSULE_PALETTES[item.colorIndex % CAPSULE_PALETTES.length];
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border-[3px] border-[#01173B] hover:border-[#0A568C] transition-colors group brand-card--sm"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-5 nexgen-label text-[11px] text-[#0A568C] text-right">
                        {idx + 1}.
                      </span>
                      <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${palette.bg} border ${palette.border} shadow-xs shrink-0`} />
                      <span className="text-xs font-black text-[#01173B] truncate" style={{ fontFamily: 'var(--brand-font)' }}>
                        {item.name}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 rounded-full bg-white text-[#01173B]/40 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 opacity-70 group-hover:opacity-100 transition-all"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {filteredItems.length > displayedItems.length && (
                <div className="pt-2 text-center">
                  <button
                    onClick={() => setLimit((prev) => prev + 100)}
                    className="w-full py-2.5 bg-white hover:bg-[#f0f4f8] text-[#01173B] font-black text-xs rounded-full border-[3px] border-[#01173B] transition-colors nexgen-label"
                  >
                    LOAD MORE (+100) — {displayedItems.length} OF {filteredItems.length.toLocaleString()}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pool Footer Actions */}
        <div className="p-4 border-t-[3px] border-[#01173B] bg-white flex items-center justify-between gap-2">
          <button
            onClick={() => {
              sound.playButtonClick();
              onOpenBulkEditor();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-[#f0f4f8] text-[#01173B] text-xs font-black border-[3px] border-[#01173B] shadow-sm nexgen-label"
          >
            <Upload className="w-3.5 h-3.5 text-[#0A568C] brand-icon" />
            <span>BULK UPLOAD</span>
          </button>

          <button
            onClick={handleClearPool}
            disabled={items.length === 0}
            className="text-xs text-red-500 hover:text-red-600 disabled:opacity-30 font-black nexgen-label"
          >
            CLEAR ALL
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#01173B] hover:bg-black text-white font-black text-xs shadow border-2 border-[#01173B] nexgen-label"
          >
            DONE
          </button>
        </div>

      </div>
    </div>
  );
};
