export type Complex = [number, number]; // [real, imag]

export function complexAdd(a: Complex, b: Complex): Complex {
  return [a[0] + b[0], a[1] + b[1]];
}

export function complexMult(a: Complex, b: Complex): Complex {
  return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
}

export function complexScale(a: Complex, scalar: number): Complex {
  return [a[0] * scalar, a[1] * scalar];
}

export class Statevector {
  public amplitudes: Complex[];

  constructor() {
    this.amplitudes = new Array(16).fill(null).map(() => [0, 0] as Complex);
    this.amplitudes[0] = [1, 0]; // |0000>
  }

  // Apply a 1-qubit gate (2x2 matrix) to target qubit (0 to 3)
  apply1Q(matrix: [Complex, Complex, Complex, Complex], target: number) {
    const newAmps: Complex[] = new Array(16).fill(null).map(() => [0, 0] as Complex);
    for (let i = 0; i < 16; i++) {
      const bit = (i >> target) & 1;
      const flipped = i ^ (1 << target);
      if (bit === 0) {
        // i is the state where target is 0
        newAmps[i] = complexAdd(complexMult(matrix[0], this.amplitudes[i]), complexMult(matrix[1], this.amplitudes[flipped]));
      } else {
        // i is the state where target is 1
        newAmps[i] = complexAdd(complexMult(matrix[2], this.amplitudes[flipped]), complexMult(matrix[3], this.amplitudes[i]));
      }
    }
    this.amplitudes = newAmps;
  }

  // Apply CX gate
  applyCX(control: number, target: number) {
    const newAmps = [...this.amplitudes];
    for (let i = 0; i < 16; i++) {
      const cBit = (i >> control) & 1;
      if (cBit === 1) {
        const flipped = i ^ (1 << target);
        if (i < flipped) {
          const temp = newAmps[i];
          newAmps[i] = newAmps[flipped];
          newAmps[flipped] = temp;
        }
      }
    }
    this.amplitudes = newAmps;
  }

  // Probabilities of all 16 computational basis states
  getProbabilities(): number[] {
    return this.amplitudes.map(a => a[0] * a[0] + a[1] * a[1]);
  }

  // Measurement (destructive / sampled) - returns measured integer 0-15
  measure(): number {
    const probs = this.getProbabilities();
    const r = Math.random();
    let sum = 0;
    for (let i = 0; i < 16; i++) {
      sum += probs[i];
      if (r <= sum) return i;
    }
    return 15;
  }

  normalize() {
    let norm = 0;
    for (let i = 0; i < 16; i++) {
      norm += this.amplitudes[i][0] * this.amplitudes[i][0] + this.amplitudes[i][1] * this.amplitudes[i][1];
    }
    if (norm > 0) {
      const scale = 1 / Math.sqrt(norm);
      for (let i = 0; i < 16; i++) {
        this.amplitudes[i] = [this.amplitudes[i][0] * scale, this.amplitudes[i][1] * scale];
      }
    }
  }
}

// Gates
const invSqrt2 = 1 / Math.sqrt(2);
export const GATES = {
  H: [
    [invSqrt2, 0], [invSqrt2, 0],
    [invSqrt2, 0], [-invSqrt2, 0]
  ] as [Complex, Complex, Complex, Complex],
  S: [
    [1, 0], [0, 0],
    [0, 0], [0, 1]
  ] as [Complex, Complex, Complex, Complex],
  Sdg: [
    [1, 0], [0, 0],
    [0, 0], [0, -1]
  ] as [Complex, Complex, Complex, Complex],
  X: [
    [0, 0], [1, 0],
    [1, 0], [0, 0]
  ] as [Complex, Complex, Complex, Complex],
  Y: [
    [0, 0], [0, -1],
    [0, 1], [0, 0]
  ] as [Complex, Complex, Complex, Complex],
  Z: [
    [1, 0], [0, 0],
    [0, 0], [-1, 0]
  ] as [Complex, Complex, Complex, Complex]
};

// Depolarizing noise
function applyNoise(sv: Statevector, qubit: number, p: number) {
  if (p <= 0) return;
  if (Math.random() < p) {
    const errorType = Math.random();
    if (errorType < 1/3) sv.apply1Q(GATES.X, qubit);
    else if (errorType < 2/3) sv.apply1Q(GATES.Y, qubit);
    else sv.apply1Q(GATES.Z, qubit);
  }
}

export function decodeAliceBits(row: number, a0: number, a1: number): [number, number, number] {
  if (row === 0) {
    const b0 = a0 ^ 1;
    const b1 = a1 ^ 1;
    return [b0, b1, b0 ^ b1];
  } else if (row === 1) {
    const b0 = a1;
    const b1 = a0;
    return [b0, b1, b0 ^ b1];
  } else {
    const b2 = a1;
    const b1 = a0 ^ 1;
    return [b1 ^ b2, b1, b2];
  }
}

