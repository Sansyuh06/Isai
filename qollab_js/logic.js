// Isai — pure game logic for the Qollab JS frontend.
// No Qiskit imports, no DOM access: this module runs in the Qollab iframe
// and in Node (for deterministic local tests).

// Circuit instruction tables. Qubit layout: Alice 0,1 — Bob 2,3.
// Each op is [methodName, ...args] applied to a Qiskit QuantumCircuit.
export const BELL_OPS = [
  ['h', 0], ['cx', 0, 2],
  ['h', 1], ['cx', 1, 3],
];

// Alice's local basis rotations per row (diagonalize her commuting observables).
export const ALICE_BASIS_OPS = [
  [['h', 0], ['h', 1]],                                   // row 0: X, X, XX
  [['sdg', 0], ['h', 0], ['sdg', 1], ['h', 1]],           // row 1: Y, Y, YY
  [['s', 0], ['cx', 0, 1], ['h', 0]],                    // row 2: YX, XY, ZZ
];

// Bob's local basis rotations per column.
export const BOB_BASIS_OPS = [
  [['h', 2], ['s', 3], ['h', 3]],                        // col 0
  [['h', 3], ['s', 2], ['h', 2]],                        // col 1
  [['cx', 2, 3], ['h', 2]],                              // col 2
];

export const CONTEXTS = [
  [0, 0], [0, 1], [0, 2],
  [1, 0], [1, 1], [1, 2],
  [2, 0], [2, 1], [2, 2],
];

// Decode a Qiskit count key into {a0, a1, b0, b1}.
// Two register groups ("bb aa") or one flat 4-bit register ("bbaa"):
// leftmost two chars are Bob's bits [b1][b0], rightmost two Alice's [a1][a0].
export function decodeCountKey(key) {
  const k = String(key).replace(/\s+/g, '');
  if (!/^[01]{4}$/.test(k)) {
    throw new Error(`Expected a 4-bit count key (optionally two 2-bit groups), got '${key}'`);
  }
  return { a0: +k[3], a1: +k[2], b0: +k[1], b1: +k[0] };
}

// Eigenvalue +1 -> bit 0, eigenvalue -1 -> bit 1. Alice parity even.
export function decodeAlice(row, q0, q1) {
  if (row === 0) {
    const b0 = q0 ^ 1;
    const b1 = q1 ^ 1;
    return [b0, b1, b0 ^ b1];
  }
  if (row === 1) {
    const b0 = q1;
    const b1 = q0;
    return [b0, b1, b0 ^ b1];
  }
  if (row === 2) {
    const b2 = q1;
    const b1 = q0 ^ 1;
    return [b1 ^ b2, b1, b2];
  }
  throw new Error(`Invalid row ${row}`);
}

// Bob parity odd.
export function decodeBob(col, q0, q1) {
  if (col === 0) {
    const b0 = q0 ^ 1;
    const b1 = q1;
    return [b0, b1, b0 ^ b1 ^ 1];
  }
  if (col === 1) {
    const b0 = q1 ^ 1;
    const b1 = q0;
    return [b0, b1, b0 ^ b1 ^ 1];
  }
  if (col === 2) {
    const b0 = q0;
    const b2 = q1;
    return [b0, b0 ^ b2 ^ 1, b2];
  }
  throw new Error(`Invalid col ${col}`);
}

export function checkRound(row, col, aliceBits, bobBits) {
  const aliceParityEven = (aliceBits[0] ^ aliceBits[1] ^ aliceBits[2]) === 0;
  const bobParityOdd = (bobBits[0] ^ bobBits[1] ^ bobBits[2]) === 1;
  const sharedMatch = aliceBits[col] === bobBits[row];
  return aliceParityEven && bobParityOdd && sharedMatch;
}

// Count wins over a Qiskit counts object for one (row, col) context.
export function scoreCounts(row, col, counts) {
  let wins = 0;
  let total = 0;
  for (const [key, n] of Object.entries(counts)) {
    const { a0, a1, b0, b1 } = decodeCountKey(key);
    if (checkRound(row, col, decodeAlice(row, a0, a1), decodeBob(col, b0, b1))) {
      wins += n;
    }
    total += n;
  }
  return { wins, total };
}

// Wilson score interval (95%), mirrors python/mermin_peres scoring.
export function wilson(wins, total) {
  if (total <= 0) return [0, 0];
  const z = 1.959963984540054;
  const p = wins / total;
  const z2 = z * z;
  const den = 1 + z2 / total;
  const centre = (p + z2 / (2 * total)) / den;
  const half = (z * Math.sqrt((p * (1 - p) + z2 / (4 * total)) / total)) / den;
  return [
    Math.max(0, Math.round((centre - half) * 10000) / 10000),
    Math.min(1, Math.round((centre + half) * 10000) / 10000),
  ];
}

function xorKey(key, mask) {
  // String index i holds clbit (3 - i); mask bit j flips clbit j.
  let out = '';
  for (let i = 0; i < 4; i++) {
    const bit = (+key[i]) ^ ((mask >> (3 - i)) & 1);
    out += bit;
  }
  return out;
}

// Classical browser-side noise overlay: independently flip each measured bit
// with probability p, redistributing counts deterministically (largest
// remainder, so totals are preserved exactly). This is post-processing of
// simulator counts — it is NOT hardware noise and is labelled as such in UI.
export function noiseOverlay(counts, p) {
  if (p === 0) return { ...counts };
  const exact = new Map();
  let grandTotal = 0;
  for (const [key, n] of Object.entries(counts)) {
    grandTotal += n;
    for (let mask = 0; mask < 16; mask++) {
      let w = 1;
      for (let i = 0; i < 4; i++) w *= ((mask >> i) & 1) ? p : 1 - p;
      if (w === 0) continue;
      const nk = xorKey(key, mask);
      exact.set(nk, (exact.get(nk) || 0) + n * w);
    }
  }
  const out = {};
  let assigned = 0;
  const remainders = [];
  for (const [key, v] of [...exact.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const f = Math.floor(v);
    out[key] = f;
    assigned += f;
    remainders.push([key, v - f]);
  }
  remainders.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  for (let i = 0; i < grandTotal - assigned; i++) out[remainders[i][0]] += 1;
  for (const key of Object.keys(out)) if (out[key] === 0) delete out[key];
  return out;
}
