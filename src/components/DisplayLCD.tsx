import React, { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import { AngleUnit, DisplayFormat } from '../types/calculator';
import { formatResult, primeFactors } from '../utils/mathCore';

interface DisplayLCDProps {
  expression: string;
  setExpression: (val: string | ((prev: string) => string)) => void;
  resultValue: number;
  resultError?: string;
  angleUnit: AngleUnit;
  displayFormat: DisplayFormat;
  toggleDisplayFormat: () => void;
  shiftActive: boolean;
  alphaActive: boolean;
  memoryM: number;
  cursorPos: number;
  setCursorPos: (pos: number) => void;
}

export const DisplayLCD: React.FC<DisplayLCDProps> = ({
  expression,
  setExpression,
  resultValue,
  resultError,
  angleUnit,
  displayFormat,
  toggleDisplayFormat,
  shiftActive,
  alphaActive,
  memoryM,
  cursorPos,
  setCursorPos,
}) => {
  const [copied, setCopied] = useState(false);
  const [useKaTeX, setUseKaTeX] = useState(true);
  const [factoredText, setFactoredText] = useState<string | null>(null);
  const katexRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert raw expression to KaTeX math format
  useEffect(() => {
    if (!useKaTeX || !katexRef.current) return;

    if (!expression) {
      katexRef.current.innerHTML = '<span class="opacity-40 font-mono text-slate-800">0</span>';
      return;
    }

    try {
      let latex = expression
        .replace(/\*/g, ' \\times ')
        .replace(/\//g, ' \\div ')
        .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
        .replace(/sqrt/g, '\\sqrt{}')
        .replace(/pi/g, '\\pi ')
        .replace(/deg/g, '^\\circ')
        .replace(/asinh\(/g, '\\sinh^{-1}(')
        .replace(/acosh\(/g, '\\cosh^{-1}(')
        .replace(/atanh\(/g, '\\tanh^{-1}(')
        .replace(/asin\(/g, '\\sin^{-1}(')
        .replace(/acos\(/g, '\\cos^{-1}(')
        .replace(/atan\(/g, '\\tan^{-1}(')
        .replace(/sinh\(/g, '\\sinh(')
        .replace(/cosh\(/g, '\\cosh(')
        .replace(/tanh\(/g, '\\tanh(')
        .replace(/sin\(/g, '\\sin(')
        .replace(/cos\(/g, '\\cos(')
        .replace(/tan\(/g, '\\tan(')
        .replace(/log\(/g, '\\log(')
        .replace(/ln\(/g, '\\ln(');

      katex.render(latex, katexRef.current, {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      if (katexRef.current) {
        katexRef.current.innerText = expression;
      }
    }
  }, [expression, useKaTeX]);

  const formattedResultStr = resultError ? resultError : formatResult(resultValue, displayFormat);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedResultStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrimeFactorize = () => {
    if (!isNaN(resultValue) && isFinite(resultValue) && Number.isInteger(resultValue) && resultValue > 1) {
      const factors = primeFactors(resultValue);
      if (factors.length === 0) {
        setFactoredText(`${resultValue} is Prime`);
      } else {
        const str = factors.map(f => (f.power > 1 ? `${f.prime}^${f.power}` : `${f.prime}`)).join(' × ');
        setFactoredText(`${resultValue} = ${str}`);
      }
      setTimeout(() => setFactoredText(null), 5000);
    }
  };

  const formatBadgeText =
    displayFormat === 'EXACT_FRACTION'
      ? 'a/b'
      : displayFormat === 'MIXED_FRACTION'
      ? 'd a/b'
      : displayFormat === 'ENGINEERING'
      ? 'ENG'
      : displayFormat === 'SCIENTIFIC'
      ? 'SCI'
      : 'DEC';

  return (
    <div className="relative rounded-xl p-3 md:p-4 border-2 border-slate-700/30 transition-all duration-300 font-mono shadow-md lcd-screen-light text-slate-950 font-bold overflow-hidden">
      {/* Top Status Indicators Bar */}
      <div className="flex items-center justify-between text-[10px] tracking-wider mb-2 border-b border-slate-800/15 pb-1 opacity-90 select-none">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="px-1.5 py-0.2 rounded bg-black/5 text-slate-900 font-black">{angleUnit}</span>
          {shiftActive && (
            <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black animate-pulse">S</span>
          )}
          {alphaActive && (
            <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white font-black animate-pulse">A</span>
          )}
          {memoryM !== 0 && (
            <span className="px-1 py-0.2 rounded font-black border bg-emerald-800/20 text-emerald-950 border-emerald-800/40">
              M
            </span>
          )}
          <span className="px-1.5 py-0.2 rounded uppercase bg-black/5 text-slate-900">{formatBadgeText}</span>
        </div>

        {/* Natural Math vs Raw Text Switcher Indicator */}
        <button
          onClick={() => setUseKaTeX(prev => !prev)}
          className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded border border-slate-700/20 bg-black/5 hover:bg-black/10 text-slate-800 transition select-none"
          title="Switch view format"
        >
          {useKaTeX ? 'Natural Math' : 'Raw Expression'}
        </button>
      </div>

      {/* Top Line: Formula Expression Input */}
      <div className="min-h-[36px] flex items-center justify-between overflow-x-auto py-1">
        {useKaTeX ? (
          <div ref={katexRef} className="text-xs sm:text-sm md:text-base tracking-wide font-mono overflow-x-auto whitespace-nowrap" />
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={expression}
            onChange={e => {
              setExpression(e.target.value);
              setCursorPos(e.target.selectionStart || e.target.value.length);
            }}
            onClick={e => setCursorPos((e.target as HTMLInputElement).selectionStart || 0)}
            className="w-full bg-transparent text-xs sm:text-sm md:text-base font-mono outline-hidden tracking-wider text-slate-950"
            placeholder="0"
          />
        )}
      </div>

      {/* Bottom Line: Pristine Computed Result - 100% Horizontal Space for 20+ digits */}
      <div className="mt-2 pt-2 border-t border-slate-800/15 flex items-center justify-between">
        <div 
          onClick={toggleDisplayFormat}
          onDoubleClick={handleCopy}
          className="w-full group relative cursor-pointer select-all"
          title="Tap to cycle display formatting (S-D) | Double-Tap to Copy"
        >
          {copied ? (
            <div className="text-[11px] sm:text-xs font-black text-emerald-800 animate-pulse font-mono py-1">
              ✓ Result Copied to Clipboard
            </div>
          ) : factoredText ? (
            <div className="text-[11px] sm:text-xs md:text-sm font-semibold animate-fade-in font-mono text-amber-950">
              {factoredText}
            </div>
          ) : (
            <div className="flex flex-col w-full text-right">
              <div className={`text-base sm:text-lg md:text-2xl font-bold tracking-normal font-lcd overflow-x-auto whitespace-nowrap text-right ${
                resultError ? 'text-rose-700' : 'text-slate-950'
              }`}>
                {formattedResultStr}
              </div>
              {/* Subtle hover instructions */}
              <div className="hidden group-hover:block text-[9px] text-slate-600 font-mono text-right animate-fade-in select-none">
                Tap to Toggle Formats (S-D) • Double-Tap to Copy
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
