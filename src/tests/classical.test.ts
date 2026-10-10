import { describe, it, expect } from 'vitest';
import { evaluateAllBaselineContexts, evaluateBaselineContext } from '../utils/classicalStrategy';

describe('Classical Baseline Strategy', () => {
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

  it('wins all other 8 contexts', () => {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (r === 0 && c === 0) continue;
        const res = evaluateBaselineContext(r, c);
        expect(res.win).toBe(true);
      }
    }
  });

  it('proves that across all 4,096 valid parity grid configurations, mismatches are always odd and max wins is 8/9', () => {
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
    let maxWins = 0;

    for (const r0 of validAliceRows) {
      for (const r1 of validAliceRows) {
        for (const r2 of validAliceRows) {
          const aGrid = [r0, r1, r2];

          for (const c0 of validBobCols) {
            for (const c1 of validBobCols) {
              for (const c2 of validBobCols) {
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
                // Parity theorem: number of mismatches must be odd (1, 3, 5, 7, 9)
                expect(mismatches % 2).toBe(1);

                if (wins > maxWins) maxWins = wins;
              }
            }
          }
        }
      }
    }

    expect(maxWins).toBe(8);
  });
});
