import React from 'react';
import { ContextData } from '../types/data';
import { OBSERVABLE_MATRIX } from './MagicGrid';

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
    <div className="bg-surface border border-hairline rounded-[10px] p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-[16px] font-bold text-ink">Measurement Summary</h3>
        <p className="text-[12px] text-muted mt-1">
          Recorded outcomes across all nine Alice row and Bob column input combinations.
        </p>
      </div>

      <div className="overflow-x-auto border border-hairline rounded-[6px]">
        <table className="w-full text-[12px] text-left border-collapse font-mono">
          <thead>
            <tr className="bg-paper text-muted border-b border-hairline">
              <th className="p-3 font-semibold">Context</th>
              <th className="p-3 font-semibold">Observable</th>
              <th className="p-3 font-semibold text-right">Wins / Shots</th>
              <th className="p-3 font-semibold text-right">Win Rate</th>
              <th className="p-3 font-semibold text-right">95% CI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline bg-surface">
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
                      ? 'bg-paper text-ink font-bold border-l-2 border-ink'
                      : 'hover:bg-paper text-ink border-l-2 border-transparent'
                  }`}
                >
                  <td className="p-3">
                    R{ctx.row + 1} × C{ctx.column + 1}
                  </td>
                  <td className="p-3 font-bold">{obs}</td>
                  <td className="p-3 text-right">
                    {ctx.wins} / {ctx.shots}
                  </td>
                  <td className="p-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-[4px] font-bold border ${
                        ctx.win_rate >= 0.889
                          ? 'bg-win/10 text-win border-win/20'
                          : 'bg-loss/10 text-loss border-loss/20'
                      }`}
                    >
                      {(ctx.win_rate * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-3 text-right text-muted">
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
