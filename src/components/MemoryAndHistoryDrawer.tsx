import React, { useState } from 'react';
import { X, Search, Trash2, Download, Copy, Check, ArrowUpRight, Variable } from 'lucide-react';
import { CalcAppTheme, HistoryItem, MemoryRegisterKey, MemoryRegisters } from '../types/calculator';

interface MemoryAndHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'MEMORY' | 'HISTORY';
  setActiveTab: (tab: 'MEMORY' | 'HISTORY') => void;
  registers: MemoryRegisters;
  setRegisters: React.Dispatch<React.SetStateAction<MemoryRegisters>>;
  history: HistoryItem[];
  onClearHistory: () => void;
  onRecallExpression: (expr: string) => void;
  onRecallResult: (res: string) => void;
  appTheme?: CalcAppTheme;
}

export const MemoryAndHistoryDrawer: React.FC<MemoryAndHistoryDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  registers,
  setRegisters,
  history,
  onClearHistory,
  onRecallExpression,
  onRecallResult,
  appTheme = 'DAY',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<MemoryRegisterKey | null>(null);
  const [editValueStr, setEditValueStr] = useState('');

  if (!isOpen) return null;

  const isDay = appTheme === 'DAY';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleSaveRegister = (key: MemoryRegisterKey) => {
    const parsed = parseFloat(editValueStr);
    if (!isNaN(parsed)) {
      setRegisters(prev => ({ ...prev, [key]: parsed }));
    }
    setEditingKey(null);
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;
    const header = 'Timestamp,Mode,Expression,Result\n';
    const rows = history
      .map(
        h =>
          `"${new Date(h.timestamp).toLocaleString()}","${h.mode}","${h.expression.replace(/"/g, '""')}","${h.result.replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calc_history_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredHistory = history.filter(
    item =>
      item.expression.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.result.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const regKeys: MemoryRegisterKey[] = ['A', 'B', 'C', 'D', 'E', 'F', 'M', 'X', 'Y', 'Ans'];

  const containerClass = isDay
    ? 'bg-white border-l border-slate-200 text-slate-900'
    : 'bg-slate-900 border-l border-slate-800 text-slate-100';

  const cardClass = isDay
    ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
    : 'bg-slate-950 border-slate-800 hover:border-slate-700';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className={`w-full max-w-md flex flex-col h-full shadow-2xl animate-slide-left ${containerClass}`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${isDay ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className={`flex items-center gap-1 p-1 rounded-lg border text-xs font-semibold ${isDay ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
            <button
              onClick={() => setActiveTab('MEMORY')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'MEMORY' ? 'bg-cyan-600 text-white shadow-xs font-bold' : isDay ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Registers ({regKeys.length})
            </button>
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'HISTORY' ? 'bg-cyan-600 text-white shadow-xs font-bold' : isDay ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              History ({history.length})
            </button>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${isDay ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Body */}
        {activeTab === 'MEMORY' ? (
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            <div className={`flex items-center justify-between text-xs mb-2 ${isDay ? 'text-slate-500' : 'text-slate-400'}`}>
              <span>Click a register to insert variable into formula</span>
              <button
                onClick={() =>
                  setRegisters({ A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, M: 0, X: 0, Y: 0, Ans: 0 })
                }
                className="text-rose-600 font-bold hover:underline flex items-center gap-1"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {regKeys.map(key => {
                const val = registers[key];
                const isEditing = editingKey === key;

                return (
                  <div
                    key={key}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition ${cardClass}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-sm flex items-center gap-1">
                        <Variable className="w-3.5 h-3.5" />
                        {key}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(val.toString(), key)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          title="Copy Value"
                        >
                          {copiedKey === key ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => {
                            setEditingKey(key);
                            setEditValueStr(val.toString());
                          }}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isDay ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'}`}
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          value={editValueStr}
                          onChange={e => setEditValueStr(e.target.value)}
                          className={`w-full border rounded px-1.5 py-0.5 text-xs font-mono outline-hidden ${isDay ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-cyan-300'}`}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRegister(key)}
                          className="px-2 py-0.5 bg-cyan-600 text-white rounded text-[11px] font-bold"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onRecallExpression(key)}
                        className={`text-left font-mono text-sm truncate font-bold hover:text-cyan-600 transition ${isDay ? 'text-slate-900' : 'text-slate-100'}`}
                        title="Click to insert variable into active formula"
                      >
                        {val}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 h-full overflow-hidden">
            {/* Search and export actions */}
            <div className={`p-3 border-b flex items-center justify-between gap-2 ${isDay ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`w-full border rounded-lg pl-8 pr-3 py-1.5 text-xs outline-hidden ${isDay ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'}`}
                />
              </div>

              <button
                onClick={handleExportCSV}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${isDay ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                title="Export History to CSV"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={onClearHistory}
                className="p-2 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950/60 text-xs font-semibold flex items-center gap-1 border border-rose-200 dark:border-rose-800/40 transition"
                title="Clear History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-mono">
                  No calculation history recorded yet.
                </div>
              ) : (
                filteredHistory.map(item => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition flex flex-col gap-1.5 ${cardClass}`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className={`px-1.5 py-0.5 rounded font-mono ${isDay ? 'bg-slate-200 text-slate-700 font-bold' : 'bg-slate-800 text-slate-300'}`}>
                        {item.mode}
                      </span>
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-mono text-xs truncate ${isDay ? 'text-slate-700' : 'text-slate-300'}`}>
                        {item.expression}
                      </span>
                      <button
                        onClick={() => onRecallExpression(item.expression)}
                        className="text-cyan-600 dark:text-cyan-400 hover:underline text-xs flex items-center gap-0.5 shrink-0 font-bold"
                        title="Recall expression"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Use</span>
                      </button>
                    </div>

                    <div className={`flex items-center justify-between gap-2 border-t pt-1 ${isDay ? 'border-slate-200' : 'border-slate-900'}`}>
                      <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-300 truncate">
                        = {item.result}
                      </span>
                      <button
                        onClick={() => onRecallResult(item.result)}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline text-xs shrink-0"
                        title="Use result as Ans"
                      >
                        Ans
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
