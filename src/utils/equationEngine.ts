export interface ComplexNumber {
  re: number;
  im: number;
}

export function formatComplex(c: ComplexNumber, precision = 4): string {
  const reFix = Number(c.re.toFixed(precision));
  const imFix = Number(c.im.toFixed(precision));

  if (Math.abs(imFix) < 1e-10) {
    return `${reFix}`;
  }
  if (Math.abs(reFix) < 1e-10) {
    if (imFix === 1) return 'i';
    if (imFix === -1) return '-i';
    return `${imFix}i`;
  }
  const sign = imFix > 0 ? ' + ' : ' - ';
  const absIm = Math.abs(imFix);
  const imStr = absIm === 1 ? 'i' : `${absIm}i`;
  return `${reFix}${sign}${imStr}`;
}

/**
 * Solve System of Linear Equations (Ax = B) for 2x2, 3x3, or 4x4
 * Gaussian elimination with partial pivoting.
 */
export function solveLinearSystem(A: number[][], B: number[]): { solution: number[] | null; message?: string } {
  const n = A.length;
  // Create augmented matrix
  const M: number[][] = A.map((row, i) => [...row, B[i]]);

  for (let i = 0; i < n; i++) {
    // Partial pivoting
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }

    // Swap max row
    const temp = M[i];
    M[i] = M[maxRow];
    M[maxRow] = temp;

    if (Math.abs(M[i][i]) < 1e-12) {
      return { solution: null, message: 'System has no unique solution (Infinite or No Solutions).' };
    }

    // Make pivot 1
    const pivot = M[i][i];
    for (let j = i; j <= n; j++) {
      M[i][j] /= pivot;
    }

    // Eliminate below & above
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = M[k][i];
        for (let j = i; j <= n; j++) {
          M[k][j] -= factor * M[i][j];
        }
      }
    }
  }

  const solution = M.map(row => row[n]);
  return { solution };
}

/**
 * Solve Quadratic Equation: ax^2 + bx + c = 0
 */
export function solveQuadratic(a: number, b: number, c: number): ComplexNumber[] {
  if (a === 0) {
    if (b === 0) return [];
    return [{ re: -c / b, im: 0 }];
  }

  const disc = b * b - 4 * a * c;
  if (disc >= 0) {
    const rootDisc = Math.sqrt(disc);
    return [
      { re: (-b + rootDisc) / (2 * a), im: 0 },
      { re: (-b - rootDisc) / (2 * a), im: 0 }
    ];
  } else {
    const rootDisc = Math.sqrt(-disc);
    return [
      { re: -b / (2 * a), im: rootDisc / (2 * a) },
      { re: -b / (2 * a), im: -rootDisc / (2 * a) }
    ];
  }
}

/**
 * Solve Cubic Equation: ax^3 + bx^2 + cx + d = 0 using Cardano's Method
 */
export function solveCubic(a: number, b: number, c: number, d: number): ComplexNumber[] {
  if (Math.abs(a) < 1e-12) {
    return solveQuadratic(b, c, d);
  }

  // Depress the cubic to t^3 + pt + q = 0 via x = t - b/(3a)
  const p = (3 * a * c - b * b) / (3 * a * a);
  const q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
  const shift = -b / (3 * a);

  const delta = (q * q) / 4 + (p * p * p) / 27;

  if (Math.abs(delta) < 1e-12) {
    // Multiple real roots
    if (Math.abs(q) < 1e-12) {
      return [{ re: shift, im: 0 }, { re: shift, im: 0 }, { re: shift, im: 0 }];
    }
    const u = Math.cbrt(-q / 2);
    return [
      { re: 2 * u + shift, im: 0 },
      { re: -u + shift, im: 0 },
      { re: -u + shift, im: 0 }
    ];
  } else if (delta > 0) {
    // 1 real root, 2 complex conjugate roots
    const u = Math.cbrt(-q / 2 + Math.sqrt(delta));
    const v = Math.cbrt(-q / 2 - Math.sqrt(delta));

    const r1: ComplexNumber = { re: u + v + shift, im: 0 };
    const r2: ComplexNumber = { re: -0.5 * (u + v) + shift, im: (Math.sqrt(3) / 2) * (u - v) };
    const r3: ComplexNumber = { re: -0.5 * (u + v) + shift, im: -(Math.sqrt(3) / 2) * (u - v) };

    return [r1, r2, r3];
  } else {
    // 3 distinct real roots (casus irreducibilis)
    const r = Math.sqrt(-p * p * p / 27);
    const phi = Math.acos(-q / (2 * r));
    const m = 2 * Math.cbrt(r);

    const r1: ComplexNumber = { re: m * Math.cos(phi / 3) + shift, im: 0 };
    const r2: ComplexNumber = { re: m * Math.cos((phi + 2 * Math.PI) / 3) + shift, im: 0 };
    const r3: ComplexNumber = { re: m * Math.cos((phi + 4 * Math.PI) / 3) + shift, im: 0 };

    return [r1, r2, r3];
  }
}

/**
 * Solve Quartic Equation: ax^4 + bx^3 + cx^2 + dx + e = 0 via Ferrari's Method
 */
