import React, { useState } from 'react';
import { PlayCircle, ShieldAlert } from 'lucide-react';
import { MagicGrid } from './MagicGrid';
import { runMagicSquareSimulation } from '../utils/simulator';
import { audioEngine, VisualStepEvent } from '../audio/synth';
import { MerminPeresDataset } from '../types/data';

interface Props {
  ibmDataset?: MerminPeresDataset | null;
}

export const Act3Corrupt: React.FC<Props> = ({ ibmDataset }) => {
  const [noiseLevel, setNoiseLevel] = useState<number>(0.05); // 5% default
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedCol, setSelectedCol] = useState(0);
  const [activeStepEvent, setActiveStepEvent] = useState<VisualStepEvent | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastResult, setLastResult] = useState<{ aliceBits: number[], bobBits: number[], win: boolean } | null>(null);
  const [useHardware, setUseHardware] = useState(false);

  const runSingle = async (r: number, c: number) => {
    setSelectedRow(r);
    setSelectedCol(c);
    
    let aBits, bBits, win;

    if (useHardware && ibmDataset) {
      // Pick a random shot from the dataset's recorded context distribution
      const ctx = ibmDataset.contexts.find(x => x.row === r && x.column === c);
      if (ctx) {
        // Weighted random choice
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
        aBits = selected.alice_bits;
        bBits = selected.bob_bits;
        win = aBits[c] === bBits[r];
      } else {
        aBits = [0,0,0]; bBits = [0,0,0]; win = false;
      }
    } else {
      // Simulate with noise
      const result = runMagicSquareSimulation(r, c, noiseLevel);
      aBits = result.aliceBits;
      bBits = result.bobBits;
      win = result.win;
    }

    setLastResult({ aliceBits: aBits, bobBits: bBits, win });
    
    // Play audio
    await audioEngine.playContextRound(
      r, c, 
      aBits as [number, number, number], 
      bBits as [number, number, number],
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
        <h2 className="text-[32px] font-display font-bold">Act 3: Corrupt It</h2>
        <p className="text-muted text-[16px]">
          Quantum entanglement is fragile. We inject stochastic Pauli depolarizing noise into the statevector after every gate to simulate a real noisy quantum processing unit (QPU). 
          Notice how errors cause the perfect 9/9 unison to randomly clash.
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
            className="flex items-center gap-2 px-8 py-4 bg-ink text-paper rounded-full font-bold hover:scale-105 transition-transform disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            <PlayCircle className="w-5 h-5"/>
            {isPlaying ? 'Running...' : 'Hear the Noisy Strategy'}
          </button>
        </div>

        <div className="w-full lg:w-[400px] space-y-6">
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-[14px] font-bold tracking-wider text-muted uppercase">Noise Model Configuration</h3>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold flex justify-between">
                  <span>Depolarizing Error Probability (p)</span>
                  <span className="font-mono text-bob">{noiseLevel.toFixed(3)}</span>
                </label>
                <input 
                  type="range" 
                  min="0" max="0.2" step="0.005" 
                  value={noiseLevel} 
                  onChange={(e) => {
                    setNoiseLevel(parseFloat(e.target.value));
                    setUseHardware(false);
                  }}
                  className="w-full accent-bob"
                  disabled={useHardware}
                />
                <p className="text-[11px] text-muted leading-relaxed mt-1">
                  Applies X, Y, or Z errors (each with probability p/3) after every single- and two-qubit gate in the Mermin-Peres preparation and basis rotations.
                </p>
              </div>

              {ibmDataset && (
                <div className="pt-4 border-t border-hairline mt-4">
                   <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={useHardware} 
                      onChange={(e) => setUseHardware(e.target.checked)}
                      className="w-4 h-4 accent-win"
                    />
                    <span className="text-[14px] font-bold">Use recorded IBM Hardware run</span>
                  </label>
                  {useHardware && (
                    <p className="text-[11px] text-muted mt-2">
                      Currently replaying Job <code>{ibmDataset.ibm_job_id?.slice(0,8)}</code> from <strong>{ibmDataset.backend_name}</strong>.
                    </p>
                  )}
                </div>
              )}
            </div>

            {lastResult && (
              <div className={`p-4 rounded-[8px] border mt-4 ${lastResult.win ? 'bg-win/10 border-win/30 text-win' : 'bg-loss/10 border-loss/30 text-loss'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12px] font-bold uppercase tracking-widest">Shared Cell Result</span>
                  <span className="font-bold flex items-center gap-1">
                    {lastResult.win ? 'MATCH' : <><ShieldAlert className="w-4 h-4"/> CLASH</>}
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
      </div>
    </div>
  );
};
