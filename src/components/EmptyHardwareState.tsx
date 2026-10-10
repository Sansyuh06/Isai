import React from 'react';
import { ServerOff, Terminal, UploadCloud, ShieldAlert, Cpu } from 'lucide-react';

interface Props {
  onSwitchToAer: () => void;
  onTriggerImport: () => void;
}

export const EmptyHardwareState: React.FC<Props> = ({
  onSwitchToAer,
  onTriggerImport
}) => {
  return (
    <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-8 shadow-2xl backdrop-blur-md max-w-3xl mx-auto my-6 text-slate-200">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-400 shadow-lg shadow-purple-950/50">
          <ServerOff className="w-12 h-12" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">
            No recorded IBM hardware run loaded.
          </h2>
          <p className="text-xs text-purple-300 font-mono">
            Integrity Guard: Simulated or invented data is never substituted for physical hardware.
          </p>
        </div>

        <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
          Per Qollab competition rules and scientific rigor, this static page never makes live IBM Quantum API calls and never contains API secrets. To evaluate physical IBM Quantum processor data, run the offline capture tool on your local machine and import the sanitized results file.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onSwitchToAer}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all shadow-md shadow-cyan-900/30 active:scale-95"
          >
            <Cpu className="w-4 h-4" />
            <span>Switch to Aer Simulator Data</span>
          </button>

          <button
            type="button"
            onClick={onTriggerImport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-100 border border-purple-500/50 font-medium text-sm transition-all shadow-md active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Import Recorded Hardware JSON</span>
          </button>
        </div>
      </div>

      {/* Step-by-step local capture instructions */}
      <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span>How to Generate a Genuine IBM Quantum Hardware Run Locally</span>
        </div>

        <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
          <p className="text-slate-400"># 1. Set your IBM Quantum token in your terminal environment:</p>
          <div className="text-purple-300 bg-slate-900 p-2 rounded border border-slate-800 select-all">
            $env:QISKIT_IBM_TOKEN="your_ibm_api_token"  # Windows PowerShell<br />
            export QISKIT_IBM_TOKEN="your_ibm_api_token" # Linux / macOS
          </div>

          <p className="text-slate-400 pt-1"># 2. Run the official batch capture script (outside the web bundle):</p>
          <div className="text-cyan-300 bg-slate-900 p-2 rounded border border-slate-800 select-all">
            python scripts/capture_ibm_hardware.py --shots 1024
          </div>

          <p className="text-slate-400 pt-1">
            # 3. The script transpiles the 9 circuits, runs them on an operational physical QPU (e.g. ibm_brisbane / ibm_sherbrooke), validates the schema, and saves a sanitized JSON file.
          </p>
        </div>

        <div className="flex items-start gap-2 p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Zero Secrets Guarantee:</strong> API tokens are never saved to repository files, web bundles, or commits. The web app operates strictly on read-only static JSON data.
          </span>
        </div>
      </div>
    </div>
  );
};
