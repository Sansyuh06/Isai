import React from 'react';
import { ContextData, CountItem } from '../types/data';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { OBSERVABLE_MATRIX } from './MagicGrid';

interface Props {
  contextData: ContextData;
  activeSampleIndex: number;
  onSelectSampleIndex: (idx: number) => void;
  currentCountItem: CountItem;
}

export const OutcomeView: React.FC<Props> = ({
  contextData,
  activeSampleIndex,
  onSelectSampleIndex,
  currentCountItem
}) => {
  const { row, column, shots, wins, win_rate, confidence_interval_95, counts } = contextData;
  const aliceBits = currentCountItem.alice_bits;
  const bobBits = currentCountItem.bob_bits;

  const aliceParity = aliceBits[0] ^ aliceBits[1] ^ aliceBits[2];
  const bobParity = bobBits[0] ^ bobBits[1] ^ bobBits[2];

  const aliceSharedBit = aliceBits[column];
  const bobSharedBit = bobBits[row];
  const sharedMatch = aliceSharedBit === bobSharedBit;
  const roundWin = currentCountItem.win;

  const crossingObservable = OBSERVABLE_MATRIX[row][column];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-5">
      {/* Header Context Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Context: Row {row + 1} × Column {colHeader(column)}</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-yellow-300 border border-yellow-500/30">
              Shared Cell ({row + 1}, {column + 1}): {crossingObservable}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Alice is queried on row {row + 1}; Bob is queried on column {column + 1}.
          </p>
        </div>

        {/* Win Rate & CI Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-400">Context Win Rate</div>
            <div className="text-lg font-extrabold text-cyan-300 font-mono">
              {(win_rate * 100).toFixed(1)}%
              <span className="text-xs font-normal text-slate-400 ml-1">
                ({wins}/{shots})
              </span>
            </div>
          </div>
          {confidence_interval_95 && (
            <div className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
              95% CI: [{(confidence_interval_95[0] * 100).toFixed(1)}%,{' '}
              {(confidence_interval_95[1] * 100).toFixed(1)}%]
            </div>
          )}
        </div>
      </div>

      {/* Players' Decoded Bits Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alice Panel (Left) */}
        <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Alice (Row {row + 1})
            </span>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              Left Pan
            </span>
          </div>

          <div className="flex items-center justify-around gap-2 my-2">
            {[0, 1, 2].map((c) => {
              const isCrossing = c === column;
              const bit = aliceBits[c];
              return (
                <div
                  key={`alice-bit-${c}`}
                  className={`flex flex-col items-center p-2 rounded-lg border flex-1 text-center ${
                    isCrossing
                      ? 'bg-yellow-500/20 border-yellow-400/80 ring-2 ring-yellow-400/40'
                      : 'bg-slate-800/60 border-slate-700'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 uppercase">Col {c + 1}</span>
                  <span className="text-xl font-mono font-black text-white">{bit}</span>
                  <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                    {OBSERVABLE_MATRIX[row][c]}
                  </span>
                  {isCrossing && (
                    <span className="text-[9px] font-bold text-yellow-300 mt-0.5">Crossing</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-cyan-500/20 flex items-center justify-between text-xs">
            <span className="text-slate-400">Parity Check (a₁ ⊕ a₂ ⊕ a₃):</span>
            <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {aliceParity} (Even = 0)
            </span>
          </div>
        </div>

        {/* Bob Panel (Right) */}
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Bob (Column {column + 1})
            </span>
            <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
              Right Pan
            </span>
          </div>

          <div className="flex items-center justify-around gap-2 my-2">
            {[0, 1, 2].map((r) => {
              const isCrossing = r === row;
              const bit = bobBits[r];
              return (
                <div
                  key={`bob-bit-${r}`}
                  className={`flex flex-col items-center p-2 rounded-lg border flex-1 text-center ${
                    isCrossing
                      ? 'bg-yellow-500/20 border-yellow-400/80 ring-2 ring-yellow-400/40'
                      : 'bg-slate-800/60 border-slate-700'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 uppercase">Row {r + 1}</span>
                  <span className="text-xl font-mono font-black text-white">{bit}</span>
                  <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                    {OBSERVABLE_MATRIX[r][column]}
                  </span>
                  {isCrossing && (
                    <span className="text-[9px] font-bold text-yellow-300 mt-0.5">Crossing</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs">
            <span className="text-slate-400">Parity Check (b₁ ⊕ b₂ ⊕ b₃):</span>
            <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {bobParity} (Odd = 1)
            </span>
          </div>
        </div>
      </div>

      {/* Shared Crossing Verdict Callout */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          roundWin
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
            : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {roundWin ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
          )}
          <div>
            <div className="font-bold text-sm">
              Crossing Cell ({row + 1}, {column + 1}) Check:{' '}
              {sharedMatch ? 'MATCH (Unison Sound) — ROUND WON' : 'MISMATCH (Dissonance) — ROUND LOST'}
            </div>
            <div className="text-xs opacity-90 mt-0.5 font-mono">
              Alice bit at col {column + 1} = <strong>{aliceSharedBit}</strong> vs Bob bit at row{' '}
              {row + 1} = <strong>{bobSharedBit}</strong>
            </div>
          </div>
        </div>

        <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700">
          Sample {activeSampleIndex + 1} of {counts.length} ({currentCountItem.count} shots in this configuration)
        </div>
      </div>

      {/* Honest Scientific Clarification on Parity Inference */}
      <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl flex items-start gap-2.5 text-xs text-slate-300">
        <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
        <div>
          <strong>Construction Notice:</strong> Because each player measures two compatible observables and infers the third via the required algebraic parity, parity passes by construction. <strong>Shared-cell agreement</strong> is the true noise-sensitive test of quantum state fidelity and nonlocality.
        </div>
      </div>

      {/* Sample Distribution Browser */}
      {counts.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Observed Bitstring Outcomes in this Context:</span>
            <span>Click to inspect & replay sample</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {counts.map((item, idx) => {
              const isSelected = idx === activeSampleIndex;
              const pct = ((item.count / shots) * 100).toFixed(1);
              return (
                <button
                  key={`sample-btn-${idx}`}
                  type="button"
                  onClick={() => onSelectSampleIndex(idx)}
                  className={`p-2 rounded-lg border text-left font-mono text-xs transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 ring-2 ring-cyan-400/40 font-bold'
                      : 'bg-slate-800/50 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">#{idx + 1}</span>
                    <span className="text-[10px] text-cyan-300">{pct}%</span>
                  </div>
                  <div className="text-[11px] mt-1">
                    A:[{item.alice_bits.join('')}] B:[{item.bob_bits.join('')}]
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {item.count} shots · {item.win ? 'Win' : 'Loss'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

function colHeader(c: number): number {
  return c + 1;
}
