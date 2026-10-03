import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { PHYSICAL_CONSTANTS } from '../../utils/constantsAndUnits';

interface ConstantsPanelProps {
  onInsertConstant: (val: number) => void;
}

export const ConstantsPanel: React.FC<ConstantsPanelProps> = ({ onInsertConstant }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredConstants = PHYSICAL_CONSTANTS.filter(c => {
    const matchesCat = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full space-y-4 bg-transparent text-slate-900">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search constants (e.g. Speed of Light, h, Planck)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 font-bold outline-hidden focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/30 shadow-2xs"
          />
        </div>

        {/* Select Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-bold outline-hidden focus:border-cyan-600 shadow-2xs"
        >
          <option value="ALL">All Categories</option>
          <option value="Universal">Universal Constants</option>
          <option value="Electromagnetic">Electromagnetic Constants</option>
          <option value="Physico-Chemical">Physico-Chemical Constants</option>
          <option value="Atomic">Atomic & Nuclear Constants</option>
          <option value="Astro">Astro & Gravity Constants</option>
        </select>
      </div>

      {/* Constants Grid Container */}
      <div className="max-h-120 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-3 p-1 scrollbar-thin">
        {filteredConstants.length > 0 ? (
          filteredConstants.map(c => (
            <div
              key={c.name}
              onClick={() => onInsertConstant(c.value)}
              className="p-3.5 bg-white border border-slate-200 hover:border-cyan-500 rounded-2xl shadow-3xs hover:shadow-md transition cursor-pointer flex items-center justify-between group"
            >
              <div className="space-y-0.5 min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-lg border border-cyan-200">
                    {c.symbol}
                  </span>
                  <span className="font-bold text-xs text-slate-800 truncate">{c.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate">{c.category}</div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono font-bold text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                  {c.value.toExponential(4)} {c.unit}
                </span>
                <span className="text-[10px] font-bold text-cyan-600 opacity-0 group-hover:opacity-100 transition">
                  Insert →
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-10 text-slate-400 text-xs font-bold">
            No matching physical constants found.
          </div>
        )}
      </div>
    </div>
  );
};
