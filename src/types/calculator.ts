export type AngleUnit = 'DEG' | 'RAD' | 'GRAD';

export type DisplayFormat = 
  | 'EXACT_FRACTION' 
  | 'MIXED_FRACTION' 
  | 'DECIMAL' 
  | 'ENGINEERING' 
  | 'SCIENTIFIC';

export type CalculatorMode = 
  | 'SCIENTIFIC'
  | 'CALCULUS'
  | 'GRAPH_PLOTTER'
  | 'EQUATIONS'
  | 'MATRIX_VECTOR'
  | 'COMPLEX'
  | 'STATISTICS'
  | 'BASE_N'
  | 'CONSTANTS'
  | 'CONVERTER'
  | 'QUANTUM';

export type LCDTheme = 'LIGHT' | 'DARK';
export type CalcAppTheme = 'DAY' | 'DARK';

export type MemoryRegisterKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'M' | 'X' | 'Y' | 'Ans';

export type MemoryRegisters = Record<MemoryRegisterKey, number>;

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  numericValue?: number;
  mode: CalculatorMode;
  timestamp: number;
}

export type WordSize = 8 | 16 | 32 | 64;
export type BaseNType = 'HEX' | 'DEC' | 'OCT' | 'BIN';

export interface PhysicalConstant {
  id: string;
  symbol: string;
  latexSymbol: string;
  name: string;
  category: 'Universal' | 'Electromagnetic' | 'Physico-Chemical' | 'Atomic' | 'Astro';
  value: number;
  unit: string;
}

export interface UnitCategory {
  name: string;
  units: { name: string; symbol: string; toBase: (val: number) => number; fromBase: (val: number) => number }[];
}
