import { create, all } from 'mathjs';
import { AngleUnit, MemoryRegisters } from '../types/calculator';
import { convertAngleToRad } from './mathCore';

const math = create(all, {});

export function parseNumericOrInfinity(input: string): number {
  if (!input) return 0;
  const clean = input.trim().toLowerCase();
  if (clean === 'inf' || clean === 'infinity' || clean === '∞' || clean === '+inf' || clean === '+infinity') {
    return Infinity;
  }
  if (clean === '-inf' || clean === '-infinity' || clean === '-∞') {
    return -Infinity;
  }
  if (clean === 'pi' || clean === 'π') return Math.PI;
  if (clean === 'e') return Math.E;
  
  const val = parseFloat(clean);
  if (!isNaN(val)) return val;

  try {
    const res = math.evaluate(clean, { pi: Math.PI, e: Math.E });
    if (typeof res === 'number' && !isNaN(res)) return res;
  } catch {}

  return 0;
}

function createFunctionEvaluator(expr: string, angleUnit: AngleUnit, registers: MemoryRegisters) {
  let sanitized = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi');

  const compiled = math.compile(sanitized);

  return (xVal: number): number => {
    const scope: Record<string, any> = {
      x: xVal,
      X: xVal,
      A: registers.A, B: registers.B, C: registers.C, D: registers.D, E: registers.E, F: registers.F,
      M: registers.M, Y: registers.Y, Ans: registers.Ans,
      pi: Math.PI, e: Math.E,
      sin: (v: number) => Math.sin(convertAngleToRad(v, angleUnit)),
      cos: (v: number) => Math.cos(convertAngleToRad(v, angleUnit)),
      tan: (v: number) => Math.tan(convertAngleToRad(v, angleUnit)),
      sinh: (v: number) => Math.sinh(v),
      cosh: (v: number) => Math.cosh(v),
      tanh: (v: number) => Math.tanh(v),
    };
    return Number(compiled.evaluate(scope));
  };
}

/**
 * First Derivative at point x = a using 5-point stencil
 */
export function numericalDerivative(
  expr: string,
  a: number,
  angleUnit: AngleUnit,
  registers: MemoryRegisters
): number {
  const f = createFunctionEvaluator(expr, angleUnit, registers);
  const h = Math.max(1e-5, Math.abs(a) * 1e-5);
  
  const f_m2 = f(a - 2 * h);
  const f_m1 = f(a - h);
  const f_p1 = f(a + h);
  const f_p2 = f(a + 2 * h);

  const df = (-f_p2 + 8 * f_p1 - 8 * f_m1 + f_m2) / (12 * h);
  return df;
}

/**
 * Second Derivative f''(a)
 */
export function numericalSecondDerivative(
  expr: string,
  a: number,
  angleUnit: AngleUnit,
  registers: MemoryRegisters
): number {
  const f = createFunctionEvaluator(expr, angleUnit, registers);
  const h = Math.max(1e-4, Math.abs(a) * 1e-4);

  const f_m2 = f(a - 2 * h);
  const f_m1 = f(a - h);
  const f_0  = f(a);
  const f_p1 = f(a + h);
  const f_p2 = f(a + 2 * h);

  const d2f = (-f_p2 + 16 * f_p1 - 30 * f_0 + 16 * f_m1 - f_m2) / (12 * h * h);
  return d2f;
}

/**
 * Definite Integral from a to b using Adaptive Simpson's Rule (supporting improper integrals with Infinity)
 */
export function numericalIntegral(
  expr: string,
  a: number,
  b: number,
  angleUnit: AngleUnit,
  registers: MemoryRegisters,
  intervals = 1000
): number {
  if (a === b) return 0;

  // Handle improper integrals involving Infinity using variable substitution
  if (!isFinite(a) || !isFinite(b)) {
    const f = createFunctionEvaluator(expr, angleUnit, registers);
    // Map [a, b] to [0, 1] via substitution
    // If a = 0, b = inf: x = t / (1 - t), dx = 1 / (1 - t)^2 dt
    if (a === 0 && b === Infinity) {
      let sum = 0;
      const n = 1000;
      const h = 1 / n;
      for (let i = 1; i < n; i++) {
        const t = i * h;
        const x = t / (1 - t);
        const weight = 1 / ((1 - t) * (1 - t));
        sum += f(x) * weight;
      }
      return sum * h;
    }
    // If a = -inf, b = inf: x = t / (1 - t^2) or similar, or approximate with large bounds
    const largeBound = 100;
    const realA = a === -Infinity ? -largeBound : a;
    const realB = b === Infinity ? largeBound : b;
    return numericalIntegral(expr, realA, realB, angleUnit, registers, intervals);
  }

  const f = createFunctionEvaluator(expr, angleUnit, registers);
  const n = intervals % 2 === 0 ? intervals : intervals + 1;
  const h = (b - a) / n;

  let sum = f(a) + f(b);

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const coef = i % 2 === 0 ? 2 : 4;
    sum += coef * f(x);
  }

  return (h / 3) * sum;
}

