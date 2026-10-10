import React, { useState } from 'react';
import { PlayCircle, ShieldCheck } from 'lucide-react';
import { MagicGrid } from './MagicGrid';
import { ActiveCircuit } from './ActiveCircuit';
import { runMagicSquareSimulation } from '../utils/simulator';
import { audioEngine, VisualStepEvent } from '../audio/synth';

export const Act2Entangle: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedCol, setSelectedCol] = useState(0);
  const [activeStepEvent, setActiveStepEvent] = useState<VisualStepEvent | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastResult, setLastResult] = useState<{ aliceBits: number[], bobBits: number[], win: boolean } | null>(null);

  const runSingle = async (r: number, c: number) => {
    setSelectedRow(r);
    setSelectedCol(c);
    const result = runMagicSquareSimulation(r, c, 0);
    setLastResult(result);
    
    // Play audio
    await audioEngine.playContextRound(
      r, c, 
      result.aliceBits as [number, number, number], 
      result.bobBits as [number, number, number],
      (e) => setActiveStepEvent(e)
    );
    setActiveStepEvent(null);
  };

  const playNineBeatLoop = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          await runSingle(r, c);
          await new Promise(res => setTimeout(res, 200));
        }
      }
    } finally {
      setIsPlaying(false);
      setActiveStepEvent(null);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-[1000px] mx-auto space-y-12 animate-fade-in-up">
      <div className="text-center space-y-4 max-w-3xl">
        <h2 className="text-[32px] font-display font-bold">Act 2: Entangle It</h2>
        <p className="text-muted text-[16px]">
          We run the same game through an <strong>ideal local statevector simulation</strong> of the Mermin-Peres circuit in your browser. With entanglement, Alice and Bob share Bell pairs, bypass the classical limit, and achieve a perfect 9/9 unison without communicating.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full items-start">
        <div className="flex-1 w-full flex flex-col items-center space-y-6">
          <MagicGrid
            selectedRow={selectedRow}
            selectedCol={selectedCol}
            onSelectContext={(r, c) => runSingle(r, c)}
            activeStepEvent={activeStepEvent}
            aliceBits={lastResult?.aliceBits}
            bobBits={lastResult?.bobBits}
          />
          
          <button 
            onClick={playNineBeatLoop}
            disabled={isPlaying}
            className="flex items-center gap-2 px-8 py-4 bg-win text-paper rounded-full font-bold hover:scale-105 transition-transform disabled:opacity-50 shadow-[0_0_30px_rgba(91,227,168,0.2)]"
          >
            <PlayCircle className="w-5 h-5"/>
            {isPlaying ? 'Simulating...' : 'Hear the Perfect 9/9 Strategy'}
          </button>
        </div>

        <div className="w-full lg:w-[400px] space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-[14px] font-bold tracking-wider text-muted uppercase mb-4">Live Simulation Data</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface rounded-[8px] border border-hairline">
                <span className="text-muted text-[12px]">Source</span>
                <span className="text-ink font-mono text-[12px]">TypeScript Statevector</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface rounded-[8px] border border-hairline">
                <span className="text-muted text-[12px]">Context</span>
                <span className="text-ink font-mono text-[12px]">R{selectedRow+1}, C{selectedCol+1}</span>
              </div>
              {lastResult && (
                <div className={`p-4 rounded-[8px] border ${lastResult.win ? 'bg-win/10 border-win/30 text-win' : 'bg-loss/10 border-loss/30 text-loss'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[12px] font-bold uppercase tracking-widest">Shared Cell</span>
                    <span className="font-bold flex items-center gap-1">
                      {lastResult.win ? <><ShieldCheck className="w-4 h-4"/> MATCH</> : 'CLASH'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[14px] font-mono">
                    <span>Alice: {lastResult.aliceBits[selectedCol]}</span>
                    <span>Bob: {lastResult.bobBits[selectedRow]}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <ActiveCircuit row={selectedRow} col={selectedCol} />
        </div>
      </div>
    </div>
  );
};
