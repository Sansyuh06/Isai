import React, { useState } from 'react';
import { PlayCircle, StopCircle, HelpCircle, ShieldAlert, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { audioEngine } from '../audio/synth';

export const ClassicalPuzzle: React.FC = () => {
  // Grids start empty (null) so the player can discover the puzzle organically
  const [aliceGrid, setAliceGrid] = useState<(number | null)[][]>([
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ]);

  const [bobGrid, setBobGrid] = useState<(number | null)[][]>([
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBeatIndex, setActiveBeatIndex] = useState<number>(-1);
  const [showProof, setShowProof] = useState(false);

  // Helper: toggle independent bit for Alice (cols 0, 1) and derive col 2 (even parity: sum % 2 === 0)
  const handleAliceToggle = (r: number, c: number) => {
    if (c === 2 || isPlaying) return;
    const next = aliceGrid.map(row => [...row]);
    next[r][c] = next[r][c] === 1 ? 0 : 1;
    // Derive col 2 if both 0 and 1 are chosen
    if (next[r][0] !== null && next[r][1] !== null) {
      next[r][2] = next[r][0]! ^ next[r][1]!;
    }
    setAliceGrid(next);
  };

  // Helper: toggle independent bit for Bob (rows 0, 1) and derive row 2 (odd parity: sum % 2 === 1)
  const handleBobToggle = (r: number, c: number) => {
    if (r === 2 || isPlaying) return;
    const next = bobGrid.map(row => [...row]);
    next[r][c] = next[r][c] === 1 ? 0 : 1;
    // Derive row 2 for each column if rows 0 and 1 are chosen
    for (let col = 0; col < 3; col++) {
      if (next[0][col] !== null && next[1][col] !== null) {
        next[2][col] = next[0][col]! ^ next[1][col]! ^ 1;
      }
    }
    setBobGrid(next);
  };

  // 8/9 Optimal Strategy (wins 8 contexts, loses strictly at (0,0) or (r=0, c=0))
  // Alice: Row 0: [0, 1, 1], Row 1: [0, 0, 0], Row 2: [0, 0, 0]
  // Bob:   Col 0: [1, 0, 0], Col 1: [1, 0, 0], Col 2: [1, 0, 0]
  // In matrix form:
  // Alice:
  // [0, 1, 1]
  // [0, 0, 0]
  // [0, 0, 0]
  // Bob (col 0: 1,0,0; col 1: 1,0,0; col 2: 1,0,0):
  // [1, 1, 1]
  // [0, 0, 0]
  // [0, 0, 0]
  const setBestKnown = () => {
    setAliceGrid([
      [0, 1, 1],
      [0, 0, 0],
      [0, 0, 0]
    ]);
    setBobGrid([
      [1, 1, 1],
      [0, 0, 0],
      [0, 0, 0]
    ]);
  };

  const handleClear = () => {
    setAliceGrid([
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ]);
    setBobGrid([
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ]);
    setShowProof(false);
  };

  // Score evaluation across all 9 crossing cells
  const contextsList: Array<{ row: number; col: number; aVal: number | null; bVal: number | null; match: boolean }> = [];
  let evaluatedCount = 0;
  let matchCount = 0;

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const aVal = aliceGrid[r][c];
      const bVal = bobGrid[r][c];
      const hasBoth = aVal !== null && bVal !== null;
      if (hasBoth) evaluatedCount++;
      const match = hasBoth && aVal === bVal;
      if (match) matchCount++;
      contextsList.push({ row: r, col: c, aVal, bVal, match });
    }
  }

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

    // Default unchosen cells to 0 for audio playback if partially filled
    const payload = contextsList.map(item => ({
      row: item.row,
      col: item.col,
      aliceSharedBit: item.aVal ?? 0,
      bobSharedBit: item.bVal ?? 0
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
          Choose the independent bits; the third bit is derived automatically. Can you make all 9 cells match?
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
              const beatActive = activeBeatIndex !== -1 && contextsList[activeBeatIndex].row === r && contextsList[activeBeatIndex].col === c;

              return (
                <button
                  key={`alice-${r}-${c}`}
                  type="button"
                  disabled={isDerived || isPlaying}
                  onClick={() => handleAliceToggle(r, c)}
                  className={`h-20 rounded-[10px] font-mono text-[26px] font-bold transition-all relative flex flex-col items-center justify-center
                    ${isDerived 
                      ? 'bg-surface/50 border border-hairline text-ink cursor-default' 
                      : 'bg-alice/10 border border-alice/30 text-alice-text hover:bg-alice/20 hover:scale-[1.02] cursor-pointer'
                    }
                    ${beatActive ? 'ring-4 ring-alice shadow-[0_0_20px_rgba(111,144,255,0.6)] scale-105' : ''}
                    disabled:opacity-80
                  `}
                >
                  <span>{val !== null ? val : '—'}</span>
                  {isDerived && (
                    <span className="text-[9px] uppercase tracking-wider font-sans opacity-60 -mt-1 text-muted">
                      derived
                    </span>
                  )}
                </button>
              );
            }))}
          </div>
        </div>

        {/* Central Scoreboard & Controls */}
        <div className="flex flex-col items-center justify-center space-y-6 px-4">
          <div className="text-center">
            <span className="text-xs font-mono uppercase tracking-widest text-muted block mb-1">Agreement Score</span>
            <div className="font-mono text-[56px] font-extrabold leading-none tracking-tight">
              <span className={matchCount === 8 ? 'text-win' : matchCount === 9 ? 'text-win' : 'text-ink'}>
                {evaluatedCount > 0 ? matchCount : 0}
              </span>
              <span className="text-muted text-[28px]">/9</span>
            </div>
            <div className="text-[12px] font-mono text-muted mt-1">
              {evaluatedCount === 9 && matchCount === 8 && (
                <span className="text-loss font-semibold">1 clash (88.9% optimal ceiling)</span>
              )}
              {evaluatedCount < 9 && (
                <span>{9 - evaluatedCount} cells unassigned</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full min-w-[200px]">
            <button
              type="button"
              onClick={handlePlayLoop}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-[15px] transition-all shadow-lg
                ${isPlaying 
                  ? 'bg-loss text-white hover:bg-loss/90 animate-pulse' 
                  : 'bg-ink text-paper hover:scale-105'
                }
              `}
            >
              {isPlaying ? (
                <>
                  <StopCircle className="w-5 h-5" /> Stop Loop
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5" /> Play 9-Beat Loop
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isPlaying}
              onClick={setBestKnown}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-bold bg-surface border border-hairline text-ink hover:bg-surface/80 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-bob" /> Best Known Strategy (8/9)
            </button>

            <button
              type="button"
              disabled={isPlaying}
              onClick={handleClear}
              className="text-xs text-muted hover:text-ink underline underline-offset-4 transition-colors"
            >
              Clear Puzzle
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
              const beatActive = activeBeatIndex !== -1 && contextsList[activeBeatIndex].row === r && contextsList[activeBeatIndex].col === c;

              return (
                <button
                  key={`bob-${r}-${c}`}
                  type="button"
                  disabled={isDerived || isPlaying}
                  onClick={() => handleBobToggle(r, c)}
                  className={`h-20 rounded-[10px] font-mono text-[26px] font-bold transition-all relative flex flex-col items-center justify-center
                    ${isDerived 
                      ? 'bg-surface/50 border border-hairline text-ink cursor-default' 
                      : 'bg-bob/10 border border-bob/30 text-bob-text hover:bg-bob/20 hover:scale-[1.02] cursor-pointer'
                    }
                    ${beatActive ? 'ring-4 ring-bob shadow-[0_0_20px_rgba(232,176,74,0.6)] scale-105' : ''}
                    disabled:opacity-80
                  `}
                >
                  <span>{val !== null ? val : '—'}</span>
                  {isDerived && (
                    <span className="text-[9px] uppercase tracking-wider font-sans opacity-60 -mt-1 text-muted">
                      derived
                    </span>
                  )}
                </button>
              );
            }))}
          </div>
        </div>
      </div>

      {/* Visual 9-Context Crossing Scoreboard */}
      <div className="w-full glass-card p-5">
        <div className="flex items-center justify-between mb-3 text-xs font-mono text-muted uppercase tracking-wider">
          <span>Crossing-Cell Alignment (9 Contexts)</span>
          <span>{matchCount} Unisons · {9 - matchCount} Clashes</span>
        </div>
        <div className="grid grid-cols-9 gap-2">
          {contextsList.map((ctx, idx) => {
            const isPlayingThis = activeBeatIndex === idx;
            return (
              <div
                key={`score-${ctx.row}-${ctx.col}`}
                className={`p-2.5 rounded-[8px] text-center border transition-all flex flex-col items-center gap-1
                  ${isPlayingThis ? 'ring-2 ring-ink scale-105 z-10' : ''}
                  ${ctx.aVal !== null && ctx.bVal !== null
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
                  {ctx.aVal !== null && ctx.bVal !== null ? (
                    ctx.match ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
                  ) : '—'}
                </span>
                <span className="text-[10px] font-mono">
                  {ctx.aVal !== null && ctx.bVal !== null ? `${ctx.aVal}:${ctx.bVal}` : ''}
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
            <HelpCircle className="w-4 h-4 text-bob" /> Why can’t I fix it? Show Proof
          </button>
        ) : (
          <div className="glass-card p-6 border-loss/20 bg-loss/5 max-w-2xl w-full text-ink animate-fade-in-up space-y-3">
            <div className="flex items-center gap-2.5 text-loss font-bold text-sm uppercase tracking-wider font-mono">
              <ShieldAlert className="w-5 h-5" /> The Parity Contradiction Theorem
            </div>
            <p className="text-[14px] leading-relaxed text-muted">
              Suppose Alice and Bob could agree on all 9 crossing cells using a classical deterministic table M_ij in {'{0, 1}'}:
            </p>
            <ul className="text-[13px] font-mono space-y-1.5 list-disc list-inside text-ink bg-surface/50 p-3.5 rounded-[8px] border border-hairline">
              <li>Alice requires each row to be even: sum_j M_ij = 0 (mod 2) =&gt; Total sum = 0 (mod 2).</li>
              <li>Bob requires each column to be odd: sum_i M_ij = 1 (mod 2) =&gt; Total sum = 1+1+1 = 1 (mod 2).</li>
              <li>Both sum the exact same 9 cells: 0 = 1 (mod 2), an absolute contradiction.</li>
            </ul>
            <p className="text-xs text-muted">
              Therefore, the classical ceiling is provably capped at <strong>8/9 (88.9%)</strong>. Exactly 1 clash is unavoidable under classical physics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
