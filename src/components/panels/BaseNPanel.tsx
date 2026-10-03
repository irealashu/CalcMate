import React, { useState } from 'react';
import { BaseNType, WordSize } from '../../types/calculator';
import {
  BitwiseOp,
  executeBitwise,
  formatBaseN,
  parseBaseNInput,
  toggleBit,
  textToHexASCII,
  hexASCIIToText,
} from '../../utils/baseNEngine';

interface BaseNPanelProps {
  onPushHistory: (expr: string, res: string) => void;
}

export const BaseNPanel: React.FC<BaseNPanelProps> = ({ onPushHistory }) => {
  const [activeBase, setActiveBase] = useState<BaseNType>('DEC');
  const [wordBits, setWordBits] = useState<WordSize>(32);
  const [isSigned, setIsSigned] = useState(false);

  const [valueBig, setValueBig] = useState<bigint>(255n);
  const [operandBig, setOperandBig] = useState<bigint>(15n);
  const [operandInputStr, setOperandInputStr] = useState('15');

  const [rawInputStr, setRawInputStr] = useState('255');

  // ASCII Inspector State
  const [asciiText, setAsciiText] = useState('CALC');
  const [asciiHex, setAsciiHex] = useState('43 41 4C 43');

  const handleInputChange = (str: string) => {
    setRawInputStr(str);
    const parsed = parseBaseNInput(str, activeBase, wordBits);
    setValueBig(parsed);
  };

  const handleBaseChange = (base: BaseNType) => {
    setActiveBase(base);
    setRawInputStr(formatBaseN(valueBig, base, wordBits, isSigned));
  };

  const handleBitToggle = (bitIdx: number) => {
    const updated = toggleBit(valueBig, bitIdx, wordBits);
    setValueBig(updated);
    setRawInputStr(formatBaseN(updated, activeBase, wordBits, isSigned));
  };

  const handleOp = (op: BitwiseOp) => {
    const res = executeBitwise(valueBig, operandBig, op, wordBits);
    setValueBig(res);
    setRawInputStr(formatBaseN(res, activeBase, wordBits, isSigned));
    onPushHistory(`${op}`, formatBaseN(res, activeBase, wordBits, isSigned));
  };

  const hexVal = formatBaseN(valueBig, 'HEX', wordBits, isSigned);
  const decVal = formatBaseN(valueBig, 'DEC', wordBits, isSigned);
  const octVal = formatBaseN(valueBig, 'OCT', wordBits, isSigned);
  const binVal = formatBaseN(valueBig, 'BIN', wordBits, isSigned);

  const bitsArray = Array.from({ length: wordBits }, (_, i) => wordBits - 1 - i);

  return (
    <div className="w-full space-y-3 bg-transparent text-slate-900">
      {/* Settings Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          {/* Word Size */}
          <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded border border-slate-300 text-xs">
            {([8, 16, 32, 64] as WordSize[]).map(b => (
              <button
                key={b}
                onClick={() => {
                  setWordBits(b);
                  setRawInputStr(formatBaseN(valueBig, activeBase, b, isSigned));
                }}
                className={`px-2 py-0.5 rounded font-mono ${wordBits === b ? 'bg-cyan-600 text-white font-bold' : 'text-slate-700'}`}
              >
                {b}-Bit
              </button>
            ))}
          </div>

          {/* Signed / Unsigned Toggle */}
          <button
            onClick={() => {
              setIsSigned(prev => !prev);
              setRawInputStr(formatBaseN(valueBig, activeBase, wordBits, !isSigned));
            }}
            className={`px-2.5 py-1 rounded text-xs font-semibold border transition ${
              isSigned ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' : 'bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            {isSigned ? 'Signed (2s Comp)' : 'Unsigned'}
          </button>
        </div>
      </div>

      {/* Synchronized Base Representations Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
        <div
          onClick={() => handleBaseChange('HEX')}
          className={`p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
            activeBase === 'HEX' ? 'bg-cyan-50 border-cyan-400 shadow-2xs' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
            <span>HEX</span>
            {activeBase === 'HEX' && <span className="text-[9px] text-cyan-600 bg-cyan-100/80 px-1.5 py-0.5 rounded font-bold">Active</span>}
          </div>
          <div className="font-mono text-xs md:text-sm font-bold tracking-wider select-all break-all text-slate-800 leading-relaxed">
            {hexVal}
          </div>
        </div>

        <div
          onClick={() => handleBaseChange('DEC')}
          className={`p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
            activeBase === 'DEC' ? 'bg-cyan-50 border-cyan-400 shadow-2xs' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
            <span>DEC</span>
            {activeBase === 'DEC' && <span className="text-[9px] text-cyan-600 bg-cyan-100/80 px-1.5 py-0.5 rounded font-bold">Active</span>}
          </div>
          <div className="font-mono text-xs md:text-sm font-bold tracking-wider select-all break-all text-slate-800 leading-relaxed">
            {decVal}
          </div>
        </div>

        <div
          onClick={() => handleBaseChange('OCT')}
          className={`p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
            activeBase === 'OCT' ? 'bg-cyan-50 border-cyan-400 shadow-2xs' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
            <span>OCT</span>
            {activeBase === 'OCT' && <span className="text-[9px] text-cyan-600 bg-cyan-100/80 px-1.5 py-0.5 rounded font-bold">Active</span>}
          </div>
          <div className="font-mono text-xs md:text-sm font-bold tracking-wider select-all break-all text-slate-800 leading-relaxed">
            {octVal}
          </div>
        </div>

        <div
          onClick={() => handleBaseChange('BIN')}
          className={`p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
            activeBase === 'BIN' ? 'bg-cyan-50 border-cyan-400 shadow-2xs' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
            <span>BIN</span>
            {activeBase === 'BIN' && <span className="text-[9px] text-cyan-600 bg-cyan-100/80 px-1.5 py-0.5 rounded font-bold">Active</span>}
          </div>
          <div className="font-mono text-[11px] md:text-xs font-semibold tracking-wider select-all break-all text-slate-800 leading-relaxed">
            {binVal}
          </div>
        </div>
      </div>

      {/* Input box */}
      <div>
        <label className="text-xs text-slate-600 block mb-1 font-semibold">
          Active Input ({activeBase}):
        </label>
        <input
          type="text"
          value={rawInputStr}
          onChange={e => handleInputChange(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-base text-slate-900 font-bold outline-hidden focus:border-cyan-600 tracking-wider"
        />
      </div>

      {/* Interactive Bit Toggle Grid */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>Interactive Bit Toggle Grid ({wordBits} Bits)</span>
          <span>Click any bit to flip 0 ↔ 1</span>
        </div>

        <div className="grid grid-cols-8 gap-1.5 font-mono text-center text-xs">
          {bitsArray.map(bitIdx => {
            const isSet = (valueBig & (1n << BigInt(bitIdx))) !== 0n;
            return (
              <button
                key={bitIdx}
                onClick={() => handleBitToggle(bitIdx)}
                className={`py-1.5 rounded-md border flex flex-col items-center justify-center transition ${
                  isSet
                    ? 'bg-cyan-600 text-white border-cyan-600 font-bold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <span className="text-[9px] opacity-70">{bitIdx}</span>
                <span className="text-sm font-bold">{isSet ? '1' : '0'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bitwise & Base-N Arithmetic Operations */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-semibold">Second Operand (B):</span>
          <input
            type="text"
            value={operandInputStr}
            onChange={e => {
              const strVal = e.target.value;
              setOperandInputStr(strVal);
              if (strVal === '' || strVal === '-') {
                setOperandBig(0n);
              } else {
                try {
                  const p = BigInt(strVal);
                  setOperandBig(p);
                } catch {
                  // Fallback for partially typed or scientific numbers
                  const parsedFloat = parseFloat(strVal);
                  setOperandBig(isNaN(parsedFloat) ? 0n : BigInt(Math.round(parsedFloat)));
                }
              }
            }}
            className="w-32 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono text-slate-900 font-bold"
          />
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-xs font-bold font-mono">
          {(['ADD', 'SUB', 'MUL', 'AND', 'OR', 'XOR', 'NOT', 'SHL', 'SHR', 'ASR', 'ROL', 'ROR'] as BitwiseOp[]).map(op => (
            <button
              key={op}
              onClick={() => handleOp(op)}
              className="py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg border border-slate-300 transition"
            >
              {op}
            </button>
          ))}
        </div>
      </div>

      {/* ASCII String Inspector */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
        <div className="text-xs font-bold text-slate-700">ASCII / Hex Text Inspector</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
          <div>
            <label className="text-[11px] text-slate-500 block mb-0.5">Text String:</label>
            <input
              type="text"
              value={asciiText}
              onChange={e => {
                const val = e.target.value;
                setAsciiText(val);
                setAsciiHex(textToHexASCII(val));
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 font-bold outline-hidden"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-500 block mb-0.5">ASCII Hex Code:</label>
            <input
              type="text"
              value={asciiHex}
              onChange={e => {
                const val = e.target.value;
                setAsciiHex(val);
                setAsciiText(hexASCIIToText(val));
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 font-bold outline-hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
