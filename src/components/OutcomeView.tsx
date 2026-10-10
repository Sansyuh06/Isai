import React, { useState } from 'react';
import { ContextData, CountItem } from '../types/data';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showOutcomes, setShowOutcomes] = useState(false);

  const { row, column, shots, win_rate, confidence_interval_95, counts } = contextData;
  const aliceBits = currentCountItem.alice_bits;
  const bobBits = currentCountItem.bob_bits;

  const aliceSharedBit = aliceBits[column];
  const bobSharedBit = bobBits[row];
  const sharedMatch = aliceSharedBit === bobSharedBit;
  const roundWin = currentCountItem.win;

  const crossingObservable = OBSERVABLE_MATRIX[row][column];

  return (
    <div className="bg-surface border border-hairline rounded-[10px] p-5 shadow-sm space-y-5">
      {/* Header Context Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <h2 className="text-[20px] font-bold text-ink tracking-tight leading-tight">
            Row {row + 1} × Column {column + 1}
          </h2>
          <p className="text-[14px] text-muted mt-0.5">
            Shared Cell: <span className="font-mono">{crossingObservable}</span>
          </p>
        </div>

        {/* Win Rate & CI Pill */}
        <div className="text-right">
          <div className="text-[12px] font-semibold text-muted uppercase tracking-wider">Context Win Rate</div>
          <div className="text-[20px] font-bold text-ink font-mono tracking-tight flex items-baseline justify-end gap-2">
            {(win_rate * 100).toFixed(1)}%
            <span className="text-[12px] font-normal text-muted font-sans">
              [{confidence_interval_95 ? (confidence_interval_95[0]*100).toFixed(1) : ''}%, {confidence_interval_95 ? (confidence_interval_95[1]*100).toFixed(1) : ''}%]
            </span>
          </div>
        </div>
      </div>

      {/* Players' Decoded Bits Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Alice Panel (Left) */}
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-alice-text font-bold text-[14px]">
            <span className="w-3 h-3 rounded-[2px] bg-alice/10 border border-alice/20"></span>
            Alice
          </div>
          <div className="text-[28px] font-mono font-black text-ink tracking-[0.5em] text-center border-y border-hairline py-3">
            {aliceBits.join('')}
          </div>
          <div className="mt-2 flex items-center justify-between text-[12px]">
            <span className="text-muted font-mono">Row {row + 1}</span>
            <span className="text-muted">Even parity ✓</span>
          </div>
        </div>

        {/* Bob Panel (Right) */}
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-bob-text font-bold text-[14px]">
            <span className="w-3 h-3 rounded-[2px] bg-bob/10 border border-bob/20"></span>
            Bob
          </div>
          <div className="text-[28px] font-mono font-black text-ink tracking-[0.5em] text-center border-y border-hairline py-3">
            {bobBits.join('')}
          </div>
          <div className="mt-2 flex items-center justify-between text-[12px]">
            <span className="text-muted font-mono">Col {column + 1}</span>
            <span className="text-muted">Odd parity ✓</span>
          </div>
        </div>
      </div>

      {/* Shared Crossing Verdict Callout */}
      <div
        className={`p-4 rounded-[6px] flex flex-col sm:flex-row items-center justify-between gap-4 border ${
          roundWin ? 'bg-win/10 text-win border-win/20' : 'bg-loss/10 text-loss border-loss/20'
        }`}
      >
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center justify-center gap-3 bg-surface px-4 py-2 rounded-[6px] shadow-sm font-mono text-[20px] font-bold text-ink border border-hairline">
            <span>{aliceSharedBit}</span>
            <span className="text-muted text-[16px]">vs</span>
            <span>{bobSharedBit}</span>
          </div>
          <div>
            <div className={`font-bold text-[16px] leading-tight ${roundWin ? 'text-win' : 'text-loss'}`}>
              {sharedMatch ? 'MATCH — round won' : 'MISMATCH — round lost'}
            </div>
            <div className={`text-[12px] font-medium mt-0.5 ${roundWin ? 'text-win/80' : 'text-loss/80'}`}>
              Outcome pattern {activeSampleIndex + 1} of {counts.length} · {currentCountItem.count} of {shots} shots
            </div>
          </div>
        </div>
      </div>

      {/* Honest Scientific Clarification on Parity Inference */}
      <details className="text-[12px] text-muted [&_summary::-webkit-details-marker]:hidden">
        <summary className="cursor-pointer font-medium hover:text-ink transition-colors flex items-center gap-1">
          <span className="inline-block w-3.5 h-3.5 border border-current rounded-full text-center leading-[11px] text-[10px]">i</span>
          Note on parity inference
        </summary>
        <div className="mt-2 pl-4 border-l-2 border-hairline leading-relaxed">
          Because each player measures two compatible observables and infers the third via the required algebraic parity, parity passes by construction. <strong>Shared-cell agreement</strong> is the true noise-sensitive test of quantum state fidelity and nonlocality.
        </div>
      </details>

      {/* Collapsible Sample Distribution Browser */}
      {counts.length > 1 && (
        <div className="border border-hairline rounded-[6px] overflow-hidden bg-surface">
          <button
            type="button"
            onClick={() => setShowOutcomes(!showOutcomes)}
            className="w-full px-4 py-3 bg-paper hover:bg-hairline flex items-center justify-between text-[14px] font-semibold text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            <span>Measured Outcomes ({counts.length} patterns)</span>
            {showOutcomes ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
          </button>
          
          {showOutcomes && (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-hairline bg-surface">
              {counts.map((item, idx) => {
                const isSelected = idx === activeSampleIndex;
                const pct = ((item.count / shots) * 100).toFixed(1);
                return (
                  <button
                    key={`sample-btn-${idx}`}
                    type="button"
                    onClick={() => onSelectSampleIndex(idx)}
                    className={`p-3 rounded-[6px] border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
                      isSelected
                        ? 'bg-ink border-ink text-surface shadow-sm'
                        : 'bg-surface border-hairline text-ink hover:bg-paper'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[12px] font-semibold ${isSelected ? 'text-surface/80' : 'text-muted'}`}>Pattern {idx + 1}</span>
                      <span className={`text-[12px] font-bold ${isSelected ? 'text-surface' : 'text-ink'}`}>{pct}%</span>
                    </div>
                    <div className={`text-[14px] font-mono tracking-widest ${isSelected ? 'text-surface/90' : 'text-ink'}`}>
                      A:{item.alice_bits.join('')} B:{item.bob_bits.join('')}
                    </div>
                    <div className={`text-[12px] mt-1.5 flex items-center gap-1.5 ${isSelected ? 'text-surface/70' : 'text-muted'}`}>
                      <span className="font-semibold">{item.count}</span> shots
                      <span>·</span>
                      <span className={item.win ? (isSelected ? 'text-win/90' : 'text-win') : (isSelected ? 'text-loss/90' : 'text-loss')}>
                        {item.win ? 'Win' : 'Loss'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
