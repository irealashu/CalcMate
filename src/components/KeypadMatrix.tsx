import React, { useEffect } from 'react';
import { Delete, RotateCcw } from 'lucide-react';
import { MemoryRegisterKey, MemoryRegisters } from '../types/calculator';

interface KeypadMatrixProps {
  onKeyPress: (key: string) => void;
  onClear: () => void;
  onDelete: () => void;
  onEvaluate: () => void;
  shiftActive: boolean;
  setShiftActive: (val: boolean | ((prev: boolean) => boolean)) => void;
  alphaActive: boolean;
  setAlphaActive: (val: boolean | ((prev: boolean) => boolean)) => void;
  onStoreVariable: (regKey: MemoryRegisterKey) => void;
  registers: MemoryRegisters;
}

function triggerHaptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(12);
    } catch {
      // Ignore
    }
  }
}

export const KeypadMatrix: React.FC<KeypadMatrixProps> = ({
  onKeyPress,
  onClear,
  onDelete,
  onEvaluate,
  shiftActive,
  setShiftActive,
  alphaActive,
  setAlphaActive,
}) => {
  const handleBtnClick = (action: () => void, freq = 600) => {
    triggerHaptic();
    action();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleBtnClick(() => onKeyPress(e.key), 700);
      } else if (e.key === '.') {
        handleBtnClick(() => onKeyPress('.'), 700);
      } else if (e.key === '+') {
        handleBtnClick(() => onKeyPress('+'), 500);
      } else if (e.key === '-') {
        handleBtnClick(() => onKeyPress('-'), 500);
      } else if (e.key === '*') {
        handleBtnClick(() => onKeyPress('×'), 500);
      } else if (e.key === '/') {
        e.preventDefault();
        handleBtnClick(() => onKeyPress('÷'), 500);
      } else if (e.key === '^') {
        handleBtnClick(() => onKeyPress('^'), 650);
      } else if (e.key === '(' || e.key === ')') {
        handleBtnClick(() => onKeyPress(e.key), 650);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleBtnClick(() => onEvaluate(), 800);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBtnClick(() => onDelete(), 400);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleBtnClick(() => onClear(), 350);
      } else if (e.key === 's') {
        handleBtnClick(() => onKeyPress('sin('), 650);
      } else if (e.key === 'S') {
        handleBtnClick(() => onKeyPress('asin('), 650);
      } else if (e.key === 'c') {
        handleBtnClick(() => onKeyPress('cos('), 650);
      } else if (e.key === 'C') {
        handleBtnClick(() => onKeyPress('acos('), 650);
      } else if (e.key === 't') {
        handleBtnClick(() => onKeyPress('tan('), 650);
      } else if (e.key === 'T') {
        handleBtnClick(() => onKeyPress('atan('), 650);
      } else if (e.key === 'l' || e.key === 'L') {
        handleBtnClick(() => onKeyPress('log('), 650);
      } else if (e.key === 'n' || e.key === 'N') {
        handleBtnClick(() => onKeyPress('ln('), 650);
      } else if (e.key === 'p' || e.key === 'P') {
        handleBtnClick(() => onKeyPress('pi'), 650);
      } else if (e.key === 'q' || e.key === 'Q') {
        handleBtnClick(() => onKeyPress('sqrt('), 650);
      } else if (e.key === 'x' || e.key === 'X') {
        handleBtnClick(() => onKeyPress('X'), 650);
      } else if (e.key === 'y' || e.key === 'Y') {
        handleBtnClick(() => onKeyPress('Y'), 650);
      } else if (e.key === 'm' || e.key === 'M') {
        handleBtnClick(() => onKeyPress('M'), 650);
      } else if (e.key === 'e' || e.key === 'E') {
        handleBtnClick(() => onKeyPress('*10^'), 650);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress, onDelete, onClear, onEvaluate]);

  const numKeyClass = 'bg-slate-100 hover:bg-white text-slate-900 border-slate-300 shadow-2xs font-bold';
  const funcKeyClass = 'bg-slate-200/80 hover:bg-slate-300 text-slate-800 border-slate-300/80 shadow-2xs font-semibold';
  const cyanFuncClass = 'bg-cyan-50 hover:bg-cyan-100 text-cyan-950 border-cyan-300 font-bold';
  const opKeyClass = 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-lcd text-xl font-black border-amber-400 shadow-xs';

  return (
    <div className="rounded-2xl p-3 md:p-5 border border-slate-200 bg-white shadow-xl space-y-2.5 select-none transition-colors">
      {/* Row 1: SHIFT, ALPHA, (, ), ÷R */}
      <div className="grid grid-cols-5 gap-1.5 md:gap-2">
        <button
          onClick={() => handleBtnClick(() => setShiftActive(prev => !prev), 900)}
          className={`physical-key py-2 rounded-lg text-xs font-black border transition flex items-center justify-center ${
            shiftActive
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
          }`}
        >
          <span className="tracking-wider">SHIFT</span>
        </button>

        <button
          onClick={() => handleBtnClick(() => setAlphaActive(prev => !prev), 900)}
          className={`physical-key py-2 rounded-lg text-xs font-black border transition flex items-center justify-center ${
            alphaActive
              ? 'bg-rose-600 text-white border-rose-400 shadow-md'
              : 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200'
          }`}
        >
          <span className="tracking-wider">ALPHA</span>
        </button>

        <button
          onClick={() => handleBtnClick(() => onKeyPress('('), 650)}
          className={`physical-key py-2 rounded-lg text-xs font-bold font-mono border ${funcKeyClass}`}
        >
          (
        </button>

        <button
          onClick={() => handleBtnClick(() => onKeyPress(')'), 650)}
          className={`physical-key py-2 rounded-lg text-xs font-bold font-mono border ${funcKeyClass}`}
        >
          )
        </button>

        <button
          onClick={() => handleBtnClick(() => onKeyPress('÷R'), 650)}
          className="physical-key py-2 rounded-lg font-bold text-xs border bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
          title="Remainder Division"
        >
          ÷R
        </button>
      </div>

      {/* Row 2: Trig Functions */}
      <div className="grid grid-cols-5 gap-1.5 md:gap-2">
        <button
          onClick={() => handleBtnClick(() => onKeyPress(shiftActive && alphaActive ? 'asinh(' : shiftActive ? 'asin(' : alphaActive ? 'sinh(' : 'sin('), 650)}
          className={`physical-key py-2.5 rounded-lg text-xs font-bold border relative ${cyanFuncClass}`}
        >
          <span className="text-[9px] text-amber-700 font-mono absolute top-0.5 left-1">
            {shiftActive ? 'sin⁻¹' : ''}
          </span>
          <span className="text-[9px] text-rose-700 font-mono absolute top-0.5 right-1">
            {alphaActive ? 'sinh' : ''}
          </span>
          <span>sin</span>
        </button>

        <button
          onClick={() => handleBtnClick(() => onKeyPress(shiftActive && alphaActive ? 'acosh(' : shiftActive ? 'acos(' : alphaActive ? 'cosh(' : 'cos('), 650)}
          className={`physical-key py-2.5 rounded-lg text-xs font-bold border relative ${cyanFuncClass}`}
        >
          <span className="text-[9px] text-amber-700 font-mono absolute top-0.5 left-1">
            {shiftActive ? 'cos⁻¹' : ''}
          </span>
          <span className="text-[9px] text-rose-700 font-mono absolute top-0.5 right-1">
            {alphaActive ? 'cosh' : ''}
          </span>
          <span>cos</span>
        </button>

        <button
          onClick={() => handleBtnClick(() => onKeyPress(shiftActive && alphaActive ? 'atanh(' : shiftActive ? 'atan(' : alphaActive ? 'tanh(' : 'tan('), 650)}
          className={`physical-key py-2.5 rounded-lg text-xs font-bold border relative ${cyanFuncClass}`}
        >
          <span className="text-[9px] text-amber-700 font-mono absolute top-0.5 left-1">
            {shiftActive ? 'tan⁻¹' : ''}
          </span>
          <span className="text-[9px] text-rose-700 font-mono absolute top-0.5 right-1">
            {alphaActive ? 'tanh' : ''}
          </span>
          <span>tan</span>
        </button>

        <button
          onClick={() => handleBtnClick(() => onKeyPress(shiftActive ? '10^(' : 'log('), 650)}
          className={`physical-key py-2.5 rounded-lg text-xs font-bold border relative ${cyanFuncClass}`}
        >
          <span className="text-[9px] text-amber-700 font-mono absolute top-0.5 left-1">
            {shiftActive ? '10ˣ' : ''}
          </span>
          <span>log</span>
        </button>

        <button
          onClick={() => handleBtnClick(() => onKeyPress(shiftActive ? 'e^(' : 'ln('), 650)}
          className={`physical-key py-2.5 rounded-lg text-xs font-bold border relative ${cyanFuncClass}`}
        >
          <span className="text-[9px] text-amber-700 font-mono absolute top-0.5 left-1">
            {shiftActive ? 'eˣ' : ''}
          </span>
          <span>ln</span>
        </button>
      </div>

      {/* Row 3: Powers & Roots / Factorials */}
      <div className="grid grid-cols-5 gap-1.5 md:gap-2">
        <button
          onClick={() => handleBtnClick(() => onKeyPress('^2'), 650)}
          className={`physical-key py-2 rounded-lg text-xs font-mono font-bold border ${funcKeyClass}`}
        >
          x²
        </button>

        <button
          onClick={() => handleBtnClick(() => onKeyPress('^3'), 650)}
          className={`physical-key py-2 rounded-lg text-xs font-mono font-bold border ${funcKeyClass}`}
        >
          x³
        </button>

        <button
          onClick={() => handleBtnClick(() => onKeyPress('^'), 650)}
          className={`physical-key py-2 rounded-lg text-xs font-mono font-bold border ${funcKeyClass}`}
        >
          xʸ
        </button>

        <button
          onClick={() => handleBtnClick(() => onKeyPress(shiftActive ? 'cbrt(' : 'sqrt('), 650)}
          className={`physical-key py-2 rounded-lg text-xs font-bold border ${funcKeyClass}`}
        >
          {shiftActive ? '∛x' : '√x'}
        </button>

        <button
          onClick={() => handleBtnClick(() => onKeyPress(shiftActive ? '!' : '^(-1)'), 650)}
          className={`physical-key py-2 rounded-lg text-xs font-mono font-bold border ${funcKeyClass}`}
        >
          {shiftActive ? 'n!' : 'x⁻¹'}
        </button>
      </div>

      {/* Row 4: Number Theory / Combinatorics */}
      <div className="grid grid-cols-5 gap-1.5 md:gap-2">
        <button
          onClick={() => handleBtnClick(() => onKeyPress(shiftActive ? 'gcd(' : alphaActive ? 'A' : 'nCr('), 650)}
          className={`physical-key py-2 rounded-lg text-xs font-bold border relative ${funcKeyClass}`}
        >
          <span className="text-[9px] text-amber-700 font-mono absolute top-0.5 left-1">
            {shiftActive ? 'gcd' : ''}
          </span>
          <span className="text-[9px] text-rose-700 font-mono absolute top-0.5 right-1">
            {alphaActive ? 'A' : ''}
          </span>
          <span>nCr</span>
        </button>

        <button
          onClick={() => handleBtnClick(() => onKeyPress(shiftActive ? 'lcm(' : alphaActive ? 'B' : 'nPr('), 650)}
          className={`physical-key py-2 rounded-lg text-xs font-bold border relative ${funcKeyClass}`}
        >
          <span className="text-[9px] text-amber-700 font-mono absolute top-0.5 left-1">
            {shiftActive ? 'lcm' : ''}
          </span>
          <span className="text-[9px] text-rose-700 font-mono absolute top-0.5 right-1">
            {alphaActive ? 'B' : ''}
          </span>
          <span>nPr</span>
        </button>

        <button
          onClick={() => handleBtnClick(() => onKeyPress(alphaActive ? 'C' : 'abs('), 650)}
          className={`physical-key py-2 rounded-lg text-xs font-bold border relative ${funcKeyClass}`}
        >
          <span className="text-[9px] text-rose-700 font-mono absolute top-0.5 right-1">
            {alphaActive ? 'C' : ''}
          </span>
          <span>|x|</span>
        </button>

        <button
          onClick={() => handleBtnClick(() => onKeyPress(alphaActive ? 'D' : 'pi'), 650)}
          className={`physical-key py-2 rounded-lg text-xs font-mono font-bold border relative ${funcKeyClass}`}
        >
          <span className="text-[9px] text-rose-700 font-mono absolute top-0.5 right-1">
            {alphaActive ? 'D' : ''}
          </span>
          <span>π</span>
        </button>

        <button
          onClick={() => handleBtnClick(() => onKeyPress(alphaActive ? 'E' : 'e'), 650)}
          className={`physical-key py-2 rounded-lg text-xs font-mono font-bold border relative ${funcKeyClass}`}
        >
          <span className="text-[9px] text-rose-700 font-mono absolute top-0.5 right-1">
            {alphaActive ? 'E' : ''}
          </span>
          <span>e</span>
        </button>
      </div>

      {/* Main Numpad & Operations: (7, 8, 9, DEL, AC) */}
      <div className="grid grid-cols-5 gap-1.5 md:gap-2 pt-1">
        <button
          onClick={() => handleBtnClick(() => onKeyPress('7'), 700)}
          className={`physical-key py-3 rounded-xl font-lcd text-xl md:text-2xl font-bold border ${numKeyClass}`}
        >
          7
        </button>
        <button
          onClick={() => handleBtnClick(() => onKeyPress('8'), 700)}
          className={`physical-key py-3 rounded-xl font-lcd text-xl md:text-2xl font-bold border ${numKeyClass}`}
        >
          8
        </button>
        <button
          onClick={() => handleBtnClick(() => onKeyPress('9'), 700)}
          className={`physical-key py-3 rounded-xl font-lcd text-xl md:text-2xl font-bold border ${numKeyClass}`}
        >
          9
        </button>
        <button
          onClick={() => handleBtnClick(() => onDelete(), 400)}
          className="physical-key py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs md:text-sm border border-rose-500 shadow-xs flex items-center justify-center gap-1"
        >
          <Delete className="w-4 h-4" />
          <span>DEL</span>
        </button>
        <button
          onClick={() => handleBtnClick(() => onClear(), 350)}
          className="physical-key py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs md:text-sm border border-red-500 shadow-xs flex items-center justify-center gap-1"
        >
          <RotateCcw className="w-4 h-4" />
          <span>AC</span>
        </button>
      </div>

      {/* Row 6: (4, 5, 6, ×, ÷) */}
      <div className="grid grid-cols-5 gap-1.5 md:gap-2">
        <button
          onClick={() => handleBtnClick(() => onKeyPress('4'), 700)}
          className={`physical-key py-3 rounded-xl font-lcd text-xl md:text-2xl font-bold border ${numKeyClass}`}
        >
          4
        </button>
        <button
          onClick={() => handleBtnClick(() => onKeyPress('5'), 700)}
          className={`physical-key py-3 rounded-xl font-lcd text-xl md:text-2xl font-bold border ${numKeyClass}`}
        >
          5
        </button>
        <button
          onClick={() => handleBtnClick(() => onKeyPress('6'), 700)}
          className={`physical-key py-3 rounded-xl font-lcd text-xl md:text-2xl font-bold border ${numKeyClass}`}
        >
          6
        </button>
        <button
          onClick={() => handleBtnClick(() => onKeyPress('×'), 500)}
          className={`physical-key py-3 rounded-xl ${opKeyClass}`}
        >
          ×
        </button>
        <button
          onClick={() => handleBtnClick(() => onKeyPress('÷'), 500)}
          className={`physical-key py-3 rounded-xl ${opKeyClass}`}
        >
          ÷
        </button>
      </div>

      {/* Row 7: (1, 2, 3, +, -) */}
      <div className="grid grid-cols-5 gap-1.5 md:gap-2">
        <button
          onClick={() => handleBtnClick(() => onKeyPress('1'), 700)}
          className={`physical-key py-3 rounded-xl font-lcd text-xl md:text-2xl font-bold border ${numKeyClass}`}
        >
          1
        </button>
        <button
          onClick={() => handleBtnClick(() => onKeyPress('2'), 700)}
          className={`physical-key py-3 rounded-xl font-lcd text-xl md:text-2xl font-bold border ${numKeyClass}`}
        >
          2
        </button>
        <button
          onClick={() => handleBtnClick(() => onKeyPress('3'), 700)}
          className={`physical-key py-3 rounded-xl font-lcd text-xl md:text-2xl font-bold border ${numKeyClass}`}
        >
          3
        </button>
        <button
          onClick={() => handleBtnClick(() => onKeyPress('+'), 500)}
          className={`physical-key py-3 rounded-xl ${opKeyClass}`}
        >
          +
        </button>
        <button
          onClick={() => handleBtnClick(() => onKeyPress('-'), 500)}
          className={`physical-key py-3 rounded-xl ${opKeyClass}`}
        >
          −
        </button>
      </div>

      {/* Row 8: (0, ., ×10ˣ, col-span-2 equals) */}
      <div className="grid grid-cols-5 gap-1.5 md:gap-2">
        <button
          onClick={() => handleBtnClick(() => onKeyPress('0'), 700)}
          className={`physical-key py-3 rounded-xl font-lcd text-xl md:text-2xl font-bold border ${numKeyClass}`}
        >
          0
        </button>
        <button
          onClick={() => handleBtnClick(() => onKeyPress('.'), 700)}
          className={`physical-key py-3 rounded-xl font-lcd text-xl md:text-2xl font-bold border ${numKeyClass}`}
        >
          .
        </button>
        <button
          onClick={() => handleBtnClick(() => onKeyPress('*10^'), 650)}
          className={`physical-key py-3 rounded-xl font-mono text-xs md:text-sm font-extrabold border ${funcKeyClass}`}
        >
          ×10ˣ
        </button>
        <button
          onClick={() => handleBtnClick(() => onEvaluate(), 800)}
          className="col-span-2 physical-key py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-lcd text-2xl font-black border border-cyan-400 shadow-md shadow-cyan-600/30"
        >
          =
        </button>
      </div>
    </div>
  );
};
