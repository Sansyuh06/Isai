import React from 'react';
import { SourceType } from '../types/data';
import { Cpu, HardDrive, Shield } from 'lucide-react';

interface Props {
  sourceType: SourceType;
  backendName: string;
  jobId?: string | null;
  className?: string;
  activeTab?: string;
}

export const SourceBadge: React.FC<Props> = ({
  sourceType,
  backendName,
  jobId,
  className = '',
  activeTab
}) => {
  const isHardware = sourceType === 'ibm_hardware';

  // Determine actual source and model label based on active context
  if (activeTab === 'act1') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[12px] font-medium border bg-surface border-hairline text-ink ${className}`}
        role="status"
        aria-label="Active model: Classical deterministic strategy"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-loss" aria-hidden="true"></span>
        <Shield className="w-3 h-3 text-muted" aria-hidden="true" />
        <span>Classical Model</span>
        <span className="text-muted font-mono ml-1">8/9 Bound</span>
      </div>
    );
  }

  if (activeTab === 'act2') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[12px] font-medium border bg-surface border-hairline text-ink ${className}`}
        role="status"
        aria-label="Active model: In-browser TypeScript statevector simulation"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-win" aria-hidden="true"></span>
        <Cpu className="w-3 h-3 text-win" aria-hidden="true" />
        <span>Browser Simulation</span>
        <span className="text-muted font-mono ml-1">4-Qubit Statevector</span>
      </div>
    );
  }

  if (activeTab === 'act3') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[12px] font-medium border bg-surface border-hairline text-ink ${className}`}
        role="status"
        aria-label="Active model: In-browser depolarizing noise simulation"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-bob" aria-hidden="true"></span>
        <Cpu className="w-3 h-3 text-bob" aria-hidden="true" />
        <span>Browser Simulation</span>
        <span className="text-muted font-mono ml-1">Depolarizing Noise</span>
      </div>
    );
  }

  // Default for Tutorial, Results / Provenance, or Landing: Loaded replay dataset
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[12px] font-medium border bg-surface border-hairline text-ink ${className}`}
      role="status"
      aria-label={`Dataset replay: ${isHardware ? 'Recorded IBM Hardware' : 'Qiskit Aer Simulator'}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isHardware ? 'bg-win' : 'bg-muted'}`} aria-hidden="true"></span>
      {isHardware ? (
        <HardDrive className="w-3 h-3 text-muted" aria-hidden="true" />
      ) : (
        <Cpu className="w-3 h-3 text-muted" aria-hidden="true" />
      )}
      <span>{isHardware ? 'Recorded IBM run' : 'Aer dataset replay'}</span>
      <span className="text-muted font-mono ml-1">
        {backendName}{jobId ? ` · ${jobId.slice(0, 8)}` : ''}
      </span>
    </div>
  );
};
