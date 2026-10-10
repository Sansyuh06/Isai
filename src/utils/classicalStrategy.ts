import { evaluateRound } from './scoring';

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
