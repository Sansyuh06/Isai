import { describe, it, expect } from 'vitest';
import { evaluateCommunicationContext } from '../utils/communication';

describe('Classical Communication Mode', () => {
  it('achieves 100% agreement across all 9 contexts when Alice signals her row index', () => {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const step = evaluateCommunicationContext(r, c);
        expect(step.win).toBe(true);
        expect(step.crossingMatch).toBe(true);
        expect(step.aliceParityEven).toBe(true);
        expect(step.bobParityOdd).toBe(true);
        expect(step.aliceBits[c]).toBe(step.bobBits[r]);
      }
    }
  });
});
