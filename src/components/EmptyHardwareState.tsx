import React from 'react';
import { Terminal, UploadCloud, Cpu } from 'lucide-react';

interface Props {
  onSwitchToAer: () => void;
  onTriggerImport: () => void;
}

export const EmptyHardwareState: React.FC<Props> = ({
  onSwitchToAer,
  onTriggerImport
}) => {
  return (
    <div className="bg-surface border border-hairline rounded-[10px] p-8 shadow-sm max-w-3xl mx-auto my-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="space-y-1">
          <h2 className="text-[20px] font-bold text-ink tracking-tight">
            No recorded IBM hardware run loaded.
          </h2>
          <p className="text-[12px] text-muted font-mono">
            Integrity Guard: Simulated data is never substituted for physical hardware.
          </p>
        </div>

        <p className="text-[14px] text-muted max-w-[65ch] leading-relaxed">
          Per Qollab competition rules and scientific rigor, this static page never makes live IBM Quantum API calls and never contains API secrets. To evaluate physical IBM Quantum processor data, run the offline capture tool on your local machine and import the sanitized results file.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onSwitchToAer}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[6px] bg-ink hover:bg-ink/90 text-surface font-semibold text-[14px] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            <Cpu className="w-4 h-4" />
            <span>Switch to Aer Simulator Data</span>
          </button>

          <button
            type="button"
            onClick={onTriggerImport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[6px] bg-surface hover:bg-paper text-ink border border-hairline font-semibold text-[14px] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            <UploadCloud className="w-4 h-4 text-muted" />
            <span>Import Recorded Hardware JSON</span>
          </button>
        </div>
      </div>

      {/* Step-by-step local capture instructions */}
      <div className="mt-8 pt-6 border-t border-hairline space-y-3">
        <div className="flex items-center gap-2 text-[12px] font-bold text-muted uppercase tracking-wider">
          <Terminal className="w-4 h-4" />
          <span>How to Generate a Genuine IBM Quantum Hardware Run Locally</span>
        </div>

        <div className="bg-paper rounded-[6px] p-4 border border-hairline font-mono text-[12px] text-ink space-y-2">
          <p className="text-muted"># 1. Set your IBM Quantum token in your terminal environment:</p>
          <div className="text-ink font-semibold bg-surface p-2 rounded-[4px] border border-hairline select-all">
            $env:QISKIT_IBM_TOKEN="your_ibm_api_token"  # Windows PowerShell<br />
            export QISKIT_IBM_TOKEN="your_ibm_api_token" # Linux / macOS
          </div>

          <p className="text-muted pt-1"># 2. Run the official batch capture script (outside the web bundle):</p>
          <div className="text-ink font-semibold bg-surface p-2 rounded-[4px] border border-hairline select-all">
            python scripts/capture_ibm_hardware.py --shots 1024
          </div>

          <p className="text-muted pt-1">
            # 3. The script transpiles the 9 circuits, runs them on an operational physical QPU (e.g. ibm_brisbane), validates the schema, and saves a sanitized JSON file.
          </p>
        </div>

        <div className="p-3 bg-loss/5 border border-loss/20 rounded-[6px] text-[12px] text-loss leading-relaxed">
          <strong>Zero Secrets Guarantee:</strong> API tokens are never saved to repository files, web bundles, or commits. The web app operates strictly on read-only static JSON data.
        </div>
      </div>
    </div>
  );
};
