import React from 'react';
import { ContextData } from '../types/data';
import { OBSERVABLE_MATRIX } from './MagicGrid';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  contexts: ContextData[];
  selectedRow: number;
  selectedCol: number;
  onSelectContext: (row: number, col: number) => void;
}

export const HistoryTable: React.FC<Props> = ({
  contexts,
  selectedRow,
  selectedCol,
  onSelectContext
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      <div className="mb-4">
        <h3 className="text-base font-bold text-white">All 9 Context Measurement Summary</h3>
        <p className="text-xs text-slate-400">
          Recorded outcomes across all nine Alice row and Bob column input combinations.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse font-mono">
          <thead>
            <tr className="bg-slate-800/80 text-slate-400 border-b border-slate-700">
              <th className="p-2.5">Context</th>
              <th className="p-2.5">Crossing Cell</th>
              <th className="p-2.5">Observable</th>
              <th className="p-2.5">Parity Valid</th>
              <th className="p-2.5">Shared Match</th>
              <th className="p-2.5">Wins / Shots</th>
              <th className="p-2.5">Win Rate</th>
              <th className="p-2.5">95% Wilson CI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {contexts.map((ctx, idx) => {
              const isSelected = selectedRow === ctx.row && selectedCol === ctx.column;
              const obs = OBSERVABLE_MATRIX[ctx.row][ctx.column];
              const ci = ctx.confidence_interval_95;

              return (
                <tr
                  key={`ctx-row-${idx}`}
                  onClick={() => onSelectContext(ctx.row, ctx.column)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-cyan-950/40 text-cyan-200 font-bold border-l-4 border-cyan-400'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <td className="p-2.5">
                    Row {ctx.row + 1} × Col {ctx.column + 1}
                  </td>
                  <td className="p-2.5">
                    ({ctx.row + 1}, {ctx.column + 1})
                  </td>
                  <td className="p-2.5 text-yellow-300 font-bold">{obs}</td>
                  <td className="p-2.5 text-emerald-400">
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {ctx.alice_parity_valid_count} / {ctx.shots}
                    </span>
                  </td>
                  <td className="p-2.5 text-cyan-300">
                    {ctx.shared_cell_match_count} / {ctx.shots}
                  </td>
                  <td className="p-2.5">
                    {ctx.wins} / {ctx.shots}
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        ctx.win_rate >= 0.889
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {(ctx.win_rate * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-400 text-[11px]">
                    {ci ? `[${(ci[0] * 100).toFixed(1)}%, ${(ci[1] * 100).toFixed(1)}%]` : 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
