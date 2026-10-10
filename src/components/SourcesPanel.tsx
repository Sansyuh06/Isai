import React, { useState } from 'react';
import { ExternalLink, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

export const SOURCES = [
  {
    title: 'Extending and Characterizing Quantum Magic Games',
    authors: 'Alex Arkhipov (2012)',
    url: 'https://arxiv.org/abs/1209.3819',
    description: 'Foundational framework formalizing quantum pseudo-telepathy graph games and binary constraint systems.'
  },
  {
    title: 'Quantum Magic Rectangles: Characterization and Application to Certified Randomness Expansion',
    authors: 'Sean A. Adamson and Petros Wallden (2020)',
    url: 'https://arxiv.org/abs/2008.02370',
    description: 'Generalization of Mermin-Peres magic squares to rectangular games for device-independent quantum cryptography.'
  },
  {
    title: 'Quantum–Classical Separation in Bounded-Resource Tasks Arising from Measurement Contextuality',
    authors: 'Shashwat Kumar et al. (2025)',
    url: 'https://arxiv.org/abs/2512.02284',
    description: 'Rigorous analysis of contextuality advantages under bounded computational and quantum memory resources.'
  },
  {
    title: 'The Sound of Entanglement',
    authors: 'Enar de Dios Rodríguez et al. (2025)',
    url: 'https://arxiv.org/abs/2509.08892',
    description: 'Acoustic sonification and musical representation of multipartite quantum states and correlations.'
  },
  {
    title: 'Interactive Magic Square Tutorial',
    authors: 'Jan Lahmann et al.',
    url: 'https://github.com/JanLahmann/Fun-with-Quantum/pull/70',
    description: 'Open-source quantum computing educational notebook demonstrating the Mermin-Peres game on Qiskit.'
  },
  {
    title: 'Noisy & Physical Hardware Extension',
    authors: 'Jan Lahmann et al.',
    url: 'https://github.com/JanLahmann/Fun-with-Quantum/pull/103',
    description: 'Experimental evaluation of Magic Square quantum circuits under realistic physical gate errors and decoherence.'
  }
];

export const SourcesPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none"
      >
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-base font-bold text-white">Academic References & Related Works</h3>
            <p className="text-xs text-slate-400">
              Primary literature on pseudo-telepathy, contextuality, and quantum sonification.
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3">
          {SOURCES.map((src, idx) => (
            <a
              key={`src-link-${idx}`}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/50 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {src.title}
                  </h4>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 flex-shrink-0 mt-0.5" />
                </div>
                <div className="text-[11px] text-cyan-400 font-mono mt-0.5">{src.authors}</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{src.description}</p>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-2 truncate">
                {src.url}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
