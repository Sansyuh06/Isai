/**
 * Web Audio API synthesizer for The 8/9 Duet.
 *
 * Implements:
 * - Lazy AudioContext creation on user gesture
 * - Master gain and mute control
 * - Stereo panning (Alice left -0.7, Bob right +0.7)
 * - ADSR envelope with warm harmonic timbre
 * - Visual step synchronization callbacks
 * - Cancellation / Stop support
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
  private volume: number = 0.7;
  private muted: boolean = false;
  private currentPlayId: number = 0;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.03);
    }
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, 0.03);
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
   * Synthesize a warm musical tone with stereo panning.
   */
  public playTone(freq: number, pan: number, duration: number, when: number = 0): void {
    const ctx = this.initContext();
    const startTime = when > 0 ? when : ctx.currentTime;
    const stopTime = startTime + duration;

    // Dual oscillator: fundamental sine + soft triangle overtone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq, startTime);

    // ADSR Envelope
    const attack = 0.03;
    const decay = duration * 0.4;
    const sustainLevel = 0.4;
    const release = 0.08;

    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.exponentialRampToValueAtTime(0.5, startTime + attack);
    noteGain.gain.exponentialRampToValueAtTime(sustainLevel * 0.5, startTime + attack + decay);
    noteGain.gain.setValueAtTime(sustainLevel * 0.5, stopTime - release);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, stopTime);

    // Stereo Panning
    let pannerNode: AudioNode = noteGain;
    if (typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), startTime);
      noteGain.connect(panner);
      pannerNode = panner;
    }

    if (this.masterGain) {
      pannerNode.connect(this.masterGain);
    }

    osc1.connect(noteGain);
    osc2.connect(noteGain);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(stopTime);
    osc2.stop(stopTime);

    this.activeNodes.push({ osc: osc1, gain: noteGain });
    this.activeNodes.push({ osc: osc2, gain: noteGain });

    osc1.onended = () => {
      this.activeNodes = this.activeNodes.filter((n) => n.osc !== osc1 && n.osc !== osc2);
    };
  }

  /**
   * Replay a recorded sample context:
   * Plays Alice's 3-note phrase (panned left) and Bob's 3-note phrase (panned right),
   * followed by the shared crossing cell harmony check.
   */
  public async playContextRound(
    row: number,
    col: number,
    aliceBits: [number, number, number],
    bobBits: [number, number, number],
    onStep?: StepCallback
  ): Promise<boolean> {
    const playId = ++this.currentPlayId;
    this.stopAll();
    this.initContext();

    const noteDuration = 0.38;
    const stepInterval = 0.45;

    // Step 0, 1, 2: play Alice cell (row, step) and Bob cell (step, col)
    for (let step = 0; step < 3; step++) {
      if (this.currentPlayId !== playId) return false;

      const aCol = step;
      const bRow = step;
      const aBit = aliceBits[aCol];
      const bBit = bobBits[bRow];

      const aPitch = getCellPitch(row, aCol, aBit);
      const bPitch = getCellPitch(bRow, col, bBit);

      // Trigger visual step event
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

      // Play Alice note panned left (-0.7)
      this.playTone(aPitch.freq, -0.7, noteDuration);
      // Play Bob note panned right (+0.7)
      this.playTone(bPitch.freq, 0.7, noteDuration);

      await new Promise((r) => setTimeout(r, stepInterval * 1000));
    }

    if (this.currentPlayId !== playId) return false;

    // Step 3: Shared Cell Crossing Harmony Check!
    // Both Alice (left) and Bob (right) play their recorded bits for the crossing cell (row, col)
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

    // Matching bits sound in unison! Different bits sound as adjacent semitones.
    this.playTone(crossingAlicePitch.freq, -0.7, 0.65);
    this.playTone(crossingBobPitch.freq, 0.7, 0.65);

    await new Promise((r) => setTimeout(r, 750));

    if (this.currentPlayId === playId && onStep) {
      onStep(null);
    }
    return true;
  }
}

export const audioEngine = new QuantumDuetAudioEngine();
