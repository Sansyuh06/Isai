import React from 'react';

interface Props {
  row: number;
  col: number;
}

export const ActiveCircuit: React.FC<Props> = ({ row, col }) => {
  // SVG Coordinate System:
  // viewBox="0 0 620 280"
  // Wires y:
  // A0 (Row 0): 40
  // A1 (Row 1): 95
  // B0 (Row 2): 150
  // B1 (Row 3): 205
  // Labels: x=10..30
  // Wire lines: x=40..600
  //
  // Columns x:
  // Step 1: H on A0 -> x=70
  // Step 2: CX A0->B0 -> x=125 (ctrl y=40, tgt y=150)
  // Step 3: H on A1 -> x=180
  // Step 4: CX A1->B1 -> x=235 (ctrl y=95, tgt y=205)
  //
  // Basis Change Columns:
  // col 1: x=310
  // col 2: x=365
  // col 3: x=420
  //
  // Measurement:
  // x=520 (on all 4 wires)

  const yA0 = 40;
  const yA1 = 95;
  const yB0 = 150;
  const yB1 = 205;

  return (
    <div className="bg-paper border border-hairline rounded-[10px] p-4 sm:p-5 shadow-sm w-full">
      <div className="mb-2">
        <h3 className="text-[15px] font-bold text-ink">Active Quantum Circuit</h3>
        <p className="text-[12px] text-muted">
          Exact Qiskit circuit evaluated for Row {row + 1}, Col {col + 1}
        </p>
      </div>

      <div className="w-full flex items-center justify-center">
        <svg
          viewBox="0 0 600 270"
          className="w-full h-auto select-none font-mono"
          style={{ maxHeight: '270px' }}
        >
          {/* Section Divider Background Bands */}
          <rect x="50" y="15" width="225" height="215" rx="6" fill="var(--color-surface)" opacity="0.3" />
          <rect x="285" y="15" width="180" height="215" rx="6" fill="var(--color-surface)" opacity="0.4" />
          <rect x="475" y="15" width="115" height="215" rx="6" fill="var(--color-surface)" opacity="0.3" />

          {/* Section Separators */}
          <line x1="280" y1="20" x2="280" y2="230" stroke="var(--color-hairline)" strokeDasharray="3 3" />
          <line x1="470" y1="20" x2="470" y2="230" stroke="var(--color-hairline)" strokeDasharray="3 3" />

          {/* Section Footers */}
          <text x="162" y="252" fontSize="10" fill="var(--color-muted)" fontWeight="bold" textAnchor="middle" letterSpacing="0.05em">
            ENTANGLEMENT PREP
          </text>
          <text x="375" y="252" fontSize="10" fill="var(--color-muted)" fontWeight="bold" textAnchor="middle" letterSpacing="0.05em">
            BASIS ROTATIONS
          </text>
          <text x="532" y="252" fontSize="10" fill="var(--color-muted)" fontWeight="bold" textAnchor="middle" letterSpacing="0.05em">
            MEASURE
          </text>

          {/* Qubit Horizontal Wire Lines */}
          <line x1="45" y1={yA0} x2="575" y2={yA0} stroke="var(--color-hairline)" strokeWidth="2" />
          <line x1="45" y1={yA1} x2="575" y2={yA1} stroke="var(--color-hairline)" strokeWidth="2" />
          <line x1="45" y1={yB0} x2="575" y2={yB0} stroke="var(--color-hairline)" strokeWidth="2" />
          <line x1="45" y1={yB1} x2="575" y2={yB1} stroke="var(--color-hairline)" strokeWidth="2" />

          {/* Wire Labels */}
          <text x="18" y={yA0 + 4} fontSize="12" fontWeight="bold" fill="var(--color-alice-text)">A0</text>
          <text x="18" y={yA1 + 4} fontSize="12" fontWeight="bold" fill="var(--color-alice-text)">A1</text>
          <text x="18" y={yB0 + 4} fontSize="12" fontWeight="bold" fill="var(--color-bob-text)">B0</text>
          <text x="18" y={yB1 + 4} fontSize="12" fontWeight="bold" fill="var(--color-bob-text)">B1</text>

          {/* ============================================================ */}
          {/* STAGE 1: ENTANGLEMENT PREP (Bell Pairs: A0-B0 and A1-B1) */}
          {/* ============================================================ */}
          {/* H on A0 (x=75) */}
          <rect x="61" y={yA0 - 14} width="28" height="28" rx="4" fill="var(--color-alice)" fillOpacity="0.15" stroke="var(--color-alice)" strokeWidth="1.5" />
          <text x="75" y={yA0 + 5} fontSize="12" fontWeight="bold" fill="var(--color-alice-text)" textAnchor="middle">H</text>

          {/* CX A0 -> B0 (x=125) */}
          <line x1="125" y1={yA0} x2="125" y2={yB0} stroke="var(--color-ink)" strokeWidth="2" />
          <circle cx="125" cy={yA0} r="4" fill="var(--color-ink)" />
          <circle cx="125" cy={yB0} r="9" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2" />
          <line x1="116" y1={yB0} x2="134" y2={yB0} stroke="var(--color-ink)" strokeWidth="2" />
          <line x1="125" y1={yB0 - 9} x2="125" y2={yB0 + 9} stroke="var(--color-ink)" strokeWidth="2" />

          {/* H on A1 (x=175) */}
          <rect x="161" y={yA1 - 14} width="28" height="28" rx="4" fill="var(--color-alice)" fillOpacity="0.15" stroke="var(--color-alice)" strokeWidth="1.5" />
          <text x="175" y={yA1 + 5} fontSize="12" fontWeight="bold" fill="var(--color-alice-text)" textAnchor="middle">H</text>

          {/* CX A1 -> B1 (x=225) */}
          <line x1="225" y1={yA1} x2="225" y2={yB1} stroke="var(--color-ink)" strokeWidth="2" />
          <circle cx="225" cy={yA1} r="4" fill="var(--color-ink)" />
          <circle cx="225" cy={yB1} r="9" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2" />
          <line x1="216" y1={yB1} x2="234" y2={yB1} stroke="var(--color-ink)" strokeWidth="2" />
          <line x1="225" y1={yB1 - 9} x2="225" y2={yB1 + 9} stroke="var(--color-ink)" strokeWidth="2" />

          {/* ============================================================ */}
          {/* STAGE 2: BASIS CHANGE (ALICE ROW & BOB COL) */}
          {/* ============================================================ */}

          {/* Alice Basis: Row 0 */}
          {row === 0 && (
            <>
              {/* H on A0 at x=315 */}
              <rect x="301" y={yA0 - 14} width="28" height="28" rx="4" fill="var(--color-alice)" fillOpacity="0.15" stroke="var(--color-alice)" strokeWidth="1.5" />
              <text x="315" y={yA0 + 5} fontSize="12" fontWeight="bold" fill="var(--color-alice-text)" textAnchor="middle">H</text>
              {/* H on A1 at x=315 */}
              <rect x="301" y={yA1 - 14} width="28" height="28" rx="4" fill="var(--color-alice)" fillOpacity="0.15" stroke="var(--color-alice)" strokeWidth="1.5" />
              <text x="315" y={yA1 + 5} fontSize="12" fontWeight="bold" fill="var(--color-alice-text)" textAnchor="middle">H</text>
            </>
          )}

          {/* Alice Basis: Row 1 */}
          {row === 1 && (
            <>
              {/* S† on A0, A1 at x=310 */}
              <rect x="296" y={yA0 - 14} width="28" height="28" rx="4" fill="var(--color-alice)" fillOpacity="0.15" stroke="var(--color-alice)" strokeWidth="1.5" />
              <text x="310" y={yA0 + 5} fontSize="11" fontWeight="bold" fill="var(--color-alice-text)" textAnchor="middle">S†</text>

              <rect x="296" y={yA1 - 14} width="28" height="28" rx="4" fill="var(--color-alice)" fillOpacity="0.15" stroke="var(--color-alice)" strokeWidth="1.5" />
              <text x="310" y={yA1 + 5} fontSize="11" fontWeight="bold" fill="var(--color-alice-text)" textAnchor="middle">S†</text>

              {/* H on A0, A1 at x=355 */}
              <rect x="341" y={yA0 - 14} width="28" height="28" rx="4" fill="var(--color-alice)" fillOpacity="0.15" stroke="var(--color-alice)" strokeWidth="1.5" />
              <text x="355" y={yA0 + 5} fontSize="12" fontWeight="bold" fill="var(--color-alice-text)" textAnchor="middle">H</text>

              <rect x="341" y={yA1 - 14} width="28" height="28" rx="4" fill="var(--color-alice)" fillOpacity="0.15" stroke="var(--color-alice)" strokeWidth="1.5" />
              <text x="355" y={yA1 + 5} fontSize="12" fontWeight="bold" fill="var(--color-alice-text)" textAnchor="middle">H</text>
            </>
          )}

          {/* Alice Basis: Row 2 */}
          {row === 2 && (
            <>
              {/* S on A0 at x=310 */}
              <rect x="296" y={yA0 - 14} width="28" height="28" rx="4" fill="var(--color-alice)" fillOpacity="0.15" stroke="var(--color-alice)" strokeWidth="1.5" />
              <text x="310" y={yA0 + 5} fontSize="12" fontWeight="bold" fill="var(--color-alice-text)" textAnchor="middle">S</text>

              {/* CX A0 -> A1 at x=360 */}
              <line x1="360" y1={yA0} x2="360" y2={yA1} stroke="var(--color-ink)" strokeWidth="2" />
              <circle cx="360" cy={yA0} r="4" fill="var(--color-ink)" />
              <circle cx="360" cy={yA1} r="9" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2" />
              <line x1="351" y1={yA1} x2="369" y2={yA1} stroke="var(--color-ink)" strokeWidth="2" />
              <line x1="360" y1={yA1 - 9} x2="360" y2={yA1 + 9} stroke="var(--color-ink)" strokeWidth="2" />

              {/* H on A0 at x=410 */}
              <rect x="396" y={yA0 - 14} width="28" height="28" rx="4" fill="var(--color-alice)" fillOpacity="0.15" stroke="var(--color-alice)" strokeWidth="1.5" />
              <text x="410" y={yA0 + 5} fontSize="12" fontWeight="bold" fill="var(--color-alice-text)" textAnchor="middle">H</text>
            </>
          )}

          {/* Bob Basis: Col 0 */}
          {col === 0 && (
            <>
              {/* H on B0 at x=310 */}
              <rect x="296" y={yB0 - 14} width="28" height="28" rx="4" fill="var(--color-bob)" fillOpacity="0.15" stroke="var(--color-bob)" strokeWidth="1.5" />
              <text x="310" y={yB0 + 5} fontSize="12" fontWeight="bold" fill="var(--color-bob-text)" textAnchor="middle">H</text>

              {/* S on B1 at x=310 */}
              <rect x="296" y={yB1 - 14} width="28" height="28" rx="4" fill="var(--color-bob)" fillOpacity="0.15" stroke="var(--color-bob)" strokeWidth="1.5" />
              <text x="310" y={yB1 + 5} fontSize="12" fontWeight="bold" fill="var(--color-bob-text)" textAnchor="middle">S</text>

              {/* H on B1 at x=355 */}
              <rect x="341" y={yB1 - 14} width="28" height="28" rx="4" fill="var(--color-bob)" fillOpacity="0.15" stroke="var(--color-bob)" strokeWidth="1.5" />
              <text x="355" y={yB1 + 5} fontSize="12" fontWeight="bold" fill="var(--color-bob-text)" textAnchor="middle">H</text>
            </>
          )}

          {/* Bob Basis: Col 1 */}
          {col === 1 && (
            <>
              {/* S on B0 at x=310 */}
              <rect x="296" y={yB0 - 14} width="28" height="28" rx="4" fill="var(--color-bob)" fillOpacity="0.15" stroke="var(--color-bob)" strokeWidth="1.5" />
              <text x="310" y={yB0 + 5} fontSize="12" fontWeight="bold" fill="var(--color-bob-text)" textAnchor="middle">S</text>

              {/* H on B1 at x=310 */}
              <rect x="296" y={yB1 - 14} width="28" height="28" rx="4" fill="var(--color-bob)" fillOpacity="0.15" stroke="var(--color-bob)" strokeWidth="1.5" />
              <text x="310" y={yB1 + 5} fontSize="12" fontWeight="bold" fill="var(--color-bob-text)" textAnchor="middle">H</text>

              {/* H on B0 at x=355 */}
              <rect x="341" y={yB0 - 14} width="28" height="28" rx="4" fill="var(--color-bob)" fillOpacity="0.15" stroke="var(--color-bob)" strokeWidth="1.5" />
              <text x="355" y={yB0 + 5} fontSize="12" fontWeight="bold" fill="var(--color-bob-text)" textAnchor="middle">H</text>
            </>
          )}

          {/* Bob Basis: Col 2 */}
          {col === 2 && (
            <>
              {/* CX B0 -> B1 at x=320 */}
              <line x1="320" y1={yB0} x2="320" y2={yB1} stroke="var(--color-ink)" strokeWidth="2" />
              <circle cx="320" cy={yB0} r="4" fill="var(--color-ink)" />
              <circle cx="320" cy={yB1} r="9" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2" />
              <line x1="311" y1={yB1} x2="329" y2={yB1} stroke="var(--color-ink)" strokeWidth="2" />
              <line x1="320" y1={yB1 - 9} x2="320" y2={yB1 + 9} stroke="var(--color-ink)" strokeWidth="2" />

              {/* H on B0 at x=370 */}
              <rect x="356" y={yB0 - 14} width="28" height="28" rx="4" fill="var(--color-bob)" fillOpacity="0.15" stroke="var(--color-bob)" strokeWidth="1.5" />
              <text x="370" y={yB0 + 5} fontSize="12" fontWeight="bold" fill="var(--color-bob-text)" textAnchor="middle">H</text>
            </>
          )}

          {/* ============================================================ */}
          {/* STAGE 3: MEASUREMENT METERS (x=525) */}
          {/* ============================================================ */}
          {[
            { y: yA0, color: 'var(--color-alice)' },
            { y: yA1, color: 'var(--color-alice)' },
            { y: yB0, color: 'var(--color-bob)' },
            { y: yB1, color: 'var(--color-bob)' }
          ].map((m, idx) => (
            <g key={`meter-${idx}`} transform={`translate(518, ${m.y - 14})`}>
              <rect width="28" height="28" rx="4" fill={m.color} fillOpacity="0.12" stroke={m.color} strokeWidth="1.5" />
              {/* Dial arc */}
              <path d="M 6 20 A 8 8 0 0 1 22 20" fill="none" stroke={m.color} strokeWidth="1.5" />
              {/* Needle */}
              <line x1="14" y1="20" x2="20" y2="10" stroke={m.color} strokeWidth="1.5" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
