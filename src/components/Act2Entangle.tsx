import React, { useState } from 'react';
import { PlayCircle, StopCircle, ShieldCheck, RotateCcw } from 'lucide-react';
import { MagicGrid } from './MagicGrid';
import { ActiveCircuit } from './ActiveCircuit';
import { runMagicSquareSimulation } from '../utils/simulator';
import { audioEngine } from '../audio/synth';

export const Act2Entangle: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedCol, setSelectedCol] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastResult, setLastResult] = useState<{ aliceBits: [number, number, number]; bobBits: [number, number, number]; win: boolean } | null>(null);

  // Cumulative tracking of all 9 contexts
  const [cumulativeContexts, setCumulativeContexts] = useState<Record<string, {
    aliceBits: [number, number, number];
    bobBits: [number, number, number];
    win: boolean;
  }>>({});

  const runSingle = async (r: number, c: number) => {
    if (isPlaying) return;
    setSelectedRow(r);
    setSelectedCol(c);
    const result = runMagicSquareSimulation(r, c, 0);
    setLastResult(result);

    setCumulativeContexts(prev => ({
      ...prev,
      [`${r}_${c}`]: result
    }));

    // Play quick single chord for that cell
    await audioEngine.playNineBeatFastLoop([{
      row: r,
      col: c,
      aliceSharedBit: result.aliceBits[c],
      bobSharedBit: result.bobBits[r]
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
    const newCumulative: Record<string, {
      aliceBits: [number, number, number];
      bobBits: [number, number, number];
      win: boolean;
    }> = {};

    const payload: Array<{
      row: number;
      col: number;
      aliceSharedBit: number;
      bobSharedBit: number;
    }> = [];

    // Pre-simulate or simulate on the fly for each context
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const res = runMagicSquareSimulation(r, c, 0);
        newCumulative[`${r}_${c}`] = res;
        payload.push({
          row: r,
          col: c,
          aliceSharedBit: res.aliceBits[c],
          bobSharedBit: res.bobBits[r]
        });
      }
    }

    setCumulativeContexts(newCumulative);

    await audioEngine.playNineBeatFastLoop(payload, (idx) => {
      if (idx >= 0 && idx < payload.length) {
        setSelectedRow(payload[idx].row);
        setSelectedCol(payload[idx].col);
        const current = newCumulative[`${payload[idx].row}_${payload[idx].col}`];
        setLastResult(current);
      }
    });

    setIsPlaying(false);
  };

  const handleResetCumulative = () => {
    setCumulativeContexts({});
    setLastResult(null);
  };

  const cumulativeKeys = Object.keys(cumulativeContexts);
  const totalRecorded = cumulativeKeys.length;
  const totalWins = Object.values(cumulativeContexts).filter(x => x.win).length;

  return (
    <div className="flex flex-col items-center max-w-[1100px] mx-auto space-y-10 animate-fade-in-up">
      <div className="text-center space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-win/10 text-win border border-win/20">
          Act 2: Quantum Pseudo-Telepathy
        </div>
        <h2 className="text-[36px] font-display font-extrabold text-ink leading-tight">
          Entangle It: The Perfect 9/9 Strategy
        </h2>
        <p className="text-muted text-[16px] leading-relaxed">
          Running an <strong>in-browser ideal 4-qubit statevector simulation</strong>. 
          Alice and Bob measure their halves of two entangled Bell pairs locally. Hear the 9-beat loop resonate in <strong>pure unison chords</strong> with zero clashes.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full items-start">
        {/* Left: Magic Grid & Loop Trigger */}
        <div className="flex-1 w-full flex flex-col items-center space-y-6">
          <MagicGrid
            selectedRow={selectedRow}
            selectedCol={selectedCol}
            onSelectContext={(r, c) => runSingle(r, c)}
            activeStepEvent={null}
            aliceBits={lastResult?.aliceBits}
            bobBits={lastResult?.bobBits}
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
                  : 'bg-win text-paper hover:scale-105 shadow-[0_0_20px_rgba(91,227,168,0.25)]'
                }
              `}
            >
              {isPlaying ? (
                <>
                  <StopCircle className="w-4 h-4"/> Stop Playback
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4"/> Play All (9/9 Loop)
                </>
              )}
            </button>

            {totalRecorded > 0 && (
              <button
                type="button"
                onClick={handleResetCumulative}
                disabled={isPlaying}
                className="p-2.5 rounded-full bg-surface border border-hairline text-muted hover:text-ink transition-colors disabled:opacity-40"
                title="Reset Recorded Contexts"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Cumulative Scoreboard & Circuit */}
        <div className="w-full lg:w-[420px] space-y-6">
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="text-xs font-mono font-bold tracking-wider text-muted uppercase">
                Cumulative Verification
              </h3>
              <span className="text-xs font-mono font-bold text-win bg-win/10 px-2 py-0.5 rounded border border-win/20">
                Ideal Statevector
              </span>
            </div>

            {/* Scoreboard */}
            <div className="flex items-center justify-between p-4 bg-surface rounded-[10px] border border-hairline">
              <div>
                <span className="text-xs text-muted block">Score So Far</span>
                <span className="font-mono text-[32px] font-bold text-win leading-none">
                  {totalWins} / {totalRecorded}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted block">Win Rate</span>
                <span className="font-mono text-[24px] font-bold text-ink leading-none">
                  {totalRecorded > 0 ? `${((totalWins / totalRecorded) * 100).toFixed(1)}%` : '—'}
                </span>
              </div>
            </div>

            {/* 9-cell cumulative grid tracker */}
            <div>
              <div className="text-[11px] font-mono text-muted uppercase tracking-wider mb-2">
                Context Progress (All 9)
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map(r => (
                  [0, 1, 2].map(c => {
                    const res = cumulativeContexts[`${r}_${c}`];
                    const isSelected = selectedRow === r && selectedCol === c;

                    return (
                      <div
                        key={`cumul-${r}-${c}`}
                        className={`p-2 rounded-[6px] text-center border font-mono text-xs transition-all
                          ${isSelected ? 'ring-2 ring-ink' : ''}
                          ${res 
                            ? res.win 
                              ? 'bg-win/10 border-win/30 text-win' 
                              : 'bg-loss/10 border-loss/30 text-loss'
                            : 'bg-surface/50 border-hairline text-muted'
                          }
                        `}
                      >
                        <div className="text-[10px] opacity-70">R{r+1}C{c+1}</div>
                        <div className="font-bold">{res ? (res.win ? 'WIN' : 'FAIL') : '·'}</div>
                      </div>
                    );
                  })
                ))}
              </div>
            </div>

            {lastResult && (
              <div className="p-3.5 rounded-[8px] bg-win/10 border border-win/30 text-win text-xs space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4"/> R{selectedRow+1}C{selectedCol+1} MATCH</span>
                  <span>Pure Unison</span>
                </div>
                <div className="font-mono flex justify-between text-[11px] opacity-80 pt-1 border-t border-win/20">
                  <span>Alice: [{lastResult.aliceBits.join(', ')}]</span>
                  <span>Bob: [{lastResult.bobBits.join(', ')}]</span>
                </div>
              </div>
            )}
          </div>
          
          <ActiveCircuit row={selectedRow} col={selectedCol} />
        </div>
      </div>
    </div>
  );
};
