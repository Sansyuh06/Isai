/**
 * Web Audio API synthesizer for The 8/9 Duet.
 *
 * Implements:
 * - Robust AudioContext initialization and async resume on user interaction
 * - Fixed playback synchronization ID sequence
 * - Master gain and mute controls
 * - Stereo panning (Alice left -0.7, Bob right +0.7) with mono fallback
 * - Warm harmonic synthesis with ADSR envelope
 * - Synchronized visual event callbacks
 */

import { getCellPitch } from './notes';

export interface VisualStepEvent {
  step: number; // 0, 1, 2, or 3 (3 = shared chord)
  aliceRow: number;
  aliceCol: number;
  bobRow: number;
  bobCol: number;
  aliceBit: number;
  bobBit: number;
  aliceFreq: number;
  bobFreq: number;
  isShared: boolean;
  isMatch: boolean;
}

export type StepCallback = (event: VisualStepEvent | null) => void;

class QuantumDuetAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: Array<{ osc: OscillatorNode; gain: GainNode }> = [];
  private volume: number = 0.8;
  private muted: boolean = false;
  private currentPlayId: number = 0;

  public async ensureContext(): Promise<AudioContext> {
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (err) {
        console.warn('AudioContext resume failed:', err);
      }
    }
    return this.ctx;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.02);
    }
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, 0.02);
    }
  }

  public stopAll(): void {
    this.currentPlayId++;
    for (const node of this.activeNodes) {
      try {
        node.gain.gain.cancelScheduledValues(0);
        node.gain.gain.setValueAtTime(0, 0);
        node.osc.stop();
        node.osc.disconnect();
      } catch {
        // Node may have already ended
      }
    }
    this.activeNodes = [];
  }

  /**
   * Synthesize a musical tone with stereo panning.
   */
  public async playTone(freq: number, pan: number, duration: number, when: number = 0): Promise<void> {
    const ctx = await this.ensureContext();
    const startTime = when > 0 ? when : ctx.currentTime;
    const stopTime = startTime + duration;

    // Soothing electric piano/marimba-like synthesis
    const osc1 = ctx.createOscillator(); // Fundamental
    const osc2 = ctx.createOscillator(); // First harmonic (octave)
    
    const osc1Gain = ctx.createGain();
    const osc2Gain = ctx.createGain();
    
    const filter = ctx.createBiquadFilter();
    const noteGain = ctx.createGain();

    // Waveforms: smooth sine fundamental, very subtle triangle for warmth
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, startTime); // Octave up

    // Mix the oscillators: mostly fundamental
    osc1Gain.gain.setValueAtTime(0.8, startTime);
    osc2Gain.gain.setValueAtTime(0.15, startTime);

    // Warm Lowpass Filter: sweeps down to mimic a plucked/struck string
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(0.5, startTime);
    filter.frequency.setValueAtTime(freq * 4, startTime); // Start bright
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + duration * 0.5); // Decay to warm

    // Envelope (ADSR) - Plucked, soothing contour
    const attack = 0.015;
    const decay = duration * 0.4;
    const sustainLevel = 0.3;
    const release = 0.4; // Soft lingering tail

    // Start silent, quick attack
    noteGain.gain.setValueAtTime(0.001, startTime);
    noteGain.gain.exponentialRampToValueAtTime(0.7, startTime + attack);
    
    // Smooth decay to sustain
    noteGain.gain.exponentialRampToValueAtTime(sustainLevel, startTime + attack + decay);
    
    // Release drops smoothly to 0 after stopTime
    const trueStopTime = stopTime;
    noteGain.gain.setValueAtTime(sustainLevel, trueStopTime);
    noteGain.gain.exponentialRampToValueAtTime(0.001, trueStopTime + release);

    // Stereo Panning
    let outputNode: AudioNode = noteGain;
    if (typeof ctx.createStereoPanner === 'function') {
      try {
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), startTime);
        noteGain.connect(panner);
        outputNode = panner;
      } catch {
        outputNode = noteGain;
      }
    }

    if (this.masterGain) {
      outputNode.connect(this.masterGain);
    } else {
      outputNode.connect(ctx.destination);
    }

    // Routing
    osc1.connect(osc1Gain);
    osc2.connect(osc2Gain);
    osc1Gain.connect(filter);
    osc2Gain.connect(filter);
    filter.connect(noteGain);

    osc1.start(startTime);
    osc2.start(startTime);
    
    // Stop oscillators after release finishes
    osc1.stop(trueStopTime + release);
    osc2.stop(trueStopTime + release);

    this.activeNodes.push({ osc: osc1, gain: noteGain });
    this.activeNodes.push({ osc: osc2, gain: noteGain });

    osc1.onended = () => {
      this.activeNodes = this.activeNodes.filter((n) => n.osc !== osc1 && n.osc !== osc2);
    };
  }

  /**
   * Replay a recorded sample context:
   * 1. Stops any ongoing sound.
   * 2. Resumes AudioContext.
   * 3. Plays Alice's phrase (left pan) and Bob's phrase (right pan) step-by-step.
   * 4. Plays the crossing cell unison harmony check.
   */
  public async playContextRound(
    row: number,
    col: number,
    aliceBits: [number, number, number],
    bobBits: [number, number, number],
    onStep?: StepCallback
  ): Promise<boolean> {
    // 1. Stop previous nodes first
    this.stopAll();

    // 2. Ensure AudioContext is ready and resumed
    await this.ensureContext();

    // 3. Increment playId AFTER stopAll so loop doesn't abort!
    const playId = ++this.currentPlayId;

    const noteDuration = 0.4;
    const stepInterval = 0.48;

    // Steps 0, 1, 2: Alice note and Bob note in sequence
    for (let step = 0; step < 3; step++) {
      if (this.currentPlayId !== playId) return false;

      const aCol = step;
      const bRow = step;
      const aBit = aliceBits[aCol];
      const bBit = bobBits[bRow];

      const aPitch = getCellPitch(row, aCol, aBit);
      const bPitch = getCellPitch(bRow, col, bBit);

      if (onStep) {
        onStep({
          step,
          aliceRow: row,
          aliceCol: aCol,
          bobRow: bRow,
          bobCol: col,
          aliceBit: aBit,
          bobBit: bBit,
          aliceFreq: aPitch.freq,
          bobFreq: bPitch.freq,
          isShared: aCol === col && bRow === row,
          isMatch: aCol === col && bRow === row ? aBit === bBit : false
        });
      }

      // Alice left (-0.7), Bob right (+0.7)
      this.playTone(aPitch.freq, -0.7, noteDuration);
      this.playTone(bPitch.freq, 0.7, noteDuration);

      await new Promise((r) => setTimeout(r, stepInterval * 1000));
    }

    if (this.currentPlayId !== playId) return false;

    // Step 3: Shared Cell Crossing Harmony Check!
    const crossingAliceBit = aliceBits[col];
    const crossingBobBit = bobBits[row];
    const crossingAlicePitch = getCellPitch(row, col, crossingAliceBit);
    const crossingBobPitch = getCellPitch(row, col, crossingBobBit);
    const isMatch = crossingAliceBit === crossingBobBit;

    if (onStep) {
      onStep({
        step: 3,
        aliceRow: row,
        aliceCol: col,
        bobRow: row,
        bobCol: col,
        aliceBit: crossingAliceBit,
        bobBit: crossingBobBit,
        aliceFreq: crossingAlicePitch.freq,
        bobFreq: crossingBobPitch.freq,
        isShared: true,
        isMatch
      });
    }

    // Matching bits sound in unison; different bits sound as adjacent semitones
    this.playTone(crossingAlicePitch.freq, -0.7, 0.75);
    this.playTone(crossingBobPitch.freq, 0.7, 0.75);

    await new Promise((r) => setTimeout(r, 850));

    if (this.currentPlayId === playId && onStep) {
      onStep(null);
    }
    return true;
  }
}

export const audioEngine = new QuantumDuetAudioEngine();