export function decodeBobBits(col: number, b0: number, b1: number): [number, number, number] {
  if (col === 0) {
    const c0 = b0 ^ 1;
    const c1 = b1;
    return [c0, c1, c0 ^ c1 ^ 1];
  } else if (col === 1) {
    const c0 = b1 ^ 1;
    const c1 = b0;
    return [c0, c1, c0 ^ c1 ^ 1];
  } else {
    const c0 = b0;
    const c2 = b1;
    return [c0, c0 ^ c2 ^ 1, c2];
  }
}

export function buildStatevectorCircuit(row: number, col: number, noiseP: number = 0): Statevector {
  const sv = new Statevector();
  // Qubits: A0=0, A1=1, B0=2, B1=3
  
  // Entanglement Prep: Bell pairs on (A0, B0) and (A1, B1)
  sv.apply1Q(GATES.H, 0);
  applyNoise(sv, 0, noiseP);
  sv.applyCX(0, 2);
  applyNoise(sv, 0, noiseP); applyNoise(sv, 2, noiseP);

  sv.apply1Q(GATES.H, 1);
  applyNoise(sv, 1, noiseP);
  sv.applyCX(1, 3);
  applyNoise(sv, 1, noiseP); applyNoise(sv, 3, noiseP);

  // Alice Basis (Row)
  if (row === 0) {
    sv.apply1Q(GATES.H, 0); applyNoise(sv, 0, noiseP);
    sv.apply1Q(GATES.H, 1); applyNoise(sv, 1, noiseP);
  } else if (row === 1) {
    sv.apply1Q(GATES.Sdg, 0); applyNoise(sv, 0, noiseP);
    sv.apply1Q(GATES.H, 0); applyNoise(sv, 0, noiseP);
    sv.apply1Q(GATES.Sdg, 1); applyNoise(sv, 1, noiseP);
    sv.apply1Q(GATES.H, 1); applyNoise(sv, 1, noiseP);
  } else {
    sv.apply1Q(GATES.S, 0); applyNoise(sv, 0, noiseP);
    sv.applyCX(0, 1); applyNoise(sv, 0, noiseP); applyNoise(sv, 1, noiseP);
    sv.apply1Q(GATES.H, 0); applyNoise(sv, 0, noiseP);
  }

  // Bob Basis (Col)
  if (col === 0) {
    sv.apply1Q(GATES.H, 2); applyNoise(sv, 2, noiseP);
    sv.apply1Q(GATES.S, 3); applyNoise(sv, 3, noiseP);
    sv.apply1Q(GATES.H, 3); applyNoise(sv, 3, noiseP);
  } else if (col === 1) {
    sv.apply1Q(GATES.H, 3); applyNoise(sv, 3, noiseP);
    sv.apply1Q(GATES.S, 2); applyNoise(sv, 2, noiseP);
    sv.apply1Q(GATES.H, 2); applyNoise(sv, 2, noiseP);
  } else {
    sv.applyCX(2, 3); applyNoise(sv, 2, noiseP); applyNoise(sv, 3, noiseP);
    sv.apply1Q(GATES.H, 2); applyNoise(sv, 2, noiseP);
  }

  sv.normalize();
  return sv;
}

export function getExactContextOutcomeProbabilities(row: number, col: number): Record<string, number> {
  const sv = buildStatevectorCircuit(row, col, 0);
  const probs = sv.getProbabilities();
  const outcomeMap: Record<string, number> = {};

  for (let idx = 0; idx < 16; idx++) {
    const p = probs[idx];
    if (p > 1e-9) {
      const a0 = (idx >> 0) & 1;
      const a1 = (idx >> 1) & 1;
      const b0 = (idx >> 2) & 1;
      const b1 = (idx >> 3) & 1;

      const aBits = decodeAliceBits(row, a0, a1);
      const bBits = decodeBobBits(col, b0, b1);
      const key = `[${aBits.join(', ')}]|[${bBits.join(', ')}]`;
      outcomeMap[key] = (outcomeMap[key] || 0) + p;
    }
  }

  return outcomeMap;
}

export function runMagicSquareSimulation(row: number, col: number, noiseP: number = 0) {
  const sv = buildStatevectorCircuit(row, col, noiseP);
  const res = sv.measure();
  const a0 = (res >> 0) & 1;
  const a1 = (res >> 1) & 1;
  const b0 = (res >> 2) & 1;
  const b1 = (res >> 3) & 1;

  const aBits = decodeAliceBits(row, a0, a1);
  const bBits = decodeBobBits(col, b0, b1);

  return { 
    aliceBits: aBits, 
    bobBits: bBits,
    win: aBits[col] === bBits[row]
  };
}
