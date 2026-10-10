import { describe, it, expect } from 'vitest';
import { 
  generatePromptSequence, 
  runSurvivalChallenge, 
  getClassicalTheoreticalStats 
} from '../utils/survival';
import { BEST_KNOWN_ALICE, BEST_KNOWN_BOB } from '../utils/classicalStrategy';

describe('30-Round Survival Challenge Module', () => {
  it('generates uniform seeded prompt sequences reproducibly', () => {
    const seed = 98765;
    const seq1 = generatePromptSequence(30, seed);
    const seq2 = generatePromptSequence(30, seed);

    expect(seq1).toEqual(seq2);
    expect(seq1.length).toBe(30);

    // Each row and col should be in {0, 1, 2}
    for (const p of seq1) {
      expect([0, 1, 2]).toContain(p.row);
      expect([0, 1, 2]).toContain(p.col);
    }
  });

  it('calculates theoretical probabilities for 30 rounds', () => {
    // Expected losses = 30 / 9 ≈ 3.333
    const stats1Life = getClassicalTheoreticalStats(30, 1);
    expect(stats1Life.expectedLosses).toBeCloseTo(30 / 9, 4);
    // (8/9)^30 ≈ 0.02924 (2.92%)
    expect(stats1Life.survivalProbability).toBeCloseTo(Math.pow(8 / 9, 30), 4);
    expect(stats1Life.survivalProbability).toBeCloseTo(0.0292, 3);

    // 2 lives: (8/9)^30 + 30 * (8/9)^29 * (1/9) ≈ 0.1387 (13.87%)
    const stats2Lives = getClassicalTheoreticalStats(30, 2);
    expect(stats2Lives.survivalProbability).toBeCloseTo(0.1387, 3);
  });

  it('replays identical prompt sequences across classical and quantum modes', () => {
    const seed = 42;
    const prompts = generatePromptSequence(30, seed);

    const classicalRun = runSurvivalChallenge(prompts, 'classical', {
      initialLives: 1,
      aliceGrid: BEST_KNOWN_ALICE,
      bobGrid: BEST_KNOWN_BOB
    });

    const quantumRun = runSurvivalChallenge(prompts, 'quantum_ideal', {
      initialLives: 1,
      simSeed: 100
    });

    expect(classicalRun.rounds.length).toBe(30);
    expect(quantumRun.rounds.length).toBe(30);

    // Verify prompts match 1:1
    for (let i = 0; i < 30; i++) {
      expect(classicalRun.rounds[i].row).toBe(quantumRun.rounds[i].row);
      expect(classicalRun.rounds[i].col).toBe(quantumRun.rounds[i].col);
    }

    // Ideal quantum always achieves 30/30 with 0 losses
    expect(quantumRun.survived).toBe(true);
    expect(quantumRun.totalMatches).toBe(30);
    expect(quantumRun.totalLosses).toBe(0);
    expect(quantumRun.eliminationRound).toBeNull();
  });
});
