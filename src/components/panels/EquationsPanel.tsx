import React, { useState } from 'react';
import {
  formatComplex,
  InequalityOperator,
  solveCubic,
  solveInequality,
  solveLinearSystem,
  solveQuadratic,
  solveQuartic,
} from '../../utils/equationEngine';

interface EquationsPanelProps {
  onPushHistory: (expr: string, res: string) => void;
}

export const EquationsPanel: React.FC<EquationsPanelProps> = ({ onPushHistory }) => {
  const [subTab, setSubTab] = useState<'LINEAR' | 'POLYNOMIAL' | 'INEQUALITY'>('LINEAR');

  // Linear system state
  const [systemDim, setSystemDim] = useState<2 | 3 | 4>(3);
  const [matrixA, setMatrixA] = useState<(number | string)[][]>([
    [1, 2, -1],
    [2, -1, 1],
    [1, 1, 1],
  ]);
  const [vectorB, setVectorB] = useState<(number | string)[]>([3, 4, 6]);
  const [linearSolution, setLinearSolution] = useState<number[] | null>(null);
  const [linearError, setLinearError] = useState<string | null>(null);

  // Polynomial state
  const [polyDegree, setPolyDegree] = useState<2 | 3 | 4>(2);
  const [polyCoeffs, setPolyCoeffs] = useState<(number | string)[]>([1, -5, 6]);
  const [polyRoots, setPolyRoots] = useState<string[] | null>(null);

  // Inequality state
  const [ineqCoeffs, setIneqCoeffs] = useState<(number | string)[]>([1, -1, -6]);
  const [ineqOp, setIneqOp] = useState<InequalityOperator>('>=');
  const [ineqResult, setIneqResult] = useState<string | null>(null);

  const handleDimChange = (dim: 2 | 3 | 4) => {
    setSystemDim(dim);
    setMatrixA(Array.from({ length: dim }, (_, r) => Array.from({ length: dim }, (_, c) => (r === c ? 1 : 0))));
    setVectorB(Array(dim).fill(0));
    setLinearSolution(null);
  };

  const parseVal = (v: number | string): number => {
    if (typeof v === 'number') return v;
    const p = parseFloat(v);
    return isNaN(p) ? 0 : p;
  };

  const handleSolveLinear = () => {
    const cleanA = matrixA.map(row => row.map(parseVal));
    const cleanB = vectorB.map(parseVal);
    const res = solveLinearSystem(cleanA, cleanB);
    if (res.solution) {
      setLinearSolution(res.solution);
      setLinearError(null);
      const str = res.solution.map((val, idx) => `x${idx + 1}=${val.toFixed(4)}`).join(', ');
      onPushHistory(`System ${systemDim}x${systemDim}`, str);
    } else {
      setLinearSolution(null);
      setLinearError(res.message || 'Error solving system');
    }
  };

  const handleSolvePoly = () => {
    const c = polyCoeffs.map(parseVal);
    let roots: any[] = [];
    if (polyDegree === 2) {
      roots = solveQuadratic(c[0], c[1], c[2]);
    } else if (polyDegree === 3) {
      roots = solveCubic(c[0], c[1], c[2], c[3]);
    } else if (polyDegree === 4) {
      roots = solveQuartic(c[0], c[1], c[2], c[3], c[4]);
    }

    const formatted = roots.map((r, idx) => `x${idx + 1} = ${formatComplex(r, 6)}`);
    setPolyRoots(formatted);
    onPushHistory(`Poly Deg ${polyDegree} Roots`, formatted.join(' | '));
  };

  const handleSolveIneq = () => {
    const c = ineqCoeffs.map(parseVal);
    const res = solveInequality(c, ineqOp);
    setIneqResult(res);
    onPushHistory(`Inequality`, res);
  };

  const handleNumInput = (str: string, setter: (val: number | string) => void) => {
    if (str === '' || str === '-') {
      setter(str);
    } else {
      const p = parseFloat(str);
      setter(isNaN(p) ? str : p);
    }
  };

  const loadLinearPreset = (presetType: 'SIMPLE_2X2' | 'SYSTEM_3X3' | 'COMPLEX_4X4') => {
    setLinearSolution(null);
    setLinearError(null);
    if (presetType === 'SIMPLE_2X2') {
      setSystemDim(2);
      setMatrixA([
        [1, 1],
        [2, -1],
      ]);
      setVectorB([3, 0]);
    } else if (presetType === 'SYSTEM_3X3') {
      setSystemDim(3);
      setMatrixA([
        [1, 2, -1],
        [2, -1, 1],
        [1, 1, 1],
      ]);
      setVectorB([3, 4, 6]);
    } else if (presetType === 'COMPLEX_4X4') {
      setSystemDim(4);
      setMatrixA([
        [2, 1, -1, 3],
        [1, 2, 1, -1],
        [-1, 1, 3, 2],
        [3, -1, 2, 1],
      ]);
      setVectorB([10, 4, 12, 11]);
    }
  };

  const loadPolynomialPreset = (presetType: 'QUAD_REAL' | 'QUAD_IMAG' | 'CUBIC_ROOTS' | 'QUARTIC_EASY') => {
    setPolyRoots(null);
    if (presetType === 'QUAD_REAL') {
      setPolyDegree(2);
      setPolyCoeffs([1, -5, 6]);
    } else if (presetType === 'QUAD_IMAG') {
      setPolyDegree(2);
      setPolyCoeffs([1, 0, 1]);
    } else if (presetType === 'CUBIC_ROOTS') {
      setPolyDegree(3);
      setPolyCoeffs([1, -6, 11, -6]);
    } else if (presetType === 'QUARTIC_EASY') {
      setPolyDegree(4);
      setPolyCoeffs([1, -10, 35, -50, 24]);
    }
  };

  return (
    <div className="w-full space-y-3 bg-transparent text-slate-900">
      {/* Sub tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setSubTab('LINEAR')}
          className={`px-3 py-1.5 rounded-lg transition ${
            subTab === 'LINEAR' ? 'bg-cyan-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          System of Linear Equations
        </button>
        <button
          onClick={() => setSubTab('POLYNOMIAL')}
          className={`px-3 py-1.5 rounded-lg transition ${
            subTab === 'POLYNOMIAL' ? 'bg-cyan-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          Polynomial Roots (2,3,4)
        </button>
        <button
          onClick={() => setSubTab('INEQUALITY')}
          className={`px-3 py-1.5 rounded-lg transition ${
            subTab === 'INEQUALITY' ? 'bg-cyan-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          Inequality Solver
        </button>
      </div>

      {/* Linear System */}
      {subTab === 'LINEAR' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white/50 p-2 rounded-xl border border-slate-200/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Presets:</span>
              <button
                onClick={() => loadLinearPreset('SIMPLE_2X2')}
                className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-cyan-50 border border-slate-200 rounded font-semibold text-slate-700 hover:text-cyan-800 transition"
              >
                2x2 (Simple)
              </button>
              <button
                onClick={() => loadLinearPreset('SYSTEM_3X3')}
                className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-cyan-50 border border-slate-200 rounded font-semibold text-slate-700 hover:text-cyan-800 transition"
              >
                3x3 (Cramer)
              </button>
              <button
                onClick={() => loadLinearPreset('COMPLEX_4X4')}
                className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-cyan-50 border border-slate-200 rounded font-semibold text-slate-700 hover:text-cyan-800 transition"
              >
                4x4 (Workstation)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">System of Linear Equations (Ax = B)</h3>
            <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded border border-slate-300 text-xs">
              {([2, 3, 4] as const).map(d => (
                <button
                  key={d}
                  onClick={() => handleDimChange(d)}
                  className={`px-2 py-0.5 rounded ${systemDim === d ? 'bg-cyan-600 text-white font-bold' : 'text-slate-600'}`}
                >
                  {d}x{d}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto p-3 bg-white rounded-xl border border-slate-200">
            <div className="space-y-2">
              {matrixA.map((row, r) => (
                <div key={r} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500 w-4">R{r + 1}</span>
                  {row.map((val, c) => (
                    <div key={c} className="flex items-center gap-1">
                      <input
                        type="text"
                        value={val}
                        onChange={e => handleNumInput(e.target.value, v => {
                          setMatrixA(prev => {
                            const clone = prev.map(row => [...row]);
                            clone[r][c] = v;
                            return clone;
                          });
                        })}
                        className="w-14 bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-center font-mono text-xs text-slate-900 outline-hidden focus:border-cyan-600 animate-pulse"
                      />
                      <span className="text-xs font-mono text-slate-600">x{c + 1}</span>
                      {c < systemDim - 1 && <span className="text-xs text-slate-400">+</span>}
                    </div>
                  ))}
                  <span className="text-xs font-bold text-cyan-700 px-1">=</span>
                  <input
                    type="text"
                    value={vectorB[r]}
                    onChange={e => handleNumInput(e.target.value, v => {
                      setVectorB(prev => {
                        const clone = [...prev];
                        clone[r] = v;
                        return clone;
                      });
                    })}
                    className="w-14 bg-amber-50/50 border border-amber-200 rounded px-1.5 py-1 text-center font-mono text-xs text-amber-900 outline-hidden focus:border-cyan-600 font-bold"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSolveLinear}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition shadow-2xs"
          >
            Solve System
          </button>

          {linearSolution && (
            <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl space-y-1 font-mono text-xs">
              <div className="text-[10px] uppercase font-bold text-cyan-800">Calculated Solutions:</div>
              {linearSolution.map((val, idx) => (
                <div key={idx}>
                  x{idx + 1} = <span className="font-bold text-cyan-700">{val.toFixed(6)}</span>
                </div>
              ))}
            </div>
          )}

          {linearError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl font-mono text-xs text-rose-800">
              {linearError}
            </div>
          )}
        </div>
      )}

      {/* Polynomial Roots */}
      {subTab === 'POLYNOMIAL' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 bg-white/50 p-2 rounded-xl border border-slate-200/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Presets:</span>
              <button
                onClick={() => loadPolynomialPreset('QUAD_REAL')}
                className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-cyan-50 border border-slate-200 rounded font-semibold text-slate-700 hover:text-cyan-800 transition"
              >
                x^2 - 5x + 6 (Real)
              </button>
              <button
                onClick={() => loadPolynomialPreset('QUAD_IMAG')}
                className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-cyan-50 border border-slate-200 rounded font-semibold text-slate-700 hover:text-cyan-800 transition"
              >
                x^2 + 1 (Imaginary)
              </button>
              <button
                onClick={() => loadPolynomialPreset('CUBIC_ROOTS')}
                className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-cyan-50 border border-slate-200 rounded font-semibold text-slate-700 hover:text-cyan-800 transition"
              >
                Cubic roots
              </button>
              <button
                onClick={() => loadPolynomialPreset('QUARTIC_EASY')}
                className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-cyan-50 border border-slate-200 rounded font-semibold text-slate-700 hover:text-cyan-800 transition"
              >
                Quartic roots
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Polynomial Root Finder</h3>
            <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded border border-slate-300 text-xs">
              {(
                [
                  { d: 2, name: 'Quadratic' },
                  { d: 3, name: 'Cubic' },
                  { d: 4, name: 'Quartic' },
                ] as const
              ).map(item => (
                <button
                  key={item.d}
                  onClick={() => {
                    setPolyDegree(item.d);
                    setPolyCoeffs(Array(item.d + 1).fill(1));
                    setPolyRoots(null);
                  }}
                  className={`px-2 py-0.5 rounded ${polyDegree === item.d ? 'bg-cyan-600 text-white font-bold' : 'text-slate-600'}`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-mono text-slate-500 mb-2">
              {polyDegree === 2 && 'ax^2 + bx + c = 0'}
              {polyDegree === 3 && 'ax^3 + bx^2 + cx + d = 0'}
              {polyDegree === 4 && 'ax^4 + bx^3 + cx^2 + dx + e = 0'}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {polyCoeffs.map((v, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {idx === 0 && 'a'}
                    {idx === 1 && 'b'}
                    {idx === 2 && 'c'}
                    {idx === 3 && 'd'}
                    {idx === 4 && 'e'}
                  </span>
                  <input
                    type="text"
                    value={v}
                    onChange={e => {
                      const str = e.target.value;
                      handleNumInput(str, cleanVal => {
                        setPolyCoeffs(prev => {
                          const clone = [...prev];
                          clone[idx] = cleanVal;
                          return clone;
                        });
                      });
                    }}
                    className="w-14 bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-center font-mono text-xs text-slate-900 outline-hidden focus:border-cyan-600 font-bold"
                  />
                  {polyDegree - idx > 0 && (
                    <span className="text-xs font-mono text-slate-600">
                      x{polyDegree - idx > 1 ? `^${polyDegree - idx}` : ''} +
                    </span>
                  )}
                </div>
              ))}
              <span className="text-xs font-mono text-slate-600">= 0</span>
            </div>
          </div>

          <button
            onClick={handleSolvePoly}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition shadow-2xs"
          >
            Calculate Roots
          </button>

          {polyRoots && (
            <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl space-y-1 font-mono text-xs">
              <div className="text-[10px] uppercase font-bold text-cyan-800">Calculated Roots:</div>
              {polyRoots.map((rStr, idx) => (
                <div key={idx} className="text-slate-800">
                  {rStr}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inequality Solver */}
      {subTab === 'INEQUALITY' && (
        <div className="space-y-3">
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-4">
            <div className="text-xs text-slate-500 font-semibold uppercase">
              Quadratic Inequality: ax^2 + bx + c [op] 0
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-slate-400">a</span>
                <input
                  type="text"
                  value={ineqCoeffs[0]}
                  onChange={e => handleNumInput(e.target.value, v => setIneqCoeffs(prev => [v, prev[1], prev[2]]))}
                  className="w-14 bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-center font-mono text-xs text-slate-900 outline-hidden"
                />
                <span className="text-xs text-slate-600 font-mono">x^2 +</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-slate-400">b</span>
                <input
                  type="text"
                  value={ineqCoeffs[1]}
                  onChange={e => handleNumInput(e.target.value, v => setIneqCoeffs(prev => [prev[0], v, prev[2]]))}
                  className="w-14 bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-center font-mono text-xs text-slate-900 outline-hidden"
                />
                <span className="text-xs text-slate-600 font-mono">x +</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-slate-400">c</span>
                <input
                  type="text"
                  value={ineqCoeffs[2]}
                  onChange={e => handleNumInput(e.target.value, v => setIneqCoeffs(prev => [prev[0], prev[1], v]))}
                  className="w-14 bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-center font-mono text-xs text-slate-900 outline-hidden"
                />
              </div>

              <select
                value={ineqOp}
                onChange={e => setIneqOp(e.target.value as InequalityOperator)}
                className="bg-slate-100 border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-slate-800"
              >
                <option value=">">&gt;</option>
                <option value=">=">&gt;=</option>
                <option value="<">&lt;</option>
                <option value="<=">&lt;=</option>
              </select>

              <span className="text-sm font-bold text-slate-600">0</span>
            </div>
          </div>

          <button
            onClick={handleSolveIneq}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition shadow-2xs"
          >
            Solve Inequality
          </button>

          {ineqResult && (
            <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl space-y-1 font-mono text-xs">
              <div className="text-[10px] uppercase font-bold text-cyan-800">Interval solution:</div>
              <div className="font-bold text-cyan-900 text-sm">{ineqResult}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
