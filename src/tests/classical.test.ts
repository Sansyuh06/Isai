import { describe, it, expect } from 'vitest';
import { 
  evaluateAllBaselineContexts, 
  evaluateBaselineContext,
  BEST_KNOWN_ALICE,
  BEST_KNOWN_BOB,
  evaluateGridsAgreement,
  deriveAliceRowBit,
  deriveBobColBit,
  areAllIndependentBitsSet,
  NullableBitGrid
} from '../utils/classicalStrategy';

describe('Classical Baseline Strategy & Grid Evaluation', () => {
  it('wins exactly 8 out of 9 contexts in the fixed baseline policy', () => {
    const baseline = evaluateAllBaselineContexts();
    expect(baseline.total).toBe(9);
    expect(baseline.wins).toBe(8);
    expect(baseline.winRate).toBeCloseTo(8 / 9, 5);
  });

  it('loses strictly at row 1, col 1 (index 0, 0)', () => {
    const defect = evaluateBaselineContext(0, 0);
    expect(defect.win).toBe(false);
    expect(defect.match).toBe(false);
    expect(defect.aliceSharedBit).toBe(0);
    expect(defect.bobSharedBit).toBe(1);
  });

  it('wins all other 8 contexts in baseline', () => {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (r === 0 && c === 0) continue;
        const res = evaluateBaselineContext(r, c);
        expect(res.win).toBe(true);
      }
    }
  });

  it('proves that BEST_KNOWN_ALICE and BEST_KNOWN_BOB score exactly 8/9', () => {
    // Alice: [[0,1,1],[0,0,0],[0,0,0]]
    // Bob:   [[1,1,1],[0,0,0],[0,0,0]]
    const res = evaluateGridsAgreement(BEST_KNOWN_ALICE, BEST_KNOWN_BOB);
    expect(res.isComplete).toBe(true);
    expect(res.totalEvaluated).toBe(9);
    expect(res.matches).toBe(8);
    expect(res.mismatches).toBe(1);

    // Specifically verify the single clash is at (r=0, c=0):
    const c00 = res.contexts.find(c => c.row === 0 && c.col === 0);
    expect(c00?.match).toBe(false);
    expect(c00?.aliceBit).toBe(0);
    expect(c00?.bobBit).toBe(1);

    // All other 8 cells match
    const otherContexts = res.contexts.filter(c => !(c.row === 0 && c.col === 0));
    expect(otherContexts.every(c => c.match)).toBe(true);
  });

  it('verifies helper functions deriveAliceRowBit, deriveBobColBit and areAllIndependentBitsSet', () => {
    expect(deriveAliceRowBit(0, 1)).toBe(1);
    expect(deriveAliceRowBit(1, 1)).toBe(0);
    expect(deriveAliceRowBit(0, 0)).toBe(0);
    expect(deriveAliceRowBit(null, 1)).toBe(null);

    expect(deriveBobColBit(1, 0)).toBe(0);
    expect(deriveBobColBit(0, 0)).toBe(1);
    expect(deriveBobColBit(1, 1)).toBe(1);
    expect(deriveBobColBit(1, null)).toBe(null);

    const emptyGrid: NullableBitGrid = [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];
    expect(areAllIndependentBitsSet(emptyGrid, emptyGrid)).toBe(false);
    expect(areAllIndependentBitsSet(BEST_KNOWN_ALICE, BEST_KNOWN_BOB)).toBe(true);
  });

  it('exhaustively tests all 4,096 pairs of parity-valid grids with exact mismatch histogram {1: 144, 3: 1344, 5: 2016, 7: 576, 9: 16}', () => {
    // Valid even parity rows for Alice (sum mod 2 == 0)
    const validAliceRows = [
      [0, 0, 0],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 0]
    ];

    // Valid odd parity columns for Bob (sum mod 2 == 1)
    const validBobCols = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1]
    ];

    // 4^3 = 64 Alice grids, 4^3 = 64 Bob grids -> 4096 pairs
    const histogram: Record<number, number> = {
      1: 0,
      3: 0,
      5: 0,
      7: 0,
      9: 0
    };

    let totalPairs = 0;
    let maxWins = 0;

    for (const r0 of validAliceRows) {
      for (const r1 of validAliceRows) {
        for (const r2 of validAliceRows) {
          const aGrid = [r0, r1, r2];

          for (const c0 of validBobCols) {
            for (const c1 of validBobCols) {
              for (const c2 of validBobCols) {
                totalPairs++;
                const bGrid = [
                  [c0[0], c1[0], c2[0]],
                  [c0[1], c1[1], c2[1]],
                  [c0[2], c1[2], c2[2]]
                ];

                let wins = 0;
                for (let r = 0; r < 3; r++) {
                  for (let c = 0; c < 3; c++) {
                    if (aGrid[r][c] === bGrid[r][c]) {
                      wins++;
                    }
                  }
                }

                const mismatches = 9 - wins;
                // Parity theorem: mismatches must be odd
                expect(mismatches % 2).toBe(1);
                histogram[mismatches] = (histogram[mismatches] || 0) + 1;

                if (wins > maxWins) maxWins = wins;
              }
            }
          }
        }
      }
    }

    expect(totalPairs).toBe(4096);
    expect(maxWins).toBe(8);

    // Check exact histogram distribution
    expect(histogram).toEqual({
      1: 144,
      3: 1344,
      5: 2016,
      7: 576,
      9: 16
    });
  });
});
