import React from 'react';
import { VisualStepEvent } from '../audio/synth';
import { BASE_MIDI_PITCHES, NOTE_NAMES } from '../audio/notes';

export const OBSERVABLE_MATRIX = [
  ['-I⊗X', '-X⊗I', 'X⊗X'],
  ['Y⊗I',  'I⊗Y',  'Y⊗Y'],
  ['Y⊗X',  'X⊗Y',  'Z⊗Z']
];

interface Props {
  selectedRow: number; // 0, 1, 2
  selectedCol: number; // 0, 1, 2
  onSelectContext: (row: number, col: number) => void;
  activeStepEvent: VisualStepEvent | null;
  aliceBits?: [number, number, number];
  bobBits?: [number, number, number];
}

export const MagicGrid: React.FC<Props> = ({
  selectedRow,
  selectedCol,
  onSelectContext,
  activeStepEvent,
  aliceBits,
  bobBits
}) => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-2xl backdrop-blur-md">
        {/* Column Headers (Bob's Choices) */}
        <div className="grid grid-cols-4 gap-2 mb-2 items-center text-center">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Alice \ Bob
          </div>
          {[0, 1, 2].map((c) => {
            const isColSelected = selectedCol === c;
            return (
              <button
                key={`col-head-${c}`}
                type="button"
                onClick={() => onSelectContext(selectedRow, c)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                  isColSelected
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-lg shadow-amber-950/50'
                    : 'text-slate-400 hover:text-amber-200 hover:bg-slate-800/60'
                }`}
                title={`Select Column ${c + 1} (Bob)`}
                aria-label={`Select Column ${c + 1} for Bob`}
              >
                Col {c + 1}
              </button>
            );
          })}
        </div>

        {/* 3x3 Grid Rows */}
        <div className="space-y-2">
          {[0, 1, 2].map((r) => {
            const isRowSelected = selectedRow === r;
            return (
              <div key={`row-${r}`} className="grid grid-cols-4 gap-2 items-center">
                {/* Row Header (Alice's Choice) */}
                <button
                  type="button"
                  onClick={() => onSelectContext(r, selectedCol)}
                  className={`py-3 px-2 rounded-lg text-xs font-bold text-center transition-all ${
                    isRowSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                      : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-800/60'
                  }`}
                  title={`Select Row ${r + 1} (Alice)`}
                  aria-label={`Select Row ${r + 1} for Alice`}
                >
                  Row {r + 1}
                </button>

                {/* 3 Cells in Row r */}
                {[0, 1, 2].map((c) => {
                  const isCrossing = selectedRow === r && selectedCol === c;
                  const inRow = selectedRow === r;
                  const inCol = selectedCol === c;

                  // Active sound playback highlight
                  const isAliceActive =
                    activeStepEvent &&
                    activeStepEvent.aliceRow === r &&
                    activeStepEvent.aliceCol === c;
                  const isBobActive =
                    activeStepEvent &&
                    activeStepEvent.bobRow === r &&
                    activeStepEvent.bobCol === c;
                  const isAudioActive = isAliceActive || isBobActive;

                  // Cell bit values if this context is currently displayed
                  let cellBitText = '';
                  if (inRow && aliceBits) {
                    cellBitText = `A:${aliceBits[c]}`;
                  }
                  if (inCol && bobBits) {
                    cellBitText += cellBitText ? ` | B:${bobBits[r]}` : `B:${bobBits[r]}`;
                  }

                  const noteBase = NOTE_NAMES[r][c];
                  const midi = BASE_MIDI_PITCHES[r][c];

                  return (
                    <button
                      key={`cell-${r}-${c}`}
                      type="button"
                      onClick={() => onSelectContext(r, c)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 text-left min-h-[76px] ${
                        isCrossing
                          ? 'bg-gradient-to-br from-amber-500/30 via-yellow-500/20 to-cyan-500/30 border-yellow-400/80 shadow-lg shadow-yellow-500/20 ring-2 ring-yellow-400/40 z-10 scale-[1.02]'
                          : inRow
                          ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-100 hover:border-cyan-400/60'
                          : inCol
                          ? 'bg-amber-950/30 border-amber-500/40 text-amber-100 hover:border-amber-400/60'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800/80 hover:border-slate-600'
                      } ${
                        isAudioActive
                          ? 'ring-4 ring-emerald-400 shadow-xl shadow-emerald-500/40 animate-pulse'
                          : ''
                      }`}
                      aria-label={`Cell (${r + 1}, ${c + 1}): Observable ${OBSERVABLE_MATRIX[r][c]}`}
                    >
                      {/* Observable formula */}
                      <span className="font-mono text-sm font-bold tracking-tight text-white drop-shadow-sm">
                        {OBSERVABLE_MATRIX[r][c]}
                      </span>

                      {/* Musical pitch info */}
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {noteBase} ({midi})
                      </span>

                      {/* Bit indicators if in context */}
                      {cellBitText && (
                        <span
                          className={`text-[9px] font-mono px-1 py-0.2 rounded mt-1 ${
                            isCrossing
                              ? 'bg-yellow-400/30 text-yellow-200 font-bold'
                              : 'bg-slate-700/60 text-slate-300'
                          }`}
                        >
                          {cellBitText}
                        </span>
                      )}

                      {/* Crossing badge */}
                      {isCrossing && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400"></span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/40 border border-cyan-400"></span>
            <span>Alice (Row)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/40 border border-amber-400"></span>
            <span>Bob (Col)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-yellow-400 border border-yellow-300"></span>
            <span className="font-semibold text-yellow-300">Shared Crossing</span>
          </div>
        </div>
      </div>
    </div>
  );
};
