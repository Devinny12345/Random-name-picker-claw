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
  Search, 
  RotateCcw,
  Upload,
  Lock, 
  Unlock, 
  FolderPlus, 
  Trash2 as TrashIcon, 
  Pencil,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { NameItem } from '../types';
import { PRESET_GROUPS, CAPSULE_PALETTES } from '../data/presets';
import { sound } from '../utils/audio';
import type { ListSummary, LoadedList } from '../lib/convexClient';

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
  onClearCloudData: (listId: string, passcode: string) => Promise<void>;
}

export const NamesPoolPanel: React.FC<NamesPoolPanelProps> = ({
  isOpen,
  onClose,
  items = [],
  onUpdateItems,
  hideNames,
  onToggleHideNames,
  onOpenBulkEditor,
  isCloudReady,
  cloudError,
  lists = [],
  currentList,
  isUnlocked,
  onSetPasscode,
  onSelectList,
  onCreateList,
  onDeleteList,
  onRenameList,
  onClearCloudData,
}) => {
  const [newName, setNewName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authMsg, setAuthMsg] = useState<{type: 'error' | 'success', text: string} | null>(null);
  const [newListName, setNewListName] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  if (!isOpen) return null;

  const handleUnlock = async () => {
    if (!passcodeInput.trim()) return;
    setAuthBusy(true);
    setAuthMsg(null);
    try {
      const ok = await onSetPasscode(passcodeInput.trim());
      if (ok) {
        setAuthMsg({type: 'success', text: 'Cloud Unlocked'});
        setPasscodeInput('');
      } else {
        setAuthMsg({type: 'error', text: 'Invalid Passcode'});
      }
    } catch (e) {
      setAuthMsg({type: 'error', text: 'Connection Error'});
    } finally {
      setAuthBusy(false);
    }
  };

  const handleCreateNewList = async () => {
    if (!newListName.trim()) return;
    try {
      await onCreateList(newListName.trim());
      setNewListName('');
      setAuthMsg({type: 'success', text: 'List Created'});
    } catch (e) {
      setAuthMsg({type: 'error', text: 'Failed to create list'});
    }
  };

  const handleAddName = () => {
    if (!newName.trim()) return;
    sound.playButtonClick();
    const newItem: NameItem = {
      id: `${Date.now()}-${Math.random()}`,
      name: newName.trim(),
      colorIndex: (items?.length || 0) % CAPSULE_PALETTES.length,
    };
    const currentItems = Array.isArray(items) ? items : [];
    onUpdateItems([...currentItems, newItem]);
    setNewName('');
  };

  const handleRemoveItem = (id: string) => {
    sound.playButtonClick();
    const currentItems = Array.isArray(items) ? items : [];
    onUpdateItems(currentItems.filter((it) => it.id !== id));
  };

  const handleShuffle = () => {
    sound.playButtonClick();
    const currentItems = Array.isArray(items) ? items : [];
    const shuffled = [...currentItems].sort(() => Math.random() - 0.5);
    onUpdateItems(shuffled);
  };

  const handleSortAZ = () => {
    sound.playButtonClick();
    const currentItems = Array.isArray(items) ? items : [];
    const sorted = [...currentItems].sort((a, b) => a.name.localeCompare(b.name));
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

  const handleClearPool = async () => {
    sound.playButtonClick();
    if (!confirm('WIPE EVERYTHING? This will permanently delete all names and draw history from the cloud for this list.')) return;
    
    setIsWiping(true);
    if (currentList?._id) {
      try {
        await onClearCloudData(currentList._id, 'nexgen2026');
        onUpdateItems([]);
        setAuthMsg({type: 'success', text: 'Cloud Wiped'});
      } catch (e) {
        console.error('Cloud wipe failed:', e);
        alert('Cloud wipe failed. Clearing local state only.');
        onUpdateItems([]);
      } finally {
        setIsWiping(false);
      }
    } else {
      onUpdateItems([]);
      setIsWiping(false);
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
    if (!items || !Array.isArray(items)) return [];
    return items.filter((item) =>
      item?.name?.toLowerCase().includes(searchQuery?.toLowerCase().trim() || '')
    );
  }, [items, searchQuery]);

  const displayedItems = useMemo(() => {
    if (!filteredItems) return [];
    return filteredItems.slice(0, limit);
  }, [filteredItems, limit]);

  return (
    <div className="fixed inset-0 z-[55] flex justify-end bg-[#01173B]/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md md:max-w-lg bg-[#01173B] border-l-[6px] border-[#8CB23E] h-full shadow-2xl flex flex-col animate-slideLeft relative overflow-hidden">
        
        <div className="relative flex items-center justify-between px-6 pt-12 pb-6 border-b-2 border-white/10 bg-gradient-to-b from-white/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#8CB23E] text-[#01173B] flex items-center justify-center shadow-lg shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-1">EDIT POOL</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#8CB23E] uppercase tracking-widest">
                  {items?.length || 0} {items?.length === 1 ? 'ENTRY' : 'ENTRIES'}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span className="text-xs text-white/50 font-medium uppercase tracking-tighter">In Drum</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isUnlocked ? 'bg-[#8CB23E] animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
              {isUnlocked ? 'Cloud Sync Active' : 'Local Mode Only'}
            </span>
          </div>
          <button 
            onClick={() => { sound.playButtonClick(); onToggleHideNames(!hideNames); }}
            className={`px-3 py-1 rounded-full text-[10px] font-black transition-all border-2 ${
              hideNames ? 'bg-[#8CB23E] text-[#01173B] border-[#8CB23E]' : 'bg-transparent text-white border-white/20'
            }`}
          >
            {hideNames ? 'MYSTERY ON' : 'SHOW NAMES'}
          </button>
        </div>

        <div className="p-6 space-y-4 bg-white/[0.02]">
          <div className="bg-white/5 rounded-3xl p-5 border border-white/10 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-[#8CB23E]" />
                <span className="text-xs font-black uppercase tracking-widest text-white">Saved Lists</span>
              </div>
              {isUnlocked && <span className="text-[10px] font-bold text-[#8CB23E] bg-[#8CB23E]/10 px-2 py-0.5 rounded-full">SECURE</span>}
            </div>

            {!isUnlocked ? (
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Enter Admin Passcode..."
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#8CB23E] transition-all"
                />
                <button
                  onClick={handleUnlock}
                  disabled={authBusy || !passcodeInput.trim()}
                  className="px-4 py-2 rounded-xl bg-[#8CB23E] text-[#01173B] font-black text-xs flex items-center gap-2 hover:bg-[#9bc552] transition-all disabled:opacity-50"
                >
                  {authBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
                  UNLOCK
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-[#8CB23E]/10 p-3 rounded-xl border border-[#8CB23E]/20">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8CB23E]">
                  <Unlock className="w-3.5 h-3.5" />
                  Synced to: <span className="text-white">{currentList?.name || 'Default'}</span>
                </div>
                <button 
                  onClick={() => { const n = prompt('Rename list', currentList?.name); if (n) onRenameList(currentList?._id || '', n); }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {authMsg && (
              <div className={`mt-3 flex items-center gap-2 text-[11px] font-bold p-2 rounded-lg ${authMsg.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {authMsg.type === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {authMsg.text}
              </div>
            )}

            {isCloudReady && lists && lists.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-2">
                {lists.map((l) => {
                  if (!l) return null;
                  const active = currentList?._id === l._id;
                  return (
                    <button
                      key={l._id}
                      onClick={() => { if (!active && l.listCode) onSelectList(l.listCode); }}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                        active ? 'bg-[#8CB23E] border-[#8CB23E] text-[#01173B] shadow-lg scale-[1.02]' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${active ? 'bg-[#01173B]' : 'bg-white/20'}`} />
                        <span className="text-xs font-bold truncate">{l.name}</span>
                      </div>
                      <span className="text-[10px] font-black opacity-60">{l.count} items</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-white/[0.02] border-y border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type name and press enter..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddName()}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#8CB23E] transition-all"
            />
            <button
              onClick={handleAddName}
              disabled={!newName.trim()}
              className="px-5 py-3 rounded-xl bg-[#8CB23E] text-[#01173B] font-black text-xs flex items-center gap-2 hover:bg-[#9bc552] transition-all disabled:opacity-50 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              ADD
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search drum..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#8CB23E] transition-all"
              />
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleShuffle} className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all" title="Shuffle">
                <Shuffle className="w-4 h-4" />
              </button>
              <button onClick={handleSortAZ} className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all" title="Sort A-Z">
                <ArrowDownAZ className="w-4 h-4" />
              </button>
              <button onClick={handleResetDefault} className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all" title="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {items?.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center mb-4 text-white/20">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-white font-bold">Drum is empty</p>
              <p className="text-xs text-white/40 mt-1">Add your first entries to begin</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-xs text-white/40 italic">
              No matches for "{searchQuery}"
            </div>
          ) : (
            <div className="space-y-2">
              {displayedItems.map((item, idx) => {
                const palette = CAPSULE_PALETTES[item.colorIndex % CAPSULE_PALETTES.length];
                return (
                  <div
                    key={item.id}
                    className="group flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#8CB23E]/50 hover:bg-white/[0.08] transition-all"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="text-[10px] font-black text-white/30 w-4">{idx + 1}</span>
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-tr ${palette.bg} border ${palette.border} shadow-sm`} />
                      <span className="text-sm font-bold text-white truncate">{item.name}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 rounded-xl text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              {filteredItems.length > displayedItems.length && (
                <button 
                  onClick={() => setLimit(prev => prev + 100)}
                  className="w-full py-3 rounded-xl bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
                >
                  Load More Entries ({filteredItems.length - displayedItems.length} remaining)
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t-2 border-white/10 bg-white/[0.02] grid grid-cols-2 gap-3">
          <button
            onClick={() => { sound.playButtonClick(); onOpenBulkEditor(); }}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black transition-all border border-white/10 active:scale-95"
          >
            <Upload className="w-4 h-4" />
            BULK
          </button>
          <button
            onClick={handleClearPool}
            disabled={items?.length === 0}
            className="py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-black transition-all border border-red-500/20 disabled:opacity-30 active:scale-95"
          >
            PURGE ALL
          </button>
          <button
            onClick={onClose}
            className="col-span-2 py-4 rounded-2xl bg-[#8CB23E] text-[#01173B] font-black text-sm shadow-xl hover:bg-[#9bc552] transition-all active:scale-95"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
