import React from 'react';
import { SourceType } from '../types/data';
import { Cpu, Server } from 'lucide-react';

interface Props {
  sourceType: SourceType;
  backendName: string;
  jobId?: string | null;
  className?: string;
}

export const SourceBadge: React.FC<Props> = ({
  sourceType,
  backendName,
  jobId,
  className = ''
}) => {
  const isHardware = sourceType === 'ibm_hardware';

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border shadow-sm transition-all ${
        isHardware
          ? 'bg-purple-950/80 text-purple-200 border-purple-500/50 shadow-purple-900/30'
          : 'bg-cyan-950/80 text-cyan-200 border-cyan-500/50 shadow-cyan-900/30'
      } ${className}`}
      role="status"
      aria-label={`Data source: ${isHardware ? 'Recorded IBM Hardware' : 'Aer Simulator'}`}
    >
      {isHardware ? (
        <Server className="w-3.5 h-3.5 text-purple-400 animate-pulse" aria-hidden="true" />
      ) : (
        <Cpu className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
      )}
      <span>{isHardware ? 'RECORDED IBM HARDWARE' : 'AER SIMULATOR'}</span>
      <span className="text-[10px] opacity-75 font-mono lowercase tracking-normal">
        ({backendName}{jobId ? ` · job:${jobId.slice(0, 6)}` : ''})
      </span>
    </div>
  );
};
