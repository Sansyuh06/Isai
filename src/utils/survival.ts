import { createMulberry32 } from './prng';
import { NullableBitGrid, BEST_KNOWN_ALICE, BEST_KNOWN_BOB } from './classicalStrategy';
import { runMagicSquareSimulation } from './simulator';

export interface ChallengePrompt {
  round: number;
  row: number; // 0, 1, 2
  col: number; // 0, 1, 2
}

export type ChallengeMode = 'classical' | 'quantum_ideal' | 'quantum_noisy';

export interface RoundResult {
  round: number;
  row: number;
  col: number;
  aliceBit: number;
  bobBit: number;
  match: boolean;
  livesRemainingAfter: number;
  isPostElimination: boolean;
}

export interface ChallengeRunSummary {
  seed: number;
  mode: ChallengeMode;
  initialLives: number;
  rounds: RoundResult[];
  eliminationRound: number | null; // 1-indexed round where lives hit 0, or null if survived
  totalMatches: number;
  totalLosses: number;
  survived: boolean;
  theoreticalLosses: number; // 30 * (1/9) ≈ 3.33 for 8/9 classical
  theoreticalSurvivalRate: number; // (8/9)^30 ≈ 2.92% for 1 life, ~13.87% for 2 lives
}

/**
 * Generates uniform referee prompts for N rounds using a seeded PRNG stream.
 * row in {0, 1, 2}, col in {0, 1, 2}
 */
export function generatePromptSequence(roundsCount: number = 30, seed: number = 42): ChallengePrompt[] {
  const rng = createMulberry32(seed);
  const prompts: ChallengePrompt[] = [];

  for (let i = 0; i < roundsCount; i++) {
    const row = Math.floor(rng() * 3);
    const col = Math.floor(rng() * 3);
    prompts.push({
      round: i + 1,
      row,
      col
    });
  }

  return prompts;
}

/**
 * Calculates theoretical survival probability and expected losses for classical 8/9 strategy.
 */
export function getClassicalTheoreticalStats(totalRounds: number = 30, initialLives: number = 1): {
  expectedLosses: number;
  survivalProbability: number;
} {
  const pLoss = 1 / 9;
  const pWin = 8 / 9;
  const expectedLosses = totalRounds * pLoss;

  let survivalProbability: number;
  if (initialLives === 1) {
    // 0 losses in totalRounds
    survivalProbability = Math.pow(pWin, totalRounds);
  } else if (initialLives === 2) {
    // 0 or 1 loss in totalRounds
    const p0Losses = Math.pow(pWin, totalRounds);
    const p1Loss = totalRounds * Math.pow(pWin, totalRounds - 1) * pLoss;
    survivalProbability = p0Losses + p1Loss;
  } else {
    survivalProbability = 0;
  }

  return {
    expectedLosses,
    survivalProbability
  };
}

/**
 * Executes a full 30-round survival challenge run across a shared prompt sequence.
 */
export function runSurvivalChallenge(
  prompts: ChallengePrompt[],
  mode: ChallengeMode,
  options: {
    initialLives?: number;
    aliceGrid?: NullableBitGrid | null;
    bobGrid?: NullableBitGrid | null;
    noiseP?: number;
    simSeed?: number;
  } = {}
): ChallengeRunSummary {
  const initialLives = options.initialLives ?? 1;
  const noiseP = options.noiseP ?? 0.03;
  const simRng = options.simSeed !== undefined ? createMulberry32(options.simSeed) : Math.random;

  const aGrid = options.aliceGrid ?? BEST_KNOWN_ALICE;
  const bGrid = options.bobGrid ?? BEST_KNOWN_BOB;

  const rounds: RoundResult[] = [];
  let currentLives = initialLives;
  let eliminationRound: number | null = null;
  let totalMatches = 0;
  let totalLosses = 0;

  for (const p of prompts) {
    let aliceBit = 0;
    let bobBit = 0;
    let match = false;

    if (mode === 'classical') {
      const aVal = aGrid[p.row][p.col];
      const bVal = bGrid[p.row][p.col];
      aliceBit = aVal ?? 0;
      bobBit = bVal ?? 0;
      match = aVal !== null && bVal !== null && aVal === bVal;
    } else if (mode === 'quantum_ideal') {
      const outcome = runMagicSquareSimulation(p.row, p.col, 0, simRng);
      aliceBit = outcome.aliceBits[p.col];
      bobBit = outcome.bobBits[p.row];
      match = outcome.win;
    } else {
      // quantum_noisy
      const outcome = runMagicSquareSimulation(p.row, p.col, noiseP, simRng);
      aliceBit = outcome.aliceBits[p.col];
      bobBit = outcome.bobBits[p.row];
      match = outcome.win;
    }

    if (match) {
      totalMatches++;
    } else {
      totalLosses++;
      if (currentLives > 0) {
        currentLives--;
        if (currentLives === 0 && eliminationRound === null) {
          eliminationRound = p.round;
        }
      }
    }

    const isPostElimination = eliminationRound !== null && p.round > eliminationRound;

    rounds.push({
      round: p.round,
      row: p.row,
      col: p.col,
      aliceBit,
      bobBit,
      match,
      livesRemainingAfter: currentLives,
      isPostElimination
    });
  }

  const { expectedLosses, survivalProbability } = getClassicalTheoreticalStats(prompts.length, initialLives);

  return {
    seed: 0, // Assigned by caller if needed
    mode,
    initialLives,
    rounds,
    eliminationRound,
    totalMatches,
    totalLosses,
    survived: eliminationRound === null,
    theoreticalLosses: expectedLosses,
    theoreticalSurvivalRate: survivalProbability
  };
}
