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
  const height = 280;
  const padding = { top: 40, right: 30, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Classical limit: 8/9 = 0.8888...
  const classicalLimit = 8 / 9;
  const classicalY = padding.top + (1 - classicalLimit) * chartHeight;

  // Y-axis ticks from 0.5 to 1.0
  const yTicks = [0.5, 0.6, 0.7, 0.8, classicalLimit, 1.0];

  const colWidth = chartWidth / contexts.length;
  const barWidth = Math.max(16, colWidth * 0.45);

  return (
    <div className="bg-surface border border-hairline rounded-[10px] p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-[16px] font-bold text-ink">Measured Win Rate by Context</h3>
          <p className="text-[12px] text-muted mt-1">
            Plain SVG chart with 95% Wilson score error bars.
          </p>
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
            const isClassical = Math.abs(val - classicalLimit) < 0.005;
            return (
              <g key={`ytick-${val}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={isClassical ? 'currentColor' : 'var(--color-hairline)'}
                  strokeDasharray={isClassical ? '4 3' : '2 2'}
                  strokeWidth={isClassical ? 1.5 : 1}
                  className={isClassical ? 'text-ink' : ''}
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--color-muted)"
                  fontSize="12"
                  fontFamily="var(--font-mono)"
                  fontWeight={isClassical ? 'bold' : 'normal'}
                  className={isClassical ? 'fill-ink' : ''}
                >
                  {isClassical ? '8/9' : `${Math.round(val * 100)}%`}
                </text>
              </g>
            );
          })}

          {/* Classical Threshold Text Callout */}
          <text
            x={width - padding.right}
            y={classicalY - 8}
            textAnchor="end"
            fill="var(--color-ink)"
            fontSize="12"
            fontFamily="var(--font-sans)"
            fontWeight="600"
          >
            Classical limit (8/9)
          </text>

          {/* Context Bars and Error Bars */}
          {contexts.map((ctx, idx) => {
            const isSelected = selectedRow === ctx.row && selectedCol === ctx.column;
            const isHovered = hoveredIdx === idx;
            const cx = padding.left + (idx + 0.5) * colWidth;
            const barX = cx - barWidth / 2;

            const winRate = ctx.win_rate;
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
                {/* Highlight outline */}
                {(isSelected || isHovered) && (
                  <rect
                    x={cx - colWidth / 2 + 2}
                    y={padding.top - 20}
                    width={colWidth - 4}
                    height={chartHeight + 20}
                    fill="transparent"
                    stroke={isSelected ? 'var(--color-ink)' : 'var(--color-hairline)'}
                    strokeWidth="1"
                    rx="4"
                  />
                )}

                {/* Main Win Rate Bar */}
                <rect
                  x={barX}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={isSelected ? 'var(--color-ink)' : 'var(--color-muted)'}
                  rx="2"
                  opacity={isSelected || isHovered ? 1.0 : 0.7}
                />

                {/* Wilson CI error bar */}
                {ci && (
                  <g stroke="var(--color-ink)" strokeWidth="1.5" opacity={isSelected || isHovered ? 1 : 0.5}>
                    <line x1={cx} y1={yCiUpper} x2={cx} y2={yCiLower} />
                    {/* Top whisker */}
                    <line x1={cx - 4} y1={yCiUpper} x2={cx + 4} y2={yCiUpper} />
                    {/* Bottom whisker */}
                    <line x1={cx - 4} y1={yCiLower} x2={cx + 4} y2={yCiLower} />
                  </g>
                )}

                {/* X-axis label: (r, c) */}
                <text
                  x={cx}
                  y={height - padding.bottom + 16}
                  textAnchor="middle"
                  fill={isSelected ? 'var(--color-ink)' : 'var(--color-muted)'}
                  fontSize="12"
                  fontFamily="var(--font-mono)"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  R{ctx.row + 1}C{ctx.column + 1}
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
            stroke="var(--color-hairline)"
            strokeWidth="1.5"
          />

          {/* Y Axis line */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="var(--color-hairline)"
            strokeWidth="1.5"
          />

          {/* Axis Labels */}
          <text
            x={width / 2}
            y={height - 10}
            textAnchor="middle"
            fill="var(--color-muted)"
            fontSize="12"
            fontFamily="var(--font-sans)"
          >
            Mermin-Peres Context Pairs (Row r, Column c)
          </text>
        </svg>
      </div>
    </div>
  );
};
