import React, { useState } from 'react';
import { Send, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react';
import { evaluateCommunicationContext, CommunicationStep } from '../utils/communication';

export const ClassicalCommunication: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [selectedCol, setSelectedCol] = useState<number>(0);

  const step: CommunicationStep = evaluateCommunicationContext(selectedRow, selectedCol);

  return (
    <div className="glass-card p-6 space-y-6 max-w-4xl mx-auto border-alice/20">
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-alice-text block">
            Comparative Scenario
          </span>
          <h3 className="text-xl font-display font-extrabold text-ink">
            What If We Allow Classical Communication?
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-win bg-win/10 px-3 py-1 rounded-full border border-win/30">
          9/9 Trivial with Signaling
        </span>
      </div>

      <p className="text-sm text-muted leading-relaxed">
        In the standard Mermin-Peres game, players are isolated in spacelike-separated wings. 
        If Alice is allowed to send a <strong>single classical message</strong> (her prompt row index r in {'{1, 2, 3}'}), Bob simply sets his bit at row r to match Alice's crossing bit a_c, and adjusts his remaining bits to satisfy odd parity.
      </p>

      {/* Interactive Selection */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span>Alice deals Row:</span>
          {[0, 1, 2].map(r => (
            <button
              key={`comm-r-${r}`}
              type="button"
              onClick={() => setSelectedRow(r)}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                selectedRow === r ? 'bg-alice text-white' : 'bg-surface border border-hairline text-muted'
              }`}
            >
              Row {r + 1}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span>Bob deals Col:</span>
          {[0, 1, 2].map(c => (
            <button
              key={`comm-c-${c}`}
              type="button"
              onClick={() => setSelectedCol(c)}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                selectedCol === c ? 'bg-bob text-paper' : 'bg-surface border border-hairline text-muted'
              }`}
            >
              Col {c + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Step Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Alice Wing */}
        <div className="p-4 rounded-xl bg-alice/5 border border-alice/20 space-y-2 text-center">
          <span className="text-xs font-mono font-bold text-alice-text uppercase">1. Alice's Wing</span>
          <div className="text-sm font-bold text-ink">Receives Row {selectedRow + 1}</div>
          <div className="font-mono text-xs text-muted">
            Outputs: [{step.aliceBits.join(', ')}]
          </div>
          <div className="text-[11px] text-win font-mono">Even Parity (0 mod 2) ✓</div>
        </div>

        {/* Message Signal */}
        <div className="p-4 rounded-xl bg-surface border border-hairline flex flex-col items-center justify-center text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-alice/20 text-alice-text font-bold">
            <Send className="w-3.5 h-3.5" /> Message Sent
          </div>
          <div className="font-mono text-xs font-bold text-ink">
            "Alice was dealt Row {selectedRow + 1}"
          </div>
          <ArrowRight className="w-4 h-4 text-muted" />
        </div>

        {/* Bob Wing */}
        <div className="p-4 rounded-xl bg-bob/5 border border-bob/20 space-y-2 text-center">
          <span className="text-xs font-mono font-bold text-bob-text uppercase">2. Bob's Adaptation</span>
          <div className="text-sm font-bold text-ink">Receives Col {selectedCol + 1} + Message</div>
          <div className="font-mono text-xs text-muted">
            Outputs: [{step.bobBits.join(', ')}]
          </div>
          <div className="text-[11px] text-win font-mono">Odd Parity (1 mod 2) ✓</div>
        </div>
      </div>

      {/* Outcome Verdict */}
      <div className="p-4 rounded-xl bg-win/10 border border-win/30 flex items-center justify-between text-xs font-mono text-win">
        <div className="flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4" /> Crossing agreement: Alice $a_{selectedCol}$ ({step.aliceBits[selectedCol]}) = Bob $b_{selectedRow}$ ({step.bobBits[selectedRow]})
        </div>
        <span className="font-bold">Result: WIN (100% Guaranteed)</span>
      </div>

      <div className="p-3.5 rounded-lg bg-surface border border-hairline text-xs text-muted space-y-1">
        <div className="font-bold text-ink flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-bob" /> Quantum Pseudo-Telepathy vs. Communication:
        </div>
        <p className="leading-relaxed">
          Quantum entanglement <strong>never transmits a classical message</strong> (respecting the No-Communication Theorem). In the quantum version, Bob never learns Alice's row prompt. 
          The 9/9 win rate arises entirely from nonlocal quantum correlations between pre-shared Bell pairs measured in locally chosen bases!
        </p>
      </div>
    </div>
  );
};
