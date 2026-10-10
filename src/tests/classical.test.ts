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
});
