export interface DataPoint {
  x: number;
  y?: number;
  freq?: number;
}

export interface DescriptiveStats {
  n: number;
  mean: number;
  sum: number;
  sumSq: number;
  sampleVariance: number;
  popVariance: number;
  sampleStdDev: number;
  popStdDev: number;
  stdErrMean: number;
  coeffVariation: number;
  skewness: number;
  kurtosis: number;
  geometricMean: number | null;
  harmonicMean: number | null;
  min: number;
  max: number;
  range: number;
  median: number;
  q1: number;
  q3: number;
  iqr: number;
}

export function computeDescriptiveStats(data: number[]): DescriptiveStats {
  if (data.length === 0) {
    return {
      n: 0, mean: 0, sum: 0, sumSq: 0,
      sampleVariance: 0, popVariance: 0,
      sampleStdDev: 0, popStdDev: 0,
      stdErrMean: 0, coeffVariation: 0,
      skewness: 0, kurtosis: 0,
      geometricMean: null, harmonicMean: null,
      min: 0, max: 0, range: 0,
      median: 0, q1: 0, q3: 0, iqr: 0
    };
  }

  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const sumSq = sorted.reduce((acc, val) => acc + val * val, 0);
  const mean = sum / n;

  const popVariance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  const sampleVariance = n > 1 ? (popVariance * n) / (n - 1) : 0;
  
  const popStdDev = Math.sqrt(popVariance);
  const sampleStdDev = Math.sqrt(sampleVariance);
  
  const stdErrMean = n > 0 ? sampleStdDev / Math.sqrt(n) : 0;
  const coeffVariation = mean !== 0 ? (sampleStdDev / Math.abs(mean)) * 100 : 0;

  // Skewness & Kurtosis
  let m3 = 0, m4 = 0;
  for (const x of sorted) {
    const diff = x - mean;
    m3 += Math.pow(diff, 3);
    m4 += Math.pow(diff, 4);
  }
  m3 /= n;
  m4 /= n;

  const skewness = popStdDev > 0 ? m3 / Math.pow(popStdDev, 3) : 0;
  const kurtosis = popStdDev > 0 ? m4 / Math.pow(popStdDev, 4) - 3 : 0;

  // Geometric & Harmonic Means
  const allPos = sorted.every(x => x > 0);
  let geometricMean: number | null = null;
  let harmonicMean: number | null = null;

  if (allPos) {
    const logSum = sorted.reduce((acc, val) => acc + Math.log(val), 0);
    geometricMean = Math.exp(logSum / n);

    const invSum = sorted.reduce((acc, val) => acc + 1 / val, 0);
    harmonicMean = invSum !== 0 ? n / invSum : null;
  }

  const getPercentile = (p: number) => {
    const idx = (n - 1) * p;
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    const weight = idx - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  const min = sorted[0];
  const max = sorted[n - 1];
  const range = max - min;
  const median = getPercentile(0.5);
  const q1 = getPercentile(0.25);
  const q3 = getPercentile(0.75);
  const iqr = q3 - q1;

  return {
    n, mean, sum, sumSq, sampleVariance, popVariance, sampleStdDev, popStdDev,
    stdErrMean, coeffVariation, skewness, kurtosis, geometricMean, harmonicMean,
    min, max, range, median, q1, q3, iqr
  };
}

export interface RegressionResult {
  type: 'Linear' | 'Quadratic' | 'Logarithmic' | 'Exponential' | 'Power';
  equation: string;
  slope?: number;
  intercept?: number;
  r?: number;
  r2: number;
  predictY: (x: number) => number;
}

export function computeLinearRegression(points: { x: number; y: number }[]): RegressionResult {
  const n = points.length;
  if (n < 2) throw new Error('Regression requires at least 2 points.');

  const sumX = points.reduce((a, p) => a + p.x, 0);
  const sumY = points.reduce((a, p) => a + p.y, 0);
  const sumXY = points.reduce((a, p) => a + p.x * p.y, 0);
  const sumXX = points.reduce((a, p) => a + p.x * p.x, 0);
  const sumYY = points.reduce((a, p) => a + p.y * p.y, 0);

  const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const b = (sumY - m * sumX) / n;

  const numR = (n * sumXY - sumX * sumY);
  const denR = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  const r = denR !== 0 ? numR / denR : 0;
  const r2 = r * r;

  return {
    type: 'Linear',
    equation: `y = ${m.toFixed(4)}x ${b >= 0 ? '+' : '-'} ${Math.abs(b).toFixed(4)}`,
    slope: m,
    intercept: b,
    r,
    r2,
    predictY: (x: number) => m * x + b
  };
}

export function computeQuadraticRegression(points: { x: number; y: number }[]): RegressionResult {
  const n = points.length;
  if (n < 3) throw new Error('Quadratic regression requires at least 3 points.');

  let s4 = 0, s3 = 0, s2 = 0, s1 = 0, s0 = n;
  let sy = 0, sxy = 0, sx2y = 0;

  for (const p of points) {
    const x = p.x, y = p.y;
    const x2 = x * x;
    s4 += x2 * x2;
    s3 += x2 * x;
    s2 += x2;
    s1 += x;
    sy += y;
    sxy += x * y;
    sx2y += x2 * y;
  }

  const A = [
    [s4, s3, s2],
    [s3, s2, s1],
    [s2, s1, s0]
  ];

  const det = A[0][0]*(A[1][1]*A[2][2] - A[1][2]*A[2][1]) - A[0][1]*(A[1][0]*A[2][2] - A[1][2]*A[2][0]) + A[0][2]*(A[1][0]*A[2][1] - A[1][1]*A[2][0]);
  if (Math.abs(det) < 1e-12) throw new Error('Singular matrix in quadratic regression.');

  const a = ((sx2y)*(A[1][1]*A[2][2] - A[1][2]*A[2][1]) - sxy*(A[0][1]*A[2][2] - A[0][2]*A[2][1]) + sy*(A[0][1]*A[1][2] - A[0][2]*A[1][1])) / det;
  const b = (s4*(sxy*A[2][2] - sy*A[1][2]) - s3*(sx2y*A[2][2] - sy*A[0][2]) + s2*(sx2y*A[1][2] - sxy*A[0][2])) / det;
  const c = (s4*(A[1][1]*sy - A[2][1]*sxy) - s3*(A[1][0]*sy - A[2][0]*sxy) + s2*(A[1][0]*sxy - A[1][1]*sx2y)) / det;

  const yMean = sy / n;
  const ssTot = points.reduce((acc, p) => acc + Math.pow(p.y - yMean, 2), 0);
  const ssRes = points.reduce((acc, p) => acc + Math.pow(p.y - (a * p.x * p.x + b * p.x + c), 2), 0);
  const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 1;

  return {
    type: 'Quadratic',
    equation: `y = ${a.toFixed(4)}x² ${b >= 0 ? '+' : '-'} ${Math.abs(b).toFixed(4)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c).toFixed(4)}`,
    r2,
    predictY: (x: number) => a * x * x + b * x + c
  };
}

export function computeLogarithmicRegression(points: { x: number; y: number }[]): RegressionResult {
  const transformed = points.map(p => {
    if (p.x <= 0) throw new Error('Logarithmic regression requires x > 0');
    return { x: Math.log(p.x), y: p.y };
  });
  const lin = computeLinearRegression(transformed);
  const a = lin.predictY(0);
  const b = lin.r || 0;
  return {
    type: 'Logarithmic',
    equation: `y = ${a.toFixed(4)} + ${b.toFixed(4)} ln(x)`,
    r: lin.r,
    r2: lin.r2,
    predictY: (x: number) => lin.predictY(Math.log(x))
  };
}

export function computeExponentialRegression(points: { x: number; y: number }[]): RegressionResult {
  const transformed = points.map(p => {
    if (p.y <= 0) throw new Error('Exponential regression requires y > 0');
    return { x: p.x, y: Math.log(p.y) };
  });
  const lin = computeLinearRegression(transformed);
  const a = Math.exp(lin.predictY(0));
  const b = (Math.log(points[points.length - 1].y) - Math.log(points[0].y)) / (points[points.length - 1].x - points[0].x || 1);

  return {
    type: 'Exponential',
    equation: `y = ${a.toFixed(4)} e^(${b.toFixed(4)}x)`,
    r: lin.r,
    r2: lin.r2,
    predictY: (x: number) => a * Math.exp(b * x)
  };
}

export function computePowerRegression(points: { x: number; y: number }[]): RegressionResult {
  const transformed = points.map(p => {
    if (p.x <= 0 || p.y <= 0) throw new Error('Power regression requires x > 0 and y > 0');
    return { x: Math.log(p.x), y: Math.log(p.y) };
  });
  const lin = computeLinearRegression(transformed);
  const b = lin.r || 0;
  const a = Math.exp(lin.predictY(0));

  return {
    type: 'Power',
    equation: `y = ${a.toFixed(4)} x^(${b.toFixed(4)})`,
    r: lin.r,
    r2: lin.r2,
    predictY: (x: number) => a * Math.pow(x, b)
  };
}

// Hypothesis Testing & Confidence Intervals
export function oneSampleTTest(sample: number[], mu0: number): { tStat: number; df: number; mean: number; pValue: number } {
  const stats = computeDescriptiveStats(sample);
  if (stats.n < 2) throw new Error('t-Test requires at least 2 data points.');
  const se = stats.sampleStdDev / Math.sqrt(stats.n);
  const tStat = (stats.mean - mu0) / se;
  const df = stats.n - 1;
  const pValue = 2 * (1 - normalCDF(Math.abs(tStat)));
  return { tStat, df, mean: stats.mean, pValue };
}

export function confidenceIntervalMean(sample: number[], confLevel = 0.95): { lower: number; upper: number; marginOfError: number } {
  const stats = computeDescriptiveStats(sample);
  if (stats.n < 2) throw new Error('Confidence interval requires at least 2 data points.');
  const alpha = 1 - confLevel;
  const z = inverseNormalCDF(1 - alpha / 2);
  const me = z * stats.stdErrMean;
  return {
    lower: stats.mean - me,
    upper: stats.mean + me,
    marginOfError: me,
  };
}

// Probability Distributions
export function normalPDF(x: number, mean = 0, stdDev = 1): number {
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
}

export function normalCDF(x: number, mean = 0, stdDev = 1): number {
  const z = (x - mean) / (stdDev * Math.sqrt(2));
  const t = 1 / (1 + 0.3275911 * Math.abs(z));
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-z * z);
  const sign = z >= 0 ? 1 : -1;
  return 0.5 * (1 + sign * erf);
}

