import React, { useState } from 'react';
import { ContextData } from '../types/data';

interface Props {
  contexts: ContextData[];
  selectedRow: number;
  selectedCol: number;
  onSelectContext: (row: number, col: number) => void;
}

export const WinRateChart: React.FC<Props> = ({
  contexts,
  selectedRow,
  selectedCol,
  onSelectContext
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // SVG dimensions
  const width = 640;
  const height = 260;
  const padding = { top: 30, right: 30, bottom: 50, left: 55 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Classical limit: 8/9 = 0.8888...
  const classicalLimit = 8 / 9;
  const classicalY = padding.top + (1 - classicalLimit) * chartHeight;

  // Y-axis ticks from 0.5 to 1.0
  const yTicks = [0.5, 0.6, 0.7, 0.8, 0.889, 1.0];

  const colWidth = chartWidth / contexts.length;
  const barWidth = Math.max(16, colWidth * 0.45);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-white">Measured Win Rate by Context</h3>
          <p className="text-xs text-slate-400">
            Plain SVG chart with 95% Wilson score error bars vs Classical Bound (8/9 ≈ 88.9%)
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400 border-t border-dashed border-amber-400"></span>
            <span className="text-amber-300">Classical Bound (8/9)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-400"></span>
            <span className="text-cyan-300">Measured QPU/Aer</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px]"
          role="img"
          aria-label="Win rate chart across all 9 Mermin-Peres contexts"
        >
          {/* Grid lines */}
          {yTicks.map((val) => {
            const y = padding.top + (1 - val) * chartHeight;
            const isClassical = Math.abs(val - 0.889) < 0.005;
            return (
              <g key={`ytick-${val}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={isClassical ? '#f59e0b' : '#334155'}
                  strokeDasharray={isClassical ? '4 3' : '2 2'}
                  strokeWidth={isClassical ? 1.5 : 0.8}
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill={isClassical ? '#fbbf24' : '#94a3b8'}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight={isClassical ? 'bold' : 'normal'}
                >
                  {isClassical ? '8/9' : `${Math.round(val * 100)}%`}
                </text>
              </g>
            );
          })}

          {/* Classical Threshold Text Callout */}
          <text
            x={width - padding.right}
            y={classicalY - 6}
            textAnchor="end"
            fill="#fbbf24"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Classical Ceiling: 88.9%
          </text>

          {/* Context Bars and Error Bars */}
          {contexts.map((ctx, idx) => {
            const isSelected = selectedRow === ctx.row && selectedCol === ctx.column;
            const isHovered = hoveredIdx === idx;
            const cx = padding.left + (idx + 0.5) * colWidth;
            const barX = cx - barWidth / 2;

            const winRate = ctx.win_rate;
            // Scale between 0.5 and 1.0 (or 0 and 1)
            const y = padding.top + (1 - winRate) * chartHeight;
            const barHeight = Math.max(2, (height - padding.bottom) - y);

            // CI error bars
            const ci = ctx.confidence_interval_95;
            const ciLower = ci ? ci[0] : winRate;
            const ciUpper = ci ? ci[1] : winRate;
            const yCiLower = padding.top + (1 - ciLower) * chartHeight;
            const yCiUpper = padding.top + (1 - ciUpper) * chartHeight;

            return (
              <g
                key={`bar-group-${idx}`}
                className="cursor-pointer transition-opacity"
                onClick={() => onSelectContext(ctx.row, ctx.column)}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Background hover highlight */}
                <rect
                  x={cx - colWidth / 2}
                  y={padding.top}
                  width={colWidth}
                  height={chartHeight}
                  fill={isSelected ? '#38bdf8' : isHovered ? '#64748b' : 'transparent'}
                  opacity={isSelected ? 0.12 : isHovered ? 0.08 : 0}
                  rx="4"
                />

                {/* Main Win Rate Bar */}
                <rect
                  x={barX}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={isSelected ? '#38bdf8' : '#0ea5e9'}
                  rx="3"
                  opacity={isSelected || isHovered ? 1.0 : 0.85}
                  stroke={isSelected ? '#e0f2fe' : 'none'}
                  strokeWidth="1.5"
                />

                {/* Wilson CI error bar */}
                {ci && (
                  <g stroke="#ffffff" strokeWidth="1.5" opacity="0.8">
                    <line x1={cx} y1={yCiUpper} x2={cx} y2={yCiLower} />
                    {/* Top whisker */}
                    <line x1={cx - 3} y1={yCiUpper} x2={cx + 3} y2={yCiUpper} />
                    {/* Bottom whisker */}
                    <line x1={cx - 3} y1={yCiLower} x2={cx + 3} y2={yCiLower} />
                  </g>
                )}

                {/* X-axis label: (r, c) */}
                <text
                  x={cx}
                  y={height - padding.bottom + 16}
                  textAnchor="middle"
                  fill={isSelected ? '#38bdf8' : '#94a3b8'}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  R{ctx.row + 1}C{ctx.column + 1}
                </text>

                {/* Percentage label above bar */}
                <text
                  x={cx}
                  y={Math.min(y, yCiUpper) - 6}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {(winRate * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* X Axis line */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#475569"
            strokeWidth="1"
          />

          {/* Y Axis line */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="#475569"
            strokeWidth="1"
          />

          {/* Axis Labels */}
          <text
            x={width / 2}
            y={height - 12}
            textAnchor="middle"
            fill="#64748b"
            fontSize="10"
            fontFamily="sans-serif"
          >
            Mermin-Peres Context Pairs (Row r, Column c)
          </text>
        </svg>
      </div>
    </div>
  );
};
