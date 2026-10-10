import React from 'react';
import { ExternalLink, BookOpen } from 'lucide-react';
import { MerminPeresDataset } from '../types/data';

export const SOURCES = [
  {
    title: 'Extending and Characterizing Quantum Magic Games',
    authors: 'Alex Arkhipov (2012)',
    url: 'https://arxiv.org/abs/1209.3819'
  },
  {
    title: 'Quantum Magic Rectangles',
    authors: 'Sean A. Adamson and Petros Wallden (2020)',
    url: 'https://arxiv.org/abs/2008.02370'
  },
  {
    title: 'Quantum–Classical Separation in Bounded-Resource Tasks',
    authors: 'Shashwat Kumar et al. (2025)',
    url: 'https://arxiv.org/abs/2512.02284'
  },
  {
    title: 'The Sound of Entanglement',
    authors: 'Enar de Dios Rodríguez et al. (2025)',
    url: 'https://arxiv.org/abs/2509.08892'
  }
];

interface Props {
  dataset: MerminPeresDataset | null;
}

export const SourcesPanel: React.FC<Props> = ({ dataset }) => {
  return (
    <div className="space-y-8">
      <div className="bg-surface border border-hairline rounded-[10px] p-5 shadow-sm">
        <h3 className="text-[16px] font-bold text-ink mb-4">Runtime Environment</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-[14px]">
          <div className="flex items-center justify-between py-2 border-b border-hairline">
            <dt className="text-muted font-medium">Backend Name</dt>
            <dd className="font-mono text-ink font-semibold">{dataset?.backend_name || 'N/A'}</dd>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-hairline">
            <dt className="text-muted font-medium">Data Source Type</dt>
            <dd className="font-mono text-ink font-semibold">{dataset?.source_type || 'N/A'}</dd>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-hairline">
            <dt className="text-muted font-medium">Timestamp</dt>
            <dd className="font-mono text-ink font-semibold">{dataset?.timestamp ? new Date(dataset.timestamp).toLocaleDateString() : 'N/A'}</dd>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-hairline">
            <dt className="text-muted font-medium">Total Shots (per context)</dt>
            <dd className="font-mono text-ink font-semibold">
              {dataset?.contexts[0]?.shots || 'N/A'}
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-surface border border-hairline rounded-[10px] p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <BookOpen className="w-5 h-5 text-muted" />
          <h3 className="text-[16px] font-bold text-ink">Academic References</h3>
        </div>
        
        <ul className="space-y-3">
          {SOURCES.map((src, idx) => (
            <li key={`src-link-${idx}`}>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 py-2 border-b border-hairline hover:bg-paper transition-colors rounded-[4px] px-2 -mx-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                <span className="text-[14px] font-bold text-ink group-hover:text-alice-text transition-colors flex items-center gap-1.5">
                  {src.title}
                  <ExternalLink className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <span className="text-[12px] text-muted">{src.authors}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
