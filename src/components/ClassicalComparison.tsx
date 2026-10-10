import React, { useState } from 'react';
import { evaluateAllBaselineContexts } from '../utils/classicalStrategy';
import { CheckCircle2, XCircle, ShieldAlert, Award, ChevronDown, ChevronUp } from 'lucide-react';

export const ClassicalComparison: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const baseline = evaluateAllBaselineContexts();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Title & Overview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Classical Baseline vs Quantum Separation</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Optimal classical deterministic local strategies are strictly capped at 8/9 wins (88.89%).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-950/40 border border-amber-500/40 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] text-amber-300 font-semibold block uppercase">Classical Ceiling</span>
            <span className="text-base font-mono font-bold text-amber-200">8 / 9 (88.9%)</span>
          </div>

          <div className="bg-cyan-950/40 border border-cyan-500/40 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] text-cyan-300 font-semibold block uppercase">Quantum Ideal</span>
            <span className="text-base font-mono font-bold text-cyan-200">9 / 9 (100.0%)</span>
          </div>
        </div>
      </div>

      {/* The Parity Contradiction Proof Explanation */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 text-xs text-slate-300 space-y-2.5">
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>The Parity Contradiction Theorem (Mermin–Peres)</span>
        </div>
        <p className="leading-relaxed">
          Why is 9/9 impossible for any local classical system? If Alice and Bob used any pre-agreed deterministic classical strategy that always agreed at every crossing, there would have to exist a single 3×3 binary assignment table satisfying:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/80 p-3 rounded-lg border border-slate-800 font-mono text-[11px]">
          <div>
            <span className="text-cyan-400 font-bold block mb-1">Row Parities (Even):</span>
            Row 1 sum ≡ 0 (mod 2)<br />
            Row 2 sum ≡ 0 (mod 2)<br />
            Row 3 sum ≡ 0 (mod 2)<br />
            <strong className="text-cyan-300">Total Row Sum ≡ 0 (mod 2)</strong>
          </div>
          <div>
            <span className="text-amber-400 font-bold block mb-1">Column Parities (Odd):</span>
            Col 1 sum ≡ 1 (mod 2)<br />
            Col 2 sum ≡ 1 (mod 2)<br />
            Col 3 sum ≡ 1 (mod 2)<br />
            <strong className="text-amber-300">Total Col Sum ≡ 1 (mod 2)</strong>
          </div>
        </div>
        <p className="leading-relaxed">
          Because summing all three rows and summing all three columns counts the exact same nine cells, the total sum of all grid entries would have to be simultaneously <strong>even (0 mod 2)</strong> and <strong>odd (1 mod 2)</strong>. This contradiction proves that no classical local hidden variable theory can ever win all 9 contexts. Quantum pseudo-telepathy breaks this barrier through measurement contextuality and entanglement!
        </p>
      </div>

      {/* Baseline Strategy Inspection Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-300 transition-all"
        >
          <span>Exhaustive Classical Baseline Table (All 9 Contexts)</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse font-mono">
              <thead>
                <tr className="bg-slate-800/80 text-slate-400 border-b border-slate-700">
                  <th className="p-2">Row</th>
                  <th className="p-2">Col</th>
                  <th className="p-2">Alice Bits</th>
                  <th className="p-2">Bob Bits</th>
                  <th className="p-2">Crossing (A_c vs B_r)</th>
                  <th className="p-2">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {baseline.results.map((r, i) => (
                  <tr
                    key={`baseline-row-${i}`}
                    className={`hover:bg-slate-800/40 ${
                      r.win ? 'text-slate-300' : 'bg-rose-950/20 text-rose-300 font-bold'
                    }`}
                  >
                    <td className="p-2">Row {r.row + 1}</td>
                    <td className="p-2">Col {r.column + 1}</td>
                    <td className="p-2 text-cyan-300">[{r.aliceBits.join(', ')}]</td>
                    <td className="p-2 text-amber-300">[{r.bobBits.join(', ')}]</td>
                    <td className="p-2">
                      A[{r.column + 1}]={r.aliceSharedBit} vs B[{r.row + 1}]={r.bobSharedBit}
                    </td>
                    <td className="p-2">
                      {r.win ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Win
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400">
                          <XCircle className="w-3.5 h-3.5" /> Loss (Defect)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
