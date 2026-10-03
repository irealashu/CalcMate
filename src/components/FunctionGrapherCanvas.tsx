import React, { useEffect, useRef, useState } from 'react';
import { create, all } from 'mathjs';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, Sparkles } from 'lucide-react';
import { AngleUnit, MemoryRegisters } from '../types/calculator';

const math = create(all, {});

interface FunctionGrapherCanvasProps {
  initialFx?: string;
  initialGx?: string;
  initialHx?: string;
  initialKx?: string;
  angleUnit?: AngleUnit;
  registers?: MemoryRegisters;
}

export const FunctionGrapherCanvas: React.FC<FunctionGrapherCanvasProps> = ({
  initialFx = 'x^3 - 3*x',
  initialGx = 'sin(x)',
  initialHx = 'cos(x)',
  initialKx = 'x^2 - 4',
  angleUnit = 'DEG',
  registers = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, M: 0, X: 0, Y: 0, Ans: 0 },
}) => {
  const [fxExpr, setFxExpr] = useState(initialFx);
  const [gxExpr, setGxExpr] = useState(initialGx);
  const [hxExpr, setHxExpr] = useState(initialHx);
  const [kxExpr, setKxExpr] = useState(initialKx);

  const [showGx, setShowGx] = useState(true);
  const [showHx, setShowHx] = useState(false);
  const [showKx, setShowKx] = useState(false);
  const [showTangent, setShowTangent] = useState(false);

  // View bounds
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-10);
  const [yMax, setYMax] = useState(10);

  // Hover Inspector
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [hoverY, setHoverY] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const compileFunc = (expr: string) => {
    if (!expr || expr.trim() === '') return null;
    try {
      let sanitized = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/π/g, 'pi');
      const compiled = math.compile(sanitized);
      return (xVal: number): number => {
        const scope = {
          x: xVal, X: xVal, pi: Math.PI, e: Math.E,
          A: registers.A, B: registers.B, C: registers.C, D: registers.D, E: registers.E, F: registers.F,
          M: registers.M, Y: registers.Y, Ans: registers.Ans,
        };
        const res = compiled.evaluate(scope);
        return typeof res === 'number' && !isNaN(res) && isFinite(res) ? res : NaN;
      };
    } catch {
      return null;
    }
  };

  const fEval = compileFunc(fxExpr);
  const gEval = showGx ? compileFunc(gxExpr) : null;
  const hEval = showHx ? compileFunc(hxExpr) : null;
  const kEval = showKx ? compileFunc(kxExpr) : null;

  // Zoom / Pan Helpers
  const handleZoom = (factor: number) => {
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;
    const xSpan = (xMax - xMin) * factor;
    const ySpan = (yMax - yMin) * factor;

    setXMin(xCenter - xSpan / 2);
    setXMax(xCenter + xSpan / 2);
    setYMin(yCenter - ySpan / 2);
    setYMax(yCenter + ySpan / 2);
  };

  const handleResetView = () => {
    setXMin(-10);
    setXMax(10);
    setYMin(-10);
    setYMax(10);
  };

  const handleSetTrigView = () => {
    setXMin(-2 * Math.PI);
    setXMax(2 * Math.PI);
    setYMin(-3);
    setYMax(3);
  };

  // High-DPI Razor-Sharp Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI / Retina scaling resolution fix
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const cssWidth = rect.width || 650;
    const cssHeight = rect.height || 320;

    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);

    ctx.save();
    ctx.scale(dpr, dpr);

    const width = cssWidth;
    const height = cssHeight;

    ctx.clearRect(0, 0, width, height);

    // Canvas background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;
    const toRealX = (cx: number) => xMin + (cx / width) * (xMax - xMin);

    // Draw Grid Lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;

    const xStep = Math.pow(10, Math.floor(Math.log10(xMax - xMin))) / 2 || 1;
    const startX = Math.floor(xMin / xStep) * xStep;
    for (let x = startX; x <= xMax; x += xStep) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      if (Math.abs(x) > 1e-6) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText(x.toFixed(1).replace(/\.0$/, ''), cx + 2, toCanvasY(0) - 4 || height - 5);
      }
    }

    const yStep = Math.pow(10, Math.floor(Math.log10(yMax - yMin))) / 2 || 1;
    const startY = Math.floor(yMin / yStep) * yStep;
    for (let y = startY; y <= yMax; y += yStep) {
      const cy = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();

      if (Math.abs(y) > 1e-6) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText(y.toFixed(1).replace(/\.0$/, ''), toCanvasX(0) + 4 || 5, cy - 2);
      }
    }

    // Draw Axes (X and Y)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;

    const y0 = toCanvasY(0);
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.lineTo(width, y0);
    ctx.stroke();

    const x0 = toCanvasX(0);
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0, height);
    ctx.stroke();

    // Helper to plot any function curve
    const plotCurve = (evalFn: ((x: number) => number) | null, strokeColor: string) => {
      if (!evalFn) return;
      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;

      let drawing = false;
      for (let cx = 0; cx <= width; cx += 2) {
        const x = toRealX(cx);
        const y = evalFn(x);
        if (!isNaN(y) && isFinite(y)) {
          const cy = toCanvasY(y);
          if (!drawing) {
            ctx.moveTo(cx, cy);
            drawing = true;
          } else {
            ctx.lineTo(cx, cy);
          }
        } else {
          drawing = false;
        }
      }
      ctx.stroke();
    };

    // Plot all active graphs simultaneously
    plotCurve(fEval, '#0284c7'); // f(x) Blue
    plotCurve(gEval, '#d97706'); // g(x) Amber
    plotCurve(hEval, '#059669'); // h(x) Emerald
    plotCurve(kEval, '#7c3aed'); // k(x) Purple

    // Draw Tangent Line at hover position if enabled for f(x)
    if (showTangent && hoverX !== null && fEval) {
      const yVal = fEval(hoverX);
      const h = 1e-5;
      const df = (fEval(hoverX + h) - fEval(hoverX - h)) / (2 * h);

      if (!isNaN(df) && isFinite(df)) {
        ctx.beginPath();
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        const tanX1 = xMin;
        const tanY1 = yVal + df * (tanX1 - hoverX);
        const tanX2 = xMax;
        const tanY2 = yVal + df * (tanX2 - hoverX);

        ctx.moveTo(toCanvasX(tanX1), toCanvasY(tanY1));
        ctx.lineTo(toCanvasX(tanX2), toCanvasY(tanY2));
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Hover Crosshair Inspector
    if (hoverX !== null) {
      const cx = toCanvasX(hoverX);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);

      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }, [fxExpr, gxExpr, hxExpr, kxExpr, showGx, showHx, showKx, xMin, xMax, yMin, yMax, hoverX, showTangent]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const x = xMin + (cx / rect.width) * (xMax - xMin);
    const y = yMin + ((rect.height - cy) / rect.height) * (yMax - yMin);

    setHoverX(x);
    setHoverY(y);
  };

  const handleMouseLeave = () => {
    setHoverX(null);
    setHoverY(null);
  };

  const hoverFxVal = hoverX !== null && fEval ? fEval(hoverX) : null;
  const hoverGxVal = hoverX !== null && gEval ? gEval(hoverX) : null;
  const hoverHxVal = hoverX !== null && hEval ? hEval(hoverX) : null;
  const hoverKxVal = hoverX !== null && kEval ? kEval(hoverX) : null;

  // Tangent Slope m and Y-Intercept b at hover point
  let tangentSlope: number | null = null;
  let tangentIntercept: number | null = null;
  if (hoverX !== null && fEval) {
    const h = 1e-5;
    const fx = fEval(hoverX);
    const df = (fEval(hoverX + h) - fEval(hoverX - h)) / (2 * h);
    if (!isNaN(df) && isFinite(df)) {
      tangentSlope = df;
      tangentIntercept = fx - df * hoverX;
    }
  }

  const yIntercept0 = fEval ? fEval(0) : null;

  // Compute roots for f(x) in [xMin, xMax]
  const roots: number[] = [];
  if (fEval) {
    const steps = 150;
    const dx = (xMax - xMin) / steps;
    let prevX = xMin;
    let prevY = fEval(prevX);
    for (let i = 1; i <= steps; i++) {
      const currX = xMin + i * dx;
      const currY = fEval(currX);
      if (!isNaN(prevY) && !isNaN(currY)) {
        if (prevY * currY <= 0 || Math.abs(currY) < 1e-4) {
          let a = prevX;
          let b = currX;
          let mid = (a + b) / 2;
          for (let iter = 0; iter < 4; iter++) {
            mid = (a + b) / 2;
            const fMid = fEval(mid);
            if (fEval(a) * fMid <= 0) {
              b = mid;
            } else {
              a = mid;
            }
          }
          if (!roots.some(r => Math.abs(r - mid) < 0.05)) {
            roots.push(mid);
          }
        }
      }
      prevX = currX;
      prevY = currY;
    }
  }

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 text-slate-900">
      {/* Top Header & Preset Views */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-600" />
          <h3 className="text-xs font-bold text-slate-800">Multi-Function Graph Plotter & Tangent Analyzer</h3>
        </div>

        {/* Preset View Buttons */}
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
          <button
            onClick={() => handleZoom(0.7)}
            className="p-1.5 rounded-lg bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(1.4)}
            className="p-1.5 rounded-lg bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 rounded-lg bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 transition"
            title="Reset Standard [-10, 10] View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleSetTrigView}
            className="px-2 py-1 rounded-lg bg-cyan-50 border border-cyan-300 text-cyan-900 font-bold text-[11px]"
          >
            Trig [-2π, 2π]
          </button>
        </div>
      </div>

      {/* Multiple Function Inputs (Up to 4 functions simultaneously) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
        {/* f(x) */}
        <div>
          <label className="text-[11px] font-bold text-cyan-700 block mb-1">
            f(x) [Primary Blue]:
          </label>
          <input
            type="text"
            value={fxExpr}
            onChange={e => setFxExpr(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-bold outline-hidden focus:border-cyan-600"
            placeholder="x^3 - 3*x"
          />
        </div>

        {/* g(x) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-amber-700">
              g(x) [Amber]:
            </label>
            <button
              onClick={() => setShowGx(prev => !prev)}
              className={`text-[10px] px-1.5 py-0.5 rounded border transition font-bold ${
                showGx ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {showGx ? 'Active' : 'Enable g(x)'}
            </button>
          </div>
          <input
            type="text"
            disabled={!showGx}
            value={gxExpr}
            onChange={e => setGxExpr(e.target.value)}
            className={`w-full border rounded-lg px-3 py-1.5 text-slate-900 font-bold outline-hidden ${
              showGx ? 'bg-white border-slate-300 focus:border-amber-600' : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
            placeholder="sin(x)"
          />
        </div>

        {/* h(x) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-emerald-700">
              h(x) [Emerald]:
            </label>
            <button
              onClick={() => setShowHx(prev => !prev)}
              className={`text-[10px] px-1.5 py-0.5 rounded border transition font-bold ${
                showHx ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {showHx ? 'Active' : 'Enable h(x)'}
            </button>
          </div>
          <input
            type="text"
            disabled={!showHx}
            value={hxExpr}
            onChange={e => setHxExpr(e.target.value)}
            className={`w-full border rounded-lg px-3 py-1.5 text-slate-900 font-bold outline-hidden ${
              showHx ? 'bg-white border-slate-300 focus:border-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
            placeholder="cos(x)"
          />
        </div>

        {/* k(x) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-purple-700">
              k(x) [Purple]:
            </label>
            <button
              onClick={() => setShowKx(prev => !prev)}
              className={`text-[10px] px-1.5 py-0.5 rounded border transition font-bold ${
                showKx ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {showKx ? 'Active' : 'Enable k(x)'}
            </button>
          </div>
          <input
            type="text"
            disabled={!showKx}
            value={kxExpr}
            onChange={e => setKxExpr(e.target.value)}
            className={`w-full border rounded-lg px-3 py-1.5 text-slate-900 font-bold outline-hidden ${
              showKx ? 'bg-white border-slate-300 focus:border-purple-600' : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
            placeholder="x^2 - 4"
          />
        </div>
      </div>

      {/* Canvas Plot Container */}
      <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '320px' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-80 cursor-crosshair block"
        />

        {/* Hover Inspector Overlay Badge */}
        {hoverX !== null && (
          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-xs border border-slate-200 p-2.5 rounded-lg text-xs font-mono shadow-md text-slate-800 space-y-1">
            <div className="flex items-center gap-1 font-bold text-slate-600">
              <Crosshair className="w-3 h-3 text-cyan-600" />
              <span>x = {hoverX.toFixed(4)}</span>
            </div>
            {hoverFxVal !== null && !isNaN(hoverFxVal) && (
              <div className="text-cyan-700 font-bold">f(x) = {hoverFxVal.toFixed(4)}</div>
            )}
            {hoverGxVal !== null && !isNaN(hoverGxVal) && (
              <div className="text-amber-700 font-bold">g(x) = {hoverGxVal.toFixed(4)}</div>
            )}
            {hoverHxVal !== null && !isNaN(hoverHxVal) && (
              <div className="text-emerald-700 font-bold">h(x) = {hoverHxVal.toFixed(4)}</div>
            )}
            {hoverKxVal !== null && !isNaN(hoverKxVal) && (
              <div className="text-purple-700 font-bold">k(x) = {hoverKxVal.toFixed(4)}</div>
            )}
            {tangentSlope !== null && (
              <div className="text-rose-700 font-bold">
                Slope m = {tangentSlope.toFixed(4)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slope & Intercept & Roots Properties Panel */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs text-slate-800 items-center">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-bold">y-Intercept f(0)</span>
          <span className="font-bold text-cyan-800 text-sm">
            {yIntercept0 !== null && !isNaN(yIntercept0) ? yIntercept0.toFixed(4) : 'Undefined'}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Detected Roots</span>
          <span className="font-bold text-emerald-700 text-sm truncate block" title={roots.map(r => r.toFixed(4)).join(', ')}>
            {roots.length > 0 ? roots.map(r => r.toFixed(2)).join(', ') : 'None in view'}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Tangent Slope (m)</span>
          <span className="font-bold text-rose-700 text-sm">
            {tangentSlope !== null ? tangentSlope.toFixed(4) : 'Hover Graph'}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Tangent Intercept (b)</span>
          <span className="font-bold text-rose-800 text-sm">
            {tangentIntercept !== null ? tangentIntercept.toFixed(4) : 'Hover Graph'}
          </span>
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={() => setShowTangent(prev => !prev)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition ${
              showTangent ? 'bg-rose-100 border-rose-300 text-rose-900' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            {showTangent ? 'Hide Tangent' : 'Show Tangent'}
          </button>
        </div>
      </div>
    </div>
  );
};
