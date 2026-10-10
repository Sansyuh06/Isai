import React from 'react';
import { VisualStepEvent } from '../audio/synth';
import { NOTE_NAMES } from '../audio/notes';

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
  aliceBits?: [number, number, number] | number[];
  bobBits?: [number, number, number] | number[];
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
      <div className="w-full max-w-md bg-surface rounded-[10px] p-5 border border-hairline shadow-sm">
        {/* Column Headers (Bob's Choices) */}
        <div className="grid grid-cols-4 gap-2 mb-2 items-center text-center">
          <div className="text-[12px] font-semibold text-muted tracking-wider">
            Alice \ Bob
          </div>
          {[0, 1, 2].map((c) => {
            const isColSelected = selectedCol === c;
            return (
              <button
                key={`col-head-${c}`}
                type="button"
                onClick={() => onSelectContext(selectedRow, c)}
                className={`py-1.5 px-2 rounded-[6px] text-[12px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
                  isColSelected
                    ? 'bg-bob/10 text-bob-text border border-bob/20'
                    : 'text-muted hover:text-ink hover:bg-paper border border-transparent'
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
                  className={`py-3 px-2 rounded-[6px] text-[12px] font-semibold text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
                    isRowSelected
                      ? 'bg-alice/10 text-alice-text border border-alice/20'
                      : 'text-muted hover:text-ink hover:bg-paper border border-transparent'
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

                  const isAliceActive = activeStepEvent && activeStepEvent.aliceRow === r && activeStepEvent.aliceCol === c;
                  const isBobActive = activeStepEvent && activeStepEvent.bobRow === r && activeStepEvent.bobCol === c;
                  const isAudioActive = isAliceActive || isBobActive;

                  const noteBase = NOTE_NAMES[r][c];
                  
                  const aliceSharedBit = aliceBits ? aliceBits[c] : undefined;
                  const bobSharedBit = bobBits ? bobBits[r] : undefined;
                  const sharedMatch = aliceSharedBit !== undefined && bobSharedBit !== undefined && aliceSharedBit === bobSharedBit;

                  if (isCrossing) {
                    return (
                      <button
                        key={`cell-${r}-${c}`}
                        type="button"
                        onClick={() => onSelectContext(r, c)}
                        className={`relative overflow-hidden flex flex-col items-center justify-center rounded-[6px] border border-ink min-h-[76px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
                          isAudioActive ? 'opacity-70' : ''
                        }`}
                        aria-label={`Crossing Cell (${r + 1}, ${c + 1}): Observable ${OBSERVABLE_MATRIX[r][c]}, ${sharedMatch ? 'Match' : 'Mismatch'}`}
                      >
                        {/* Split background */}
                        <div className="absolute inset-0 z-0 flex">
                           {sharedMatch ? (
                             <div className="w-full h-full bg-win/20"></div>
                           ) : (
                             <div className="w-full h-full relative">
                                <div className="absolute inset-0 bg-alice/10" style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }}></div>
                                <div className="absolute inset-0 bg-bob/10" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none transform -rotate-45">
                                  <div className="w-[150%] h-[2px] bg-surface"></div>
                                </div>
                             </div>
                           )}
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                          <span className="font-mono text-[16px] font-bold tracking-tight text-ink">
                            {OBSERVABLE_MATRIX[r][c]}
                          </span>
                          <span className="text-[14px] text-ink font-mono mt-1 font-bold">
                            {sharedMatch ? '=' : '≠'}
                          </span>
                        </div>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={`cell-${r}-${c}`}
                      type="button"
                      onClick={() => onSelectContext(r, c)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-[6px] border transition-all duration-150 min-h-[76px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
                        inRow
                          ? 'bg-alice/5 border-alice/20 hover:border-alice/30'
                          : inCol
                          ? 'bg-bob/5 border-bob/20 hover:border-bob/30'
                          : 'bg-surface border-hairline hover:bg-paper'
                      } ${
                        isAudioActive ? 'bg-win/10 border-win/30' : ''
                      }`}
                      aria-label={`Cell (${r + 1}, ${c + 1}): Observable ${OBSERVABLE_MATRIX[r][c]}`}
                    >
                      <span className="font-mono text-[16px] font-bold tracking-tight text-ink">
                        {OBSERVABLE_MATRIX[r][c]}
                      </span>
                      <span className="text-[12px] text-muted font-mono mt-1">
                        {noteBase}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 pt-4 border-t border-hairline flex items-center justify-between text-[12px] text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[2px] bg-alice/10 border border-alice/20"></span>
            <span>Alice</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[2px] bg-bob/10 border border-bob/20"></span>
            <span>Bob</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 border border-ink flex items-center justify-center overflow-hidden relative">
               <div className="absolute inset-0 bg-alice/10" style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }}></div>
               <div className="absolute inset-0 bg-bob/10" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
            </span>
            <span className="font-medium text-ink">Shared cell</span>
          </div>
        </div>
      </div>
    </div>
  );
};
