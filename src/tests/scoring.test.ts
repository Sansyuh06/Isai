import { describe, it, expect } from 'vitest';
import { evaluateRound, calculateWilsonCI } from '../utils/scoring';

describe('Game Scoring Rules', () => {
  it('correctly validates Alice even parity and Bob odd parity', () => {
    // Alice [0, 1, 1] -> parity 0 (even)
    // Bob [1, 0, 0] -> parity 1 (odd)
    // row 0, col 1: Alice bit at col 1 is 1; Bob bit at row 0 is 1 -> Match -> Win
    const resWin = evaluateRound(0, 1, [0, 1, 1], [1, 0, 0]);
    expect(resWin.aliceParityEven).toBe(true);
    expect(resWin.bobParityOdd).toBe(true);
    expect(resWin.sharedMatch).toBe(true);
    expect(resWin.win).toBe(true);
  });

  it('rejects round if crossing cell bits disagree', () => {
    // row 0, col 0: Alice bit 0 is 0; Bob bit 0 is 1 -> Mismatch -> Loss
    const resLoss = evaluateRound(0, 0, [0, 1, 1], [1, 0, 0]);
    expect(resLoss.aliceParityEven).toBe(true);
    expect(resLoss.bobParityOdd).toBe(true);
    expect(resLoss.sharedMatch).toBe(false);
    expect(resLoss.win).toBe(false);
  });

  it('calculates valid 95% Wilson score confidence interval', () => {
    const ci = calculateWilsonCI(900, 1000);
    expect(ci[0]).toBeGreaterThanOrEqual(0.87);
    expect(ci[1]).toBeLessThanOrEqual(0.93);
    expect(ci[0]).toBeLessThan(ci[1]);
  });
});
