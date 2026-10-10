import { evaluateRound } from './scoring';

export type Bit = 0 | 1;
export type NullableBit = Bit | null;
export type BitGrid = [[Bit, Bit, Bit], [Bit, Bit, Bit], [Bit, Bit, Bit]];
export type NullableBitGrid = [
  [NullableBit, NullableBit, NullableBit],
  [NullableBit, NullableBit, NullableBit],
  [NullableBit, NullableBit, NullableBit]
];

export const BEST_KNOWN_ALICE: BitGrid = [
  [0, 1, 1],
  [0, 0, 0],
  [0, 0, 0]
];

export const BEST_KNOWN_BOB: BitGrid = [
  [1, 1, 1],
  [0, 0, 0],
  [0, 0, 0]
];

export const BASELINE_ALICE_STRATEGY: Record<number, [number, number, number]> = {
  0: [0, 1, 1],
  1: [0, 0, 0],
  2: [0, 0, 0]
};

export const BASELINE_BOB_STRATEGY: Record<number, [number, number, number]> = {
  0: [1, 0, 0],
  1: [1, 0, 0],
  2: [1, 0, 0]
};

export interface ClassicalContextResult {
  row: number;
  column: number;
  aliceBits: [number, number, number];
  bobBits: [number, number, number];
  aliceSharedBit: number;
  bobSharedBit: number;
  match: boolean;
  win: boolean;
}

export function evaluateBaselineContext(row: number, col: number): ClassicalContextResult {
  const aliceBits = BASELINE_ALICE_STRATEGY[row];
  const bobBits = BASELINE_BOB_STRATEGY[col];
  const evalRes = evaluateRound(row, col, aliceBits, bobBits);

  return {
    row,
    column: col,
    aliceBits,
    bobBits,
    aliceSharedBit: evalRes.aliceSharedBit,
    bobSharedBit: evalRes.bobSharedBit,
    match: evalRes.sharedMatch,
    win: evalRes.win
  };
}

export function evaluateAllBaselineContexts(): {
  results: ClassicalContextResult[];
  wins: number;
  total: number;
  winRate: number;
} {
  const results: ClassicalContextResult[] = [];
  let wins = 0;

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const res = evaluateBaselineContext(r, c);
      if (res.win) wins++;
      results.push(res);
    }
  }

  return {
    results,
    wins,
    total: 9,
    winRate: wins / 9
  };
}

/**
 * Derives Alice's 3rd bit in a row to ensure even parity (sum % 2 === 0).
 * If either independent bit is null, returns null.
 */
export function deriveAliceRowBit(bit0: NullableBit, bit1: NullableBit): NullableBit {
  if (bit0 === null || bit1 === null) return null;
  return (bit0 ^ bit1) as Bit;
}

/**
 * Derives Bob's 3rd bit in a column to ensure odd parity (sum % 2 === 1).
 * If either independent bit is null, returns null.
 */
export function deriveBobColBit(bit0: NullableBit, bit1: NullableBit): NullableBit {
  if (bit0 === null || bit1 === null) return null;
  return (bit0 ^ bit1 ^ 1) as Bit;
}

/**
 * Checks whether all 12 independent free bits are filled:
 * Alice has 6 free bits: [r][0], [r][1] for r in 0,1,2
 * Bob has 6 free bits: [0][c], [1][c] for c in 0,1,2
 */
export function areAllIndependentBitsSet(
  aliceGrid: NullableBitGrid,
  bobGrid: NullableBitGrid
): boolean {
  for (let r = 0; r < 3; r++) {
    if (aliceGrid[r][0] === null || aliceGrid[r][1] === null) return false;
  }
  for (let c = 0; c < 3; c++) {
    if (bobGrid[0][c] === null || bobGrid[1][c] === null) return false;
  }
  return true;
}

/**
 * Evaluates the full grid puzzle agreement across all 9 contexts.
 */
export function evaluateGridsAgreement(
  aliceGrid: NullableBitGrid,
  bobGrid: NullableBitGrid
): {
  contexts: Array<{
    row: number;
    col: number;
    aliceBit: NullableBit;
    bobBit: NullableBit;
    match: boolean;
    isEvaluated: boolean;
  }>;
  totalEvaluated: number;
  matches: number;
  mismatches: number;
  isComplete: boolean;
} {
  const contexts = [];
  let totalEvaluated = 0;
  let matches = 0;

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const aVal = aliceGrid[r][c];
      const bVal = bobGrid[r][c];
      const isEvaluated = aVal !== null && bVal !== null;
      if (isEvaluated) totalEvaluated++;
      const match = isEvaluated && aVal === bVal;
      if (match) matches++;

      contexts.push({
        row: r,
        col: c,
        aliceBit: aVal,
        bobBit: bVal,
        match,
        isEvaluated
      });
    }
  }

  return {
    contexts,
    totalEvaluated,
    matches,
    mismatches: totalEvaluated - matches,
    isComplete: totalEvaluated === 9
  };
}
