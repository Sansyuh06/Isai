import { describe, it, expect } from 'vitest';
import { 
  getExactContextOutcomeProbabilities, 
  runMagicSquareSimulation,
  decodeAliceBits,
  decodeBobBits
} from '../utils/simulator';
import exactGolden from '../data/exactProbabilitiesGolden.json';

describe('TypeScript 4-Qubit Statevector Simulator', () => {
  it('matches exact Qiskit Statevector probabilities across all 9 contexts within 1e-9 tolerance', () => {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const simProbs = getExactContextOutcomeProbabilities(r, c);
        const goldenProbs = (exactGolden as Record<string, Record<string, number>>)[`${r}_${c}`];

        expect(Object.keys(simProbs).length).toBe(Object.keys(goldenProbs).length);

        for (const [key, goldenVal] of Object.entries(goldenProbs)) {
          const simVal = simProbs[key];
          expect(simVal).toBeDefined();
          expect(Math.abs(simVal - goldenVal)).toBeLessThan(1e-9);
        }
      }
    }
  });

  it('verifies 100% win rate across all ideal simulation contexts', () => {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        for (let shot = 0; shot < 50; shot++) {
          const outcome = runMagicSquareSimulation(r, c, 0);
          expect(outcome.win).toBe(true);
          // Parity checks
          expect((outcome.aliceBits[0] ^ outcome.aliceBits[1] ^ outcome.aliceBits[2])).toBe(0);
          expect((outcome.bobBits[0] ^ outcome.bobBits[1] ^ outcome.bobBits[2])).toBe(1);
          // Crossing match
          expect(outcome.aliceBits[c]).toBe(outcome.bobBits[r]);
        }
      }
    }
  });

  it('correctly derives context parity bits at proper index positions', () => {
    // Alice row 2 has derived bit at index 0 (not 2)
    const aBits = decodeAliceBits(2, 0, 1);
    expect(aBits[0] ^ aBits[1] ^ aBits[2]).toBe(0);

    // Bob col 2 has derived bit at index 1 (not 2)
    const bBits = decodeBobBits(2, 1, 0);
    expect(bBits[0] ^ bBits[1] ^ bBits[2]).toBe(1);
  });

  it('demonstrates that noise degrades win rate below 100%', () => {
    let wins = 0;
    const total = 500;
    for (let i = 0; i < total; i++) {
      const outcome = runMagicSquareSimulation(0, 0, 0.15); // 15% error rate
      if (outcome.win) wins++;
    }
    const winRate = wins / total;
    // With 15% noise, win rate should be significantly degraded from 100%
    expect(winRate).toBeLessThan(0.95);
  });
});
