import React, { useState } from 'react';
import { VisualStepEvent } from '../audio/synth';
import { NOTE_NAMES } from '../audio/notes';

export const OBSERVABLE_MATRIX = [
  ['-I⊗X', '-X⊗I', 'X⊗X'],
  ['Y⊗I',  'I⊗Y',  'Y⊗Y'],
  ['Y⊗X',  'X⊗Y',  'Z⊗Z']
];

interface Props {
  selectedRow: number;
  selectedCol: number;
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
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);

  return (
    <div className="flex flex-col items-center w-full max-w-[600px] mx-auto">
      {/* 4x4 Grid including headers */}
      <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-3 w-full">
        
        {/* Top-left empty space */}
        <div className="w-[80px]"></div>

        {/* Column Headers (Bob) */}
        {[0, 1, 2].map(c => {
          const isColSelected = selectedCol === c;
          return (
            <button
              key={`col-${c}`}
              onClick={() => onSelectContext(selectedRow, c)}
              className={`group relative flex flex-col items-center py-3 rounded-[12px] font-bold text-[14px] transition-all
                ${isColSelected ? 'bg-bob/15 text-bob-text shadow-[0_0_15px_rgba(232,176,74,0.15)]' : 'text-muted hover:text-ink hover:bg-surface/50'}
              `}
            >
              Col {c + 1}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] uppercase tracking-widest text-bob-text bg-bob/10 px-2 py-1 rounded">
                Bob sees this
              </div>
            </button>
          );
        })}

        {/* Rows */}
        {[0, 1, 2].map(r => {
          const isRowSelected = selectedRow === r;
          
          return (
            <React.Fragment key={`row-${r}`}>
              {/* Row Header (Alice) */}
              <button
                onClick={() => onSelectContext(r, selectedCol)}
                className={`group relative flex items-center justify-center h-full min-h-[96px] rounded-[12px] font-bold text-[14px] transition-all
                  ${isRowSelected ? 'bg-alice/15 text-alice-text shadow-[0_0_15px_rgba(111,144,255,0.15)]' : 'text-muted hover:text-ink hover:bg-surface/50'}
                `}
              >
                Row {r + 1}
                <div className="absolute -left-28 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] uppercase tracking-widest text-alice-text bg-alice/10 px-2 py-1 rounded">
                  Alice sees this
                </div>
              </button>

              {/* Grid Cells */}
              {[0, 1, 2].map(c => {
                const isCrossing = selectedRow === r && selectedCol === c;
                const inRow = selectedRow === r;
                const inCol = selectedCol === c;
                
                const isAliceActive = activeStepEvent && activeStepEvent.aliceRow === r && activeStepEvent.aliceCol === c;
                const isBobActive = activeStepEvent && activeStepEvent.bobRow === r && activeStepEvent.bobCol === c;
                
                const noteBase = NOTE_NAMES[r][c];
                const observable = OBSERVABLE_MATRIX[r][c];
                
                const aliceSharedBit = aliceBits ? aliceBits[c] : undefined;
                const bobSharedBit = bobBits ? bobBits[r] : undefined;
                const matchState = (aliceSharedBit !== undefined && bobSharedBit !== undefined) 
                  ? (aliceSharedBit === bobSharedBit ? 'match' : 'mismatch') 
                  : null;

                // Beam styles
                let cellStyle = "glass-card hover:bg-surface/50 transition-all duration-300 relative overflow-hidden ";
                
                if (isCrossing) {
                  // Crossing cell styling
                  if (matchState === 'match' && activeStepEvent?.isShared) {
                    cellStyle += "bg-win text-paper shadow-[0_0_30px_rgba(91,227,168,0.5)] scale-110 z-20 border-transparent ";
                  } else if (matchState === 'mismatch' && activeStepEvent?.isShared) {
                    cellStyle += "bg-loss text-paper shadow-[0_0_30px_rgba(255,92,108,0.5)] scale-110 z-20 border-transparent animate-[shake_0.5s_cubic-bezier(.36,.07,.19,.97)_both] ";
                  } else {
                    // Split diagonal gradient when waiting
                    cellStyle += "bg-gradient-to-br from-alice/20 via-surface to-bob/20 border-ink/30 z-10 ";
                  }
                } else if (inRow) {
                  cellStyle += "bg-alice/5 border-alice/10 ";
                  if (isAliceActive) cellStyle += "bg-alice/40 shadow-[0_0_20px_rgba(111,144,255,0.4)] scale-105 z-20 ";
                } else if (inCol) {
                  cellStyle += "bg-bob/5 border-bob/10 ";
                  if (isBobActive) cellStyle += "bg-bob/40 shadow-[0_0_20px_rgba(232,176,74,0.4)] scale-105 z-20 ";
                } else {
                  cellStyle += "opacity-50 hover:opacity-100 ";
                }

                return (
                  <button
                    key={`cell-${r}-${c}`}
                    onClick={() => onSelectContext(r, c)}
                    onMouseEnter={() => setHoveredCell({ r, c })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`flex flex-col items-center justify-center min-h-[96px] rounded-[16px] outline-none focus-visible:ring-2 focus-visible:ring-ink ${cellStyle}`}
                  >
                    {/* Ripple effect on active */}
                    {(isAliceActive || isBobActive || activeStepEvent?.isShared && isCrossing) && (
                      <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-current"></span>
                    )}

                    {/* Crossing Content */}
                    {isCrossing && matchState && activeStepEvent?.step === 3 ? (
                      <div className="text-[40px] font-bold leading-none font-sans mix-blend-plus-lighter">
                        {matchState === 'match' ? '=' : '≠'}
                      </div>
                    ) : (
                      <>
                        <span className={`font-mono text-[18px] font-bold tracking-tight z-10 ${
                          isCrossing ? 'text-ink' : inRow ? 'text-alice-text' : inCol ? 'text-bob-text' : 'text-ink'
                        }`}>
                          {observable}
                        </span>
                        
                        <div className="flex items-center gap-1.5 mt-2 opacity-80 z-10">
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span className="text-[13px] font-mono">{noteBase}</span>
                        </div>
                      </>
                    )}

                    {/* Hover tooltip */}
                    {hoveredCell?.r === r && hoveredCell?.c === c && !isCrossing && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[180px] p-3 bg-surface border border-hairline rounded-[8px] shadow-xl z-50 pointer-events-none animate-fade-in-up">
                        <div className="text-[12px] font-bold mb-1">{observable}</div>
                        <div className="text-[11px] text-muted space-y-1">
                          <div className="flex justify-between"><span>Bit 0 (Even)</span><span className="font-mono">{noteBase}</span></div>
                          <div className="flex justify-between"><span>Bit 1 (Odd)</span><span className="font-mono">{noteBase}♯</span></div>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Legend below the grid */}
      <div className="flex items-center justify-center gap-6 mt-8 text-[12px] font-bold text-muted uppercase tracking-widest w-full">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-alice/30 border border-alice"></span>
          Alice
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-bob/30 border border-bob"></span>
          Bob
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-gradient-to-br from-alice via-surface to-bob border border-ink/20"></span>
          Shared cell
        </div>
      </div>
    </div>
  );
};