export function solveQuartic(a: number, b: number, c: number, d: number, e: number): ComplexNumber[] {
  if (Math.abs(a) < 1e-12) {
    return solveCubic(b, c, d, e);
  }

  // Depress the quartic to u^4 + alpha*u^2 + beta*u + gamma = 0 via x = u - b/(4a)
  const shift = -b / (4 * a);
  const alpha = c / a - (3 * b * b) / (8 * a * a);
  const beta = d / a - (b * c) / (2 * a * a) + (b * b * b) / (8 * a * a * a);
  const gamma = e / a - (b * d) / (4 * a * a) + (b * b * c) / (16 * a * a * a) - (3 * b * b * b * b) / (256 * a * a * a * a);

  if (Math.abs(beta) < 1e-10) {
    // Biquadratic case: u^4 + alpha*u^2 + gamma = 0
    const quadRoots = solveQuadratic(1, alpha, gamma);
    const roots: ComplexNumber[] = [];
    for (const q of quadRoots) {
      // Take square roots of q
      const mod = Math.hypot(q.re, q.im);
      const arg = Math.atan2(q.im, q.re);
      const sqrtMod = Math.sqrt(mod);

      roots.push({
        re: sqrtMod * Math.cos(arg / 2) + shift,
        im: sqrtMod * Math.sin(arg / 2)
      });
      roots.push({
        re: -sqrtMod * Math.cos(arg / 2) + shift,
        im: -sqrtMod * Math.sin(arg / 2)
      });
    }
    return roots;
  }

  // Solve resolvent cubic for y: y^3 + 2*alpha*y^2 + (alpha^2 - 4*gamma)*y - beta^2 = 0
  const cubicRoots = solveCubic(1, 2 * alpha, alpha * alpha - 4 * gamma, -beta * beta);
  // Pick a real root for y
  const yReal = cubicRoots.find(r => Math.abs(r.im) < 1e-8)?.re ?? cubicRoots[0].re;

  const R = Math.sqrt(Math.max(0, alpha + 2 * yReal));
  if (R === 0) {
    // Fallback if R is zero
    return solveQuadratic(1, alpha / 2, gamma).map(r => ({ re: r.re + shift, im: r.im }));
  }

  const D = Math.sqrt(Math.max(0, -(3 * alpha + 2 * yReal + (2 * beta) / R)));
  const E = Math.sqrt(Math.max(0, -(3 * alpha + 2 * yReal - (2 * beta) / R)));

  const u1 = (R + D) / 2;
  const u2 = (R - D) / 2;
  const u3 = (-R + E) / 2;
  const u4 = (-R - E) / 2;

  return [
    { re: u1 + shift, im: 0 },
    { re: u2 + shift, im: 0 },
    { re: u3 + shift, im: 0 },
    { re: u4 + shift, im: 0 }
  ];
}

export type InequalityOperator = '>' | '>=' | '<' | '<=';

/**
 * Solve Polynomial Inequality: P(x) [op] 0 for degree 2 to 4
 */
export function solveInequality(coeffs: number[], op: InequalityOperator): string {
  // Degree: coeffs length - 1
  let roots: ComplexNumber[] = [];
  if (coeffs.length === 3) {
    roots = solveQuadratic(coeffs[0], coeffs[1], coeffs[2]);
  } else if (coeffs.length === 4) {
    roots = solveCubic(coeffs[0], coeffs[1], coeffs[2], coeffs[3]);
  } else if (coeffs.length === 5) {
    roots = solveQuartic(coeffs[0], coeffs[1], coeffs[2], coeffs[3], coeffs[4]);
  } else {
    return 'Unsupported degree (Only 2, 3, 4 supported)';
  }

  // Extract real roots
  const realRoots = roots
    .filter(r => Math.abs(r.im) < 1e-6)
    .map(r => Number(r.re.toFixed(6)))
    .sort((a, b) => a - b);

  // Remove duplicate roots
  const uniqueRoots: number[] = [];
  for (const r of realRoots) {
    if (uniqueRoots.length === 0 || Math.abs(r - uniqueRoots[uniqueRoots.length - 1]) > 1e-5) {
      uniqueRoots.push(r);
    }
  }

  // Polynomial evaluation function
  const evalP = (x: number) => {
    let res = 0;
    const n = coeffs.length;
    for (let i = 0; i < n; i++) {
      res += coeffs[i] * Math.pow(x, n - 1 - i);
    }
    return res;
  };

  const checkOp = (val: number) => {
    if (op === '>') return val > 1e-9;
    if (op === '>=') return val >= -1e-9;
    if (op === '<') return val < -1e-9;
    if (op === '<=') return val <= 1e-9;
    return false;
  };

  // Build test intervals
  const testPoints: number[] = [];
  if (uniqueRoots.length === 0) {
    testPoints.push(0);
  } else {
    testPoints.push(uniqueRoots[0] - 1);
    for (let i = 0; i < uniqueRoots.length - 1; i++) {
      testPoints.push((uniqueRoots[i] + uniqueRoots[i + 1]) / 2);
    }
    testPoints.push(uniqueRoots[uniqueRoots.length - 1] + 1);
  }

  const validIntervals: string[] = [];

  for (let i = 0; i < testPoints.length; i++) {
    const val = evalP(testPoints[i]);
    if (checkOp(val)) {
      const leftBound = i === 0 ? '-∞' : uniqueRoots[i - 1].toString();
      const rightBound = i === testPoints.length - 1 ? '∞' : uniqueRoots[i].toString();
      const leftBracket = (leftBound === '-∞' || op === '>' || op === '<') ? '(' : '[';
      const rightBracket = (rightBound === '∞' || op === '>' || op === '<') ? ')' : ']';
      
      validIntervals.push(`${leftBracket}${leftBound}, ${rightBound}${rightBracket}`);
    }
  }

  if (validIntervals.length === 0) return 'No real solutions (empty set Ø)';
  if (validIntervals.length === 1 && validIntervals[0] === '(-∞, ∞)') return 'x ∈ ℝ (All Real Numbers)';
  
  return `x ∈ ${validIntervals.join(' ∪ ')}`;
}
