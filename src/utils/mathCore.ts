import { Decimal } from 'decimal.js';
import { AngleUnit, DisplayFormat } from '../types/calculator';

// Set high precision (32 significant digits) to prevent floating point inaccuracies
Decimal.set({ precision: 32, rounding: Decimal.ROUND_HALF_UP });

export { Decimal };

export function convertAngleToRad(val: number, unit: AngleUnit): number {
  if (unit === 'RAD') return val;
  if (unit === 'DEG') return (val * Math.PI) / 180;
  // GRAD
  return (val * Math.PI) / 200;
}

export function convertAngleFromRad(radVal: number, targetUnit: AngleUnit): number {
  if (targetUnit === 'RAD') return radVal;
  if (targetUnit === 'DEG') return (radVal * 180) / Math.PI;
  // GRAD
  return (radVal * 200) / Math.PI;
}

/**
 * Converts a floating point number to an exact fraction (numerator / denominator)
 * using continued fractions algorithm up to maxDenominator.
 */
export function toExactFraction(val: number, maxDenominator = 1000000): { num: number; den: number } | null {
  if (isNaN(val) || !isFinite(val) || Math.abs(val) > 1e12) return null;
  const isNeg = val < 0;
  let x = Math.abs(val);

  // If very close to integer
  if (Math.abs(x - Math.round(x)) < 1e-10) {
    return { num: Math.round(val), den: 1 };
  }

  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = x;
  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(x - h1 / k1) > x * 1e-12 && k1 < maxDenominator);

  if (k1 > maxDenominator || Math.abs(x - h1 / k1) > 0.0001) return null;
  return { num: isNeg ? -h1 : h1, den: k1 };
}

/**
 * Formats a number for S-D toggle
 */
export function formatResult(val: number, format: DisplayFormat): string {
  if (isNaN(val)) return 'Error: Indeterminate';
  if (!isFinite(val)) return val > 0 ? 'Infinity' : '-Infinity';
  if (Math.abs(val) < 1e-14 && val !== 0) return '0';

  switch (format) {
    case 'EXACT_FRACTION': {
      const frac = toExactFraction(val);
      if (frac && frac.den !== 1) {
        return `${frac.num}/${frac.den}`;
      }
      return formatDecimalStandard(val);
    }
    case 'MIXED_FRACTION': {
      const frac = toExactFraction(val);
      if (frac && frac.den !== 1) {
        const whole = Math.trunc(frac.num / frac.den);
        const rem = Math.abs(frac.num % frac.den);
        if (whole !== 0 && rem !== 0) {
          return `${whole} ${rem}/${frac.den}`;
        }
        return `${frac.num}/${frac.den}`;
      }
      return formatDecimalStandard(val);
    }
    case 'ENGINEERING': {
      return formatEngineering(val);
    }
    case 'SCIENTIFIC': {
      return val.toExponential(8).replace('e+', 'e');
    }
    case 'DECIMAL':
    default: {
      return formatDecimalStandard(val);
    }
  }
}

function formatDecimalStandard(val: number): string {
  if (Math.abs(val) >= 1e12 || (Math.abs(val) < 1e-7 && val !== 0)) {
    return val.toExponential(10).replace('e+', 'e');
  }
  // Trim trailing zeros neatly
  const d = new Decimal(val);
  const str = d.toString();
  if (str.includes('.')) {
    return parseFloat(str).toLocaleString('en-US', { maximumFractionDigits: 10, useGrouping: false });
  }
  return str;
}

function formatEngineering(val: number): string {
  if (val === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(val)));
  const engExp = Math.floor(exp / 3) * 3;
  const mantissa = val / Math.pow(10, engExp);
  const prefixes: Record<number, string> = {
    24: 'Y', 21: 'Z', 18: 'E', 15: 'P', 12: 'T', 9: 'G', 6: 'M', 3: 'k',
    0: '',
    '-3': 'm', '-6': 'μ', '-9': 'n', '-12': 'p', '-15': 'f', '-18': 'a', '-21': 'z', '-24': 'y'
  };
  const prefix = prefixes[engExp] !== undefined ? ` ${prefixes[engExp]}` : ` × 10^${engExp}`;
  return `${mantissa.toFixed(4).replace(/\.?0+$/, '')}${prefix}`;
}

/**
 * Prime Factorization
 */
export function primeFactors(n: number): { prime: number; power: number }[] {
  n = Math.abs(Math.round(n));
  if (n <= 1) return [];
  const factors: { prime: number; power: number }[] = [];
  let d = 2;
  while (d * d <= n) {
    if (n % d === 0) {
      let power = 0;
      while (n % d === 0) {
        power++;
        n /= d;
      }
      factors.push({ prime: d, power });
    }
    d = d === 2 ? 3 : d + 2;
  }
  if (n > 1) {
    factors.push({ prime: n, power: 1 });
  }
  return factors;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(Math.round((a * b) / gcd(a, b)));
}

/**
 * Coordinate conversions
 */
export function polToRec(r: number, theta: number, unit: AngleUnit): { x: number; y: number } {
  const rad = convertAngleToRad(theta, unit);
  return {
    x: r * Math.cos(rad),
    y: r * Math.sin(rad)
  };
}

export function recToPol(x: number, y: number, unit: AngleUnit): { r: number; theta: number } {
  const r = Math.hypot(x, y);
  const rad = Math.atan2(y, x);
  return {
    r,
    theta: convertAngleFromRad(rad, unit)
  };
}

/**
 * DMS (Degrees, Minutes, Seconds) conversions
 */
export function decimalToDMS(degDecimal: number): { deg: number; min: number; sec: number } {
  const isNeg = degDecimal < 0;
  const absVal = Math.abs(degDecimal);
  const deg = Math.floor(absVal);
  const minFull = (absVal - deg) * 60;
  const min = Math.floor(minFull);
  const sec = (minFull - min) * 60;
  return {
    deg: isNeg ? -deg : deg,
    min,
    sec: Math.round(sec * 100) / 100
  };
}

export function dmsToDecimal(deg: number, min: number, sec: number): number {
  const sign = deg < 0 ? -1 : 1;
  const absDeg = Math.abs(deg);
  return sign * (absDeg + min / 60 + sec / 3600);
}
