import React from 'react';
import { X, AlertTriangle, Music, Cpu } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ExplainerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface border border-hairline rounded-[10px] p-8 shadow-xl text-ink space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 rounded-full text-muted hover:text-ink hover:bg-paper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pr-12">
          <h2 id="modal-title" className="text-[20px] font-bold tracking-tight">
            About The 8/9 Duet & Scientific Scope
          </h2>
        </div>

        {/* Project Essence */}
        <div className="space-y-4 text-[14px] leading-relaxed text-muted">
          <p>
            <strong>The 8/9 Duet</strong> transforms the seminal Mermin–Peres Magic Square pseudo-telepathy game into an interactive, audio-first quantum acoustic exploration. In quantum information theory, pseudo-telepathy games demonstrate that entangled quantum players can achieve coordination tasks with unit success probability that are mathematically impossible for classical players without communication.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-paper rounded-[6px] border border-hairline">
              <div className="flex items-center gap-2 font-bold text-ink text-[14px] mb-2">
                <Music className="w-4 h-4 text-muted" />
                <span>Stereo Sonification</span>
              </div>
              <p className="text-[12px] text-muted">
                Alice’s phrase is panned left; Bob’s phrase is panned right. Matching bits at the shared crossing sound in clean resonant unison; disagreement produces discordant semitones.
              </p>
            </div>
            <div className="p-4 bg-paper rounded-[6px] border border-hairline">
              <div className="flex items-center gap-2 font-bold text-ink text-[14px] mb-2">
                <Cpu className="w-4 h-4 text-muted" />
                <span>Genuine Quantum Circuits</span>
              </div>
              <p className="text-[12px] text-muted">
                Prepared with two genuine Bell pairs |Φ+⟩ on 4 qubits, local Clifford rotations, and local decoding. No lookup tables, no fake data.
              </p>
            </div>
          </div>
        </div>

        {/* Honest Scientific Scope & Limitations */}
        <div className="bg-loss/5 border border-loss/20 rounded-[6px] p-5 space-y-4">
          <div className="flex items-center gap-2 font-bold text-loss text-[14px]">
            <AlertTriangle className="w-4 h-4" />
            <span>Honest Scientific Scope & Physical Limitations</span>
          </div>
          <ul className="space-y-3 text-[12px] text-loss/80 list-disc list-inside leading-relaxed">
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
      </div>
    </div>
  );
};