export function inverseNormalCDF(p: number, mean = 0, stdDev = 1): number {
  if (p <= 0 || p >= 1) throw new Error('p must be in (0, 1)');
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];

  const q = p - 0.5;
  let z = 0;

  if (Math.abs(q) <= 0.42) {
    const r = q * q;
    z = q * (((((a[0]*r + a[1])*r + a[2])*r + a[3])*r + a[4])*r + a[5]) / (((((b[0]*r + b[1])*r + b[2])*r + b[3])*r + b[4])*r + 1);
  } else {
    const r = p < 0.5 ? p : 1 - p;
    const s = Math.sqrt(-2 * Math.log(r));
    z = (((((c[0]*s + c[1])*s + c[2])*s + c[3])*s + c[4])*s + c[5]) / ((((d[0]*s + d[1])*s + d[2])*s + d[3])*s + 1);
    if (p < 0.5) z = -z;
  }

  return mean + z * stdDev;
}

export function binomialPD(k: number, n: number, p: number): number {
  if (k < 0 || k > n) return 0;
  const nCr = (n: number, r: number) => {
    let res = 1;
    for (let i = 1; i <= r; i++) res = (res * (n - r + i)) / i;
    return res;
  };
  return nCr(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

export function binomialCD(k: number, n: number, p: number): number {
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += binomialPD(i, n, p);
  }
  return sum;
}

export function poissonPD(x: number, lambda: number): number {
  if (x < 0) return 0;
  const fact = (n: number): number => n <= 1 ? 1 : n * fact(n - 1);
  return (Math.pow(lambda, x) * Math.exp(-lambda)) / fact(x);
}

export function poissonCD(x: number, lambda: number): number {
  let sum = 0;
  for (let i = 0; i <= x; i++) {
    sum += poissonPD(i, lambda);
  }
  return sum;
}
