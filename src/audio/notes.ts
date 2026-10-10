/**
 * Note and pitch definitions for The 8/9 Duet.
 *
 * Base MIDI pitches:
 *   row 1: 60, 62, 64 (C4, D4, E4)
 *   row 2: 67, 69, 71 (G4, A4, B4)
 *   row 3: 72, 74, 76 (C5, D5, E5)
 *
 * Cell pitch mapping:
 *   bit 0: base pitch
 *   bit 1: base pitch + 1 semitone
 */

export const BASE_MIDI_PITCHES: number[][] = [
  [60, 62, 64], // Row 0 (row 1)
  [67, 69, 71], // Row 1 (row 2)
  [72, 74, 76]  // Row 2 (row 3)
];

export const NOTE_NAMES: string[][] = [
  ['C4', 'D4', 'E4'],
  ['G4', 'A4', 'B4'],
  ['C5', 'D5', 'E5']
];

export const SHARP_NOTE_NAMES: string[][] = [
  ['C#4', 'D#4', 'F4'],
  ['G#4', 'A#4', 'C5'],
  ['C#5', 'D#5', 'F5']
];

/**
 * Convert MIDI pitch to frequency in Hertz.
 */
export function midiToFreq(midiPitch: number): number {
  return 440 * Math.pow(2, (midiPitch - 69) / 12);
}

/**
 * Get pitch and frequency for a cell (r, c) given bit (0 or 1).
 */
export function getCellPitch(row: number, col: number, bit: number): {
  midi: number;
  freq: number;
  noteName: string;
} {
  const baseMidi = BASE_MIDI_PITCHES[row][col];
  const midi = bit === 1 ? baseMidi + 1 : baseMidi;
  const freq = midiToFreq(midi);
  const noteName = bit === 1 ? SHARP_NOTE_NAMES[row][col] : NOTE_NAMES[row][col];
  return { midi, freq, noteName };
}
