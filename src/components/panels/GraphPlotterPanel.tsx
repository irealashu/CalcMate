import React from 'react';
import { AngleUnit, MemoryRegisters } from '../../types/calculator';
import { FunctionGrapherCanvas } from '../FunctionGrapherCanvas';

interface GraphPlotterPanelProps {
  angleUnit: AngleUnit;
  registers: MemoryRegisters;
}

export const GraphPlotterPanel: React.FC<GraphPlotterPanelProps> = ({ angleUnit, registers }) => {
  return (
    <div className="space-y-4 text-slate-900">
      <div className="border-b border-slate-200 pb-2">
        <h3 className="text-base font-black text-slate-800">2D Mathematical Graph Plotter 📊</h3>
        <p className="text-[11px] text-slate-500 font-bold">Interactive canvas graphing utility. Plot dual functions, adjust coordinate boundaries, and inspect exact tangents or curve slopes.</p>
      </div>

      <FunctionGrapherCanvas
        initialFx="x^3 - 3*x"
        initialGx="sin(x)"
        angleUnit={angleUnit}
        registers={registers}
      />
    </div>
  );
};
