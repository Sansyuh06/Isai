import { RoundEvaluation } from '../types/data';

/**
 * Evaluate a single round of the Mermin-Peres game.
 *
 * Alice: 3 bits [a0, a1, a2], parity must be even: a0 ^ a1 ^ a2 === 0
 * Bob: 3 bits [b0, b1, b2], parity must be odd: b0 ^ b1 ^ b2 === 1
 * Shared cell: Alice bit at column c must equal Bob bit at row r: a_c === b_r
 */
export function evaluateRound(
  row: number,
  col: number,
  aliceBits: [number, number, number],
  bobBits: [number, number, number]
): RoundEvaluation {
  const aliceParityEven = (aliceBits[0] ^ aliceBits[1] ^ aliceBits[2]) === 0;
  const bobParityOdd = (bobBits[0] ^ bobBits[1] ^ bobBits[2]) === 1;
  const aliceSharedBit = aliceBits[col];
  const bobSharedBit = bobBits[row];
  const sharedMatch = aliceSharedBit === bobSharedBit;
  const win = aliceParityEven && bobParityOdd && sharedMatch;

  return {
    aliceParityEven,
    bobParityOdd,
    sharedMatch,
    aliceSharedBit,
    bobSharedBit,
    win
  };
}

/**
 * Wilson score interval calculation for binomial proportions.
 */
export function calculateWilsonCI(wins: number, total: number): [number, number] {
  if (total <= 0) return [0, 0];
  const z = 1.959963984540054; // 95%
  const pHat = wins / total;
  const z2 = z * z;
  const denom = 1 + z2 / total;
  const center = (pHat + z2 / (2 * total)) / denom;
  const spread = (z * Math.sqrt((pHat * (1 - pHat) + z2 / (4 * total)) / total)) / denom;
  return [
    Math.max(0, Math.round((center - spread) * 1000) / 1000),
    Math.min(1, Math.round((center + spread) * 1000) / 1000)
  ];
}
