import React from 'react';
import { X, AlertTriangle, Music, Cpu, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ExplainerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-slate-200 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 id="modal-title" className="text-lg font-bold text-white">
              About The 8/9 Duet & Scientific Scope
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Essence */}
        <div className="space-y-3 text-sm leading-relaxed text-slate-300">
          <p>
            <strong>The 8/9 Duet</strong> transforms the seminal Mermin–Peres Magic Square pseudo-telepathy game into an interactive, audio-first quantum acoustic exploration. In quantum information theory, pseudo-telepathy games demonstrate that entangled quantum players can achieve coordination tasks with unit success probability that are mathematically impossible for classical players without communication.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl">
              <div className="flex items-center gap-2 font-bold text-cyan-300 text-xs mb-1">
                <Music className="w-4 h-4" />
                <span>Stereo Sonification</span>
              </div>
              <p className="text-xs text-slate-300">
                Alice’s phrase is panned left; Bob’s phrase is panned right. Matching bits at the shared crossing sound in clean resonant unison; disagreement produces discordant semitones.
              </p>
            </div>
            <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl">
              <div className="flex items-center gap-2 font-bold text-purple-300 text-xs mb-1">
                <Cpu className="w-4 h-4" />
                <span>Genuine Quantum Circuits</span>
              </div>
              <p className="text-xs text-slate-300">
                Prepared with two genuine Bell pairs |Φ+⟩ on 4 qubits, local Clifford rotations, and local decoding. No lookup tables, no fake data.
              </p>
            </div>
          </div>
        </div>

        {/* Honest Scientific Scope & Limitations */}
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Honest Scientific Scope & Physical Limitations</span>
          </div>
          <ul className="space-y-2 text-xs text-amber-100/90 list-disc list-inside leading-relaxed">
            <li>
              <strong>Established Foundation:</strong> The Magic Square game and its quantum strategy are well-established theoretical constructions. The project’s distinguishing feature is the musical, interactive presentation and verified execution pipeline.
            </li>
            <li>
              <strong>Replay, Not Live Execution:</strong> A recorded IBM run displayed in this web app is a replay of stored quantum circuit measurements, not a live hardware trigger from the web page.
            </li>
            <li>
              <strong>Centralized Demonstration:</strong> A centralized 4-qubit quantum processor execution is a circuit demonstration of quantum correlations, not a space-like separated loophole-free test of nonlocality.
            </li>
            <li>
              <strong>Hardware Noise:</strong> Physical quantum hardware is subject to decoherence, gate infidelities, and readout noise; physical devices are not guaranteed to surpass 8/9 without error mitigation.
            </li>
            <li>
              <strong>Sample Statistics:</strong> A single run or small shot sample is not sufficient to establish a statistically conclusive asymptotic win rate.
            </li>
          </ul>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
