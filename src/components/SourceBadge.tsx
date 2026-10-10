import React from 'react';
import { SourceType } from '../types/data';
import { Cpu, HardDrive } from 'lucide-react';

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
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[12px] font-medium border bg-surface border-hairline text-ink ${className}`}
      role="status"
      aria-label={`Data source: ${isHardware ? 'Recorded IBM Hardware' : 'Aer Simulator'}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isHardware ? 'bg-win' : 'bg-muted'}`} aria-hidden="true"></span>
      {isHardware ? (
        <HardDrive className="w-3 h-3 text-muted" aria-hidden="true" />
      ) : (
        <Cpu className="w-3 h-3 text-muted" aria-hidden="true" />
      )}
      <span>{isHardware ? 'Recorded IBM run' : 'Aer run'}</span>
      <span className="text-muted font-mono ml-1">
        {backendName}{jobId ? ` · ${jobId.slice(0, 8)}` : ''}
      </span>
    </div>
  );
};
