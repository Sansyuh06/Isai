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
    this.amplitudes = new Array(16).fill([0, 0]);
    this.amplitudes[0] = [1, 0]; // |0000>
  }

  // Apply a 1-qubit gate (2x2 matrix) to target qubit (0 to 3)
  apply1Q(matrix: [Complex, Complex, Complex, Complex], target: number) {
    const newAmps: Complex[] = new Array(16).fill([0, 0]);
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

  // Measurement (destructive) - returns measured integer 0-15
  measure(): number {
    const probs = this.amplitudes.map(a => a[0] * a[0] + a[1] * a[1]);
    const r = Math.random();
    let sum = 0;
    for (let i = 0; i < 16; i++) {
      sum += probs[i];
      if (r <= sum) return i;
    }
    return 15;
  }

  // Normalization just in case
  normalize() {
    let norm = 0;
    for (let i = 0; i < 16; i++) {
      norm += this.amplitudes[i][0] * this.amplitudes[i][0] + this.amplitudes[i][1] * this.amplitudes[i][1];
    }
    const scale = 1 / Math.sqrt(norm);
    for (let i = 0; i < 16; i++) {
      this.amplitudes[i] = [this.amplitudes[i][0] * scale, this.amplitudes[i][1] * scale];
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
  if (Math.random() < p) {
    const errorType = Math.random();
    if (errorType < 1/3) sv.apply1Q(GATES.X, qubit);
    else if (errorType < 2/3) sv.apply1Q(GATES.Y, qubit);
    else sv.apply1Q(GATES.Z, qubit);
  }
}

export function runMagicSquareSimulation(row: number, col: number, noiseP: number = 0) {
  const sv = new Statevector();
  // Qubits: A1=0, A2=1, B1=2, B2=3
  
  // Entanglement Prep
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

  // Measure
  sv.normalize();
  const res = sv.measure();
  const a0 = (res >> 0) & 1; // A1
  const a1 = (res >> 1) & 1; // A2
  const b0 = (res >> 2) & 1; // B1
  const b1 = (res >> 3) & 1; // B2

  // Decode Alice
  let a_bits = [0, 0, 0];
  if (row === 0) {
    a_bits[0] = a0 ^ 1;
    a_bits[1] = a1 ^ 1;
    a_bits[2] = a_bits[0] ^ a_bits[1];
  } else if (row === 1) {
    a_bits[0] = a1;
    a_bits[1] = a0;
    a_bits[2] = a_bits[0] ^ a_bits[1];
  } else {
    a_bits[2] = a1;
    a_bits[1] = a0 ^ 1;
    a_bits[0] = a_bits[1] ^ a_bits[2];
  }

  // Decode Bob
  let b_bits = [0, 0, 0];
  if (col === 0) {
    b_bits[0] = b0 ^ 1;
    b_bits[1] = b1;
    b_bits[2] = b_bits[0] ^ b_bits[1] ^ 1;
  } else if (col === 1) {
    b_bits[0] = b1 ^ 1;
    b_bits[1] = b0;
    b_bits[2] = b_bits[0] ^ b_bits[1] ^ 1;
  } else {
    b_bits[0] = b0;
    b_bits[2] = b1;
    b_bits[1] = b_bits[0] ^ b_bits[2] ^ 1;
  }

  return { 
    aliceBits: a_bits as [number, number, number], 
    bobBits: b_bits as [number, number, number],
    win: a_bits[col] === b_bits[row]
  };
}
