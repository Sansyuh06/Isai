import React, { useRef } from 'react';
import { SourceType } from '../types/data';
import { UploadCloud, HelpCircle } from 'lucide-react';
import { SourceBadge } from './SourceBadge';

interface Props {
  currentSource: SourceType;
  onSelectSource: (src: SourceType) => void;
  hasHardwareData: boolean;
  onImportFile: (file: File) => void;
  onOpenAbout: () => void;
  backendName: string;
  jobId?: string | null;
}

export const Header: React.FC<Props> = ({
  currentSource,
  onSelectSource,
  hasHardwareData,
  onImportFile,
  onOpenAbout,
  backendName,
  jobId
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportFile(file);
      e.target.value = '';
    }
  };

  return (
    <header className="bg-surface border-b border-hairline sticky top-0 z-40 px-4 py-2 sm:px-8">
      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Source Badge */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-tight text-ink leading-none">
            The 8/9 Duet
          </h1>
          <SourceBadge
            sourceType={currentSource}
            backendName={backendName}
            jobId={jobId}
            className="hidden sm:inline-flex"
          />
        </div>

        {/* Source Selector & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Control */}
          <div className="flex items-center p-0.5 rounded-md bg-hairline text-sm font-medium">
            <button
              type="button"
              onClick={() => onSelectSource('qiskit_aer')}
              className={`px-3 py-1 rounded-[4px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
                currentSource === 'qiskit_aer'
                  ? 'bg-surface text-ink shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Aer run
            </button>
            <button
              type="button"
              onClick={() => onSelectSource('ibm_hardware')}
              className={`px-3 py-1 rounded-[4px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
                currentSource === 'ibm_hardware'
                  ? 'bg-surface text-ink shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {hasHardwareData ? 'Recorded IBM run' : 'No recorded IBM run'}
            </button>
          </div>

          <div className="w-px h-5 bg-hairline mx-1 hidden sm:block"></div>

          {/* Import JSON File */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-muted hover:text-ink text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm"
          >
            <UploadCloud className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* About Dialog Toggle */}
          <button
            type="button"
            onClick={onOpenAbout}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-muted hover:text-ink text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink rounded-sm"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">About</span>
          </button>
        </div>
      </div>
    </header>
  );
};
