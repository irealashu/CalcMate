import React, { useState } from 'react';
import { AngleUnit } from '../../types/calculator';
import { RefreshCw, Shuffle } from 'lucide-react';
import {
  addMatrices,
  angleBetweenVectors,
  createEmptyMatrix,
  crossProduct,
  determinantMatrix,
  dotProduct,
  eigenvalues2x2,
  invertMatrix,
  Matrix,
  matrixPower,
  multiplyMatrices,
  scalarMultiply,
  scalarTripleProduct,
  subtractMatrices,
  transposeMatrix,
  Vector,
  vectorMagnitude,
  vectorProjection,
} from '../../utils/matrixVectorEngine';

interface MatrixVectorPanelProps {
  angleUnit: AngleUnit;
  onPushHistory: (expr: string, res: string) => void;
}

export const MatrixVectorPanel: React.FC<MatrixVectorPanelProps> = ({ angleUnit, onPushHistory }) => {
  const [subTab, setSubTab] = useState<'MATRIX' | 'VECTOR'>('MATRIX');

  // Matrix State
  const [matARows, setMatARows] = useState(2);
  const [matACols, setMatACols] = useState(2);
  const [matrixA, setMatrixA] = useState<(number | string)[][]>([
    [1, 2],
    [3, 4],
  ]);

  const [matBRows, setMatBRows] = useState(2);
  const [matBCols, setMatBCols] = useState(2);
  const [matrixB, setMatrixB] = useState<(number | string)[][]>([
    [5, 6],
    [7, 8],
  ]);

  const [matrixResult, setMatrixResult] = useState<Matrix | null>(null);
  const [matError, setMatError] = useState<string | null>(null);
  const [eigenResultText, setEigenResultText] = useState<string | null>(null);

  // Vector State
  const [vecU, setVecU] = useState<(number | string)[]>([1, 2, 3]);
  const [vecV, setVecV] = useState<(number | string)[]>([4, 5, 6]);
  const [vecResultText, setVecResultText] = useState<string | null>(null);

  const cleanNum = (v: number | string): number => {
    if (typeof v === 'number') return v;
    const p = parseFloat(v);
    return isNaN(p) ? 0 : p;
  };

  const cleanMat = (m: (number | string)[][]): Matrix => m.map(row => row.map(cleanNum));
  const cleanVec = (v: (number | string)[]): Vector => v.map(cleanNum);

  const handleNumInput = (str: string, setter: (val: number | string) => void) => {
    if (str === '' || str === '-') {
      setter(str);
    } else {
      const p = parseFloat(str);
      setter(isNaN(p) ? str : p);
    }
  };

  const handleUpdateMatA = (r: number, c: number, strVal: string) => {
    handleNumInput(strVal, val => {
      setMatrixA(prev => {
        const clone = prev.map(row => [...row]);
        clone[r][c] = val;
        return clone;
      });
    });
  };

  const handleUpdateMatB = (r: number, c: number, strVal: string) => {
    handleNumInput(strVal, val => {
      setMatrixB(prev => {
        const clone = prev.map(row => [...row]);
        clone[r][c] = val;
        return clone;
      });
    });
  };

  const handleResizeMatrixA = (r: number, c: number) => {
    setMatARows(r);
    setMatACols(c);
    setMatrixA(createEmptyMatrix(r, c));
  };

  const handleResizeMatrixB = (r: number, c: number) => {
    setMatBRows(r);
    setMatBCols(c);
    setMatrixB(createEmptyMatrix(r, c));
  };

  // Matrix Utilities & Presets
  const handleSwapAB = () => {
    const tempA = matrixA;
    const tempAR = matARows;
    const tempAC = matACols;

    setMatrixA(matrixB);
    setMatARows(matBRows);
    setMatACols(matBCols);

    setMatrixB(tempA);
    setMatBRows(tempAR);
    setMatBCols(tempAC);

    setMatrixResult(null);
    setMatError(null);
    setEigenResultText(null);
  };

  const loadMatrixPreset = (target: 'A' | 'B', type: 'IDENTITY' | 'ZERO' | 'RANDOM') => {
    const rows = target === 'A' ? matARows : matBRows;
    const cols = target === 'A' ? matACols : matBCols;
    const newMat = createEmptyMatrix(rows, cols);

    if (type === 'IDENTITY') {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          newMat[r][c] = r === c ? 1 : 0;
        }
      }
    } else if (type === 'ZERO') {
      // already 0
    } else if (type === 'RANDOM') {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          newMat[r][c] = Math.floor(Math.random() * 10) - 4; // -4 to 5
        }
      }
    }

    if (target === 'A') {
      setMatrixA(newMat);
    } else {
      setMatrixB(newMat);
    }
    setMatrixResult(null);
  };

  // Vector Presets
  const loadVectorPreset = (target: 'U' | 'V', type: 'I' | 'J' | 'K' | 'RANDOM') => {
    if (type === 'I') {
      if (target === 'U') setVecU([1, 0, 0]);
      else setVecV([1, 0, 0]);
    } else if (type === 'J') {
      if (target === 'U') setVecU([0, 1, 0]);
      else setVecV([0, 1, 0]);
    } else if (type === 'K') {
      if (target === 'U') setVecU([0, 0, 1]);
      else setVecV([0, 0, 1]);
    } else if (type === 'RANDOM') {
      const rand = () => Math.floor(Math.random() * 12) - 5;
      if (target === 'U') setVecU([rand(), rand(), rand()]);
      else setVecV([rand(), rand(), rand()]);
    }
    setVecResultText(null);
  };

  const executeMatOp = (opName: string, fn: (mA: Matrix, mB: Matrix) => Matrix | number) => {
    setMatError(null);
    setEigenResultText(null);
    try {
      const mA = cleanMat(matrixA);
      const mB = cleanMat(matrixB);
      const res = fn(mA, mB);
      if (typeof res === 'number') {
        setMatrixResult([[res]]);
        onPushHistory(opName, res.toString());
      } else {
        setMatrixResult(res);
        onPushHistory(opName, JSON.stringify(res));
      }
    } catch (err: any) {
      setMatError(err.message);
      setMatrixResult(null);
    }
  };

  const handleEigenA = () => {
    setMatError(null);
    setMatrixResult(null);
    try {
      const mA = cleanMat(matrixA);
      const res = eigenvalues2x2(mA);
      const l1Str = res.lambda1.im !== 0 ? `${res.lambda1.re.toFixed(4)} ± ${Math.abs(res.lambda1.im).toFixed(4)}i` : `${res.lambda1.re.toFixed(4)}`;
      const l2Str = res.lambda2.im !== 0 ? `${res.lambda2.re.toFixed(4)} ∓ ${Math.abs(res.lambda2.im).toFixed(4)}i` : `${res.lambda2.re.toFixed(4)}`;
      setEigenResultText(`Eigenvalues λ₁ = ${l1Str}, λ₂ = ${l2Str}`);
      onPushHistory('Eigen(A)', `λ₁=${l1Str}, λ₂=${l2Str}`);
    } catch (err: any) {
      setMatError(err.message);
    }
  };

  const executeSingleMatAOp = (opName: string, fn: (mA: Matrix) => Matrix | number) => {
    setMatError(null);
    setEigenResultText(null);
    try {
      const mA = cleanMat(matrixA);
      const res = fn(mA);
      if (typeof res === 'number') {
        setMatrixResult([[res]]);
        onPushHistory(opName, res.toString());
      } else {
        setMatrixResult(res);
        onPushHistory(opName, JSON.stringify(res));
      }
    } catch (err: any) {
      setMatError(err.message);
      setMatrixResult(null);
    }
  };

  // Vector ops
  const handleDotProduct = () => {
    const u = cleanVec(vecU);
    const v = cleanVec(vecV);
    const res = dotProduct(u, v);
    setVecResultText(`Dot Product (u • v) = ${res}`);
    onPushHistory('u • v', res.toString());
  };

  const handleCrossProduct = () => {
    const u = cleanVec(vecU);
    const v = cleanVec(vecV);
    try {
      const res = crossProduct(u, v);
      setVecResultText(`Cross Product (u × v) = [${res.join(', ')}]`);
      onPushHistory('u × v', `[${res.join(', ')}]`);
    } catch (err: any) {
      setVecResultText(`Error: ${err.message}`);
    }
  };

  const handleMagnitude = (target: 'U' | 'V') => {
    const vec = target === 'U' ? cleanVec(vecU) : cleanVec(vecV);
    const res = vectorMagnitude(vec);
    setVecResultText(`|${target}| = ${res.toFixed(6).replace(/\.?0+$/, '')}`);
    onPushHistory(`|${target}|`, res.toFixed(6));
  };

  const handleAngle = () => {
    const u = cleanVec(vecU);
    const v = cleanVec(vecV);
    try {
      const res = angleBetweenVectors(u, v, angleUnit);
      setVecResultText(`Angle (u, v) = ${res.toFixed(4)} ${angleUnit}`);
      onPushHistory(`∠(u,v)`, `${res.toFixed(4)} ${angleUnit}`);
    } catch (err: any) {
      setVecResultText(`Error: ${err.message}`);
    }
  };

  const handleProjection = () => {
    const u = cleanVec(vecU);
    const v = cleanVec(vecV);
    try {
      const res = vectorProjection(u, v);
      setVecResultText(`Proj_v(u) = [${res.map(n => n.toFixed(4).replace(/\.?0+$/, '')).join(', ')}]`);
      onPushHistory(`Proj_v(u)`, `[${res.map(n => n.toFixed(4)).join(', ')}]`);
    } catch (err: any) {
      setVecResultText(`Error: ${err.message}`);
    }
  };

  return (
    <div className="w-full space-y-3 bg-transparent text-slate-900">
      {/* Sub tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setSubTab('MATRIX')}
          className={`px-3 py-1.5 rounded-lg transition ${
            subTab === 'MATRIX' ? 'bg-cyan-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          Matrix Workbench
        </button>
        <button
          onClick={() => setSubTab('VECTOR')}
          className={`px-3 py-1.5 rounded-lg transition ${
            subTab === 'VECTOR' ? 'bg-cyan-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          Vector Calculations
        </button>
      </div>

      {subTab === 'MATRIX' && (
        <div className="space-y-4">
          {/* Main layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Matrix A */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider">Matrix A</span>
                <div className="flex items-center gap-1.5">
                  <select
                    value={`${matARows}x${matACols}`}
                    onChange={e => {
                      const [r, c] = e.target.value.split('x').map(Number);
                      handleResizeMatrixA(r, c);
                    }}
                    className="bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-800 outline-hidden"
                  >
                    <option value="2x2">2 x 2</option>
                    <option value="2x3">2 x 3</option>
                    <option value="3x2">3 x 2</option>
                    <option value="3x3">3 x 3</option>
                    <option value="4x4">4 x 4</option>
                  </select>
                </div>
              </div>

              {/* Presets Row */}
              <div className="flex items-center gap-1 py-1 border-b border-slate-100 text-[10px]">
                <span className="text-slate-400 font-bold uppercase mr-1">Presets:</span>
                <button
                  onClick={() => loadMatrixPreset('A', 'IDENTITY')}
                  className="px-1.5 py-0.5 bg-slate-50 hover:bg-cyan-50 text-slate-600 hover:text-cyan-800 border border-slate-200 rounded transition font-medium"
                >
                  Identity
                </button>
                <button
                  onClick={() => loadMatrixPreset('A', 'ZERO')}
                  className="px-1.5 py-0.5 bg-slate-50 hover:bg-cyan-50 text-slate-600 hover:text-cyan-800 border border-slate-200 rounded transition font-medium"
                >
                  Zero
                </button>
                <button
                  onClick={() => loadMatrixPreset('A', 'RANDOM')}
                  className="px-1.5 py-0.5 bg-slate-50 hover:bg-cyan-50 text-slate-600 hover:text-cyan-800 border border-slate-200 rounded transition font-medium"
                >
                  Random
                </button>
              </div>

              <div className="grid gap-1 font-mono text-center">
                {matrixA.map((row, r) => (
                  <div key={r} className="flex gap-1 justify-center">
                    {row.map((val, c) => (
                      <input
                        key={c}
                        type="text"
                        value={val}
                        onChange={e => handleUpdateMatA(r, c, e.target.value)}
                        className="w-12 bg-slate-50 border border-slate-300 rounded py-1 text-center font-mono text-xs text-slate-900 outline-hidden focus:border-cyan-600 font-bold"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Matrix B */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Matrix B</span>
                <div className="flex items-center gap-1.5">
                  <select
                    value={`${matBRows}x${matBCols}`}
                    onChange={e => {
                      const [r, c] = e.target.value.split('x').map(Number);
                      handleResizeMatrixB(r, c);
                    }}
                    className="bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-800 outline-hidden"
                  >
                    <option value="2x2">2 x 2</option>
                    <option value="2x3">2 x 3</option>
                    <option value="3x2">3 x 2</option>
                    <option value="3x3">3 x 3</option>
                    <option value="4x4">4 x 4</option>
                  </select>
                </div>
              </div>

              {/* Presets Row */}
              <div className="flex items-center gap-1 py-1 border-b border-slate-100 text-[10px]">
                <span className="text-slate-400 font-bold uppercase mr-1">Presets:</span>
                <button
                  onClick={() => loadMatrixPreset('B', 'IDENTITY')}
                  className="px-1.5 py-0.5 bg-slate-50 hover:bg-cyan-50 text-slate-600 hover:text-cyan-800 border border-slate-200 rounded transition font-medium"
                >
                  Identity
                </button>
                <button
                  onClick={() => loadMatrixPreset('B', 'ZERO')}
                  className="px-1.5 py-0.5 bg-slate-50 hover:bg-cyan-50 text-slate-600 hover:text-cyan-800 border border-slate-200 rounded transition font-medium"
                >
                  Zero
                </button>
                <button
                  onClick={() => loadMatrixPreset('B', 'RANDOM')}
                  className="px-1.5 py-0.5 bg-slate-50 hover:bg-cyan-50 text-slate-600 hover:text-cyan-800 border border-slate-200 rounded transition font-medium"
                >
                  Random
                </button>
              </div>

              <div className="grid gap-1 font-mono text-center">
                {matrixB.map((row, r) => (
                  <div key={r} className="flex gap-1 justify-center">
                    {row.map((val, c) => (
                      <input
                        key={c}
                        type="text"
                        value={val}
                        onChange={e => handleUpdateMatB(r, c, e.target.value)}
                        className="w-12 bg-slate-50 border border-slate-300 rounded py-1 text-center font-mono text-xs text-slate-900 outline-hidden focus:border-cyan-600 font-bold"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-200/50 rounded-xl">
            <button
              onClick={handleSwapAB}
              className="px-2.5 py-1 text-[10px] bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-800 font-bold flex items-center gap-1 transition shadow-3xs"
              title="Swap Matrix A and B values"
            >
              <Shuffle className="w-3 h-3 text-cyan-600" />
              <span>Swap A &lt;-&gt; B</span>
            </button>

            <span className="w-[1px] h-4 bg-slate-300 mx-1" />

            <button
              onClick={() => executeMatOp('A + B', addMatrices)}
              className="px-2.5 py-1 text-[10px] bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold transition shadow-3xs"
            >
              A + B
            </button>
            <button
              onClick={() => executeMatOp('A - B', subtractMatrices)}
              className="px-2.5 py-1 text-[10px] bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold transition shadow-3xs"
            >
              A - B
            </button>
            <button
              onClick={() => executeMatOp('A * B', multiplyMatrices)}
              className="px-2.5 py-1 text-[10px] bg-amber-500 hover:bg-amber-400 text-slate-950 rounded font-bold transition shadow-3xs"
            >
              A * B
            </button>
            <button
              onClick={() => executeSingleMatAOp('Det(A)', determinantMatrix)}
              className="px-2.5 py-1 text-[10px] bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-800 font-bold transition shadow-3xs"
            >
              Det(A)
            </button>
            <button
              onClick={() => executeSingleMatAOp('A^-1', invertMatrix)}
              className="px-2.5 py-1 text-[10px] bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-800 font-bold transition shadow-3xs"
            >
              Inv(A)
            </button>
            <button
              onClick={() => executeSingleMatAOp('A^T', transposeMatrix)}
              className="px-2.5 py-1 text-[10px] bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-800 font-bold transition shadow-3xs"
            >
              Trans(A)
            </button>
            {matARows === 2 && matACols === 2 && (
              <button
                onClick={handleEigenA}
                className="px-2.5 py-1 text-[10px] bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 rounded font-bold transition shadow-3xs"
              >
                Eigens(A)
              </button>
            )}
          </div>

          {/* Result Block */}
          {matrixResult && (
            <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl font-mono text-xs space-y-1">
              <div className="text-[10px] uppercase font-bold text-cyan-800">Result Matrix:</div>
              <div className="flex flex-col gap-1 items-center py-1 bg-white/60 rounded border border-cyan-100">
                {matrixResult.map((row, idx) => (
                  <div key={idx} className="flex gap-3 font-bold text-slate-800 text-sm">
                    {row.map((val, cIdx) => (
                      <span key={cIdx} className="w-14 text-center">
                        {val.toFixed(4).replace(/\.?0+$/, '')}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {eigenResultText && (
            <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl font-mono text-xs">
              <div className="text-[10px] uppercase font-bold text-cyan-800">Eigenanalysis Results:</div>
              <div className="font-bold text-cyan-900 text-sm py-1">{eigenResultText}</div>
            </div>
          )}

          {matError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl font-mono text-xs text-rose-800">
              {matError}
            </div>
          )}
        </div>
      )}

      {subTab === 'VECTOR' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vector u */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider block">Vector u</span>
              
              <div className="flex gap-1 py-1 border-b border-slate-100 text-[10px] mb-1.5">
                <span className="text-slate-400 font-bold uppercase mr-1">Presets:</span>
                <button onClick={() => loadVectorPreset('U', 'I')} className="px-1.5 py-0.5 bg-slate-50 hover:bg-cyan-50 text-slate-600 border border-slate-200 rounded font-medium">i</button>
                <button onClick={() => loadVectorPreset('U', 'J')} className="px-1.5 py-0.5 bg-slate-50 hover:bg-cyan-50 text-slate-600 border border-slate-200 rounded font-medium">j</button>
                <button onClick={() => loadVectorPreset('U', 'K')} className="px-1.5 py-0.5 bg-slate-50 hover:bg-cyan-50 text-slate-600 border border-slate-200 rounded font-medium">k</button>
                <button onClick={() => loadVectorPreset('U', 'RANDOM')} className="px-1.5 py-0.5 bg-slate-50 hover:bg-cyan-50 text-slate-600 border border-slate-200 rounded font-medium">Random</button>
              </div>

              <div className="flex gap-2 font-mono items-center">
                {vecU.map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center flex-1">
                    <span className="text-[10px] text-slate-400">
                      {idx === 0 && 'i (x)'}
                      {idx === 1 && 'j (y)'}
                      {idx === 2 && 'k (z)'}
                    </span>
                    <input
                      type="text"
                      value={val}
                      onChange={e => {
                        const str = e.target.value;
                        handleNumInput(str, cleanVal => {
                          setVecU(prev => {
                            const clone = [...prev];
                            clone[idx] = cleanVal;
                            return clone;
                          });
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded py-1.5 text-center text-xs text-slate-900 outline-hidden focus:border-cyan-600 font-bold"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Vector v */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Vector v</span>
              
              <div className="flex gap-1 py-1 border-b border-slate-100 text-[10px] mb-1.5">
                <span className="text-slate-400 font-bold uppercase mr-1">Presets:</span>
                <button onClick={() => loadVectorPreset('V', 'I')} className="px-1.5 py-0.5 bg-slate-50 hover:bg-cyan-50 text-slate-600 border border-slate-200 rounded font-medium">i</button>
                <button onClick={() => loadVectorPreset('V', 'J')} className="px-1.5 py-0.5 bg-slate-50 hover:bg-cyan-50 text-slate-600 border border-slate-200 rounded font-medium">j</button>
                <button onClick={() => loadVectorPreset('V', 'K')} className="px-1.5 py-0.5 bg-slate-50 hover:bg-cyan-50 text-slate-600 border border-slate-200 rounded font-medium">k</button>
                <button onClick={() => loadVectorPreset('V', 'RANDOM')} className="px-1.5 py-0.5 bg-slate-50 hover:bg-cyan-50 text-slate-600 border border-slate-200 rounded font-medium">Random</button>
              </div>

              <div className="flex gap-2 font-mono items-center">
                {vecV.map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center flex-1">
                    <span className="text-[10px] text-slate-400">
                      {idx === 0 && 'i (x)'}
                      {idx === 1 && 'j (y)'}
                      {idx === 2 && 'k (z)'}
                    </span>
                    <input
                      type="text"
                      value={val}
                      onChange={e => {
                        const str = e.target.value;
                        handleNumInput(str, cleanVal => {
                          setVecV(prev => {
                            const clone = [...prev];
                            clone[idx] = cleanVal;
                            return clone;
                          });
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded py-1.5 text-center text-xs text-slate-900 outline-hidden focus:border-cyan-600 font-bold"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vector actions */}
          <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-200/50 rounded-xl text-xs">
            <button onClick={handleDotProduct} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold transition shadow-3xs">Dot Product (u • v)</button>
            <button onClick={handleCrossProduct} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold transition shadow-3xs">Cross Product (u × v)</button>
            <button onClick={() => handleMagnitude('U')} className="px-3 py-1 bg-white border border-slate-300 text-slate-800 rounded font-bold hover:bg-slate-50 transition shadow-3xs">Magnitude |u|</button>
            <button onClick={() => handleMagnitude('V')} className="px-3 py-1 bg-white border border-slate-300 text-slate-800 rounded font-bold hover:bg-slate-50 transition shadow-3xs">Magnitude |v|</button>
            <button onClick={handleAngle} className="px-3 py-1 bg-white border border-slate-300 text-slate-800 rounded font-bold hover:bg-slate-50 transition shadow-3xs">Angle between</button>
            <button onClick={handleProjection} className="px-3 py-1 bg-white border border-slate-300 text-slate-800 rounded font-bold hover:bg-slate-50 transition shadow-3xs">Projection Proj_v(u)</button>
          </div>

          {vecResultText && (
            <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl font-mono text-xs font-bold text-cyan-950">
              {vecResultText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