/**
 * Numerical Limit: lim_{x -> a} f(x) supporting a = Infinity or -Infinity
 */
export function numericalLimit(
  expr: string,
  a: number,
  angleUnit: AngleUnit,
  registers: MemoryRegisters
): { leftLimit: number; rightLimit: number; limit: number | null; exists: boolean } {
  const f = createFunctionEvaluator(expr, angleUnit, registers);

  if (a === Infinity) {
    // Evaluate at large positive x
    const val1 = f(1e4);
    const val2 = f(1e6);
    const val3 = f(1e8);
    const exists = !isNaN(val3) && Math.abs(val3 - val2) < 1e-3;
    return {
      leftLimit: val3,
      rightLimit: val3,
      limit: exists ? val3 : null,
      exists,
    };
  }

  if (a === -Infinity) {
    const val1 = f(-1e4);
    const val2 = f(-1e6);
    const val3 = f(-1e8);
    const exists = !isNaN(val3) && Math.abs(val3 - val2) < 1e-3;
    return {
      leftLimit: val3,
      rightLimit: val3,
      limit: exists ? val3 : null,
      exists,
    };
  }

  const deltas = [1e-2, 1e-4, 1e-6, 1e-8];
  let leftVal = f(a - deltas[deltas.length - 1]);
  let rightVal = f(a + deltas[deltas.length - 1]);

  const diff = Math.abs(leftVal - rightVal);
  const exists = !isNaN(leftVal) && !isNaN(rightVal) && diff < 1e-4;

  return {
    leftLimit: leftVal,
    rightLimit: rightVal,
    limit: exists ? (leftVal + rightVal) / 2 : null,
    exists,
  };
}

/**
 * Finite Summation
 */
export function numericalSummation(
  expr: string,
  a: number,
  b: number,
  angleUnit: AngleUnit,
  registers: MemoryRegisters
): number {
  const f = createFunctionEvaluator(expr, angleUnit, registers);
  const start = Math.ceil(a);
  const end = Math.floor(b);
  let sum = 0;
  for (let x = start; x <= end; x++) {
    sum += f(x);
  }
  return sum;
}

/**
 * Finite Product
 */
export function numericalProduct(
  expr: string,
  a: number,
  b: number,
  angleUnit: AngleUnit,
  registers: MemoryRegisters
): number {
  const f = createFunctionEvaluator(expr, angleUnit, registers);
  const start = Math.ceil(a);
  const end = Math.floor(b);
  let prod = 1;
  for (let x = start; x <= end; x++) {
    prod *= f(x);
  }
  return prod;
}

export interface NewtonStep {
  iteration: number;
  x: number;
  fx: number;
}

/**
 * Newton-Raphson Solver with step iteration logs
 */
export function solveNewtonRaphson(
  lhsExpr: string,
  rhsExpr: string,
  x0: number,
  angleUnit: AngleUnit,
  registers: MemoryRegisters,
  maxIter = 50,
  tol = 1e-9
): { root: number; iterations: number; converged: boolean; steps: NewtonStep[] } {
  const fLHS = createFunctionEvaluator(lhsExpr, angleUnit, registers);
  const fRHS = rhsExpr ? createFunctionEvaluator(rhsExpr, angleUnit, registers) : () => 0;
  
  const F = (x: number) => fLHS(x) - fRHS(x);

  const steps: NewtonStep[] = [];
  let x = x0;
  for (let i = 0; i < maxIter; i++) {
    const fx = F(x);
    steps.push({ iteration: i + 1, x, fx });
    if (Math.abs(fx) < tol) {
      return { root: x, iterations: i + 1, converged: true, steps };
    }

    const h = Math.max(1e-5, Math.abs(x) * 1e-5);
    const dfx = (F(x + h) - F(x - h)) / (2 * h);

    if (Math.abs(dfx) < 1e-14) {
      x += 0.01;
      continue;
    }

    const nextX = x - fx / dfx;
    if (Math.abs(nextX - x) < tol) {
      steps.push({ iteration: i + 2, x: nextX, fx: F(nextX) });
      return { root: nextX, iterations: i + 2, converged: true, steps };
    }

    x = nextX;
  }

  return { root: x, iterations: maxIter, converged: false, steps };
}
