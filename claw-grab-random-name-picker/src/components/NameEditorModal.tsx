import React, { useState, useRef, useMemo } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Shuffle, 
  ArrowDownAZ, 
  Sparkles, 
  Copy, 
  Check, 
  Upload, 
  FileText, 
  RotateCcw,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { NameItem } from '../types';
import { PRESET_GROUPS } from '../data/presets';
import { sound } from '../utils/audio';

interface NameEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: NameItem[];
  onSaveItems: (newItems: NameItem[]) => void;
}

export const NameEditorModal: React.FC<NameEditorModalProps> = ({
  isOpen,
  onClose,
  items,
  onSaveItems,
}) => {
  const [textInput, setTextInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [rosterLimit, setRosterLimit] = useState(100);
  const [bulkText, setBulkText] = useState(items.map((it) => it.name).join('\n'));
  const [activeTab, setActiveTab] = useState<'list' | 'bulk' | 'presets'>('list');
  const [copied, setCopied] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRoster = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchFilter.toLowerCase().trim())
    );
  }, [items, searchFilter]);

  const displayedRoster = useMemo(() => {
    return filteredRoster.slice(0, rosterLimit);
  }, [filteredRoster, rosterLimit]);

  if (!isOpen) return null;

  const handleAddSingle = () => {
    if (!textInput.trim()) return;
    sound.playButtonClick();
    const newItem: NameItem = {
      id: `${Date.now()}-${Math.random()}`,
      name: textInput.trim(),
      colorIndex: items.length % 8,
    };
    onSaveItems([...items, newItem]);
    setTextInput('');
  };

  const handleRemoveItem = (id: string) => {
    sound.playButtonClick();
    onSaveItems(items.filter((it) => it.id !== id));
  };

  // Helper to extract clean names from bulk raw text
  const parseRawNames = (rawText: string): string[] => {
    // Split by newlines or commas
    const rawLines = rawText.split(/[\r\n,]+/);
    return rawLines
      .map((line) => {
        // Strip out leading numbers like "1. ", "1) ", bullets "-", quotes
        return line.replace(/^[\s\d.\-#*)]+/, '').replace(/^["']|["']$/g, '').trim();
      })
      .filter((name) => name.length > 0);
  };

  const handleApplyBulk = (appendMode = false) => {
    sound.playButtonClick();
    const parsedNames = parseRawNames(bulkText);
    if (parsedNames.length === 0) {
      setUploadFeedback('Please enter or upload at least one valid name.');
      return;
    }

    const newItems: NameItem[] = parsedNames.map((name, idx) => ({
      id: `${Date.now()}-${Math.random()}-${idx}`,
      name,
      colorIndex: (appendMode ? items.length + idx : idx) % 8,
    }));

    if (appendMode) {
      onSaveItems([...items, ...newItems]);
      setUploadFeedback(`Added ${newItems.length} new students! Total: ${items.length + newItems.length}`);
    } else {
      onSaveItems(newItems);
      setUploadFeedback(`Loaded ${newItems.length} students to the claw machine!`);
    }

    setTimeout(() => {
      setActiveTab('list');
      setUploadFeedback(null);
    }, 1200);
  };

  // File Upload Handler (txt, csv)
  const processUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setBulkText(text);
        const count = parseRawNames(text).length;
        setUploadFeedback(`File loaded: "${file.name}" (${count} names found)`);
        sound.playCoin();
      }
    };
    reader.onerror = () => {
      setUploadFeedback('Error reading file. Please check file format.');
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleLoadPreset = (names: string[]) => {
    sound.playButtonClick();
    const newItems: NameItem[] = names.map((name, idx) => ({
      id: `${Date.now()}-${idx}`,
      name,
      colorIndex: idx % 8,
    }));
    onSaveItems(newItems);
    setBulkText(names.join('\n'));
    setActiveTab('list');
  };

  const handleShuffle = () => {
    sound.playButtonClick();
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    onSaveItems(shuffled);
  };

  const handleSortAZ = () => {
    sound.playButtonClick();
    const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
    onSaveItems(sorted);
  };

  const handleClearAll = () => {
    sound.playButtonClick();
    if (confirm('Are you sure you want to clear all names from the classroom claw machine?')) {
      onSaveItems([]);
      setBulkText('');
      setUploadFeedback('Classroom roster cleared.');
      setTimeout(() => setUploadFeedback(null), 2000);
    }
  };

  const handleResetDefault = () => {
    sound.playButtonClick();
    const defaultRoster = PRESET_GROUPS[0].names.map((name, idx) => ({
      id: `default-${Date.now()}-${idx}`,
      name,
      colorIndex: idx % 8,
    }));
    onSaveItems(defaultRoster);
    setBulkText(PRESET_GROUPS[0].names.join('\n'));
    setUploadFeedback('Reset to default 24-student classroom roster.');
    setTimeout(() => setUploadFeedback(null), 2000);
  };

  const handleCopyList = () => {
    navigator.clipboard.writeText(items.map((i) => i.name).join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const detectedCount = parseRawNames(bulkText).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 text-xl shadow-inner">
              🍎
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Classroom Roster & Bulk Upload</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  {items.length} {items.length === 1 ? 'Student' : 'Students'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Manage student names, upload class lists, or choose school presets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 pt-3 bg-slate-950/50 gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-400 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Current Roster ({items.length})</span>
          </button>
          <button
            onClick={() => {
              if (items.length > 0 && !bulkText) {
                setBulkText(items.map((it) => it.name).join('\n'));
              }
              setActiveTab('bulk');
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'bulk'
                ? 'bg-slate-800 text-cyan-400 border-t-2 border-cyan-400 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File / Bulk Paste</span>
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-slate-800 text-purple-400 border-t-2 border-purple-400 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>School Presets</span>
          </button>
        </div>

        {/* Feedback alert if any */}
        {uploadFeedback && (
          <div className="mx-6 mt-3 p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl flex items-center gap-2 text-xs font-semibold text-amber-300 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{uploadFeedback}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto min-h-[320px]">
          {activeTab === 'list' && (
            <div className="flex flex-col h-full space-y-4">
              {/* Add Input Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type student name (e.g. Maya Lin)..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSingle()}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
                />
                <button
                  onClick={handleAddSingle}
                  disabled={!textInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {/* Action Toolbar & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={handleShuffle}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 font-semibold border border-slate-700"
                    title="Shuffle student order"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Shuffle</span>
                  </button>
                  <button
                    onClick={handleSortAZ}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 font-semibold border border-slate-700"
                    title="Sort A to Z"
                  >
                    <ArrowDownAZ className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Sort A-Z</span>
                  </button>
                  <button
                    onClick={handleCopyList}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 font-semibold border border-slate-700"
                    title="Copy all names to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleResetDefault}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 font-semibold border border-slate-700"
                    title="Reset to 24-student class roster"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Reset Class</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {items.length > 20 && (
                    <input
                      type="text"
                      placeholder="Filter roster..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-slate-500 w-32 focus:w-44 transition-all focus:border-amber-400 focus:outline-none"
                    />
                  )}
                  <button
                    onClick={handleClearAll}
                    disabled={items.length === 0}
                    className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 disabled:opacity-30 flex items-center gap-1 font-semibold border border-red-800/50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Items Chip Grid */}
              <div className="flex-1 bg-slate-950/60 border border-slate-800 rounded-2xl p-3 overflow-y-auto max-h-[260px] flex flex-col gap-2">
                {items.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    <p className="font-bold text-slate-400 mb-1">Roster is Empty</p>
                    <p>Type student names above, upload a CSV/TXT roster, or pick a school preset!</p>
                  </div>
                ) : filteredRoster.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No students match "{searchFilter}"
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {displayedRoster.map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between bg-slate-900/90 border border-slate-800 hover:border-amber-400/40 rounded-xl px-3 py-2 text-xs text-slate-200 group transition-colors"
                        >
                          <span className="font-mono text-slate-500 w-6 text-right mr-2">{idx + 1}.</span>
                          <span className="flex-1 font-semibold truncate">{item.name}</span>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity ml-2 p-1"
                            title="Remove student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {filteredRoster.length > displayedRoster.length && (
                      <div className="pt-2 text-center">
                        <button
                          onClick={() => setRosterLimit((prev) => prev + 100)}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
                        >
                          Load More (+100) — Showing {displayedRoster.length} of {filteredRoster.length.toLocaleString()}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'bulk' && (
            <div className="flex flex-col space-y-4">
              {/* File Upload Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-amber-400 bg-amber-500/10'
                    : 'border-slate-700 bg-slate-950/60 hover:border-amber-400/60 hover:bg-slate-950'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.csv,.tsv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white">
                  Drop classroom list (.csv, .txt) or <span className="text-amber-400 underline">Browse File</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Supports Google Classroom, PowerSchool, Canvas exported rosters, or plain text lists
                </p>
              </div>

              {/* Paste Text Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Or Paste Names Below (one per line or comma-separated):
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {detectedCount} {detectedCount === 1 ? 'student' : 'students'} detected
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Emma Watson&#10;Liam Smith&#10;Olivia Johnson&#10;Noah Williams..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
                />
              </div>

              {/* Action Buttons: Replace or Append */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    // Quick clean: strip numbers and bullets
                    const cleaned = parseRawNames(bulkText).join('\n');
                    setBulkText(cleaned);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  Clean Numbers / Bullets
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApplyBulk(true)}
                    disabled={detectedCount === 0}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700"
                  >
                    <Plus className="w-4 h-4 text-cyan-400" />
                    <span>Append to Pool</span>
                  </button>

                  <button
                    onClick={() => handleApplyBulk(false)}
                    disabled={detectedCount === 0}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Replace Entire Pool ({detectedCount})</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_GROUPS.map((preset) => (
                <div
                  key={preset.id}
                  className="bg-slate-950/80 border border-slate-800 hover:border-amber-400/60 rounded-2xl p-4 flex flex-col justify-between transition-all group"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      {preset.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{preset.description}</p>
                    <span className="text-[11px] font-mono font-semibold text-amber-400/80 mt-2 block">
                      {preset.names.length} items
                    </span>
                  </div>
                  <button
                    onClick={() => handleLoadPreset(preset.names)}
                    className="mt-3 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-bold transition-all shadow active:scale-95"
                  >
                    Load This Preset
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950">
          <span className="text-xs text-slate-400">Total in pool: <strong className="text-white">{items.length}</strong> students</span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
