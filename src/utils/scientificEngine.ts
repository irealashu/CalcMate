import { create, all } from 'mathjs';
import { AngleUnit, MemoryRegisters } from '../types/calculator';
import { convertAngleToRad, convertAngleFromRad } from './mathCore';

// Initialize mathjs instance
const math = create(all, {});

export interface EvaluationResult {
  value: number;
  error?: string;
  remainder?: { quotient: number; rem: number };
}

export function evaluateExpression(
  expr: string,
  angleUnit: AngleUnit,
  registers: MemoryRegisters
): EvaluationResult {
  if (!expr || expr.trim() === '') {
    return { value: 0 };
  }

  try {
    // 1. Check for remainder division notation: "a divR b" or "a % b" or "a ➗R b"
    if (expr.includes('÷R') || expr.includes('divR')) {
      const parts = expr.split(/÷R|divR/);
      if (parts.length === 2) {
        const a = evaluateExpression(parts[0], angleUnit, registers).value;
        const b = evaluateExpression(parts[1], angleUnit, registers).value;
        if (b === 0) return { value: NaN, error: 'Math Error: Division by 0' };
        const quotient = Math.floor(a / b);
        const rem = a % b;
        return { value: quotient, remainder: { quotient, rem } };
      }
    }

    // Sanitize user formula
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, 'pi')
      .replace(/e/g, 'e')
      .replace(/√\(([^)]+)\)/g, 'sqrt($1)')
      .replace(/√([0-9a-zA-Z._]+)/g, 'sqrt($1)')
      .replace(/Ans/g, registers.Ans.toString());

    // Build MathScope with memory registers
    const scope: Record<string, number | Function> = {
      A: registers.A,
      B: registers.B,
      C: registers.C,
      D: registers.D,
      E: registers.E,
      F: registers.F,
      M: registers.M,
      X: registers.X,
      Y: registers.Y,
      Ans: registers.Ans,
      pi: Math.PI,
      e: Math.E,
    };

    // Override trig functions to respect AngleUnit (DEG, RAD, GRAD)
    scope.sin = (x: number) => Math.sin(convertAngleToRad(x, angleUnit));
    scope.cos = (x: number) => Math.cos(convertAngleToRad(x, angleUnit));
    scope.tan = (x: number) => Math.tan(convertAngleToRad(x, angleUnit));
    
    scope.asin = (x: number) => convertAngleFromRad(Math.asin(x), angleUnit);
    scope.acos = (x: number) => convertAngleFromRad(Math.acos(x), angleUnit);
    scope.atan = (x: number) => convertAngleFromRad(Math.atan(x), angleUnit);

    scope.sinh = (x: number) => Math.sinh(x);
    scope.cosh = (x: number) => Math.cosh(x);
    scope.tanh = (x: number) => Math.tanh(x);

    scope.asinh = (x: number) => Math.asinh(x);
    scope.acosh = (x: number) => Math.acosh(x);
    scope.atanh = (x: number) => Math.atanh(x);

    // Custom log base a
    scope.logBase = (base: number, val: number) => Math.log(val) / Math.log(base);

    // nCr and nPr
    scope.nCr = (n: number, r: number) => {
      if (r < 0 || r > n) return 0;
      let res = 1;
      for (let i = 1; i <= r; i++) {
        res = (res * (n - r + i)) / i;
      }
      return Math.round(res);
    };

    scope.nPr = (n: number, r: number) => {
      if (r < 0 || r > n) return 0;
      let res = 1;
      for (let i = n - r + 1; i <= n; i++) {
        res *= i;
      }
      return Math.round(res);
    };

    const evaluated = math.evaluate(sanitized, scope);

    if (typeof evaluated === 'number') {
      if (isNaN(evaluated)) return { value: NaN, error: 'Math Error' };
      return { value: evaluated };
    } else if (typeof evaluated === 'object' && evaluated !== null) {
      if ('entries' in evaluated) {
        const last = evaluated.entries[evaluated.entries.length - 1];
        return { value: typeof last === 'number' ? last : Number(last) };
      }
      return { value: Number(evaluated) };
    }

    return { value: Number(evaluated) || 0 };
  } catch (err: any) {
    return { value: NaN, error: err?.message || 'Syntax Error' };
  }
}
