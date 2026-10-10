import React, { useState } from 'react';
import { PlayCircle, ShieldAlert } from 'lucide-react';
import { audioEngine } from '../audio/synth';

export const ClassicalPuzzle: React.FC = () => {
  // 3x3 array for Alice, 3x3 for Bob
  const [aliceGrid, setAliceGrid] = useState<number[][]>([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]);

  const [bobGrid, setBobGrid] = useState<number[][]>([
    [0, 0, 0],
    [0, 0, 0],
    [1, 1, 1] // odd parity default
  ]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCell, setActiveCell] = useState<{r: number, c: number} | null>(null);

  const handleAliceToggle = (r: number, c: number) => {
    if (c === 2) return; // derived
    const newGrid = [...aliceGrid];
    newGrid[r] = [...newGrid[r]];
    newGrid[r][c] = newGrid[r][c] === 1 ? 0 : 1;
    newGrid[r][2] = (newGrid[r][0] ^ newGrid[r][1]) as number; // enforce even parity
    setAliceGrid(newGrid);
  };

  const handleBobToggle = (r: number, c: number) => {
    if (r === 2) return; // derived
    const newGrid = bobGrid.map(row => [...row]);
    newGrid[r][c] = newGrid[r][c] === 1 ? 0 : 1;
    // Enforce odd parity on columns
    for (let col = 0; col < 3; col++) {
      newGrid[2][col] = (newGrid[0][col] ^ newGrid[1][col] ^ 1) as number;
    }
    setBobGrid(newGrid);
  };

  const setBestKnown = () => {
    setAliceGrid([[0, 0, 0], [0, 0, 0], [0, 0, 0]]);
    setBobGrid([[0, 0, 1], [0, 0, 1], [1, 1, 1]]);
  };

  const playNineBeatLoop = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          setActiveCell({ r, c });
          
          const a_bits = aliceGrid[r] as [number, number, number];
          const b_bits = [bobGrid[0][c], bobGrid[1][c], bobGrid[2][c]] as [number, number, number];
          
          await audioEngine.playContextRound(
            r, c, a_bits, b_bits,
            () => { /* handle visuals if needed */ }
          );
          
          await new Promise(res => setTimeout(res, 300));
        }
      }
    } finally {
      setIsPlaying(false);
      setActiveCell(null);
    }
  };

  // Calculate score
  let matches = 0;
  for(let r=0; r<3; r++) {
    for(let c=0; c<3; c++) {
      if (aliceGrid[r][c] === bobGrid[r][c]) matches++;
    }
  }

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="text-center space-y-4">
        <h2 className="text-[32px] font-display font-bold">Act 1: Break It</h2>
        <p className="text-muted text-[16px] max-w-2xl mx-auto">
          Alice needs even parity rows. Bob needs odd parity columns. You can edit the independent bits; the last bit is derived automatically. Try to make the grids match perfectly.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 justify-center items-start w-full">
        {/* Alice Grid */}
        <div className="glass-card p-6 w-full max-w-[320px]">
          <h3 className="text-alice-text font-bold uppercase tracking-widest text-[12px] mb-4 text-center">Alice (Even Rows)</h3>
          <div className="grid grid-cols-3 gap-2">
            {aliceGrid.map((row, r) => row.map((bit, c) => (
              <button
                key={`a-${r}-${c}`}
                onClick={() => handleAliceToggle(r, c)}
                disabled={c === 2 || isPlaying}
                className={`h-16 rounded-[8px] font-mono text-[24px] font-bold transition-all
                  ${c === 2 ? 'bg-surface border border-hairline text-muted' : 'bg-alice/10 border border-alice/30 text-alice-text hover:bg-alice/20 cursor-pointer'}
                  ${activeCell?.r === r && activeCell?.c === c ? 'ring-2 ring-alice shadow-[0_0_15px_rgba(111,144,255,0.5)]' : ''}
                `}
              >
                {bit}
              </button>
            )))}
          </div>
        </div>

        {/* Status / Score */}
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="text-[48px] font-mono font-bold leading-none">
            {matches}<span className="text-[24px] text-muted">/9</span>
          </div>
          <button 
            onClick={playNineBeatLoop}
            disabled={isPlaying}
            className="flex items-center gap-2 px-6 py-3 bg-ink text-paper rounded-full font-bold hover:scale-105 transition-transform disabled:opacity-50"
          >
            <PlayCircle className="w-5 h-5"/>
            {isPlaying ? 'Playing...' : 'Test Strategy'}
          </button>
          
          <button onClick={setBestKnown} className="text-[12px] font-bold text-muted underline underline-offset-4 hover:text-ink transition-colors mt-4">
            Show best known strategy
          </button>
        </div>

        {/* Bob Grid */}
        <div className="glass-card p-6 w-full max-w-[320px]">
          <h3 className="text-bob-text font-bold uppercase tracking-widest text-[12px] mb-4 text-center">Bob (Odd Columns)</h3>
          <div className="grid grid-cols-3 gap-2">
            {bobGrid.map((row, r) => row.map((bit, c) => (
              <button
                key={`b-${r}-${c}`}
                onClick={() => handleBobToggle(r, c)}
                disabled={r === 2 || isPlaying}
                className={`h-16 rounded-[8px] font-mono text-[24px] font-bold transition-all
                  ${r === 2 ? 'bg-surface border border-hairline text-muted' : 'bg-bob/10 border border-bob/30 text-bob-text hover:bg-bob/20 cursor-pointer'}
                  ${activeCell?.r === r && activeCell?.c === c ? 'ring-2 ring-bob shadow-[0_0_15px_rgba(232,176,74,0.5)]' : ''}
                `}
              >
                {bit}
              </button>
            )))}
          </div>
        </div>
      </div>
      
      {matches < 9 && (
        <div className="glass-card p-4 flex gap-4 items-start max-w-2xl w-full bg-loss/5 border-loss/20 text-loss mt-8 animate-fade-in-up">
          <ShieldAlert className="w-6 h-6 flex-shrink-0" />
          <p className="text-[14px]">
            <strong>The Parity Contradiction:</strong> Alice's total number of 1s must be even (sum of 3 even rows). Bob's total number of 1s must be odd (sum of 3 odd columns). If they match perfectly on all 9 cells, they must have the same total number of 1s. This is mathematically impossible!
          </p>
        </div>
      )}
    </div>
  );
};
