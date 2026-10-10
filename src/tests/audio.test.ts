import { describe, it, expect } from 'vitest';
import { BASE_MIDI_PITCHES, getCellPitch, midiToFreq } from '../audio/notes';

describe('Acoustic Bit-to-Pitch Mapping', () => {
  it('conforms to the exact specified base MIDI pitches', () => {
    // row 1: 60, 62, 64
    expect(BASE_MIDI_PITCHES[0]).toEqual([60, 62, 64]);
    // row 2: 67, 69, 71
    expect(BASE_MIDI_PITCHES[1]).toEqual([67, 69, 71]);
    // row 3: 72, 74, 76
    expect(BASE_MIDI_PITCHES[2]).toEqual([72, 74, 76]);
  });

  it('maps bit 0 to base pitch and bit 1 to base pitch + 1 semitone', () => {
    // Cell (0, 0): base 60
    const bit0 = getCellPitch(0, 0, 0);
    expect(bit0.midi).toBe(60);
    expect(bit0.noteName).toBe('C4');

    const bit1 = getCellPitch(0, 0, 1);
    expect(bit1.midi).toBe(61);
    expect(bit1.noteName).toBe('C#4');

    // Cell (2, 2): base 76
    const bit0_22 = getCellPitch(2, 2, 0);
    expect(bit0_22.midi).toBe(76);
    expect(bit0_22.noteName).toBe('E5');

    const bit1_22 = getCellPitch(2, 2, 1);
    expect(bit1_22.midi).toBe(77);
    expect(bit1_22.noteName).toBe('F5');
  });

  it('calculates accurate frequencies in Hertz', () => {
    // MIDI 69 = A4 = 440 Hz exactly
    expect(midiToFreq(69)).toBeCloseTo(440, 2);
    // MIDI 60 = C4 = ~261.63 Hz
    expect(midiToFreq(60)).toBeCloseTo(261.63, 1);
  });
});
