import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { DisplayLCD } from './components/DisplayLCD';
import { KeypadMatrix } from './components/KeypadMatrix';
import { MemoryAndHistoryDrawer } from './components/MemoryAndHistoryDrawer';
import { OfflineIndicator } from './components/OfflineIndicator';

import { CalculusPanel } from './components/panels/CalculusPanel';
import { EquationsPanel } from './components/panels/EquationsPanel';
import { MatrixVectorPanel } from './components/panels/MatrixVectorPanel';
import { ComplexPanel } from './components/panels/ComplexPanel';
import { StatisticsPanel } from './components/panels/StatisticsPanel';
import { BaseNPanel } from './components/panels/BaseNPanel';
import { ConstantsPanel } from './components/panels/ConstantsPanel';
import { ConverterPanel } from './components/panels/ConverterPanel';
import { GraphPlotterPanel } from './components/panels/GraphPlotterPanel';
import { QuantumMechanicsPanel } from './components/panels/QuantumMechanicsPanel';

import {
  AngleUnit,
  CalculatorMode,
  DisplayFormat,
  HistoryItem,
  MemoryRegisterKey,
  MemoryRegisters,
} from './types/calculator';
import { evaluateExpression } from './utils/scientificEngine';

const STORAGE_KEY_REGS = 'calc_memory_registers_v1';
const STORAGE_KEY_HIST = 'calc_history_items_v1';

const SIDEBAR_MODES: { id: CalculatorMode; label: string; desc: string; tag: string; icon: string }[] = [
  { id: 'SCIENTIFIC', label: 'Scientific Keypad', desc: 'Natural textbook syntax math', tag: '1', icon: '🔢' },
  { id: 'CALCULUS', label: 'Calculus Solvers', desc: 'Derivatives, definite integrals, series limits', tag: 'Int', icon: '⚡' },
  { id: 'GRAPH_PLOTTER', label: '2D Graph Plotter', desc: 'Interactive coordinate graphing canvas', tag: 'Gr', icon: '📊' },
  { id: 'EQUATIONS', label: 'Equation Solvers', desc: 'Linear systems, polynomial roots', tag: 'Eq', icon: '✏️' },
  { id: 'MATRIX_VECTOR', label: 'Matrices & Vectors', desc: 'Inverses, eigenvalues, dot/cross', tag: 'Mat', icon: '📐' },
  { id: 'COMPLEX', label: 'Complex Numbers', desc: 'Cartesian & polar arithmetic', tag: 'C', icon: '💡' },
  { id: 'STATISTICS', label: 'Statistics & Regress', desc: 'Scatter plots, regressions, summaries', tag: 'St', icon: '📈' },
  { id: 'BASE_N', label: 'Base-N Programmer', desc: 'HEX/DEC/OCT/BIN bitwise logic', tag: 'Bin', icon: '💻' },
  { id: 'CONSTANTS', label: 'Physical Constants', desc: 'Universal scientific constants catalog', tag: 'Co', icon: '🌎' },
  { id: 'CONVERTER', label: 'Unit Converter Pro', desc: 'Dynamic physical units conversion utility', tag: 'Cv', icon: '🔄' },
  { id: 'QUANTUM', label: 'Quantum Mechanics', desc: 'Photons, de Broglie, uncertainty, box, Rydberg', tag: 'Qm', icon: '⚛️' },
];

