import { AngleUnit } from '../types/calculator';
import { convertAngleFromRad, convertAngleToRad } from './mathCore';

export interface Complex {
  re: number;
  im: number;
}

export function complexFromPolar(r: number, theta: number, unit: AngleUnit): Complex {
  const rad = convertAngleToRad(theta, unit);
  return {
    re: r * Math.cos(rad),
    im: r * Math.sin(rad)
  };
}

export function complexToPolar(c: Complex, unit: AngleUnit): { r: number; theta: number } {
  const r = Math.hypot(c.re, c.im);
  const rad = Math.atan2(c.im, c.re);
  return {
    r,
    theta: convertAngleFromRad(rad, unit)
  };
}

export function complexAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function complexSub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function complexMul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re
  };
}

export function complexDiv(a: Complex, b: Complex): Complex {
  const denom = b.re * b.re + b.im * b.im;
  if (denom === 0) throw new Error('Complex Division by Zero');
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom
  };
}

export function complexConjugate(c: Complex): Complex {
  return { re: c.re, im: -c.im };
}

export function complexModulus(c: Complex): number {
  return Math.hypot(c.re, c.im);
}

export function complexArgument(c: Complex, unit: AngleUnit): number {
  const rad = Math.atan2(c.im, c.re);
  return convertAngleFromRad(rad, unit);
}

export function complexPower(z: Complex, n: number): Complex {
  const r = Math.hypot(z.re, z.im);
  const theta = Math.atan2(z.im, z.re);
  const rn = Math.pow(r, n);
  return {
    re: rn * Math.cos(n * theta),
    im: rn * Math.sin(n * theta)
  };
}

export function complexNthRoots(z: Complex, n: number): Complex[] {
  if (n <= 0) throw new Error('Root degree n must be a positive integer.');
  const r = Math.hypot(z.re, z.im);
  const theta = Math.atan2(z.im, z.re);
  const rn = Math.pow(r, 1 / n);

  const roots: Complex[] = [];
  for (let k = 0; k < n; k++) {
    const angle = (theta + 2 * Math.PI * k) / n;
    roots.push({
      re: rn * Math.cos(angle),
      im: rn * Math.sin(angle)
    });
  }
  return roots;
}

export function complexExp(z: Complex): Complex {
  const expRe = Math.exp(z.re);
  return {
    re: expRe * Math.cos(z.im),
    im: expRe * Math.sin(z.im)
  };
}

export function complexLn(z: Complex): Complex {
  const r = Math.hypot(z.re, z.im);
  if (r === 0) throw new Error('Complex Logarithm: ln(0) is undefined.');
  const theta = Math.atan2(z.im, z.re);
  return {
    re: Math.log(r),
    im: theta
  };
}

export function complexSin(z: Complex): Complex {
  return {
    re: Math.sin(z.re) * Math.cosh(z.im),
    im: Math.cos(z.re) * Math.sinh(z.im)
  };
}

export function complexCos(z: Complex): Complex {
  return {
    re: Math.cos(z.re) * Math.cosh(z.im),
    im: -Math.sin(z.re) * Math.sinh(z.im)
  };
}

export function formatComplexString(c: Complex, precision = 4): string {
  const re = Number(c.re.toFixed(precision));
  const im = Number(c.im.toFixed(precision));

  if (Math.abs(im) < 1e-10) return `${re}`;
  if (Math.abs(re) < 1e-10) {
    if (im === 1) return 'i';
    if (im === -1) return '-i';
    return `${im}i`;
  }
  const sign = im > 0 ? ' + ' : ' - ';
  const absIm = Math.abs(im);
  const imStr = absIm === 1 ? 'i' : `${absIm}i`;
  return `${re}${sign}${imStr}`;
}
