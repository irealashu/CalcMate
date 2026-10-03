import React, { useState } from 'react';
import { ArrowRightLeft, Copy, Check } from 'lucide-react';
import { UNIT_CATEGORIES } from '../../utils/constantsAndUnits';

interface ConverterPanelProps {
  onInsertConstant: (val: number) => void;
}

export const ConverterPanel: React.FC<ConverterPanelProps> = ({ onInsertConstant }) => {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [fromUnitIndex, setFromUnitIndex] = useState(0);
  const [toUnitIndex, setToUnitIndex] = useState(1);
  const [inputValue, setInputValue] = useState<number | string>(1);
  const [precision, setPrecision] = useState<number>(6);
  const [converterCopied, setConverterCopied] = useState<boolean>(false);

  const currentCategory = UNIT_CATEGORIES[categoryIndex];
  const fromUnit = currentCategory.units[fromUnitIndex] || currentCategory.units[0];
  const toUnit = currentCategory.units[toUnitIndex] || currentCategory.units[1];

  const parsedInputVal = parseFloat(String(inputValue)) || 0;
  const baseValue = fromUnit.toBase(parsedInputVal);
  const convertedValue = toUnit.fromBase(baseValue);

  const formatOutput = (val: number) => {
    if (isNaN(val)) return '0';
    if (Math.abs(val) === 0) return '0';
    if (Math.abs(val) < 1e-4 || Math.abs(val) >= 1e7) {
      return val.toExponential(precision);
    }
    return val.toFixed(precision).replace(/\.?0+$/, '');
  };

  const swapUnits = () => {
    const temp = fromUnitIndex;
    setFromUnitIndex(toUnitIndex);
    setToUnitIndex(temp);
  };

  const handleCopyConverted = () => {
    const strVal = formatOutput(convertedValue);
    navigator.clipboard.writeText(strVal);
    setConverterCopied(true);
    setTimeout(() => setConverterCopied(false), 2000);
  };

  const PRESET_VALUES = [1, 5, 10, 50, 100, 1000];
  const PRECISION_OPTIONS = [2, 4, 6, 8, 10, 12];

  return (
    <div className="w-full space-y-4 bg-transparent text-slate-900">
      {/* Category Selector Bar (Uniform buttons) */}
      <div className="space-y-2">
        <div className="flex bg-slate-200 p-1 rounded-2xl border border-slate-300 text-xs overflow-x-auto gap-1 shadow-3xs scrollbar-none">
          {UNIT_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.name}
              onClick={() => {
                setCategoryIndex(idx);
                setFromUnitIndex(0);
                setToUnitIndex(1);
              }}
              className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap text-center transition-all duration-150 ${
                categoryIndex === idx
                  ? 'bg-cyan-600 text-white font-black shadow-md'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-300/60'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Core Converter Card */}
      <div className="p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl space-y-5 shadow-xs relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* FROM Unit Block */}
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs text-slate-400 font-black uppercase tracking-wider block">
              From (Source Quantity):
            </label>
            <div className="flex gap-2.5">
              <input
                type="text"
                value={inputValue}
                onChange={e => {
                  const str = e.target.value;
                  if (str === '' || str === '-') {
                    setInputValue(str);
                  } else {
                    const parsed = parseFloat(str);
                    setInputValue(isNaN(parsed) ? str : parsed);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm md:text-base font-mono text-cyan-900 font-bold outline-hidden focus:border-cyan-600 focus:bg-white transition-all shadow-3xs"
              />
              <select
                value={fromUnitIndex}
                onChange={e => setFromUnitIndex(Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-3 text-xs md:text-sm font-black text-slate-800 outline-hidden focus:border-cyan-600 shadow-3xs shrink-0 max-w-[150px]"
              >
                {currentCategory.units.map((u, idx) => (
                  <option key={u.name} value={idx}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={swapUnits}
            className="p-3 rounded-2xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 text-cyan-800 transition active:scale-95 shadow-3xs shrink-0 self-center lg:self-end mb-1"
            title="Swap Units"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>

          {/* TO Unit Block */}
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs text-slate-400 font-black uppercase tracking-wider block">
              To (Converted Output):
            </label>
            <div className="flex gap-2.5">
              <div className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm md:text-base font-mono text-emerald-800 font-bold flex items-center justify-between shadow-3xs select-all">
                <span>{formatOutput(convertedValue)}</span>
                <button
                  onClick={handleCopyConverted}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition"
                  title="Copy Result"
                >
                  {converterCopied ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <select
                value={toUnitIndex}
                onChange={e => setToUnitIndex(Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-3 text-xs md:text-sm font-black text-slate-800 outline-hidden focus:border-cyan-600 shadow-3xs shrink-0 max-w-[150px]"
              >
                {currentCategory.units.map((u, idx) => (
                  <option key={u.name} value={idx}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Quick Preset Values:</span>
          <div className="flex flex-wrap gap-2">
            {PRESET_VALUES.map(val => (
              <button
                key={val}
                onClick={() => setInputValue(val)}
                className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold transition ${
                  inputValue === val
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Precision Selector & Insert Action */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Decimals:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-300">
              {PRECISION_OPTIONS.map(p => (
                <button
                  key={p}
                  onClick={() => setPrecision(p)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    precision === p ? 'bg-cyan-600 text-white shadow-3xs' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {p}d
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onInsertConstant(convertedValue)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-black shadow-xs transition active:scale-95"
          >
            Insert Result into Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
