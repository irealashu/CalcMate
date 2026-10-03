import { BaseNType, WordSize } from '../types/calculator';

export function getWordMask(bits: WordSize): bigint {
  switch (bits) {
    case 8: return 0xFFn;
    case 16: return 0xFFFFn;
    case 32: return 0xFFFFFFFFn;
    case 64: return 0xFFFFFFFFFFFFFFFFn;
  }
}

export function maskToWord(val: bigint, bits: WordSize): bigint {
  const mask = getWordMask(bits);
  return val & mask;
}

export function toSigned(val: bigint, bits: WordSize): bigint {
  const masked = maskToWord(val, bits);
  const signBit = 1n << BigInt(bits - 1);
  if ((masked & signBit) !== 0n) {
    return masked - (1n << BigInt(bits));
  }
  return masked;
}

export function formatBaseN(val: bigint, base: BaseNType, bits: WordSize, signed = false): string {
  const masked = maskToWord(val, bits);

  if (base === 'DEC') {
    if (signed) {
      return toSigned(masked, bits).toString();
    }
    return masked.toString();
  }

  if (base === 'HEX') {
    const hex = masked.toString(16).toUpperCase();
    const padLen = Math.ceil(bits / 4);
    return hex.padStart(padLen, '0');
  }

  if (base === 'OCT') {
    const oct = masked.toString(8);
    const padLen = Math.ceil(bits / 3);
    return oct.padStart(padLen, '0');
  }

  if (base === 'BIN') {
    const bin = masked.toString(2);
    return bin.padStart(bits, '0');
  }

  return masked.toString();
}

export function parseBaseNInput(input: string, base: BaseNType, bits: WordSize): bigint {
  if (!input || input.trim() === '') return 0n;
  const clean = input.trim().replace(/\s+/g, '');

  try {
    let parsed = 0n;
    if (base === 'HEX') parsed = BigInt('0x' + clean);
    else if (base === 'OCT') parsed = BigInt('0o' + clean);
    else if (base === 'BIN') parsed = BigInt('0b' + clean);
    else if (base === 'DEC') parsed = BigInt(clean);

    return maskToWord(parsed, bits);
  } catch {
    return 0n;
  }
}

export type BitwiseOp = 'ADD' | 'SUB' | 'MUL' | 'AND' | 'OR' | 'XOR' | 'XNOR' | 'NOT' | 'SHL' | 'SHR' | 'ASR' | 'ROL' | 'ROR';

export function executeBitwise(a: bigint, b: bigint, op: BitwiseOp, bits: WordSize): bigint {
  const mask = getWordMask(bits);
  const valA = maskToWord(a, bits);
  const valB = maskToWord(b, bits);

  switch (op) {
    case 'ADD': return (valA + valB) & mask;
    case 'SUB': return (valA - valB) & mask;
    case 'MUL': return (valA * valB) & mask;
    case 'AND': return (valA & valB) & mask;
    case 'OR': return (valA | valB) & mask;
    case 'XOR': return (valA ^ valB) & mask;
    case 'XNOR': return (~(valA ^ valB)) & mask;
    case 'NOT': return (~valA) & mask;
    case 'SHL': return (valA << valB) & mask;
    case 'SHR': return (valA >> valB) & mask;
    case 'ASR': {
      const signedA = toSigned(valA, bits);
      const shifted = signedA >> valB;
      return maskToWord(shifted, bits);
    }
    case 'ROL': {
      const bMod = BigInt(valB % BigInt(bits));
      return ((valA << bMod) | (valA >> (BigInt(bits) - bMod))) & mask;
    }
    case 'ROR': {
      const bMod = BigInt(valB % BigInt(bits));
      return ((valA >> bMod) | (valA << (BigInt(bits) - bMod))) & mask;
    }
  }
}

export function toggleBit(val: bigint, bitIndex: number, bits: WordSize): bigint {
  if (bitIndex < 0 || bitIndex >= bits) return val;
  const mask = 1n << BigInt(bitIndex);
  const toggled = val ^ mask;
  return maskToWord(toggled, bits);
}

export function textToHexASCII(text: string): string {
  return Array.from(text)
    .map(c => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'))
    .join(' ');
}

export function hexASCIIToText(hexStr: string): string {
  const clean = hexStr.replace(/[^0-9A-Fa-f]/g, '');
  let result = '';
  for (let i = 0; i < clean.length; i += 2) {
    const code = parseInt(clean.substring(i, i + 2), 16);
    if (!isNaN(code)) result += String.fromCharCode(code);
  }
  return result;
}
