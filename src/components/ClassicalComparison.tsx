import React from 'react';
import { evaluateAllBaselineContexts } from '../utils/classicalStrategy';

export const ClassicalComparison: React.FC = () => {
  const baseline = evaluateAllBaselineContexts();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-[20px] font-bold text-ink">Why classical fails</h3>
        <p className="text-[14px] text-muted mt-2 max-w-[75ch] leading-relaxed">
          Optimal classical deterministic local strategies are strictly capped at 8/9 wins. If Alice and Bob used any pre-agreed deterministic classical strategy that always agreed at every crossing, there would have to exist a single 3×3 binary assignment table satisfying the constraints below.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Classical Card */}
        <div className="bg-surface border border-hairline p-5 rounded-[10px] flex flex-col justify-center shadow-sm">
          <span className="text-[12px] font-bold text-muted uppercase tracking-wider mb-2">Classical Ceiling</span>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold font-mono text-ink">8/9</span>
            <span className="text-[14px] font-medium text-muted">· 88.9%</span>
          </div>
        </div>

        {/* Quantum Card */}
        <div className="bg-surface border border-hairline p-5 rounded-[10px] flex flex-col justify-center shadow-sm">
          <span className="text-[12px] font-bold text-muted uppercase tracking-wider mb-2">Ideal Quantum Strategy</span>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold font-mono text-ink">9/9</span>
            <span className="text-[14px] font-medium text-muted">· 100% (Theoretical)</span>
          </div>
        </div>
      </div>

      {/* The Parity Contradiction Proof Explanation */}
      <div className="bg-surface border border-hairline rounded-[10px] p-6 shadow-sm space-y-6">
        <div>
          <h4 className="font-bold text-[16px] text-ink">The Parity Contradiction</h4>
          <p className="text-[14px] text-muted mt-2 max-w-[75ch] leading-relaxed">
            Because summing all three rows and summing all three columns counts the exact same nine cells, the total sum of all grid entries would have to be simultaneously <strong>even (0 mod 2)</strong> and <strong>odd (1 mod 2)</strong>. This contradiction proves that no classical local hidden variable theory can ever win all 9 contexts.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-paper p-5 rounded-[6px] border border-hairline font-mono text-[14px]">
          <div>
            <span className="text-alice-text font-bold block mb-2">Row Parities (Even):</span>
            Row 1 sum ≡ 0 (mod 2)<br />
            Row 2 sum ≡ 0 (mod 2)<br />
            Row 3 sum ≡ 0 (mod 2)<br />
            <strong className="text-ink mt-2 block pt-2 border-t border-hairline/50">Total Row Sum ≡ 0 (mod 2)</strong>
          </div>
          <div>
            <span className="text-bob-text font-bold block mb-2">Column Parities (Odd):</span>
            Col 1 sum ≡ 1 (mod 2)<br />
            Col 2 sum ≡ 1 (mod 2)<br />
            Col 3 sum ≡ 1 (mod 2)<br />
            <strong className="text-ink mt-2 block pt-2 border-t border-hairline/50">Total Col Sum ≡ 1 (mod 2)</strong>
          </div>
        </div>

        <div className="pt-4 border-t border-hairline">
          <h4 className="font-bold text-[14px] text-ink mb-4">Exhaustive Classical Baseline Table (All 9 Contexts)</h4>
          <div className="overflow-x-auto border border-hairline rounded-[6px]">
            <table className="w-full text-[12px] text-left border-collapse font-mono whitespace-nowrap">
              <thead>
                <tr className="bg-paper text-muted border-b border-hairline">
                  <th className="p-3 font-semibold">Row</th>
                  <th className="p-3 font-semibold">Col</th>
                  <th className="p-3 font-semibold text-alice-text">Alice Bits</th>
                  <th className="p-3 font-semibold text-bob-text">Bob Bits</th>
                  <th className="p-3 font-semibold">Crossing (A vs B)</th>
                  <th className="p-3 font-semibold">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline bg-surface">
                {baseline.results.map((r, i) => (
                  <tr
                    key={`baseline-row-${i}`}
                    className={`hover:bg-paper ${
                      r.win ? 'text-ink' : 'bg-loss/5 text-loss font-semibold'
                    }`}
                  >
                    <td className="p-3">R{r.row + 1}</td>
                    <td className="p-3">C{r.column + 1}</td>
                    <td className="p-3 text-alice-text">[{r.aliceBits.join(' ')}]</td>
                    <td className="p-3 text-bob-text">[{r.bobBits.join(' ')}]</td>
                    <td className="p-3 text-muted">
                      A{r.column + 1}: {r.aliceSharedBit} vs B{r.row + 1}: {r.bobSharedBit}
                    </td>
                    <td className="p-3">
                      {r.win ? (
                        <span className="text-win">Win</span>
                      ) : (
                        <span>Loss (Defect)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
