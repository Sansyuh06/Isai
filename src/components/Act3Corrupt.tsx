import React, { useState } from 'react';
import { PlayCircle, StopCircle, AlertTriangle } from 'lucide-react';
import { MagicGrid } from './MagicGrid';
import { NoiseCrossoverChart } from './NoiseCrossoverChart';
import { runMagicSquareSimulation } from '../utils/simulator';
import { audioEngine } from '../audio/synth';
import { MerminPeresDataset } from '../types/data';
import { calculateWilsonCI } from '../utils/scoring';

interface Props {
  ibmDataset?: MerminPeresDataset | null;
}

export const Act3Corrupt: React.FC<Props> = ({ ibmDataset }) => {
  const [noiseLevel, setNoiseLevel] = useState<number>(0.03); // 3% default
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedCol, setSelectedCol] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [useHardware, setUseHardware] = useState(false);

  // Cumulative results across all 9 contexts
  const [contextResults, setContextResults] = useState<Record<string, {
    wins: number;
    total: number;
    sampleAliceBits: [number, number, number];
    sampleBobBits: [number, number, number];
    lastWin: boolean;
  }>>({});

  const sampleSingleContext = (r: number, c: number, p: number) => {
    if (useHardware && ibmDataset) {
      const ctx = ibmDataset.contexts.find(x => x.row === r && x.column === c);
      if (ctx && ctx.counts.length > 0) {
        const total = ctx.shots;
        let rand = Math.random() * total;
        let selected = ctx.counts[0];
        for (const item of ctx.counts) {
          rand -= item.count;
          if (rand <= 0) {
            selected = item;
            break;
          }
        }
        const aBits = selected.alice_bits as [number, number, number];
        const bBits = selected.bob_bits as [number, number, number];
        return {
          aliceBits: aBits,
          bobBits: bBits,
          win: aBits[c] === bBits[r]
        };
      }
    }
    return runMagicSquareSimulation(r, c, p);
  };

  const runSingle = async (r: number, c: number) => {
    if (isPlaying) return;
    setSelectedRow(r);
    setSelectedCol(c);

    // Run batch of shots (e.g. 50 shots per single click)
    const shotsToRun = 50;
    let winsInBatch = 0;
    let lastOutcome = sampleSingleContext(r, c, noiseLevel);

    for (let i = 0; i < shotsToRun; i++) {
      const outcome = sampleSingleContext(r, c, noiseLevel);
      if (outcome.win) winsInBatch++;
      lastOutcome = outcome;
    }

    setContextResults(prev => {
      const existing = prev[`${r}_${c}`] || { wins: 0, total: 0, sampleAliceBits: lastOutcome.aliceBits, sampleBobBits: lastOutcome.bobBits, lastWin: lastOutcome.win };
      return {
        ...prev,
        [`${r}_${c}`]: {
          wins: existing.wins + winsInBatch,
          total: existing.total + shotsToRun,
          sampleAliceBits: lastOutcome.aliceBits,
          sampleBobBits: lastOutcome.bobBits,
          lastWin: lastOutcome.win
        }
      };
    });

    // Play representative audio chord
    await audioEngine.playNineBeatFastLoop([{
      row: r,
      col: c,
      aliceSharedBit: lastOutcome.aliceBits[c],
      bobSharedBit: lastOutcome.bobBits[r]
    }]);
  };

  const handleStop = () => {
    audioEngine.stopAll();
    setIsPlaying(false);
  };

  const playNineBeatLoop = async () => {
    if (isPlaying) {
      handleStop();
      return;
    }

    setIsPlaying(true);
    const shotsPerCtx = 20;
    const newResults: Record<string, {
      wins: number;
      total: number;
      sampleAliceBits: [number, number, number];
      sampleBobBits: [number, number, number];
      lastWin: boolean;
    }> = {};

    const audioPayload: Array<{
      row: number;
      col: number;
      aliceSharedBit: number;
      bobSharedBit: number;
    }> = [];

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        let winsInBatch = 0;
        let lastOutcome = sampleSingleContext(r, c, noiseLevel);
        for (let s = 0; s < shotsPerCtx; s++) {
          const outcome = sampleSingleContext(r, c, noiseLevel);
          if (outcome.win) winsInBatch++;
          lastOutcome = outcome;
        }

        newResults[`${r}_${c}`] = {
          wins: winsInBatch,
          total: shotsPerCtx,
          sampleAliceBits: lastOutcome.aliceBits,
          sampleBobBits: lastOutcome.bobBits,
          lastWin: lastOutcome.win
        };

        audioPayload.push({
          row: r,
          col: c,
          aliceSharedBit: lastOutcome.aliceBits[c],
          bobSharedBit: lastOutcome.bobBits[r]
        });
      }
    }

    setContextResults(newResults);

    await audioEngine.playNineBeatFastLoop(audioPayload, (idx) => {
      if (idx >= 0 && idx < audioPayload.length) {
        setSelectedRow(audioPayload[idx].row);
        setSelectedCol(audioPayload[idx].col);
      }
    });

    setIsPlaying(false);
  };

  // Aggregated metrics
  let totalWins = 0;
  let totalShots = 0;
  Object.values(contextResults).forEach(res => {
    totalWins += res.wins;
    totalShots += res.total;
  });

  const aggregateWinRate = totalShots > 0 ? (totalWins / totalShots) : null;
  const wilsonInterval = totalShots > 0 ? calculateWilsonCI(totalWins, totalShots) : [0, 0];
  const activeCtxResult = contextResults[`${selectedRow}_${selectedCol}`];

  return (
    <div className="flex flex-col items-center max-w-[1100px] mx-auto space-y-10 animate-fade-in-up">
      <div className="text-center space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-loss/10 text-loss border border-loss/20">
          Act 3: Noise & Realistic Verification
        </div>
        <h2 className="text-[36px] font-display font-extrabold text-ink leading-tight">
          Corrupt It: The Fragility of Entanglement
        </h2>
        <p className="text-muted text-[16px] leading-relaxed">
          Stochastic Pauli depolarizing noise (with Pauli X, Y, Z inserted with probability p/3 after each gate) models state decoherence. 
          Notice how fidelity degrades and acoustic unisons fracture into random dissonant semitone clashes.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full items-start">
        {/* Left: MagicGrid and Loop Button */}
        <div className="flex-1 w-full flex flex-col items-center space-y-6">
          <MagicGrid
            selectedRow={selectedRow}
            selectedCol={selectedCol}
            onSelectContext={(r, c) => runSingle(r, c)}
            activeStepEvent={null}
            aliceBits={activeCtxResult?.sampleAliceBits}
            bobBits={activeCtxResult?.sampleBobBits}
          />
          
          {/* Playback Controls Strip: Play one, Next Context, Play all, Stop */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              disabled={isPlaying}
              onClick={() => runSingle(selectedRow, selectedCol)}
              className="px-5 py-2.5 rounded-full font-bold text-xs bg-surface border border-hairline text-ink hover:bg-surface/80 transition-all disabled:opacity-50"
            >
              Play One (R{selectedRow + 1}C{selectedCol + 1})
            </button>

            <button
              type="button"
              disabled={isPlaying}
              onClick={() => {
                const nextIdx = (selectedRow * 3 + selectedCol + 1) % 9;
                const nextR = Math.floor(nextIdx / 3);
                const nextC = nextIdx % 3;
                runSingle(nextR, nextC);
              }}
              className="px-5 py-2.5 rounded-full font-bold text-xs bg-surface border border-hairline text-ink hover:bg-surface/80 transition-all disabled:opacity-50"
            >
              Next Context
            </button>

            <button 
              type="button"
              onClick={playNineBeatLoop}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs transition-all shadow-md
                ${isPlaying 
                  ? 'bg-loss text-white hover:bg-loss/90 animate-pulse' 
                  : 'bg-ink text-paper hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                }
              `}
            >
              {isPlaying ? (
                <>
                  <StopCircle className="w-4 h-4"/> Stop Playback
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4"/> Play All (Noisy Loop)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Noise Configuration & Statistical Scope */}
        <div className="w-full lg:w-[420px] space-y-6">
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="text-xs font-mono font-bold tracking-wider text-muted uppercase">
                Noise Model Parameters
              </h3>
              <span className="text-xs font-mono font-bold text-bob bg-bob/10 px-2 py-0.5 rounded border border-bob/20">
                {useHardware ? 'Recorded IBM QPU' : 'Stochastic Depolarizing'}
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span>Gate Error Probability (p)</span>
                <span className="text-bob font-bold text-sm">{noiseLevel.toFixed(3)}</span>
              </div>
              <input 
                type="range" 
                min="0" max="0.15" step="0.005" 
                value={noiseLevel} 
                disabled={isPlaying || useHardware}
                onChange={(e) => {
                  setNoiseLevel(parseFloat(e.target.value));
                  setUseHardware(false);
                }}
                className="w-full accent-bob"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted">
                <span>0.000 (Ideal 100%)</span>
                <span>~0.02–0.04 (Model Crossover)</span>
                <span>0.150 (Heavy Noise)</span>
              </div>
            </div>

            {/* Note on crossover */}
            <div className="p-3 bg-surface rounded-[8px] border border-hairline text-[11px] leading-relaxed text-muted">
              <strong>Noise Model Specifics:</strong> Error probability p represents the per-gate depolarizing channel probability for this circuit topology. 
              The threshold where win rate drops below 8/9 is model-specific (~0.02 to 0.04 depending on gate noise application) and not a universal physical constant.
            </div>

            {/* Optional Hardware Toggle */}
            {ibmDataset ? (
              <div className="pt-2 border-t border-hairline">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={useHardware} 
                    disabled={isPlaying}
                    onChange={(e) => setUseHardware(e.target.checked)}
                    className="w-4 h-4 accent-win"
                  />
                  <span className="text-xs font-bold text-ink">Replay Recorded IBM Run ({ibmDataset.backend_name})</span>
                </label>
              </div>
            ) : (
              <div className="pt-2 border-t border-hairline text-[11px] text-muted flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-bob" />
                <span>No recorded IBM QPU dataset loaded. Replaying pure simulation.</span>
              </div>
            )}

            {/* Cumulative Statistics Scoreboard */}
            <div className="space-y-3 pt-2 border-t border-hairline">
              <div className="flex items-center justify-between text-xs font-mono text-muted uppercase">
                <span>Aggregated Win Rate</span>
                <span>{totalShots} Total Shots</span>
              </div>

              <div className="p-4 bg-surface rounded-[10px] border border-hairline flex items-center justify-between">
                <div>
                  <span className="font-mono text-[32px] font-bold leading-none text-ink">
                    {aggregateWinRate !== null ? `${(aggregateWinRate * 100).toFixed(1)}%` : '—'}
                  </span>
                  <div className="text-[11px] font-mono text-muted mt-1">
                    {totalWins} / {totalShots} matches
                  </div>
                </div>

                {totalShots > 0 && (
                  <div className="text-right font-mono text-xs text-muted">
                    <span className="block font-bold text-ink">95% Wilson CI</span>
                    <span>[{(wilsonInterval[0] * 100).toFixed(1)}%, {(wilsonInterval[1] * 100).toFixed(1)}%]</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Crossover Analysis Chart */}
      <div className="w-full">
        <NoiseCrossoverChart />
      </div>
    </div>
  );
};