export default function App() {
  const [mode, setMode] = useState<CalculatorMode>('SCIENTIFIC');
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('DEG');
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>('DECIMAL');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Expression Buffer & Cursor Position
  const [expression, setExpression] = useState<string>('');
  const [cursorPos, setCursorPos] = useState<number>(0);

  // Key Modifiers
  const [shiftActive, setShiftActive] = useState<boolean>(false);
  const [alphaActive, setAlphaActive] = useState<boolean>(false);

  // Drawers
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerTab, setDrawerTab] = useState<'MEMORY' | 'HISTORY'>('MEMORY');

  // Registers & History with localStorage persistence
  const [registers, setRegisters] = useState<MemoryRegisters>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, M: 0, X: 0, Y: 0, Ans: 0 };
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HIST);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REGS, JSON.stringify(registers));
    } catch {}
  }, [registers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HIST, JSON.stringify(history));
    } catch {}
  }, [history]);

  // Live evaluation
  const evalResult = evaluateExpression(expression, angleUnit, registers);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEvaluate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const validChars = /^[0-9+\-*/().^xX%πe,a-fA-F]$/;
        if (validChars.test(e.key) || ['+', '-', '*', '/', '(', ')', '^', '.'].includes(e.key)) {
          e.preventDefault();
          handleKeyPress(e.key === 'X' ? 'x' : e.key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expression, cursorPos]);

  const pushHistory = (expr: string, res: string, numericVal?: number) => {
    if (!expr || expr.trim() === '') return;
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      expression: expr,
      result: res,
      numericValue: numericVal,
      mode,
      timestamp: Date.now(),
    };
    setHistory(prev => [newItem, ...prev].slice(0, 100));
  };

  const handleKeyPress = (key: string) => {
    setExpression(prev => {
      const before = prev.slice(0, cursorPos);
      const after = prev.slice(cursorPos);
      return before + key + after;
    });
    setCursorPos(prev => prev + key.length);

    if (shiftActive) setShiftActive(false);
    if (alphaActive) setAlphaActive(false);
  };

  const handleClear = () => {
    setExpression('');
    setCursorPos(0);
    setShiftActive(false);
    setAlphaActive(false);
  };

  const handleDelete = () => {
    if (expression.length === 0) return;
    setExpression(prev => {
      const before = prev.slice(0, Math.max(0, cursorPos - 1));
      const after = prev.slice(cursorPos);
      return before + after;
    });
    setCursorPos(prev => Math.max(0, prev - 1));
  };

  const handleEvaluate = () => {
    if (!expression || expression.trim() === '') return;
    if (evalResult.error) return;

    const val = evalResult.value;
    const strRes = evalResult.remainder
      ? `${evalResult.remainder.quotient} R ${evalResult.remainder.rem}`
      : val.toString();

    setRegisters(prev => ({ ...prev, Ans: val }));
    pushHistory(expression, strRes, val);
  };

  const toggleDisplayFormat = () => {
    const formats: DisplayFormat[] = [
      'DECIMAL',
      'EXACT_FRACTION',
      'MIXED_FRACTION',
      'ENGINEERING',
      'SCIENTIFIC',
    ];
    const currIdx = formats.indexOf(displayFormat);
    const nextIdx = (currIdx + 1) % formats.length;
    setDisplayFormat(formats[nextIdx]);
  };

  const handleStoreVariable = (regKey: MemoryRegisterKey) => {
    if (!isNaN(evalResult.value)) {
      setRegisters(prev => ({ ...prev, [regKey]: evalResult.value }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased bg-slate-100 text-slate-900 selection:bg-cyan-500/30 selection:text-cyan-900">
      {/* Header with Sidebar Toggle inside */}
      <Navbar
        mode={mode}
        angleUnit={angleUnit}
        setAngleUnit={setAngleUnit}
        onOpenMemory={() => {
          setDrawerTab('MEMORY');
          setIsDrawerOpen(true);
        }}
        onOpenHistory={() => {
          setDrawerTab('HISTORY');
          setIsDrawerOpen(true);
        }}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Universal Right-Aligned Floating Compact Dropdown Card */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end items-start pt-12 pr-2 sm:pr-4">
          {/* Backdrop */}
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-3xs"
          />

          {/* Compact Pill Dropdown Card */}
          <aside className="relative flex flex-col w-52 max-w-[80vw] bg-white border border-slate-200 rounded-2xl p-1 shadow-2xl animate-fade-in-up overflow-y-auto max-h-[75vh] overscroll-contain z-10 text-slate-800">
            <nav className="space-y-0.5">
              {SIDEBAR_MODES.map(m => {
                const isSelected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMode(m.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-left transition duration-150 group border ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-600 shadow-3xs font-bold'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-transparent hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] transition shrink-0 ${
                      isSelected ? 'bg-white/20 text-white font-black' : 'bg-slate-100 text-slate-600 group-hover:bg-cyan-50 group-hover:text-cyan-600'
                    }`}>
                      <span>{m.icon}</span>
                    </div>
                    <span className="text-[11px] font-bold truncate">{m.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Responsive Workspace Grid */}
      <div className="flex-1 w-full max-w-none mx-auto px-2 sm:px-4 py-2 sm:py-3 flex flex-col lg:flex-row gap-3">
        
        {/* Left Workspace Panel */}
        <main className="flex-1 min-w-0 flex flex-col justify-start">
          <div className="w-full space-y-3 bg-transparent text-slate-900">
            {/* LCD Display Screen (Rendered for Scientific mode) */}
            {mode === 'SCIENTIFIC' && (
              <DisplayLCD
                expression={expression}
                setExpression={setExpression}
                resultValue={evalResult.value}
                resultError={evalResult.error}
                angleUnit={angleUnit}
                displayFormat={displayFormat}
                toggleDisplayFormat={toggleDisplayFormat}
                shiftActive={shiftActive}
                alphaActive={alphaActive}
                memoryM={registers.M}
                cursorPos={cursorPos}
                setCursorPos={setCursorPos}
              />
            )}

            {/* Render selected Mode Panel with Smooth Animation */}
            <div key={mode} className="animate-fade-in-up">
              {mode === 'SCIENTIFIC' && (
                <KeypadMatrix
                  onKeyPress={handleKeyPress}
                  onClear={handleClear}
                  onDelete={handleDelete}
                  onEvaluate={handleEvaluate}
                  shiftActive={shiftActive}
                  setShiftActive={setShiftActive}
                  alphaActive={alphaActive}
                  setAlphaActive={setAlphaActive}
                  onStoreVariable={handleStoreVariable}
                  registers={registers}
                />
              )}

              {mode === 'CALCULUS' && (
                <CalculusPanel
                  angleUnit={angleUnit}
                  registers={registers}
                  onPushHistory={pushHistory}
                />
              )}

              {mode === 'EQUATIONS' && (
                <EquationsPanel onPushHistory={pushHistory} />
              )}

              {mode === 'MATRIX_VECTOR' && (
                <MatrixVectorPanel
                  angleUnit={angleUnit}
                  onPushHistory={pushHistory}
                />
              )}

              {mode === 'COMPLEX' && (
                <ComplexPanel
                  angleUnit={angleUnit}
                  onPushHistory={pushHistory}
                />
              )}

              {mode === 'STATISTICS' && (
                <StatisticsPanel onPushHistory={pushHistory} />
              )}

              {mode === 'BASE_N' && (
                <BaseNPanel onPushHistory={pushHistory} />
              )}

              {mode === 'GRAPH_PLOTTER' && (
                <GraphPlotterPanel
                  angleUnit={angleUnit}
                  registers={registers}
                />
              )}

              {mode === 'CONSTANTS' && (
                <ConstantsPanel
                  onInsertConstant={val => {
                    handleKeyPress(val.toString());
                    setMode('SCIENTIFIC');
                  }}
                />
              )}

              {mode === 'CONVERTER' && (
                <ConverterPanel
                  onInsertConstant={val => {
                    handleKeyPress(val.toString());
                    setMode('SCIENTIFIC');
                  }}
                />
              )}

              {mode === 'QUANTUM' && (
                <QuantumMechanicsPanel
                  angleUnit={angleUnit}
                  registers={registers}
                  onPushHistory={pushHistory}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Memory Registers & History Drawer */}
      <MemoryAndHistoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={drawerTab}
        setActiveTab={setDrawerTab}
        registers={registers}
        setRegisters={setRegisters}
        history={history}
        onClearHistory={() => setHistory([])}
        onRecallExpression={expr => {
          setExpression(expr);
          setCursorPos(expr.length);
          setIsDrawerOpen(false);
        }}
        onRecallResult={resStr => {
          const num = parseFloat(resStr);
          if (!isNaN(num)) {
            setRegisters(prev => ({ ...prev, Ans: num }));
            handleKeyPress('Ans');
          } else {
            handleKeyPress(resStr);
          }
          setIsDrawerOpen(false);
        }}
      />

      {/* Offline Toast Indicator */}
      <OfflineIndicator />
    </div>
  );
}
