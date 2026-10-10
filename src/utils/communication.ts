import { Bit } from './classicalStrategy';

export interface CommunicationStep {
  refereeRow: number; // 0, 1, 2
  refereeCol: number; // 0, 1, 2
  aliceRowMessage: number; // Alice transmits 'row' to Bob (classical message: 0, 1, or 2)
  crossingCellCol: number; // = refereeCol
  crossingCellRow: number; // = refereeRow
  aliceBits: [Bit, Bit, Bit];
  bobBits: [Bit, Bit, Bit];
  crossingMatch: boolean;
  aliceParityEven: boolean;
  bobParityOdd: boolean;
  win: boolean;
}

/**
 * In Communication Mode:
 * Alice receives row r in {0,1,2}. She outputs [a0, a1, a2] according to her policy (even parity).
 * Alice sends her row index r to Bob via classical signal (1 of 3 choices).
 * Bob receives col c and the message r from Alice.
 * Bob knows Alice's bit at the crossing cell is a_c.
 * Bob sets his bit at row r to b_r = a_c (guaranteeing agreement!).
 * Bob then chooses his other two bits to satisfy odd parity: b0 ^ b1 ^ b2 = 1.
 * Thus classical communication enables 9/9 = 100% win rate!
 */
export function evaluateCommunicationContext(
  row: number,
  col: number,
  aliceBaseRows?: Record<number, [Bit, Bit, Bit]>
): CommunicationStep {
  // Alice default fixed policy:
  const aRows: Record<number, [Bit, Bit, Bit]> = aliceBaseRows || {
    0: [0, 1, 1],
    1: [0, 0, 0],
    2: [0, 0, 0]
  };

  const aliceBits = aRows[row];
  const aliceSharedBit = aliceBits[col];

  // Bob receives Alice's message: 'I was dealt row r'.
  // Bob must set b[row] = aliceSharedBit.
  // The other two row indices for Bob:
  const otherRows = [0, 1, 2].filter(r => r !== row);
  const bBits: [Bit, Bit, Bit] = [0, 0, 0];
  bBits[row] = aliceSharedBit;

  // Bob picks free bit on otherRows[0] = 0, then derives otherRows[1] to enforce odd parity:
  // b0 ^ b1 ^ b2 = 1
  bBits[otherRows[0]] = 0;
  bBits[otherRows[1]] = (bBits[row] ^ bBits[otherRows[0]] ^ 1) as Bit;

  const aliceParityEven = (aliceBits[0] ^ aliceBits[1] ^ aliceBits[2]) === 0;
  const bobParityOdd = (bBits[0] ^ bBits[1] ^ bBits[2]) === 1;
  const crossingMatch = aliceBits[col] === bBits[row];

  return {
    refereeRow: row,
    refereeCol: col,
    aliceRowMessage: row,
    crossingCellCol: col,
    crossingCellRow: row,
    aliceBits,
    bobBits: bBits,
    crossingMatch,
    aliceParityEven,
    bobParityOdd,
    win: aliceParityEven && bobParityOdd && crossingMatch
  };
}
