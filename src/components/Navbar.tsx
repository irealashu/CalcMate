import React from 'react';
import { Calculator, Cpu, History, Menu, X } from 'lucide-react';
import { AngleUnit, CalculatorMode } from '../types/calculator';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  mode: CalculatorMode;
  angleUnit: AngleUnit;
  setAngleUnit: (unit: AngleUnit) => void;
  onOpenMemory: () => void;
  onOpenHistory: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const MODE_LABELS: Record<CalculatorMode, { label: string; tag: string }> = {
  SCIENTIFIC: { label: 'Scientific Keyboard', tag: '1' },
  CALCULUS: { label: 'Calculus Workbench', tag: 'Int' },
  GRAPH_PLOTTER: { label: '2D Graph Plotter', tag: 'Gr' },
  EQUATIONS: { label: 'Equation Solvers', tag: 'f(x)' },
  MATRIX_VECTOR: { label: 'Matrix & Vectors', tag: '[M]' },
  COMPLEX: { label: 'Complex Numbers', tag: 'i' },
  STATISTICS: { label: 'Statistics Analysis', tag: 'St' },
  BASE_N: { label: 'Base-N Logic', tag: 'HEX' },
  CONSTANTS: { label: 'Constants Catalog', tag: 'c0' },
  CONVERTER: { label: 'Unit Converter Pro', tag: 'Cv' },
  QUANTUM: { label: 'Quantum Mechanics', tag: 'Qm' },
};

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  angleUnit,
  setAngleUnit,
  onOpenMemory,
  onOpenHistory,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const currentMode = MODE_LABELS[mode] || MODE_LABELS.SCIENTIFIC;

  const cycleAngleUnit = () => {
    if (angleUnit === 'DEG') setAngleUnit('RAD');
    else if (angleUnit === 'RAD') setAngleUnit('GRAD');
    else setAngleUnit('DEG');
  };

  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur-md bg-white/95 border-slate-200 text-slate-900 shadow-xs">
      <div className="max-w-none mx-auto px-2.5 sm:px-4 py-1 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Brand & Active Mode Indicator */}
        <div className="flex items-center gap-1.5">
          {/* Logo */}
          <div className="hidden xs:flex w-6 h-6 rounded-md bg-cyan-600 text-white items-center justify-center font-black shadow-3xs shrink-0">
            <Calculator className="w-3.5 h-3.5" />
          </div>

          {/* App Name */}
          <div className="flex items-center">
            <span className="font-sans font-black tracking-tight text-xs sm:text-sm text-slate-800 bg-gradient-to-r from-slate-900 via-cyan-800 to-blue-900 bg-clip-text text-transparent">
              CalcMate
            </span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Angle Unit Switcher (Mobile: Single Cyclic Button) */}
          <button
            onClick={cycleAngleUnit}
            className="flex sm:hidden items-center justify-center px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[9px] font-mono font-black text-cyan-700"
            title="Tap to cycle angle unit"
          >
            {angleUnit}
          </button>

          {/* Angle Unit Switcher (Desktop: 3 Segment selector) */}
          <div className="hidden sm:flex items-center rounded-md p-0.5 border border-slate-300 bg-slate-100 text-[10px] font-mono font-bold">
            {(['DEG', 'RAD', 'GRAD'] as AngleUnit[]).map(unit => (
              <button
                key={unit}
                onClick={() => setAngleUnit(unit)}
                className={`px-2 py-0.5 rounded text-[9px] transition ${
                  angleUnit === unit
                    ? 'bg-cyan-600 text-white shadow-3xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>

          {/* Memory Drawer Trigger */}
          <button
            onClick={onOpenMemory}
            className="px-2 py-1 rounded-md border border-slate-300 hover:border-slate-400 bg-white text-slate-700 transition shadow-3xs hover:bg-slate-50 flex items-center gap-1"
            title="Memory Registers"
          >
            <Cpu className="w-3 h-3 text-cyan-600" />
            <span className="text-[9px] font-black tracking-wider text-slate-500 uppercase select-none">Mem</span>
          </button>

          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="p-1.5 rounded-md border border-slate-300 hover:border-slate-400 bg-white text-slate-700 transition shadow-3xs hover:bg-slate-50"
            title="History"
          >
            <History className="w-3.5 h-3.5 text-amber-500" />
          </button>

          <PWAInstallButton />

          {/* Menu Toggle Button (Always on Right) */}
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-md border border-slate-300 hover:border-slate-400 bg-white text-slate-700 hover:text-slate-900 transition active:scale-95 shrink-0 shadow-3xs hover:bg-slate-50"
            title={isSidebarOpen ? "Hide Workstation Menu" : "Show Workstation Menu"}
          >
            {isSidebarOpen ? (
              <X className="w-4 h-4 text-cyan-600 font-bold" />
            ) : (
              <Menu className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
