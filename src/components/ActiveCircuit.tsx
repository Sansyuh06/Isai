import React from 'react';

interface Props {
  row: number;
  col: number;
}

export const ActiveCircuit: React.FC<Props> = ({ row, col }) => {
  const renderGate = (label: string, color: 'alice' | 'bob' | 'neutral' = 'neutral') => {
    const bg = color === 'alice' ? 'bg-alice/10 border-alice/40 text-alice-text' 
             : color === 'bob' ? 'bg-bob/10 border-bob/40 text-bob-text' 
             : 'bg-surface border-hairline text-ink';
    return (
      <div className={`flex items-center justify-center w-10 h-10 border rounded-[4px] font-mono text-[12px] font-bold z-10 ${bg}`}>
        {label}
      </div>
    );
  };

  const renderControl = () => (
    <div className="flex items-center justify-center w-10 h-10 z-10">
      <div className="w-3 h-3 rounded-full bg-ink"></div>
    </div>
  );

  const renderTarget = () => (
    <div className="flex items-center justify-center w-10 h-10 z-10">
      <div className="w-6 h-6 rounded-full border-2 border-ink flex items-center justify-center relative">
        <div className="w-full h-[2px] bg-ink absolute"></div>
        <div className="h-full w-[2px] bg-ink absolute"></div>
      </div>
    </div>
  );
  
  const renderMeter = (color: 'alice' | 'bob') => {
    const bg = color === 'alice' ? 'bg-alice/10 border-alice/40 text-alice-text' : 'bg-bob/10 border-bob/40 text-bob-text';
    return (
      <div className={`flex items-center justify-center w-10 h-10 border rounded-[4px] z-10 relative overflow-hidden ${bg}`}>
        <div className="absolute bottom-1 w-6 h-6 border-t-2 border-l-2 border-r-2 rounded-t-full border-current opacity-50"></div>
        <div className="absolute bottom-1 w-4 h-[2px] bg-current origin-bottom-left -rotate-45 mb-1 ml-2"></div>
      </div>
    );
  };



  // Define the stages for each wire based on row/col
  
  // Entanglement stage is same for all:
  // A1 (w0), A2 (w1), B1 (w2), B2 (w3)
  // Step 1: H on A1
  // Step 2: CX A1 -> B1
  // Step 3: H on A2
  // Step 4: CX A2 -> B2
  
  // To make it compact, let's just lay it out absolutely or with CSS Grid.
  // CSS Grid: 4 rows (qubits), N columns (time steps)
  
  return (
    <div className="bg-paper border border-hairline rounded-[10px] p-4 sm:p-6 shadow-sm overflow-x-auto w-full max-w-full">
      <div className="mb-4">
        <h3 className="text-[16px] font-bold text-ink">Active Quantum Circuit</h3>
        <p className="text-[12px] text-muted">Showing the exact Qiskit circuit evaluated for Row {row + 1}, Col {col + 1} (scroll horizontally on mobile)</p>
      </div>

      <div className="relative min-w-[580px] h-[250px] mt-4">
        
        {/* Wires */}
        <div className="absolute top-[20px] left-[40px] right-[20px] h-[2px] bg-hairline"></div>
        <div className="absolute top-[76px] left-[40px] right-[20px] h-[2px] bg-hairline"></div>
        <div className="absolute top-[132px] left-[40px] right-[20px] h-[2px] bg-hairline"></div>
        <div className="absolute top-[188px] left-[40px] right-[20px] h-[2px] bg-hairline"></div>

        {/* Labels */}
        <div className="absolute top-[10px] left-0 text-alice-text text-[12px] font-bold">A1</div>
        <div className="absolute top-[66px] left-0 text-alice-text text-[12px] font-bold">A2</div>
        <div className="absolute top-[122px] left-0 text-bob-text text-[12px] font-bold">B1</div>
        <div className="absolute top-[178px] left-0 text-bob-text text-[12px] font-bold">B2</div>

        {/* Entanglement Prep CNOT Vertical wires */}
        <div className="absolute left-[120px] top-[20px] w-[2px] h-[112px] bg-ink"></div> {/* A1 to B1 */}
        <div className="absolute left-[220px] top-[76px] w-[2px] h-[112px] bg-ink"></div> {/* A2 to B2 */}

        {/* A1 (Row 0) Gates */}
        <div className="absolute top-[0px] left-[50px]">{renderGate('H', 'alice')}</div>
        <div className="absolute top-[0px] left-[100px]">{renderControl()}</div>

        {/* A2 (Row 1) Gates */}
        <div className="absolute top-[56px] left-[150px]">{renderGate('H', 'alice')}</div>
        <div className="absolute top-[56px] left-[200px]">{renderControl()}</div>

        {/* B1 (Row 2) Gates */}
        <div className="absolute top-[112px] left-[100px]">{renderTarget()}</div>

        {/* B2 (Row 3) Gates */}
        <div className="absolute top-[168px] left-[200px]">{renderTarget()}</div>

        {/* BASIS CHANGE SECTION */}
        {/* Alice Basis CNOT vertical wire */}
        {row === 2 && (
          <div className="absolute left-[370px] top-[20px] w-[2px] h-[56px] bg-ink"></div>
        )}
        
        {/* Bob Basis CNOT vertical wire */}
        {col === 2 && (
          <div className="absolute left-[320px] top-[132px] w-[2px] h-[56px] bg-ink"></div>
        )}

        {/* A1 Basis */}
        {row === 0 && <div className="absolute top-[0px] left-[300px]">{renderGate('H', 'alice')}</div>}
        {row === 1 && (
          <>
            <div className="absolute top-[0px] left-[300px]">{renderGate('S†', 'alice')}</div>
            <div className="absolute top-[0px] left-[350px]">{renderGate('H', 'alice')}</div>
          </>
        )}
        {row === 2 && (
          <>
            <div className="absolute top-[0px] left-[300px]">{renderGate('S', 'alice')}</div>
            <div className="absolute top-[0px] left-[350px]">{renderControl()}</div>
            <div className="absolute top-[0px] left-[400px]">{renderGate('H', 'alice')}</div>
          </>
        )}

        {/* A2 Basis */}
        {row === 0 && <div className="absolute top-[56px] left-[300px]">{renderGate('H', 'alice')}</div>}
        {row === 1 && (
          <>
            <div className="absolute top-[56px] left-[300px]">{renderGate('S†', 'alice')}</div>
            <div className="absolute top-[56px] left-[350px]">{renderGate('H', 'alice')}</div>
          </>
        )}
        {row === 2 && <div className="absolute top-[56px] left-[350px]">{renderTarget()}</div>}

        {/* B1 Basis */}
        {col === 0 && <div className="absolute top-[112px] left-[300px]">{renderGate('H', 'bob')}</div>}
        {col === 1 && (
          <>
            <div className="absolute top-[112px] left-[300px]">{renderGate('S', 'bob')}</div>
            <div className="absolute top-[112px] left-[350px]">{renderGate('H', 'bob')}</div>
          </>
        )}
        {col === 2 && (
          <>
            <div className="absolute top-[112px] left-[300px]">{renderControl()}</div>
            <div className="absolute top-[112px] left-[350px]">{renderGate('H', 'bob')}</div>
          </>
        )}

        {/* B2 Basis */}
        {col === 0 && (
          <>
            <div className="absolute top-[168px] left-[300px]">{renderGate('S', 'bob')}</div>
            <div className="absolute top-[168px] left-[350px]">{renderGate('H', 'bob')}</div>
          </>
        )}
        {col === 1 && <div className="absolute top-[168px] left-[300px]">{renderGate('H', 'bob')}</div>}
        {col === 2 && <div className="absolute top-[168px] left-[300px]">{renderTarget()}</div>}

        {/* MEASURE SECTION */}
        <div className="absolute top-[0px] left-[500px]">{renderMeter('alice')}</div>
        <div className="absolute top-[56px] left-[500px]">{renderMeter('alice')}</div>
        <div className="absolute top-[112px] left-[500px]">{renderMeter('bob')}</div>
        <div className="absolute top-[168px] left-[500px]">{renderMeter('bob')}</div>

        {/* Bottom Labels */}
        <div className="absolute top-[225px] left-[100px] text-[10px] uppercase font-bold text-muted tracking-wider text-center w-[150px]">
          Entanglement Prep
        </div>
        <div className="absolute top-[225px] left-[300px] text-[10px] uppercase font-bold text-muted tracking-wider text-center w-[150px] border-l border-hairline">
          Basis Change
        </div>
        <div className="absolute top-[225px] left-[480px] text-[10px] uppercase font-bold text-muted tracking-wider text-center w-[80px] border-l border-hairline">
          Measure
        </div>
      </div>
    </div>
  );
};
