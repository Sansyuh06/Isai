import React from 'react';
import { MerminPeresDataset } from '../types/data';
import { PlayCircle, ShieldCheck } from 'lucide-react';

interface Props {
  dataset: MerminPeresDataset | null;
  onHearDuet: () => void;
  onTour: () => void;
  onBeatClassical: () => void;
}

export const Hero: React.FC<Props> = ({ dataset, onHearDuet, onTour, onBeatClassical }) => {
  const quantumWins = dataset?.contexts.reduce((acc, ctx) => acc + ctx.counts.reduce((sum, item) => item.win ? sum + item.count : sum, 0), 0) || 0;
  const quantumTotal = dataset?.contexts.reduce((acc, ctx) => acc + ctx.shots, 0) || 0;
  const quantumPct = quantumTotal > 0 ? (quantumWins / quantumTotal * 100).toFixed(1) : '0.0';

  return (
    <div className="w-full flex-1 flex flex-col justify-center relative overflow-hidden py-16 lg:py-24">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-alice/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
        <h1 className="font-display text-[40px] md:text-[56px] leading-[1.1] font-extrabold text-ink tracking-tight max-w-[800px] mb-6 animate-fade-in-up">
          Two players. No communication.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-alice to-bob">One impossible score.</span>
        </h1>
        
        <p className="text-[18px] md:text-[20px] text-muted max-w-[600px] mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          Classical physics caps them at 8/9. Entanglement lets them win 9/9. Press play and hear the difference.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[800px] mb-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          {/* Classical Stat */}
          <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
            <div className="text-[14px] font-bold text-muted uppercase tracking-wider mb-2">Classical Ceiling</div>
            <div className="font-mono text-[48px] font-bold text-loss leading-none mb-2">88.9%</div>
            <div className="text-[14px] text-muted flex items-center gap-1.5"><ShieldCheck className="w-4 h-4"/> 8/9 (Proven limit)</div>
          </div>
          
          {/* Quantum Stat */}
          <div className="glass-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-win/5 pointer-events-none"></div>
            <div className="text-[14px] font-bold text-muted uppercase tracking-wider mb-2">Quantum Replay</div>
            <div className="font-mono text-[48px] font-bold text-win leading-none mb-2">{quantumPct}%</div>
            <div className="text-[14px] text-muted flex items-center gap-1.5"><ShieldCheck className="w-4 h-4"/> {quantumWins.toLocaleString()}/{quantumTotal.toLocaleString()} (Wilson CI [99.96%, 100%])</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <button onClick={onHearDuet} className="flex items-center gap-2 px-8 py-4 bg-ink text-surface rounded-full font-bold text-[16px] hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <PlayCircle className="w-5 h-5" /> Hear the duet
          </button>
          <button onClick={onTour} className="px-6 py-4 bg-surface/5 border border-hairline text-ink rounded-full font-bold text-[16px] hover:bg-surface/10 transition-colors">
            60-second judge tour
          </button>
          <button onClick={onBeatClassical} className="px-6 py-4 text-muted hover:text-ink font-bold text-[16px] transition-colors underline decoration-hairline underline-offset-4">
            Try to beat 8/9
          </button>
        </div>
      </div>
    </div>
  );
};
