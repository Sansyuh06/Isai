import React, { useState } from 'react';
import { PlayCircle, StopCircle, HelpCircle, ShieldAlert, Sparkles, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { audioEngine } from '../audio/synth';
import { 
  Bit, 
  NullableBitGrid, 
  BEST_KNOWN_ALICE, 
  BEST_KNOWN_BOB,
  deriveAliceRowBit, 
  deriveBobColBit, 
  areAllIndependentBitsSet, 
  evaluateGridsAgreement 
} from '../utils/classicalStrategy';
import { ClassicalCommunication } from './ClassicalCommunication';

interface Props {
  onStrategyUpdated?: (alice: NullableBitGrid, bob: NullableBitGrid) => void;
}

export const ClassicalPuzzle: React.FC<Props> = ({ onStrategyUpdated }) => {
  // Act 1 starts with 12 unfilled independent cells (null)
  const [aliceGrid, setAliceGrid] = useState<NullableBitGrid>([
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ]);

  const [bobGrid, setBobGrid] = useState<NullableBitGrid>([
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBeatIndex, setActiveBeatIndex] = useState<number>(-1);
  const [showProof, setShowProof] = useState(false);
  const [hasTestedOnce, setHasTestedOnce] = useState(false);

  // Helper: toggle independent bit for Alice (cols 0, 1) and auto-derive col 2 (even parity)
  const handleAliceToggle = (r: number, c: number) => {
    if (c === 2 || isPlaying) return;
    const next: NullableBitGrid = [
      [...aliceGrid[0]],
      [...aliceGrid[1]],
      [...aliceGrid[2]]
    ];
    next[r][c] = (next[r][c] === 1 ? 0 : 1) as Bit;
    // Auto-derive column 2
    next[r][2] = deriveAliceRowBit(next[r][0], next[r][1]);
    setAliceGrid(next);
    onStrategyUpdated?.(next, bobGrid);
  };

  // Helper: toggle independent bit for Bob (rows 0, 1) and auto-derive row 2 (odd parity)
  const handleBobToggle = (r: number, c: number) => {
    if (r === 2 || isPlaying) return;
    const next: NullableBitGrid = [
      [...bobGrid[0]],
      [...bobGrid[1]],
      [...bobGrid[2]]
    ];
    next[r][c] = (next[r][c] === 1 ? 0 : 1) as Bit;
    // Auto-derive row 2 for each column
    for (let col = 0; col < 3; col++) {
      next[2][col] = deriveBobColBit(next[0][col], next[1][col]);
    }
    setBobGrid(next);
    onStrategyUpdated?.(aliceGrid, next);
  };

  // Show best known 8/9 strategy
  const setBestKnown = () => {
    if (isPlaying) return;
    const newAlice: NullableBitGrid = [
      [...BEST_KNOWN_ALICE[0]],
      [...BEST_KNOWN_ALICE[1]],
      [...BEST_KNOWN_ALICE[2]]
    ];
    const newBob: NullableBitGrid = [
      [...BEST_KNOWN_BOB[0]],
      [...BEST_KNOWN_BOB[1]],
      [...BEST_KNOWN_BOB[2]]
    ];
    setAliceGrid(newAlice);
    setBobGrid(newBob);
    onStrategyUpdated?.(newAlice, newBob);
  };

  const handleClear = () => {
    if (isPlaying) return;
    const emptyAlice: NullableBitGrid = [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];
    const emptyBob: NullableBitGrid = [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];
    setAliceGrid(emptyAlice);
    setBobGrid(emptyBob);
    setShowProof(false);
    setHasTestedOnce(false);
    onStrategyUpdated?.(emptyAlice, emptyBob);
  };

  const allReady = areAllIndependentBitsSet(aliceGrid, bobGrid);
  const evaluation = evaluateGridsAgreement(aliceGrid, bobGrid);

  const handleStop = () => {
    audioEngine.stopAll();
    setIsPlaying(false);
    setActiveBeatIndex(-1);
  };

  const handlePlayLoop = async () => {
    if (isPlaying) {
      handleStop();
      return;
    }
    if (!allReady) return;

    setHasTestedOnce(true);
    const payload = evaluation.contexts.map(item => ({
      row: item.row,
      col: item.col,
      aliceSharedBit: item.aliceBit as number,
      bobSharedBit: item.bobBit as number
    }));

    setIsPlaying(true);
    await audioEngine.playNineBeatFastLoop(payload, (idx) => {
      setActiveBeatIndex(idx);
    });
    setIsPlaying(false);
    setActiveBeatIndex(-1);
  };

  return (
    <div className="flex flex-col items-center max-w-5xl mx-auto space-y-10 animate-fade-in-up">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-alice/10 text-alice-text border border-alice/20">
          Act 1: Classical Strategy Puzzle
        </div>
        <h2 className="text-[36px] font-display font-extrabold text-ink leading-tight">
          Break It: Try to Beat 8/9
        </h2>
        <p className="text-muted text-[16px] max-w-2xl mx-auto leading-relaxed">
          Alice must satisfy <strong>even parity</strong> on every row (0 mod 2). Bob must satisfy <strong>odd parity</strong> on every column (1 mod 2). 
          Set the 12 free independent bits; the third bit is derived automatically. Can you make all 9 cells match?
        </p>
      </div>

      {/* Main Puzzle Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-center w-full">
        {/* Alice's Grid */}
        <div className="glass-card p-6 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-alice-text">Alice's Grid</span>
            <span className="text-[11px] text-muted">Rows must be Even (0 mod 2)</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px]">
            {aliceGrid.map((row, r) => row.map((val, c) => {
              const isDerived = c === 2;
              const beatActive = activeBeatIndex !== -1 && evaluation.contexts[activeBeatIndex].row === r && evaluation.contexts[activeBeatIndex].col === c;

              return (
                <button
                  key={`alice-${r}-${c}`}
                  type="button"
                  disabled={isDerived || isPlaying}
                  onClick={() => handleAliceToggle(r, c)}
                  aria-label={`Alice row ${r+1} column ${c+1}: ${val !== null ? val : 'unassigned'}${isDerived ? ' (derived)' : ''}`}
                  className={`h-20 rounded-[10px] font-mono text-[26px] font-bold transition-all relative flex flex-col items-center justify-center
                    ${isDerived 
                      ? 'bg-surface/50 border border-hairline text-muted cursor-default' 
                      : val === null
                        ? 'bg-surface/40 border border-dashed border-hairline text-muted/60 hover:bg-alice/10 hover:border-alice/40 cursor-pointer'
                        : 'bg-alice/10 border border-alice/30 text-alice-text hover:bg-alice/20 hover:scale-[1.02] cursor-pointer'
                    }
                    ${beatActive ? 'ring-4 ring-alice shadow-[0_0_20px_rgba(111,144,255,0.6)] scale-105' : ''}
                    disabled:opacity-80
                  `}
                >
                  <span>{val !== null ? val : '—'}</span>
                  {isDerived && (
                    <span className="text-[9px] uppercase tracking-wider font-sans opacity-70 -mt-1 text-muted">
                      derived
                    </span>
                  )}
                </button>
              );
            }))}
          </div>
          <span className="text-[11px] text-muted mt-3">Col 3 is derived to guarantee even parity</span>
        </div>

        {/* Central Scoreboard & Controls */}
        <div className="flex flex-col items-center justify-center space-y-6 px-4">
          <div className="text-center">
            <span className="text-xs font-mono uppercase tracking-widest text-muted block mb-1">Agreement Score</span>
            <div className="font-mono text-[56px] font-extrabold leading-none tracking-tight">
              <span className={evaluation.matches === 8 ? 'text-win' : evaluation.matches === 9 ? 'text-win' : 'text-ink'}>
                {allReady ? evaluation.matches : '—'}
              </span>
              <span className="text-muted text-[28px]">/9</span>
            </div>
            <div className="text-[12px] font-mono text-muted mt-1">
              {!allReady ? (
                <span className="text-bob">Set all 12 free bits to test</span>
              ) : evaluation.matches === 8 ? (
                <span className="text-loss font-semibold">1 clash (88.9% optimal ceiling)</span>
              ) : (
                <span>{9 - evaluation.matches} clashes</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full min-w-[210px]">
            <button
              type="button"
              disabled={!allReady && !isPlaying}
              onClick={handlePlayLoop}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-[15px] transition-all shadow-lg
                ${isPlaying 
                  ? 'bg-loss text-white hover:bg-loss/90 animate-pulse' 
                  : !allReady
                    ? 'bg-surface border border-hairline text-muted cursor-not-allowed opacity-60'
                    : 'bg-ink text-paper hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                }
              `}
            >
              {isPlaying ? (
                <>
                  <StopCircle className="w-5 h-5" /> Stop Loop
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5" /> Test Strategy (9 Beats)
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isPlaying}
              onClick={setBestKnown}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-bold bg-surface border border-hairline text-ink hover:bg-surface/80 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-bob" /> Show best known 8/9 strategy
            </button>

            <button
              type="button"
              disabled={isPlaying}
              onClick={handleClear}
              className="inline-flex items-center justify-center gap-1.5 text-xs text-muted hover:text-ink transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Puzzle
            </button>
          </div>
        </div>

        {/* Bob's Grid */}
        <div className="glass-card p-6 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-bob-text">Bob's Grid</span>
            <span className="text-[11px] text-muted">Columns must be Odd (1 mod 2)</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px]">
            {bobGrid.map((row, r) => row.map((val, c) => {
              const isDerived = r === 2;
              const beatActive = activeBeatIndex !== -1 && evaluation.contexts[activeBeatIndex].row === r && evaluation.contexts[activeBeatIndex].col === c;

              return (
                <button
                  key={`bob-${r}-${c}`}
                  type="button"
                  disabled={isDerived || isPlaying}
                  onClick={() => handleBobToggle(r, c)}
                  aria-label={`Bob row ${r+1} column ${c+1}: ${val !== null ? val : 'unassigned'}${isDerived ? ' (derived)' : ''}`}
                  className={`h-20 rounded-[10px] font-mono text-[26px] font-bold transition-all relative flex flex-col items-center justify-center
                    ${isDerived 
                      ? 'bg-surface/50 border border-hairline text-muted cursor-default' 
                      : val === null
                        ? 'bg-surface/40 border border-dashed border-hairline text-muted/60 hover:bg-bob/10 hover:border-bob/40 cursor-pointer'
                        : 'bg-bob/10 border border-bob/30 text-bob-text hover:bg-bob/20 hover:scale-[1.02] cursor-pointer'
                    }
                    ${beatActive ? 'ring-4 ring-bob shadow-[0_0_20px_rgba(232,176,74,0.6)] scale-105' : ''}
                    disabled:opacity-80
                  `}
                >
                  <span>{val !== null ? val : '—'}</span>
                  {isDerived && (
                    <span className="text-[9px] uppercase tracking-wider font-sans opacity-70 -mt-1 text-muted">
                      derived
                    </span>
                  )}
                </button>
              );
            }))}
          </div>
          <span className="text-[11px] text-muted mt-3">Row 3 is derived to guarantee odd parity</span>
        </div>
      </div>

      {/* Visual 9-Context Crossing Scoreboard */}
      <div className="w-full glass-card p-5">
        <div className="flex items-center justify-between mb-3 text-xs font-mono text-muted uppercase tracking-wider">
          <span>Crossing-Cell Alignment (9 Contexts)</span>
          <span>{allReady ? `${evaluation.matches} Unisons · ${evaluation.mismatches} Clashes` : 'Fill all 12 free bits'}</span>
        </div>
        <div className="grid grid-cols-9 gap-2">
          {evaluation.contexts.map((ctx, idx) => {
            const isPlayingThis = activeBeatIndex === idx;
            return (
              <div
                key={`score-${ctx.row}-${ctx.col}`}
                className={`p-2.5 rounded-[8px] text-center border transition-all flex flex-col items-center gap-1
                  ${isPlayingThis ? 'ring-2 ring-ink scale-105 z-10' : ''}
                  ${ctx.isEvaluated
                    ? ctx.match
                      ? 'bg-win/10 border-win/30 text-win'
                      : 'bg-loss/10 border-loss/30 text-loss shadow-[0_0_12px_rgba(255,92,108,0.25)]'
                    : 'bg-surface border-hairline text-muted'
                  }
                `}
              >
                <span className="text-[10px] font-mono opacity-70">
                  R{ctx.row + 1}C{ctx.col + 1}
                </span>
                <span className="font-mono text-xs font-bold">
                  {ctx.isEvaluated ? (
                    ctx.match ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
                  ) : '—'}
                </span>
                <span className="text-[10px] font-mono">
                  {ctx.isEvaluated ? `${ctx.aliceBit}:${ctx.bobBit}` : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delayed Proof Disclosure */}
      <div className="w-full flex flex-col items-center">
        {!showProof ? (
          <button
            type="button"
            onClick={() => setShowProof(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-muted hover:text-ink border border-hairline bg-surface/40 hover:bg-surface transition-all"
          >
            <HelpCircle className="w-4 h-4 text-bob" /> 
            {hasTestedOnce ? "Why can't I get 9/9? Show Proof" : "Why can't I get 9/9?"}
          </button>
        ) : (
          <div className="glass-card p-6 border-loss/20 bg-loss/5 max-w-2xl w-full text-ink animate-fade-in-up space-y-4">
            <div className="flex items-center gap-2.5 text-loss font-bold text-sm uppercase tracking-wider font-mono">
              <ShieldAlert className="w-5 h-5" /> The Parity Contradiction Theorem
            </div>
            
            {/* Visual Sum Comparison */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-[10px] bg-surface border border-hairline text-center">
              <div>
                <span className="text-xs font-mono text-alice-text uppercase block mb-1">Alice's Total 1s</span>
                <span className="font-mono text-xl font-bold">Sum of 3 Even Rows</span>
                <span className="block font-mono text-sm text-win mt-1">Always EVEN (0 mod 2)</span>
              </div>
              <div>
                <span className="text-xs font-mono text-bob-text uppercase block mb-1">Bob's Total 1s</span>
                <span className="font-mono text-xl font-bold">Sum of 3 Odd Cols</span>
                <span className="block font-mono text-sm text-bob mt-1">Always ODD (1 mod 2)</span>
              </div>
            </div>

            <p className="text-[14px] leading-relaxed text-muted">
              If Alice and Bob matched on all 9 cells, the total count of 1s in Alice's grid would have to equal the total count of 1s in Bob's grid:
            </p>
            <div className="font-mono text-center text-sm p-3 bg-surface rounded-[8px] border border-loss/30 text-loss font-bold">
              Even = Odd &nbsp;⇒&nbsp; 0 ≡ 1 (mod 2) &nbsp;[IMPOSSIBLE]
            </div>
            <p className="text-xs text-muted">
              Because of this global parity contradiction, the best classical strategy is capped at <strong>8/9 (88.9%)</strong>. At least one clash is mathematically guaranteed.
            </p>
          </div>
        )}
      </div>

      {/* Classical Communication Comparison Section */}
      <div className="w-full pt-6 border-t border-hairline">
        <ClassicalCommunication />
      </div>
    </div>
  );
};
