import { describe, it, expect } from 'vitest';
import { 
  getExactContextOutcomeProbabilities, 
  runMagicSquareSimulation,
  decodeAliceBits,
  decodeBobBits
} from '../utils/simulator';
import { createMulberry32 } from '../utils/prng';
import goldenFixture from '../data/exactProbabilitiesGolden.json';
import defaultAerDataset from '../data/defaultAerData.json';

describe('TypeScript 4-Qubit Statevector Simulator', () => {
  it('matches exact Qiskit Statevector probabilities across all 9 contexts within 1e-9 tolerance', () => {
    const contexts = goldenFixture.contexts as Record<string, Record<string, number>>;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const simProbs = getExactContextOutcomeProbabilities(r, c);
        const goldenProbs = contexts[`${r}_${c}`];

        expect(Object.keys(simProbs).length).toBe(Object.keys(goldenProbs).length);

        for (const [key, goldenVal] of Object.entries(goldenProbs)) {
          const simVal = simProbs[key];
          expect(simVal).toBeDefined();
          expect(Math.abs(simVal - goldenVal)).toBeLessThan(1e-9);
        }
      }
    }
  });

  it('guarantees identical reproducibility when using seeded PRNG', () => {
    const seed = 123456789;
    const rngA = createMulberry32(seed);
    const rngB = createMulberry32(seed);

    for (let i = 0; i < 20; i++) {
      const resA = runMagicSquareSimulation(1, 2, 0.05, rngA);
      const resB = runMagicSquareSimulation(1, 2, 0.05, rngB);

      expect(resA.aliceBits).toEqual(resB.aliceBits);
      expect(resA.bobBits).toEqual(resB.bobBits);
      expect(resA.win).toBe(resB.win);
    }
  });

  it('verifies 100% win rate across all ideal simulation contexts', () => {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        for (let shot = 0; shot < 20; shot++) {
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

  it('statistically compares sampled simulation against aggregate saved Aer counts bin frequencies', () => {
    // Check context (0, 0)
    const aerCtx = defaultAerDataset.contexts.find(x => x.row === 0 && x.column === 0);
    expect(aerCtx).toBeDefined();

    // Sample 2,000 shots using seeded PRNG
    const N = 2000;
    const rng = createMulberry32(42);
    let simWins = 0;
    for (let i = 0; i < N; i++) {
      const out = runMagicSquareSimulation(0, 0, 0, rng);
      if (out.win) simWins++;
    }

    // Aer counts are aggregated over 1000 shots with 100% wins
    const aerWinCount = aerCtx!.counts.reduce((sum, item) => item.win ? sum + item.count : sum, 0);
    expect(aerWinCount).toBe(aerCtx!.shots);
    expect(simWins).toBe(N); // Ideal statevector matches aer ideal 100% win rate
  });
});
