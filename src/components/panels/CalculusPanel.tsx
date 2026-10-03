import React, { useState } from 'react';
import { AngleUnit, CalcAppTheme, MemoryRegisters } from '../../types/calculator';
import {
  numericalDerivative,
  numericalSecondDerivative,
  numericalIntegral,
  numericalLimit,
  numericalProduct,
  numericalSummation,
  solveNewtonRaphson,
  parseNumericOrInfinity,
  NewtonStep,
} from '../../utils/calculusEngine';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface CalculusPanelProps {
  angleUnit: AngleUnit;
  registers: MemoryRegisters;
  onPushHistory: (expr: string, res: string) => void;
  appTheme?: CalcAppTheme;
}

export const CalculusPanel: React.FC<CalculusPanelProps> = ({
  angleUnit,
  registers,
  onPushHistory,
  appTheme = 'DAY',
}) => {
  const [subTab, setSubTab] = useState<'DERIVATIVE' | 'INTEGRAL' | 'LIMIT' | 'SUM_PROD' | 'SOLVER'>('DERIVATIVE');

  // Derivative state
  const [derivExpr, setDerivExpr] = useState('x^3 - 2*x + 5');
  const [derivPoint, setDerivPoint] = useState('2');
  const [derivOrder, setDerivOrder] = useState<'1ST' | '2ND'>('1ST');
  const [derivResult, setDerivResult] = useState<string | null>(null);

  // Integral state
  const [integExpr, setIntegExpr] = useState('sin(x)');
  const [integA, setIntegA] = useState('0');
  const [integB, setIntegB] = useState('pi');
  const [integResult, setIntegResult] = useState<string | null>(null);

  // Limit state
  const [limitExpr, setLimitExpr] = useState('sin(x)/x');
  const [limitPoint, setLimitPoint] = useState('0');
  const [limitResult, setLimitResult] = useState<{ leftLimit: number; rightLimit: number; limit: number | null; exists: boolean } | null>(null);

  // Sum & Prod state
  const [seqExpr, setSeqExpr] = useState('x^2');
  const [seqA, setSeqA] = useState('1');
  const [seqB, setSeqB] = useState('10');
  const [seqMode, setSeqMode] = useState<'SUM' | 'PROD'>('SUM');
  const [seqResult, setSeqResult] = useState<string | null>(null);

  // Solver state
  const [solveLHS, setSolveLHS] = useState('x^3 - x - 2');
  const [solveRHS, setSolveRHS] = useState('0');
  const [solveX0, setSolveX0] = useState('1.5');
  const [solveResult, setSolveResult] = useState<{ root: number; iterations: number; converged: boolean; steps: NewtonStep[] } | null>(null);

  const handleComputeDeriv = () => {
    try {
      const a = parseNumericOrInfinity(derivPoint);
      if (derivOrder === '1ST') {
        const val = numericalDerivative(derivExpr, a, angleUnit, registers);
        const resStr = val.toFixed(8).replace(/\.?0+$/, '');
        setDerivResult(resStr);
        onPushHistory(`d/dx (${derivExpr}) |_{x=${derivPoint}}`, resStr);
      } else {
        const val = numericalSecondDerivative(derivExpr, a, angleUnit, registers);
        const resStr = val.toFixed(8).replace(/\.?0+$/, '');
        setDerivResult(resStr);
        onPushHistory(`d²/dx² (${derivExpr}) |_{x=${derivPoint}}`, resStr);
      }
    } catch (err: any) {
      setDerivResult('Error: ' + err.message);
    }
  };

  const handleComputeInteg = () => {
    try {
      const a = parseNumericOrInfinity(integA);
      const b = parseNumericOrInfinity(integB);
      const val = numericalIntegral(integExpr, a, b, angleUnit, registers);
      const resStr = val.toFixed(8).replace(/\.?0+$/, '');
      setIntegResult(resStr);
      onPushHistory(`∫_(${integA})^(${integB}) (${integExpr}) dx`, resStr);
    } catch (err: any) {
      setIntegResult('Error: ' + err.message);
    }
  };

  const handleComputeLimit = () => {
    try {
      const a = parseNumericOrInfinity(limitPoint);
      const res = numericalLimit(limitExpr, a, angleUnit, registers);
      setLimitResult(res);
      onPushHistory(`lim_{x->${limitPoint}} (${limitExpr})`, res.exists && res.limit !== null ? res.limit.toFixed(6) : 'Undefined');
    } catch (err: any) {
      setLimitResult(null);
    }
  };

  const handleComputeSeq = () => {
    try {
      const a = Math.round(parseNumericOrInfinity(seqA));
      const b = Math.round(parseNumericOrInfinity(seqB));
      if (seqMode === 'SUM') {
        const val = numericalSummation(seqExpr, a, b, angleUnit, registers);
        const resStr = val.toString();
        setSeqResult(resStr);
        onPushHistory(`∑_(${a})^(${b}) (${seqExpr})`, resStr);
      } else {
        const val = numericalProduct(seqExpr, a, b, angleUnit, registers);
        const resStr = val.toString();
        setSeqResult(resStr);
        onPushHistory(`∏_(${a})^(${b}) (${seqExpr})`, resStr);
      }
    } catch (err: any) {
      setSeqResult('Error: ' + err.message);
    }
  };

  const handleSolve = () => {
    try {
      const x0 = parseNumericOrInfinity(solveX0);
      const res = solveNewtonRaphson(solveLHS, solveRHS, x0, angleUnit, registers);
      setSolveResult(res);
      onPushHistory(`Newton SOLVE (${solveLHS} = ${solveRHS})`, res.root.toFixed(8));
    } catch (err: any) {
      setSolveResult(null);
    }
  };

  const isNight = appTheme === 'DARK';
  const containerBg = isNight ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-slate-900 border-slate-200';
  const tabBtnActive = 'bg-cyan-600 text-white font-black shadow-xs';
  const tabBtnInactive = isNight ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200';
  const inputClass = isNight ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900';
  const resultBoxClass = isNight ? 'bg-slate-800 border-slate-700 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-900';

  return (
    <div className={`w-full p-4 sm:p-5 rounded-2xl border shadow-sm space-y-4 ${containerBg}`}>
      {/* Calculus Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Advanced Calculus Workbench</h3>
        </div>

        <div className="flex flex-wrap items-center gap-1 text-xs font-bold">
          <button onClick={() => setSubTab('DERIVATIVE')} className={`px-2.5 py-1.5 rounded-xl transition ${subTab === 'DERIVATIVE' ? tabBtnActive : tabBtnInactive}`}>Derivative</button>
          <button onClick={() => setSubTab('INTEGRAL')} className={`px-2.5 py-1.5 rounded-xl transition ${subTab === 'INTEGRAL' ? tabBtnActive : tabBtnInactive}`}>Integral</button>
          <button onClick={() => setSubTab('LIMIT')} className={`px-2.5 py-1.5 rounded-xl transition ${subTab === 'LIMIT' ? tabBtnActive : tabBtnInactive}`}>Limits</button>
          <button onClick={() => setSubTab('SUM_PROD')} className={`px-2.5 py-1.5 rounded-xl transition ${subTab === 'SUM_PROD' ? tabBtnActive : tabBtnInactive}`}>Sum & Prod</button>
          <button onClick={() => setSubTab('SOLVER')} className={`px-2.5 py-1.5 rounded-xl transition ${subTab === 'SOLVER' ? tabBtnActive : tabBtnInactive}`}>Newton Solver</button>
        </div>
      </div>

      {/* Infinity Input Tip Banner */}
      <div className="flex items-center gap-2 px-3 py-2 bg-cyan-50/70 border border-cyan-200 rounded-xl text-[11px] text-cyan-900">
        <Info className="w-4 h-4 text-cyan-600 shrink-0" />
        <span>You can type <strong className="font-black">inf</strong>, <strong className="font-black">infinity</strong>, <strong className="font-black">∞</strong>, <strong className="font-black">-inf</strong>, <strong className="font-black">pi</strong>, or <strong className="font-black">e</strong> in any numeric field!</span>
      </div>

      {/* Derivative Tab */}
      {subTab === 'DERIVATIVE' && (
        <div className="space-y-4 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px]">
            <span className="text-slate-400 font-black uppercase mr-1">Presets:</span>
            <button onClick={() => { setDerivExpr('x^3 - 2*x + 5'); setDerivPoint('2'); setDerivOrder('1ST'); }} className="px-2.5 py-1 bg-white hover:bg-cyan-50 border border-slate-200 rounded-lg text-slate-700 font-bold">d/dx(x³ - 2x + 5) @ 2</button>
            <button onClick={() => { setDerivExpr('sin(x)'); setDerivPoint('0'); setDerivOrder('1ST'); }} className="px-2.5 py-1 bg-white hover:bg-cyan-50 border border-slate-200 rounded-lg text-slate-700 font-bold">d/dx(sin x) @ 0</button>
            <button onClick={() => { setDerivExpr('exp(-x^2)'); setDerivPoint('1'); setDerivOrder('2ND'); }} className="px-2.5 py-1 bg-white hover:bg-cyan-50 border border-slate-200 rounded-lg text-slate-700 font-bold">d²/dx²(e⁻ˣ²) @ 1</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Function f(x)</label>
              <input
                type="text"
                value={derivExpr}
                onChange={e => setDerivExpr(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Point (x = a)</label>
              <input
                type="text"
                value={derivPoint}
                onChange={e => setDerivPoint(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold">Order:</span>
              <button
                onClick={() => setDerivOrder('1ST')}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition ${derivOrder === '1ST' ? 'bg-cyan-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'}`}
              >
                1st Derivative (d/dx)
              </button>
              <button
                onClick={() => setDerivOrder('2ND')}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition ${derivOrder === '2ND' ? 'bg-cyan-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'}`}
              >
                2nd Derivative (d²/dx²)
              </button>
            </div>

            <button
              onClick={handleComputeDeriv}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black transition shadow-xs"
            >
              Compute Derivative
            </button>
          </div>

          {derivResult && (
            <div className={`p-4 border rounded-xl space-y-2 font-mono ${resultBoxClass}`}>
              <div className="text-xs font-bold uppercase opacity-80">Step-by-Step Breakdown (5-Point Stencil Approximation):</div>
              <div className="text-base font-black">Result: {derivResult}</div>
            </div>
          )}
        </div>
      )}

      {/* Integral Tab */}
      {subTab === 'INTEGRAL' && (
        <div className="space-y-4 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px]">
            <span className="text-slate-400 font-black uppercase mr-1">Presets:</span>
            <button onClick={() => { setIntegExpr('sin(x)'); setIntegA('0'); setIntegB('pi'); }} className="px-2.5 py-1 bg-white hover:bg-cyan-50 border border-slate-200 rounded-lg text-slate-700 font-bold">∫ sin(x) dx [0, π]</button>
            <button onClick={() => { setIntegExpr('exp(-x)'); setIntegA('0'); setIntegB('inf'); }} className="px-2.5 py-1 bg-white hover:bg-cyan-50 border border-slate-200 rounded-lg text-slate-700 font-bold">∫ e⁻ˣ dx [0, ∞]</button>
            <button onClick={() => { setIntegExpr('1/(1+x^2)'); setIntegA('0'); setIntegB('inf'); }} className="px-2.5 py-1 bg-white hover:bg-cyan-50 border border-slate-200 rounded-lg text-slate-700 font-bold">∫ 1/(1+x²) dx [0, ∞]</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-3">
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Integrand f(x)</label>
              <input
                type="text"
                value={integExpr}
                onChange={e => setIntegExpr(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Lower Limit (a) [e.g. 0, -inf]</label>
              <input
                type="text"
                value={integA}
                onChange={e => setIntegA(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Upper Limit (b) [e.g. pi, inf]</label>
              <input
                type="text"
                value={integB}
                onChange={e => setIntegB(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleComputeInteg}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black transition shadow-xs"
              >
                Evaluate Integral
              </button>
            </div>
          </div>

          {integResult && (
            <div className={`p-4 border rounded-xl space-y-2 font-mono ${resultBoxClass}`}>
              <div className="text-xs font-bold uppercase opacity-80">Step-by-Step Breakdown (Simpson's Rule / Improper Mapping):</div>
              <div className="text-base font-black">Definite Integral Value = {integResult}</div>
            </div>
          )}
        </div>
      )}

      {/* Limit Tab */}
      {subTab === 'LIMIT' && (
        <div className="space-y-4 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px]">
            <span className="text-slate-400 font-black uppercase mr-1">Presets:</span>
            <button onClick={() => { setLimitExpr('sin(x)/x'); setLimitPoint('0'); }} className="px-2.5 py-1 bg-white hover:bg-cyan-50 border border-slate-200 rounded-lg text-slate-700 font-bold">lim x→0 sin(x)/x</button>
            <button onClick={() => { setLimitExpr('(1 + 1/x)^x'); setLimitPoint('inf'); }} className="px-2.5 py-1 bg-white hover:bg-cyan-50 border border-slate-200 rounded-lg text-slate-700 font-bold">lim x→∞ (1 + 1/x)ˣ (= e)</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Expression f(x)</label>
              <input
                type="text"
                value={limitExpr}
                onChange={e => setLimitExpr(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Approaching Point (x → a) [e.g. 0, inf]</label>
              <input
                type="text"
                value={limitPoint}
                onChange={e => setLimitPoint(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
          </div>

          <button
            onClick={handleComputeLimit}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black transition shadow-xs"
          >
            Compute Limit
          </button>

          {limitResult && (
            <div className={`p-4 border rounded-xl space-y-3 font-mono ${resultBoxClass}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase opacity-80">Limit Verification:</span>
                <span className={`px-2 py-0.5 rounded-md font-black text-[10px] ${limitResult.exists ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {limitResult.exists ? 'Limit Exists' : 'Limit Undefined / DNE'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-white/60 rounded-lg border border-cyan-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Left Limit</span>
                  <span className="font-bold text-slate-800">{limitResult.leftLimit.toFixed(6)}</span>
                </div>
                <div className="p-2 bg-white/60 rounded-lg border border-cyan-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Right Limit</span>
                  <span className="font-bold text-slate-800">{limitResult.rightLimit.toFixed(6)}</span>
                </div>
                <div className="p-2 bg-white/60 rounded-lg border border-cyan-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Estimated Limit</span>
                  <span className="font-black text-cyan-900">{limitResult.limit !== null ? limitResult.limit.toFixed(6) : 'DNE'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sum & Product Tab */}
      {subTab === 'SUM_PROD' && (
        <div className="space-y-4 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px]">
            <span className="text-slate-400 font-black uppercase mr-1">Presets:</span>
            <button onClick={() => { setSeqExpr('x^2'); setSeqA('1'); setSeqB('10'); setSeqMode('SUM'); }} className="px-2.5 py-1 bg-white hover:bg-cyan-50 border border-slate-200 rounded-lg text-slate-700 font-bold">∑ x² [1, 10]</button>
            <button onClick={() => { setSeqExpr('x'); setSeqA('1'); setSeqB('5'); setSeqMode('PROD'); }} className="px-2.5 py-1 bg-white hover:bg-cyan-50 border border-slate-200 rounded-lg text-slate-700 font-bold">∏ x [1, 5] (5!)</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Sequence Expression f(x)</label>
              <input
                type="text"
                value={seqExpr}
                onChange={e => setSeqExpr(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Start Index (a)</label>
              <input
                type="text"
                value={seqA}
                onChange={e => setSeqA(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">End Index (b)</label>
              <input
                type="text"
                value={seqB}
                onChange={e => setSeqB(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold">Mode:</span>
              <button
                onClick={() => setSeqMode('SUM')}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition ${seqMode === 'SUM' ? 'bg-cyan-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'}`}
              >
                Summation (∑)
              </button>
              <button
                onClick={() => setSeqMode('PROD')}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition ${seqMode === 'PROD' ? 'bg-cyan-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'}`}
              >
                Product (∏)
              </button>
            </div>

            <button
              onClick={handleComputeSeq}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black transition shadow-xs"
            >
              Compute Sequence
            </button>
          </div>

          {seqResult && (
            <div className={`p-4 border rounded-xl space-y-2 font-mono ${resultBoxClass}`}>
              <div className="text-xs font-bold uppercase opacity-80">{seqMode === 'SUM' ? 'Summation Result:' : 'Product Result:'}</div>
              <div className="text-base font-black">{seqResult}</div>
            </div>
          )}
        </div>
      )}

      {/* Newton Solver Tab */}
      {subTab === 'SOLVER' && (
        <div className="space-y-4 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px]">
            <span className="text-slate-400 font-black uppercase mr-1">Presets:</span>
            <button onClick={() => { setSolveLHS('x^3 - x - 2'); setSolveRHS('0'); setSolveX0('1.5'); }} className="px-2.5 py-1 bg-white hover:bg-cyan-50 border border-slate-200 rounded-lg text-slate-700 font-bold">x³ - x - 2 = 0</button>
            <button onClick={() => { setSolveLHS('cos(x)'); setSolveRHS('x'); setSolveX0('0.5'); }} className="px-2.5 py-1 bg-white hover:bg-cyan-50 border border-slate-200 rounded-lg text-slate-700 font-bold">cos(x) = x</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">LHS Expression</label>
              <input
                type="text"
                value={solveLHS}
                onChange={e => setSolveLHS(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">RHS Expression</label>
              <input
                type="text"
                value={solveRHS}
                onChange={e => setSolveRHS(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Initial Guess (x₀)</label>
              <input
                type="text"
                value={solveX0}
                onChange={e => setSolveX0(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-bold outline-hidden focus:border-cyan-600 ${inputClass}`}
              />
            </div>
          </div>

          <button
            onClick={handleSolve}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black transition shadow-xs"
          >
            Run Newton-Raphson Solver
          </button>

          {solveResult && (
            <div className="space-y-3">
              <div className={`p-4 border rounded-xl space-y-1 font-mono ${resultBoxClass}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase opacity-80">Root Found:</span>
                  <span className="font-black text-emerald-700">Converged in {solveResult.iterations} iterations</span>
                </div>
                <div className="text-lg font-black">x = {solveResult.root.toFixed(8)}</div>
              </div>

              {/* Iteration Table */}
              <div className="max-h-60 overflow-auto bg-white border border-slate-200 rounded-xl">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 sticky top-0">
                      <th className="p-2 border-r border-slate-200">Iteration (n)</th>
                      <th className="p-2 border-r border-slate-200">Approximation (xₙ)</th>
                      <th className="p-2">Residual f(xₙ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {solveResult.steps.map(step => (
                      <tr key={step.iteration} className="hover:bg-slate-50">
                        <td className="p-2 border-r border-slate-200 font-bold text-slate-500">{step.iteration}</td>
                        <td className="p-2 border-r border-slate-200 font-bold text-cyan-800">{step.x.toFixed(8)}</td>
                        <td className="p-2 font-bold text-slate-700">{step.fx.toExponential(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
