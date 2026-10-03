import React, { useState } from 'react';
import { AngleUnit } from '../../types/calculator';
import { Shuffle } from 'lucide-react';
import {
  Complex,
  complexAdd,
  complexArgument,
  complexConjugate,
  complexDiv,
  complexFromPolar,
  complexModulus,
  complexMul,
  complexNthRoots,
  complexPower,
  complexSub,
  complexToPolar,
  formatComplexString,
} from '../../utils/complexEngine';

interface ComplexPanelProps {
  angleUnit: AngleUnit;
  onPushHistory: (expr: string, res: string) => void;
}

export const ComplexPanel: React.FC<ComplexPanelProps> = ({ angleUnit, onPushHistory }) => {
  const [z1Re, setZ1Re] = useState<number | string>(3);
  const [z1Im, setZ1Im] = useState<number | string>(4);

  const [z2Re, setZ2Re] = useState<number | string>(1);
  const [z2Im, setZ2Im] = useState<number | string>(-2);

  const [polarR, setPolarR] = useState<number | string>(5);
  const [polarTheta, setPolarTheta] = useState<number | string>(53.13);

  const [rootN, setRootN] = useState<number | string>(3);
  const [rootsList, setRootsList] = useState<string[] | null>(null);

  const [resultText, setResultText] = useState<string | null>(null);

  const parseVal = (v: number | string): number => {
    if (typeof v === 'number') return v;
    const p = parseFloat(v);
    return isNaN(p) ? 0 : p;
  };

  const handleNumInput = (str: string, setter: (val: number | string) => void) => {
    if (str === '' || str === '-') {
      setter(str);
    } else {
      const p = parseFloat(str);
      setter(isNaN(p) ? str : p);
    }
  };

  const z1: Complex = { re: parseVal(z1Re), im: parseVal(z1Im) };
  const z2: Complex = { re: parseVal(z2Re), im: parseVal(z2Im) };

  const handleOp = (label: string, res: Complex | number) => {
    setRootsList(null);
    let str = '';
    if (typeof res === 'number') {
      str = res.toFixed(6).replace(/\.?0+$/, '');
    } else {
      const cart = formatComplexString(res);
      const pol = complexToPolar(res, angleUnit);
      str = `${cart}  ::  (${pol.r.toFixed(4)} at angle ${pol.theta.toFixed(2)} deg)`;
    }
    setResultText(str);
    onPushHistory(label, str);
  };

  const handlePolarToCart = () => {
    setRootsList(null);
    const r = parseVal(polarR);
    const theta = parseVal(polarTheta);
    const c = complexFromPolar(r, theta, angleUnit);
    const cartStr = formatComplexString(c);
    setResultText(`${r} at angle ${theta} deg  =  ${cartStr}`);
    onPushHistory(`Polar to Cart`, cartStr);
  };

  const handleComputeRoots = () => {
    setResultText(null);
    try {
      const n = Math.max(1, Math.round(parseVal(rootN)));
      const roots = complexNthRoots(z1, n);
      const formatted = roots.map((r, idx) => {
        const cart = formatComplexString(r);
        const pol = complexToPolar(r, angleUnit);
        return `z_${idx} = ${cart}  (r=${pol.r.toFixed(3)}, theta=${pol.theta.toFixed(1)} deg)`;
      });
      setRootsList(formatted);
      onPushHistory(`Roots of z1 (n=${n})`, `${roots.length} roots found`);
    } catch (err: any) {
      setRootsList([err.message]);
    }
  };

  const handleSwapComplex = () => {
    const tempRe = z1Re;
    const tempIm = z1Im;
    setZ1Re(z2Re);
    setZ1Im(z2Im);
    setZ2Re(tempRe);
    setZ2Im(tempIm);
    setResultText(null);
    setRootsList(null);
  };

  const loadComplexPreset = (preset: 'CONJUGATE' | 'IMAGINARY' | 'GOLDEN_ROOTS') => {
    setRootsList(null);
    setResultText(null);
    if (preset === 'CONJUGATE') {
      setZ1Re(3);
      setZ1Im(4);
      setZ2Re(3);
      setZ2Im(-4);
    } else if (preset === 'IMAGINARY') {
      setZ1Re(0);
      setZ1Im(1);
      setZ2Re(0);
      setZ2Im(-1);
    } else if (preset === 'GOLDEN_ROOTS') {
      setZ1Re(0.5);
      setZ1Im(0.866);
      setZ2Re(0.5);
      setZ2Im(-0.866);
    }
  };

  return (
    <div className="w-full space-y-3 bg-transparent text-slate-900">
      
      {/* Complex Number Presets Panel */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Presets:</span>
          <button
            onClick={() => loadComplexPreset('CONJUGATE')}
            className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-cyan-50 border border-slate-200 rounded font-semibold text-slate-700 hover:text-cyan-800 transition"
          >
            Conjugates (3 +/- 4i)
          </button>
          <button
            onClick={() => loadComplexPreset('IMAGINARY')}
            className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-cyan-50 border border-slate-200 rounded font-semibold text-slate-700 hover:text-cyan-800 transition"
          >
            Pure Imaginary (+/- i)
          </button>
          <button
            onClick={() => loadComplexPreset('GOLDEN_ROOTS')}
            className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-cyan-50 border border-slate-200 rounded font-semibold text-slate-700 hover:text-cyan-800 transition"
          >
            Unit Roots (0.5 +/- 0.866i)
          </button>
        </div>

        <button
          onClick={handleSwapComplex}
          className="px-2 py-1 text-[10px] bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded font-bold flex items-center gap-1 transition"
          title="Swap z1 and z2"
        >
          <Shuffle className="w-3 h-3 text-cyan-600" />
          <span>Swap z1 ↔ z2</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* z1 */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-700">
            <span>z1 = a + bi</span>
            <span className="font-mono text-slate-500">
              |z1| = {complexModulus(z1).toFixed(2)}, arg(z1) = {complexArgument(z1, angleUnit).toFixed(1)} deg
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={z1Re}
              onChange={e => handleNumInput(e.target.value, setZ1Re)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-center font-mono text-xs text-slate-900 font-bold outline-hidden focus:border-cyan-600"
              placeholder="Real a"
            />
            <span className="text-xs text-slate-400">+</span>
            <input
              type="text"
              value={z1Im}
              onChange={e => handleNumInput(e.target.value, setZ1Im)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-center font-mono text-xs text-slate-900 font-bold outline-hidden focus:border-cyan-600"
              placeholder="Imag b"
            />
            <span className="text-xs font-bold text-cyan-700">i</span>
          </div>
        </div>

        {/* z2 */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-700">
            <span>z2 = c + di</span>
            <span className="font-mono text-slate-500">
              |z2| = {complexModulus(z2).toFixed(2)}, arg(z2) = {complexArgument(z2, angleUnit).toFixed(1)} deg
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={z2Re}
              onChange={e => handleNumInput(e.target.value, setZ2Re)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-center font-mono text-xs text-slate-900 font-bold outline-hidden focus:border-cyan-600"
              placeholder="Real c"
            />
            <span className="text-xs text-slate-400">+</span>
            <input
              type="text"
              value={z2Im}
              onChange={e => handleNumInput(e.target.value, setZ2Im)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-center font-mono text-xs text-slate-900 font-bold outline-hidden focus:border-cyan-600"
              placeholder="Imag d"
            />
            <span className="text-xs font-bold text-amber-700">i</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
        <button
          onClick={() => handleOp('z1 + z2', complexAdd(z1, z2))}
          className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 transition"
        >
          z1 + z2
        </button>
        <button
          onClick={() => handleOp('z1 - z2', complexSub(z1, z2))}
          className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 transition"
        >
          z1 - z2
        </button>
        <button
          onClick={() => handleOp('z1 * z2', complexMul(z1, z2))}
          className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 transition"
        >
          z1 * z2
        </button>
        <button
          onClick={() => handleOp('z1 / z2', complexDiv(z1, z2))}
          className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 transition"
        >
          z1 / z2
        </button>
        <button
          onClick={() => handleOp('Conjugate z1*', complexConjugate(z1))}
          className="p-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-300 transition"
        >
          z1* Conjugate
        </button>
        <button
          onClick={() => handleOp('Modulus |z1|', complexModulus(z1))}
          className="p-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-300 transition"
        >
          |z1| Modulus
        </button>
        <button
          onClick={() => handleOp('z1^2 Power', complexPower(z1, 2))}
          className="p-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-300 transition"
        >
          z1^2
        </button>
        <button
          onClick={() => handleOp('z1^3 Power', complexPower(z1, 3))}
          className="p-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-300 transition"
        >
          z1^3
        </button>
      </div>

      {/* Result Display Box */}
      {resultText && (
        <div className="p-3.5 bg-cyan-50 border border-cyan-200 rounded-xl space-y-1 font-mono text-xs">
          <div className="text-[10px] uppercase font-bold text-cyan-800">Result Value:</div>
          <div className="font-bold text-cyan-950 text-sm">{resultText}</div>
        </div>
      )}

      {/* Roots and Polar Converter segment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        
        {/* Polar converter */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5">
          <span className="text-xs font-bold text-slate-700 block uppercase">Polar to Cartesian (r at angle theta)</span>
          <div className="flex items-center gap-2 font-mono">
            <input
              type="text"
              value={polarR}
              onChange={e => handleNumInput(e.target.value, setPolarR)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-center text-xs text-slate-900 font-bold"
              placeholder="r"
            />
            <span className="text-xs text-slate-400">at angle</span>
            <input
              type="text"
              value={polarTheta}
              onChange={e => handleNumInput(e.target.value, setPolarTheta)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-center text-xs text-slate-900 font-bold"
              placeholder="theta"
            />
            <span className="text-xs text-slate-500">deg</span>
          </div>
          <button
            onClick={handlePolarToCart}
            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition"
          >
            Convert to Rectangular
          </button>
        </div>

        {/* Nth Roots of z1 */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5">
          <span className="text-xs font-bold text-slate-700 block uppercase">De Moivre N-th Roots of z1</span>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-xs text-slate-400">Index n =</span>
            <input
              type="text"
              value={rootN}
              onChange={e => handleNumInput(e.target.value, setRootN)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-center text-xs text-slate-900 font-bold"
              placeholder="n"
            />
          </div>
          <button
            onClick={handleComputeRoots}
            className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition"
          >
            Calculate roots of z1
          </button>
        </div>

      </div>

      {rootsList && (
        <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl space-y-1 font-mono text-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500">De Moivre Roots:</div>
          <div className="space-y-1">
            {rootsList.map((r, idx) => (
              <div key={idx} className="text-slate-800 font-medium">
                {r}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
