import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, LineChart, BarChart2 } from 'lucide-react';
import {
  binomialCD,
  binomialPD,
  computeDescriptiveStats,
  computeExponentialRegression,
  computeLinearRegression,
  computeLogarithmicRegression,
  computePowerRegression,
  computeQuadraticRegression,
  confidenceIntervalMean,
  inverseNormalCDF,
  normalCDF,
  normalPDF,
  oneSampleTTest,
  poissonCD,
  poissonPD,
  RegressionResult,
} from '../../utils/statisticsEngine';

interface StatisticsPanelProps {
  onPushHistory: (expr: string, res: string) => void;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ onPushHistory }) => {
  const [subTab, setSubTab] = useState<'DATA' | 'STATS' | 'REGRESSION' | 'HYPOTHESIS' | 'PROBABILITY'>('DATA');

  const [dataPoints, setDataPoints] = useState<{ id: string; x: number; y: number }[]>([
    { id: '1', x: 1, y: 2.1 },
    { id: '2', x: 2, y: 3.9 },
    { id: '3', x: 3, y: 6.2 },
    { id: '4', x: 4, y: 8.1 },
    { id: '5', x: 5, y: 10.3 },
  ]);

  const [selectedRegType, setSelectedRegType] = useState<'Linear' | 'Quadratic' | 'Logarithmic' | 'Exponential' | 'Power'>('Linear');

  const loadDataset = (type: 'LINEAR_TREND' | 'PARABOLIC' | 'EXP_GROWTH' | 'RANDOM_SCATTER') => {
    if (type === 'LINEAR_TREND') {
      setDataPoints([
        { id: '1', x: 1, y: 12.2 },
        { id: '2', x: 2, y: 24.5 },
        { id: '3', x: 3, y: 35.1 },
        { id: '4', x: 4, y: 48.0 },
        { id: '5', x: 5, y: 61.3 },
        { id: '6', x: 6, y: 73.0 },
      ]);
      setSelectedRegType('Linear');
    } else if (type === 'PARABOLIC') {
      setDataPoints([
        { id: '1', x: -3, y: 9.1 },
        { id: '2', x: -2, y: 4.2 },
        { id: '3', x: -1, y: 1.1 },
        { id: '4', x: 0, y: 0.2 },
        { id: '5', x: 1, y: 1.0 },
        { id: '6', x: 2, y: 3.9 },
        { id: '7', x: 3, y: 9.3 },
      ]);
      setSelectedRegType('Quadratic');
    } else if (type === 'EXP_GROWTH') {
      setDataPoints([
        { id: '1', x: 1, y: 2.1 },
        { id: '2', x: 2, y: 4.2 },
        { id: '3', x: 3, y: 8.5 },
        { id: '4', x: 4, y: 16.1 },
        { id: '5', x: 5, y: 32.4 },
      ]);
      setSelectedRegType('Exponential');
    } else if (type === 'RANDOM_SCATTER') {
      setDataPoints([
        { id: '1', x: 2, y: 5 },
        { id: '2', x: 4, y: 3 },
        { id: '3', x: 6, y: 8 },
        { id: '4', x: 8, y: 7 },
        { id: '5', x: 10, y: 11 },
        { id: '6', x: 12, y: 9 },
      ]);
      setSelectedRegType('Linear');
    }
  };

  const [probType, setProbType] = useState<'NORMAL' | 'BINOMIAL' | 'POISSON'>('NORMAL');
  const [normX, setNormX] = useState(0);
  const [normMean, setNormMean] = useState(0);
  const [normSd, setNormSd] = useState(1);
  const [normProb, setNormProb] = useState(0.95);

  const [binomK, setBinomK] = useState(3);
  const [binomN, setBinomN] = useState(10);
  const [binomP, setBinomP] = useState(0.5);

  const [poissX, setPoissX] = useState(2);
  const [poissLambda, setPoissLambda] = useState(3);

  // Hypothesis Test state
  const [hypoMu0, setHypoMu0] = useState(5.0);
  const [tTestResult, setTTestResult] = useState<{ tStat: number; df: number; mean: number; pValue: number } | null>(null);
  const [confLevel, setConfLevel] = useState(0.95);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleAddPoint = () => {
    setDataPoints(prev => [
      ...prev,
      { id: Date.now().toString(), x: prev.length + 1, y: 0 },
    ]);
  };

  const handleRemovePoint = (id: string) => {
    setDataPoints(prev => prev.filter(p => p.id !== id));
  };

  const cleanNum = (v: number | string): number => {
    if (typeof v === 'number') return v;
    const p = parseFloat(v);
    return isNaN(p) ? 0 : p;
  };

  const cleanDataPoints = dataPoints.map(p => ({
    id: p.id,
    x: cleanNum(p.x),
    y: cleanNum(p.y),
  }));

  const xValues = cleanDataPoints.map(p => p.x);
  const yValues = cleanDataPoints.map(p => p.y);

  const statsX = computeDescriptiveStats(xValues);
  const statsY = computeDescriptiveStats(yValues);
  const confIntervalX = xValues.length >= 2 ? confidenceIntervalMean(xValues, confLevel) : null;

  let regLinear: RegressionResult | null = null;
  let regQuad: RegressionResult | null = null;
  let regLog: RegressionResult | null = null;
  let regExp: RegressionResult | null = null;
  let regPower: RegressionResult | null = null;

  try { regLinear = computeLinearRegression(cleanDataPoints); } catch {}
  try { regQuad = computeQuadraticRegression(cleanDataPoints); } catch {}
  try { regLog = computeLogarithmicRegression(cleanDataPoints); } catch {}
  try { regExp = computeExponentialRegression(cleanDataPoints); } catch {}
  try { regPower = computePowerRegression(cleanDataPoints); } catch {}

  const activeReg =
    selectedRegType === 'Linear' ? regLinear :
    selectedRegType === 'Quadratic' ? regQuad :
    selectedRegType === 'Logarithmic' ? regLog :
    selectedRegType === 'Exponential' ? regExp : regPower;

  // Draw Scatter Plot + Regression Line on Canvas
  useEffect(() => {
    if (subTab !== 'REGRESSION' || !canvasRef.current || dataPoints.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI Retina scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const cssWidth = rect.width || 500;
    const cssHeight = rect.height || 260;

    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);

    ctx.save();
    ctx.scale(dpr, dpr);

    const width = cssWidth;
    const height = cssHeight;
    ctx.clearRect(0, 0, width, height);

    const padding = 40;
    const minX = Math.min(...xValues, 0);
    const maxX = Math.max(...xValues, 1) * 1.1;
    const minY = Math.min(...yValues, 0);
    const maxY = Math.max(...yValues, 1) * 1.1;

    const toCanvasX = (x: number) => padding + ((x - minX) / (maxX - minX || 1)) * (width - 2 * padding);
    const toCanvasY = (y: number) => height - padding - ((y - minY) / (maxY - minY || 1)) * (height - 2 * padding);

    // Grid lines & Axes
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const xVal = minX + (i / 5) * (maxX - minX);
      const yVal = minY + (i / 5) * (maxY - minY);
      
      const cx = toCanvasX(xVal);
      const cy = toCanvasY(yVal);

      ctx.beginPath();
      ctx.moveTo(cx, padding);
      ctx.lineTo(cx, height - padding);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(padding, cy);
      ctx.lineTo(width - padding, cy);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText(xVal.toFixed(1), cx - 10, height - padding + 15);
      ctx.fillText(yVal.toFixed(1), 5, cy + 3);
    }

    // Axes
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // Draw Regression Curve if available
    if (activeReg) {
      ctx.beginPath();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;

      const steps = 100;
      for (let i = 0; i <= steps; i++) {
        const x = minX + (i / steps) * (maxX - minX);
        try {
          const y = activeReg.predictY(x);
          const cx = toCanvasX(x);
          const cy = toCanvasY(y);
          if (i === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        } catch {}
      }
      ctx.stroke();
    }

    // Draw Data Points
    dataPoints.forEach(p => {
      const cx = toCanvasX(p.x);
      const cy = toCanvasY(p.y);

      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#d97706';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    ctx.restore();
  }, [subTab, dataPoints, selectedRegType, activeReg]);

  const handleRunTTest = () => {
    try {
      const res = oneSampleTTest(xValues, hypoMu0);
      setTTestResult(res);
      onPushHistory(`t-Test (μ₀=${hypoMu0})`, `t=${res.tStat.toFixed(4)}, p=${res.pValue.toFixed(4)}`);
    } catch {
      setTTestResult(null);
    }
  };

  return (
    <div className="w-full space-y-3 bg-transparent text-slate-900">
      {/* Sub tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setSubTab('DATA')}
          className={`px-3 py-1.5 rounded-lg transition ${
            subTab === 'DATA' ? 'bg-cyan-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          Data Table ({dataPoints.length})
        </button>
        <button
          onClick={() => setSubTab('STATS')}
          className={`px-3 py-1.5 rounded-lg transition ${
            subTab === 'STATS' ? 'bg-cyan-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          Descriptive Metrics
        </button>
        <button
          onClick={() => setSubTab('REGRESSION')}
          className={`px-3 py-1.5 rounded-lg transition ${
            subTab === 'REGRESSION' ? 'bg-cyan-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          Scatter Plot & Regression
        </button>
        <button
          onClick={() => setSubTab('HYPOTHESIS')}
          className={`px-3 py-1.5 rounded-lg transition ${
            subTab === 'HYPOTHESIS' ? 'bg-cyan-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          Hypothesis Tests & C.I.
        </button>
        <button
          onClick={() => setSubTab('PROBABILITY')}
          className={`px-3 py-1.5 rounded-lg transition ${
            subTab === 'PROBABILITY' ? 'bg-cyan-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          Distributions
        </button>
      </div>

      {/* Data Table */}
      {subTab === 'DATA' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-white p-2.5 rounded-xl border border-slate-200 text-[10px]">
            <span className="text-slate-400 font-bold uppercase mr-1">Load Sample Dataset:</span>
            <button
              onClick={() => loadDataset('LINEAR_TREND')}
              className="px-2 py-1 bg-slate-100 hover:bg-cyan-50 border border-slate-200 rounded font-semibold text-slate-700 hover:text-cyan-800 transition"
            >
              Linear Trend (y = 12x + b)
            </button>
            <button
              onClick={() => loadDataset('PARABOLIC')}
              className="px-2 py-1 bg-slate-100 hover:bg-cyan-50 border border-slate-200 rounded font-semibold text-slate-700 hover:text-cyan-800 transition"
            >
              Parabolic curve (y = x²)
            </button>
            <button
              onClick={() => loadDataset('EXP_GROWTH')}
              className="px-2 py-1 bg-slate-100 hover:bg-cyan-50 border border-slate-200 rounded font-semibold text-slate-700 hover:text-cyan-800 transition"
            >
              Exponential Growth (2ⁿ)
            </button>
            <button
              onClick={() => loadDataset('RANDOM_SCATTER')}
              className="px-2 py-1 bg-slate-100 hover:bg-cyan-50 border border-slate-200 rounded font-semibold text-slate-700 hover:text-cyan-800 transition"
            >
              Random Scatter
            </button>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Statistical Spreadsheet Data Entry</h3>
            <button
              onClick={handleAddPoint}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Row</span>
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
            <table className="w-full text-left font-mono text-xs text-slate-800">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 pb-1">
                  <th className="p-1.5 w-12 text-center">#</th>
                  <th className="p-1.5">X Value</th>
                  <th className="p-1.5">Y Value</th>
                  <th className="p-1.5 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataPoints.map((pt, idx) => (
                  <tr key={pt.id}>
                    <td className="p-1.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={pt.x}
                        onChange={e => {
                          const raw = e.target.value;
                          let val: number | string;
                          if (raw === '' || raw === '-') {
                            val = raw;
                          } else {
                            const p = parseFloat(raw);
                            val = isNaN(p) ? raw : p;
                          }
                          setDataPoints(prev =>
                            prev.map(p => (p.id === pt.id ? { ...p, x: val as any } : p))
                          );
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 font-bold outline-hidden focus:border-cyan-600"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={pt.y}
                        onChange={e => {
                          const raw = e.target.value;
                          let val: number | string;
                          if (raw === '' || raw === '-') {
                            val = raw;
                          } else {
                            const p = parseFloat(raw);
                            val = isNaN(p) ? raw : p;
                          }
                          setDataPoints(prev =>
                            prev.map(p => (p.id === pt.id ? { ...p, y: val as any } : p))
                          );
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-amber-900 font-bold outline-hidden focus:border-amber-600"
                      />
                    </td>
                    <td className="p-1.5 text-center">
                      <button
                        onClick={() => handleRemovePoint(pt.id)}
                        className="p-1 text-rose-600 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comprehensive Descriptive Metrics */}
      {subTab === 'STATS' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Comprehensive Descriptive Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            {/* X Summary */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-cyan-700 text-sm mb-2 pb-1 border-b border-slate-200">X Variable Metrics</div>
              <div className="flex justify-between"><span>Sample Size (n):</span><span className="font-bold text-slate-900">{statsX.n}</span></div>
              <div className="flex justify-between"><span>Mean (x̄):</span><span className="font-bold text-cyan-800">{statsX.mean.toFixed(6)}</span></div>
              <div className="flex justify-between"><span>Median:</span><span>{statsX.median.toFixed(4)}</span></div>
              <div className="flex justify-between"><span>Geometric Mean:</span><span>{statsX.geometricMean ? statsX.geometricMean.toFixed(6) : 'N/A'}</span></div>
              <div className="flex justify-between"><span>Harmonic Mean:</span><span>{statsX.harmonicMean ? statsX.harmonicMean.toFixed(6) : 'N/A'}</span></div>
              <div className="flex justify-between"><span>Sample Variance (s²):</span><span>{statsX.sampleVariance.toFixed(6)}</span></div>
              <div className="flex justify-between"><span>Sample Std Dev (s_x):</span><span className="text-amber-800 font-bold">{statsX.sampleStdDev.toFixed(6)}</span></div>
              <div className="flex justify-between"><span>Std Error Mean (SE):</span><span>{statsX.stdErrMean.toFixed(6)}</span></div>
              <div className="flex justify-between"><span>Coeff of Variation (CV%):</span><span>{statsX.coeffVariation.toFixed(2)}%</span></div>
              <div className="flex justify-between"><span>Skewness:</span><span>{statsX.skewness.toFixed(4)}</span></div>
              <div className="flex justify-between"><span>Excess Kurtosis:</span><span>{statsX.kurtosis.toFixed(4)}</span></div>
              <div className="flex justify-between"><span>Min / Max / Range:</span><span>{statsX.min} / {statsX.max} ({statsX.range})</span></div>
              <div className="flex justify-between"><span>IQR (Q₃ - Q₁):</span><span>{statsX.iqr.toFixed(4)}</span></div>
            </div>

            {/* Y Summary */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-amber-700 text-sm mb-2 pb-1 border-b border-slate-200">Y Variable Metrics</div>
              <div className="flex justify-between"><span>Sample Size (n):</span><span className="font-bold text-slate-900">{statsY.n}</span></div>
              <div className="flex justify-between"><span>Mean (ȳ):</span><span className="font-bold text-amber-800">{statsY.mean.toFixed(6)}</span></div>
              <div className="flex justify-between"><span>Median:</span><span>{statsY.median.toFixed(4)}</span></div>
              <div className="flex justify-between"><span>Geometric Mean:</span><span>{statsY.geometricMean ? statsY.geometricMean.toFixed(6) : 'N/A'}</span></div>
              <div className="flex justify-between"><span>Harmonic Mean:</span><span>{statsY.harmonicMean ? statsY.harmonicMean.toFixed(6) : 'N/A'}</span></div>
              <div className="flex justify-between"><span>Sample Variance (s²):</span><span>{statsY.sampleVariance.toFixed(6)}</span></div>
              <div className="flex justify-between"><span>Sample Std Dev (s_y):</span><span className="text-amber-800 font-bold">{statsY.sampleStdDev.toFixed(6)}</span></div>
              <div className="flex justify-between"><span>Std Error Mean (SE):</span><span>{statsY.stdErrMean.toFixed(6)}</span></div>
              <div className="flex justify-between"><span>Coeff of Variation (CV%):</span><span>{statsY.coeffVariation.toFixed(2)}%</span></div>
              <div className="flex justify-between"><span>Skewness:</span><span>{statsY.skewness.toFixed(4)}</span></div>
              <div className="flex justify-between"><span>Excess Kurtosis:</span><span>{statsY.kurtosis.toFixed(4)}</span></div>
              <div className="flex justify-between"><span>Min / Max / Range:</span><span>{statsY.min} / {statsY.max} ({statsY.range})</span></div>
              <div className="flex justify-between"><span>IQR (Q₃ - Q₁):</span><span>{statsY.iqr.toFixed(4)}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Regressions & Scatter Plot Canvas */}
      {subTab === 'REGRESSION' && (
        <div className="space-y-3 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-800">Scatter Plot & Regression Curve Plotter</h3>
            <div className="flex rounded border border-slate-300 bg-slate-200 text-xs p-0.5">
              {(['Linear', 'Quadratic', 'Logarithmic', 'Exponential', 'Power'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedRegType(type)}
                  className={`px-2 py-1 rounded font-bold ${
                    selectedRegType === type ? 'bg-cyan-600 text-white' : 'text-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col items-center space-y-3">
            <canvas ref={canvasRef} style={{ width: '100%', height: '260px' }} className="w-full max-w-xl h-64 border border-slate-100 rounded-lg bg-slate-50" />
            
            {activeReg && (
              <div className="w-full space-y-2">
                <div className="p-2.5 bg-cyan-50 border border-cyan-200 rounded-lg text-center font-bold text-cyan-950 text-sm">
                  {activeReg.equation}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Slope (m)</span>
                    <span className="font-bold text-cyan-800 text-sm">
                      {activeReg.slope !== undefined ? activeReg.slope.toFixed(6) : 'N/A'}
                    </span>
                  </div>

                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Intercept (b)</span>
                    <span className="font-bold text-cyan-800 text-sm">
                      {activeReg.intercept !== undefined ? activeReg.intercept.toFixed(6) : 'N/A'}
                    </span>
                  </div>

                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Correlation (r)</span>
                    <span className="font-bold text-amber-800 text-sm">
                      {activeReg.r !== undefined ? activeReg.r.toFixed(6) : 'N/A'}
                    </span>
                  </div>

                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">R² Goodness of Fit</span>
                    <span className="font-bold text-emerald-800 text-sm">
                      {activeReg.r2.toFixed(6)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hypothesis Testing & Confidence Intervals */}
      {subTab === 'HYPOTHESIS' && (
        <div className="space-y-3 font-mono text-xs">
          <h3 className="text-sm font-bold text-slate-800">Hypothesis Testing & Confidence Intervals (X Data)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* One Sample t-Test */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-cyan-700 text-sm">One-Sample t-Test</div>
              <div className="flex items-center gap-2">
                <label className="text-slate-500">Null μ₀:</label>
                <input
                  type="number"
                  value={hypoMu0}
                  onChange={e => setHypoMu0(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 font-bold"
                />
                <button
                  onClick={handleRunTTest}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold shadow-2xs"
                >
                  Run Test
                </button>
              </div>

              {tTestResult && (
                <div className="p-2 bg-slate-50 border border-slate-200 rounded space-y-0.5 text-slate-900">
                  <div>t-Stat: <span className="font-bold text-cyan-800">{tTestResult.tStat.toFixed(6)}</span></div>
                  <div>df: <span>{tTestResult.df}</span> | p-Value: <span className="font-bold">{tTestResult.pValue.toFixed(6)}</span></div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {tTestResult.pValue < 0.05 ? 'Significant difference at α=0.05 (Reject H₀)' : 'Fail to reject H₀ at α=0.05'}
                  </div>
                </div>
              )}
            </div>

            {/* Confidence Interval */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-amber-700 text-sm">Confidence Interval for Mean μ</div>
              <div className="flex items-center gap-2">
                <label className="text-slate-500">Level:</label>
                <select
                  value={confLevel}
                  onChange={e => setConfLevel(parseFloat(e.target.value))}
                  className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 font-bold"
                >
                  <option value={0.90}>90% C.I.</option>
                  <option value={0.95}>95% C.I.</option>
                  <option value={0.99}>99% C.I.</option>
                </select>
              </div>

              {confIntervalX && (
                <div className="p-2 bg-slate-50 border border-slate-200 rounded space-y-0.5 text-slate-900">
                  <div>Interval: <span className="font-bold text-amber-800">[{confIntervalX.lower.toFixed(4)}, {confIntervalX.upper.toFixed(4)}]</span></div>
                  <div>Margin of Error (E): ±{confIntervalX.marginOfError.toFixed(4)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Probability */}
      {subTab === 'PROBABILITY' && (
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Probability Distributions</h3>
            <div className="flex bg-slate-200 p-0.5 rounded border border-slate-300 text-xs">
              {(['NORMAL', 'BINOMIAL', 'POISSON'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setProbType(p)}
                  className={`px-2 py-0.5 rounded ${probType === p ? 'bg-cyan-600 text-white font-bold' : 'text-slate-600'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {probType === 'NORMAL' && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-500 block text-[11px]">x</label>
                  <input
                    type="number"
                    value={normX}
                    onChange={e => setNormX(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block text-[11px]">Mean (μ)</label>
                  <input
                    type="number"
                    value={normMean}
                    onChange={e => setNormMean(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block text-[11px]">Std Dev (σ)</label>
                  <input
                    type="number"
                    value={normSd}
                    onChange={e => setNormSd(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="p-2 bg-slate-100 rounded space-y-1 text-slate-800">
                <div>PDF f(x): <span className="font-bold text-cyan-800">{normalPDF(normX, normMean, normSd).toFixed(6)}</span></div>
                <div>CDF P(X ≤ x): <span className="font-bold text-cyan-800">{normalCDF(normX, normMean, normSd).toFixed(6)}</span></div>
                <div>InvNormal(p={normProb}): <span className="font-bold text-amber-800">{inverseNormalCDF(normProb, normMean, normSd).toFixed(6)}</span></div>
              </div>
            </div>
          )}

          {probType === 'BINOMIAL' && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-500 block text-[11px]">k (Successes)</label>
                  <input
                    type="number"
                    value={binomK}
                    onChange={e => setBinomK(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block text-[11px]">n (Trials)</label>
                  <input
                    type="number"
                    value={binomN}
                    onChange={e => setBinomN(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block text-[11px]">p (Prob)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={binomP}
                    onChange={e => setBinomP(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="p-2 bg-slate-100 rounded space-y-1 text-slate-800">
                <div>PD P(X = k): <span className="font-bold text-cyan-800">{binomialPD(binomK, binomN, binomP).toFixed(6)}</span></div>
                <div>CD P(X ≤ k): <span className="font-bold text-cyan-800">{binomialCD(binomK, binomN, binomP).toFixed(6)}</span></div>
              </div>
            </div>
          )}

          {probType === 'POISSON' && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 block text-[11px]">x (Events)</label>
                  <input
                    type="number"
                    value={poissX}
                    onChange={e => setPoissX(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block text-[11px]">Mean (λ)</label>
                  <input
                    type="number"
                    value={poissLambda}
                    onChange={e => setPoissLambda(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="p-2 bg-slate-100 rounded space-y-1 text-slate-800">
                <div>PD P(X = x): <span className="font-bold text-cyan-800">{poissonPD(poissX, poissLambda).toFixed(6)}</span></div>
                <div>CD P(X ≤ x): <span className="font-bold text-cyan-800">{poissonCD(poissX, poissLambda).toFixed(6)}</span></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
