import React, { useState, useEffect } from 'react';
import { MerminPeresDataset, ContextData, CountItem } from '../types/data';
import { MagicGrid } from './MagicGrid';
import { SkipBack, SkipForward, Cpu, Music, CheckCircle2, XCircle } from 'lucide-react';
import { VisualStepEvent } from '../audio/synth';

interface Props {
  dataset: MerminPeresDataset;
  audioEngine: any; // Using any for simplicity here, type is defined in App
  activeStepEvent: VisualStepEvent | null;
  onSetActiveStepEvent: (e: VisualStepEvent | null) => void;
  selectedRow: number;
  selectedCol: number;
  onSelectContext: (r: number, c: number) => void;
  onPlayAll: () => void;
}

export const GuidedRound: React.FC<Props> = ({
  dataset,
  audioEngine,
  activeStepEvent,
  onSetActiveStepEvent,
  selectedRow,
  selectedCol,
  onSelectContext,
  onPlayAll
}) => {
  const [step, setStep] = useState<number>(1);
  const [sampleIndex, setSampleIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const contextData: ContextData | undefined = dataset.contexts.find(
    (c) => c.row === selectedRow && c.column === selectedCol
  );


  const currentCountItem: CountItem | undefined = contextData?.counts[sampleIndex];

  // Whenever context changes, weight-pick a sample
  useEffect(() => {
    if (contextData && contextData.counts.length > 0) {
      // Pick a representative outcome weighted by its count
      const total = contextData.counts.reduce((sum, c) => sum + c.count, 0);
      let rand = Math.random() * total;
      let pickedIdx = 0;
      for (let i = 0; i < contextData.counts.length; i++) {
        rand -= contextData.counts[i].count;
        if (rand <= 0) {
          pickedIdx = i;
          break;
        }
      }
      setSampleIndex(pickedIdx);
    }
  }, [selectedRow, selectedCol, contextData]);

  const handlePlayAudio = async () => {
    if (!contextData || !currentCountItem) return;
    setIsPlaying(true);
    try {
      await audioEngine.playContextRound(
        contextData.row,
        contextData.column,
        currentCountItem.alice_bits,
        currentCountItem.bob_bits,
        (event: VisualStepEvent) => onSetActiveStepEvent(event)
      );
    } finally {
      setIsPlaying(false);
      onSetActiveStepEvent(null);
    }
  };

  const handleNextStep = () => {
    if (step < 6) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isAer = dataset.source_type === 'qiskit_aer';

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-hairline p-4 rounded-[10px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-[18px] font-bold text-ink">Guided Round</h2>
          <div className="text-[12px] text-muted flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-paper border border-hairline font-semibold text-ink">
              {isAer ? <Cpu className="w-3.5 h-3.5 text-muted" /> : <Cpu className="w-3.5 h-3.5 text-alice-text" />}
              {isAer ? 'REPLAYING AER SIMULATOR DATA' : 'RECORDED IBM HARDWARE'}
            </span>
            <span>·</span>
            <span>These are saved results. This page is replaying a result, not submitting a new quantum job.</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Grid */}
        <div className="lg:col-span-5 space-y-4">
          <MagicGrid
            selectedRow={selectedRow}
            selectedCol={selectedCol}
            onSelectContext={(r, c) => {
              onSelectContext(r, c);
              setStep(1); // Reset to step 1 on new prompt
            }}
            activeStepEvent={activeStepEvent}
            aliceBits={step >= 4 ? currentCountItem?.alice_bits : undefined}
            bobBits={step >= 4 ? currentCountItem?.bob_bits : undefined}
          />
        </div>

        {/* Right Column - Step Content */}
        <div className="lg:col-span-7 bg-surface border border-hairline rounded-[10px] p-6 shadow-sm min-h-[450px] flex flex-col">
          
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5, 6].map(s => (
              <div 
                key={s} 
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s === step ? 'bg-ink' : s < step ? 'bg-ink/20' : 'bg-paper'
                }`} 
              />
            ))}
          </div>

          <div className="flex-1 space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-fade-in-up">
                <h3 className="text-[20px] font-bold text-ink">Step 1: The referee deals the prompts</h3>
                <p className="text-[14px] text-muted leading-relaxed">
                  The referee selects one row for Alice and one column for Bob.
                </p>
                <div className="flex justify-center gap-8 py-4">
                  <div className="opacity-0 animate-deal-card flex flex-col items-center" style={{ animationDelay: '100ms' }}>
                    <div className="text-[12px] text-muted uppercase tracking-wider mb-2 font-bold">To Alice</div>
                    <div className="px-6 py-4 bg-alice/10 border-2 border-alice text-alice-text rounded-[8px] text-[20px] font-bold shadow-sm">
                      Row {selectedRow + 1}
                    </div>
                  </div>
                  <div className="opacity-0 animate-deal-card flex flex-col items-center" style={{ animationDelay: '500ms' }}>
                    <div className="text-[12px] text-muted uppercase tracking-wider mb-2 font-bold">To Bob</div>
                    <div className="px-6 py-4 bg-bob/10 border-2 border-bob text-bob-text rounded-[8px] text-[20px] font-bold shadow-sm">
                      Col {selectedCol + 1}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-paper rounded-[6px] border border-hairline space-y-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '900ms' }}>
                  <p className="text-[14px] font-semibold text-ink">Crucial Rule:</p>
                  <p className="text-[14px] text-muted">Alice sees only a row. Bob sees only a column. They do not know what the other was asked.</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in-up">
                <h3 className="text-[20px] font-bold text-ink">Step 2: The shared quantum state</h3>
                <p className="text-[14px] text-muted leading-relaxed">
                  Before the round starts, Alice and Bob share two entangled Bell pairs. The pairs are prepared in advance. The players don't send messages to each other during the game.
                </p>
                
                <div className="flex justify-center py-6">
                  <div className="flex items-center gap-8">
                    <div className="text-center space-y-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-alice/10 border border-alice text-alice-text flex items-center justify-center font-bold text-[12px]">A1</div>
                        <div className="w-8 h-8 rounded-full bg-alice/10 border border-alice text-alice-text flex items-center justify-center font-bold text-[12px]">A2</div>
                      </div>
                      <div className="text-[12px] font-semibold text-muted">Alice</div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1 opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                      <div className="h-px w-24 bg-gradient-to-r from-alice/40 via-muted/40 to-bob/40 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-alice via-muted to-bob opacity-50 animate-gentle-pulse"></div>
                      </div>
                      <div className="h-px w-24 bg-gradient-to-r from-alice/40 via-muted/40 to-bob/40 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-alice via-muted to-bob opacity-50 animate-gentle-pulse" style={{ animationDelay: '1500ms' }}></div>
                      </div>
                      <div className="text-[10px] text-muted uppercase tracking-wider font-bold mt-1">Entangled Correlation</div>
                    </div>

                    <div className="text-center space-y-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-bob/10 border border-bob text-bob-text flex items-center justify-center font-bold text-[12px]">B1</div>
                        <div className="w-8 h-8 rounded-full bg-bob/10 border border-bob text-bob-text flex items-center justify-center font-bold text-[12px]">B2</div>
                      </div>
                      <div className="text-[12px] font-semibold text-muted">Bob</div>
                    </div>
                  </div>
                </div>

                <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '900ms' }}>
                  <details className="text-[12px] text-muted border border-hairline rounded-[6px] p-3 cursor-pointer hover:bg-paper transition-colors group">
                    <summary className="font-semibold text-ink group-open:mb-2">Show preparation circuit (Qiskit)</summary>
                    <pre className="font-mono bg-surface p-2 rounded-[4px] border border-hairline overflow-x-auto text-[11px]">
{`qc = QuantumCircuit(4, 6)
qc.h(0)
qc.cx(0, 2) # Bell pair 1 (A1, B1)
qc.h(1)
qc.cx(1, 3) # Bell pair 2 (A2, B2)`}
                    </pre>
                  </details>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fade-in-up">
                <h3 className="text-[20px] font-bold text-ink">Step 3: Choosing a measurement context</h3>
                <p className="text-[14px] text-muted leading-relaxed">
                  The prompt chooses which compatible measurements each side makes on their half of the entangled pairs.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-paper p-4 rounded-[6px] border border-hairline opacity-0 animate-deal-card" style={{ animationDelay: '100ms' }}>
                    <h4 className="text-[14px] font-bold text-alice-text mb-2">Alice's Context (Row {selectedRow + 1})</h4>
                    <p className="text-[12px] text-muted mb-3">Alice rotates her qubits into the basis required for this row.</p>
                    <div className="font-mono text-[11px] bg-surface p-2 rounded-[4px] border border-hairline text-ink">
                      {selectedRow === 0 && 'H(A1), H(A2)'}
                      {selectedRow === 1 && 'Sdg(A1), H(A1), Sdg(A2), H(A2)'}
                      {selectedRow === 2 && 'S(A1), CX(A1, A2), H(A1)'}
                    </div>
                  </div>
                  <div className="bg-paper p-4 rounded-[6px] border border-hairline opacity-0 animate-deal-card" style={{ animationDelay: '300ms' }}>
                    <h4 className="text-[14px] font-bold text-bob-text mb-2">Bob's Context (Col {selectedCol + 1})</h4>
                    <p className="text-[12px] text-muted mb-3">Bob rotates his qubits into the basis required for this column.</p>
                    <div className="font-mono text-[11px] bg-surface p-2 rounded-[4px] border border-hairline text-ink">
                      {selectedCol === 0 && 'H(B1), S(B2), H(B2)'}
                      {selectedCol === 1 && 'H(B2), S(B1), H(B1)'}
                      {selectedCol === 2 && 'CX(B1, B2), H(B1)'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-fade-in-up">
                <h3 className="text-[20px] font-bold text-ink">Step 4: The measurement outcomes</h3>
                <p className="text-[14px] text-muted leading-relaxed mb-4">
                  Here is a representative outcome pattern from the saved distribution. The third bit in each set is derived locally by the decoder to strictly enforce parity.
                </p>

                <div className="flex flex-col gap-4">
                  {/* Alice Bits */}
                  <div className="flex items-center justify-between p-3 border border-alice/20 bg-alice/5 rounded-[6px]">
                    <div>
                      <div className="text-[12px] font-bold text-alice-text uppercase tracking-wider mb-1">Alice's Answer</div>
                      <div className="font-mono text-[20px] text-ink font-bold tracking-[0.2em] flex gap-1">
                        {[0, 1, 2].map(bitIndex => {
                          const isDerived = (selectedRow === 2 && bitIndex === 0) || (selectedRow !== 2 && bitIndex === 2);
                          const delay = isDerived ? 1000 : (bitIndex * 300 + 200);
                          return (
                            <span 
                              key={`a-${bitIndex}`}
                              className={`inline-flex flex-col items-center opacity-0 animate-reveal-bit ${isDerived ? 'text-alice-text' : ''}`}
                              style={{ animationDelay: `${delay}ms` }}
                            >
                              <span>{currentCountItem?.alice_bits[bitIndex]}</span>
                              {isDerived && <span className="text-[9px] -mt-1 opacity-70 tracking-normal font-sans">derived</span>}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="text-right opacity-0 animate-reveal-bit" style={{ animationDelay: '1400ms' }}>
                      <div className="text-[12px] text-muted font-mono mb-1">Parity check</div>
                      <div className="text-[12px] font-bold text-win flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Even (0 mod 2)
                      </div>
                    </div>
                  </div>

                  {/* Bob Bits */}
                  <div className="flex items-center justify-between p-3 border border-bob/20 bg-bob/5 rounded-[6px]">
                    <div>
                      <div className="text-[12px] font-bold text-bob-text uppercase tracking-wider mb-1">Bob's Answer</div>
                      <div className="font-mono text-[20px] text-ink font-bold tracking-[0.2em] flex gap-1">
                        {[0, 1, 2].map(bitIndex => {
                          const isDerived = (selectedCol === 2 && bitIndex === 1) || (selectedCol !== 2 && bitIndex === 2);
                          const delay = isDerived ? 1000 : (bitIndex * 300 + 200);
                          return (
                            <span 
                              key={`b-${bitIndex}`}
                              className={`inline-flex flex-col items-center opacity-0 animate-reveal-bit ${isDerived ? 'text-bob-text' : ''}`}
                              style={{ animationDelay: `${delay}ms` }}
                            >
                              <span>{currentCountItem?.bob_bits[bitIndex]}</span>
                              {isDerived && <span className="text-[9px] -mt-1 opacity-70 tracking-normal font-sans">derived</span>}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="text-right opacity-0 animate-reveal-bit" style={{ animationDelay: '1400ms' }}>
                      <div className="text-[12px] text-muted font-mono mb-1">Parity check</div>
                      <div className="text-[12px] font-bold text-win flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Odd (1 mod 2)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[12px] text-muted bg-paper p-3 rounded-[6px] border border-hairline mt-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '1800ms' }}>
                  <strong>Note:</strong> The parity pass is a mathematical construction, not an independently measured hardware check.
                </div>
                
                <div className="text-[12px] font-semibold text-ink bg-surface border border-hairline p-2 rounded-[4px] text-center shadow-sm opacity-0 animate-fade-in-up" style={{ animationDelay: '1800ms' }}>
                  Outcome pattern: {currentCountItem?.count} occurrences in {contextData?.shots} shots.
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <h3 className="text-[20px] font-bold text-ink">Step 5: Check the crossing cell</h3>
                <p className="text-[14px] text-muted leading-relaxed">
                  The shared-cell agreement is the noise-sensitive comparison. Let's see if Alice and Bob gave the same answer for the crossing cell.
                </p>

                <div className="flex justify-center py-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-[12px] font-bold text-alice-text uppercase tracking-wider mb-2">Alice</div>
                      <div className="w-16 h-16 rounded-[8px] bg-alice/10 border-2 border-alice text-[24px] font-bold font-mono text-alice-text flex items-center justify-center">
                        {currentCountItem?.alice_bits[selectedCol]}
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[12px] text-muted font-mono mb-1">Match?</span>
                      {currentCountItem?.alice_bits[selectedCol] === currentCountItem?.bob_bits[selectedRow] ? (
                        <div className="bg-win/10 text-win px-3 py-1 rounded-full font-bold text-[14px] border border-win/20 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> YES
                        </div>
                      ) : (
                        <div className="bg-loss/10 text-loss px-3 py-1 rounded-full font-bold text-[14px] border border-loss/20 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> NO
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <div className="text-[12px] font-bold text-bob-text uppercase tracking-wider mb-2">Bob</div>
                      <div className="w-16 h-16 rounded-[8px] bg-bob/10 border-2 border-bob text-[24px] font-bold font-mono text-bob-text flex items-center justify-center">
                        {currentCountItem?.bob_bits[selectedRow]}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <h3 className="text-[20px] font-bold text-ink">Step 6: Hear the duet</h3>
                <p className="text-[14px] text-muted leading-relaxed">
                  Alice’s phrase plays from the left, Bob’s from the right. Matching bits at the crossing cell sound in unison. Differing bits create a dissonant semitone clash.
                </p>

                <div className="flex flex-col items-center justify-center py-6 space-y-6">
                  <button
                    type="button"
                    onClick={handlePlayAudio}
                    disabled={isPlaying}
                    className="flex items-center gap-2 px-6 py-3 bg-ink text-paper rounded-full font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
                  >
                    <Music className="w-5 h-5" />
                    {isPlaying ? 'Playing...' : 'Play Audio'}
                  </button>

                  <div className="w-full max-w-sm flex items-center justify-between text-[12px] font-semibold text-muted px-4">
                    <span>Alice (Left)</span>
                    <span>Bob (Right)</span>
                  </div>
                </div>

                <div className="border-t border-hairline pt-6 flex gap-4 justify-between">
                  <div className="space-y-1">
                     <p className="text-[14px] font-bold text-ink">Next Steps</p>
                     <p className="text-[12px] text-muted">Play all rounds or check the Results tab for aggregate stats.</p>
                  </div>
                  <button
                    type="button"
                    onClick={onPlayAll}
                    className="px-6 py-2 bg-surface border border-hairline text-ink rounded-full text-[14px] font-bold hover:bg-hairline/50 transition-colors"
                  >
                    Play all 9 rounds
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Nav */}
          <div className="flex items-center justify-between pt-6 mt-4 border-t border-hairline">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={step === 1}
              className="flex items-center gap-1 text-[14px] font-bold text-muted hover:text-ink disabled:opacity-30 disabled:hover:text-muted transition-colors"
            >
              <SkipBack className="w-4 h-4" /> Back
            </button>
            <div className="text-[12px] font-bold text-muted font-mono">
              Step {step} of 6
            </div>
            <button
              type="button"
              onClick={handleNextStep}
              disabled={step === 6}
              className="flex items-center gap-1 text-[14px] font-bold text-ink hover:text-ink/70 disabled:opacity-30 disabled:hover:text-ink transition-colors"
            >
              Next <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
