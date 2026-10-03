import { AngleUnit } from '../types/calculator';
import { convertAngleFromRad } from './mathCore';

export type Matrix = number[][];

export function createEmptyMatrix(rows: number, cols: number): Matrix {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

export function addMatrices(A: Matrix, B: Matrix): Matrix {
  if (A.length !== B.length || A[0].length !== B[0].length) {
    throw new Error('Dimension Mismatch: Matrices must have same dimensions for addition.');
  }
  return A.map((row, i) => row.map((val, j) => val + B[i][j]));
}

export function subtractMatrices(A: Matrix, B: Matrix): Matrix {
  if (A.length !== B.length || A[0].length !== B[0].length) {
    throw new Error('Dimension Mismatch: Matrices must have same dimensions for subtraction.');
  }
  return A.map((row, i) => row.map((val, j) => val - B[i][j]));
}

export function multiplyMatrices(A: Matrix, B: Matrix): Matrix {
  if (A[0].length !== B.length) {
    throw new Error('Dimension Mismatch: Columns of A must equal rows of B for multiplication.');
  }
  const rows = A.length;
  const cols = B[0].length;
  const K = A[0].length;
  const C = createEmptyMatrix(rows, cols);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let sum = 0;
      for (let k = 0; k < K; k++) {
        sum += A[i][k] * B[k][j];
      }
      C[i][j] = sum;
    }
  }
  return C;
}

export function scalarMultiply(A: Matrix, k: number): Matrix {
  return A.map(row => row.map(val => val * k));
}

export function transposeMatrix(A: Matrix): Matrix {
  const rows = A.length;
  const cols = A[0].length;
  const T = createEmptyMatrix(cols, rows);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      T[j][i] = A[i][j];
    }
  }
  return T;
}

export function determinantMatrix(A: Matrix): number {
  if (A.length !== A[0].length) {
    throw new Error('Non-Square Matrix: Determinant requires a square matrix.');
  }
  const n = A.length;
  if (n === 1) return A[0][0];
  if (n === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0];

  let det = 0;
  for (let j = 0; j < n; j++) {
    const minor = A.slice(1).map(row => row.filter((_, colIdx) => colIdx !== j));
    const sign = j % 2 === 0 ? 1 : -1;
    det += sign * A[0][j] * determinantMatrix(minor);
  }
  return det;
}

export function invertMatrix(A: Matrix): Matrix {
  if (A.length !== A[0].length) {
    throw new Error('Non-Square Matrix: Inverse requires a square matrix.');
  }
  const det = determinantMatrix(A);
  if (Math.abs(det) < 1e-12) {
    throw new Error('Singular Matrix: Matrix is non-invertible (Determinant = 0).');
  }

  const n = A.length;
  if (n === 1) return [[1 / A[0][0]]];

  const C = createEmptyMatrix(n, n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const minor = A.filter((_, rowIdx) => rowIdx !== i)
        .map(row => row.filter((_, colIdx) => colIdx !== j));
      const sign = (i + j) % 2 === 0 ? 1 : -1;
      C[i][j] = sign * determinantMatrix(minor);
    }
  }

  const adj = transposeMatrix(C);
  return scalarMultiply(adj, 1 / det);
}

export function matrixPower(A: Matrix, power: number): Matrix {
  if (A.length !== A[0].length) {
    throw new Error('Non-Square Matrix: Power requires a square matrix.');
  }
  if (!Number.isInteger(power) || power < 0) {
    throw new Error('Power must be a non-negative integer.');
  }
  const n = A.length;
  let result = createEmptyMatrix(n, n);
  for (let i = 0; i < n; i++) result[i][i] = 1; // Identity
  let base = A;
  let p = power;
  while (p > 0) {
    if (p % 2 === 1) result = multiplyMatrices(result, base);
    base = multiplyMatrices(base, base);
    p = Math.floor(p / 2);
  }
  return result;
}

export function eigenvalues2x2(A: Matrix): { lambda1: { re: number; im: number }; lambda2: { re: number; im: number } } {
  if (A.length !== 2 || A[0].length !== 2) {
    throw new Error('Eigenvalues feature currently supports 2x2 matrices.');
  }
  const tr = A[0][0] + A[1][1];
  const det = determinantMatrix(A);
  const disc = tr * tr - 4 * det;

  if (disc >= 0) {
    const sqrtDisc = Math.sqrt(disc);
    return {
      lambda1: { re: (tr + sqrtDisc) / 2, im: 0 },
      lambda2: { re: (tr - sqrtDisc) / 2, im: 0 },
    };
  } else {
    const sqrtDisc = Math.sqrt(-disc);
    return {
      lambda1: { re: tr / 2, im: sqrtDisc / 2 },
      lambda2: { re: tr / 2, im: -sqrtDisc / 2 },
    };
  }
}

// Vector Engine
export type Vector = number[]; // 2D or 3D

export function vectorMagnitude(v: Vector): number {
  return Math.hypot(...v);
}

export function vectorNormalize(v: Vector): Vector {
  const mag = vectorMagnitude(v);
  if (mag === 0) throw new Error('Zero Vector: Cannot normalize zero vector.');
  return v.map(x => x / mag);
}

export function dotProduct(u: Vector, v: Vector): number {
  if (u.length !== v.length) throw new Error('Dimension Mismatch: Vectors must have same length.');
  return u.reduce((sum, val, i) => sum + val * v[i], 0);
}

export function crossProduct(u: Vector, v: Vector): Vector {
  if (u.length !== 3 || v.length !== 3) {
    throw new Error('Cross Product: Requires 3D vectors.');
  }
  return [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0]
  ];
}

export function vectorProjection(u: Vector, v: Vector): Vector {
  const magV = vectorMagnitude(v);
  if (magV === 0) throw new Error('Zero Vector: Cannot project onto zero vector.');
  const scalar = dotProduct(u, v) / (magV * magV);
  return v.map(val => val * scalar);
}

export function scalarTripleProduct(u: Vector, v: Vector, w: Vector): number {
  if (u.length !== 3 || v.length !== 3 || w.length !== 3) {
    throw new Error('Scalar Triple Product: Requires three 3D vectors.');
  }
  return dotProduct(u, crossProduct(v, w));
}

export function angleBetweenVectors(u: Vector, v: Vector, unit: AngleUnit): number {
  const magU = vectorMagnitude(u);
  const magV = vectorMagnitude(v);
  if (magU === 0 || magV === 0) throw new Error('Zero Vector: Cannot compute angle with zero vector.');
  
  const cosTheta = Math.max(-1, Math.min(1, dotProduct(u, v) / (magU * magV)));
  const rad = Math.acos(cosTheta);
  return convertAngleFromRad(rad, unit);
}
