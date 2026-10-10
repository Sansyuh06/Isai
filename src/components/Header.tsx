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
      e.target.value = ''; // Reset input
    }
  };

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-xl">
            8/9
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                The 8/9 Duet
              </h1>
              <SourceBadge
                sourceType={currentSource}
                backendName={backendName}
                jobId={jobId}
                className="hidden sm:inline-flex"
              />
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Acoustic Exploration of the Mermin–Peres Quantum Pseudo-Telepathy Game
            </p>
          </div>
        </div>

        {/* Source Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Source Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onSelectSource('qiskit_aer')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentSource === 'qiskit_aer'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Aer simulator run
            </button>
            <button
              type="button"
              onClick={() => onSelectSource('ibm_hardware')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentSource === 'ibm_hardware'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-sm'
                  : hasHardwareData
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-purple-300'
              }`}
              title={hasHardwareData ? 'Inspect recorded IBM QPU run' : 'No recorded IBM run loaded yet'}
            >
              Recorded IBM hardware run
              {!hasHardwareData && (
                <span className="ml-1 text-[10px] text-slate-500 font-mono">(empty)</span>
              )}
            </button>
          </div>

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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all active:scale-95 shadow-sm"
            title="Import a validated IBM Hardware or Aer JSON results file"
          >
            <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Import Run</span>
          </button>

          {/* About / Limitations Dialog Toggle */}
          <button
            type="button"
            onClick={onOpenAbout}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all"
            title="About & Scientific Limitations"
            aria-label="About & Scientific Limitations"
          >
            <HelpCircle className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
