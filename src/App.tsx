import React, { useState, useEffect, useRef } from 'react';
import { MerminPeresDataset, SourceType, ContextData, CountItem } from './types/data';
import defaultAerDataset from './data/defaultAerData.json';
import { validateDatasetJson } from './utils/validator';
import { audioEngine, VisualStepEvent } from './audio/synth';

// Components
import { Header } from './components/Header';
import { MagicGrid } from './components/MagicGrid';
import { AudioControls } from './components/AudioControls';
import { OutcomeView } from './components/OutcomeView';
import { ClassicalComparison } from './components/ClassicalComparison';
import { WinRateChart } from './components/WinRateChart';
import { HistoryTable } from './components/HistoryTable';
import { EmptyHardwareState } from './components/EmptyHardwareState';
import { ExplainerModal } from './components/ExplainerModal';
import { SourcesPanel } from './components/SourcesPanel';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  // Datasets
  const [aerData, setAerData] = useState<MerminPeresDataset>(defaultAerDataset as unknown as MerminPeresDataset);
  const [ibmData, setIbmData] = useState<MerminPeresDataset | null>(null);
  const [currentSource, setCurrentSource] = useState<SourceType>('qiskit_aer');

  // Interactive Selection
  const [selectedRow, setSelectedRow] = useState<number>(0); // 0, 1, 2
  const [selectedCol, setSelectedCol] = useState<number>(0); // 0, 1, 2
  const [sampleIndex, setSampleIndex] = useState<number>(0);

  // Audio Playback State
  const [isPlayingSample, setIsPlayingSample] = useState<boolean>(false);
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [activeStepEvent, setActiveStepEvent] = useState<VisualStepEvent | null>(null);
  const [volume, setVolume] = useState<number>(0.7);
  const [muted, setMuted] = useState<boolean>(false);

  // Modals & Notifications
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Stop flag ref for multi-round playback
  const isCancelledRef = useRef<boolean>(false);

  // Active dataset according to selected source
  const currentDataset = currentSource === 'ibm_hardware' ? ibmData : aerData;

  // Find currently selected context
  const currentContext: ContextData | undefined = currentDataset?.contexts.find(
    (c) => c.row === selectedRow && c.column === selectedCol
  );

  // Current sample count item
  const currentCountItem: CountItem | undefined =
    currentContext && currentContext.counts[sampleIndex]
      ? currentContext.counts[sampleIndex]
      : currentContext?.counts[0];

  // Reset sample index when context changes
  useEffect(() => {
    setSampleIndex(0);
  }, [selectedRow, selectedCol, currentSource]);

  // Handle file import
  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const valResult = validateDatasetJson(parsed);

      if (!valResult.valid || !valResult.dataset) {
        setNotification({
          type: 'error',
          message: `Import rejected: ${valResult.error || 'Invalid dataset format.'}`
        });
        return;
      }

      const imported = valResult.dataset;
      if (imported.source_type === 'ibm_hardware') {
        setIbmData(imported);
        setCurrentSource('ibm_hardware');
        setNotification({
          type: 'success',
          message: `Loaded recorded IBM Hardware run from ${imported.backend_name} (Job: ${imported.ibm_job_id?.slice(0, 8)}...)`
        });
      } else {
        setAerData(imported);
        setCurrentSource('qiskit_aer');
        setNotification({
          type: 'success',
          message: `Loaded verified Aer Simulator run (${imported.backend_name})`
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Failed to parse file: ${err instanceof Error ? err.message : String(err)}`
      });
    }
  };

  // Play single recorded sample
  const handlePlaySample = async () => {
    if (!currentContext || !currentCountItem) return;
    setIsPlayingSample(true);
    isCancelledRef.current = false;

    try {
      await audioEngine.playContextRound(
        currentContext.row,
        currentContext.column,
        currentCountItem.alice_bits,
        currentCountItem.bob_bits,
        (event) => setActiveStepEvent(event)
      );
    } finally {
      setIsPlayingSample(false);
      setActiveStepEvent(null);
    }
  };

  // Play all 9 contexts sequentially (Nine-Bar Duet)
  const handlePlayAll = async () => {
    if (!currentDataset) return;
    setIsPlayingAll(true);
    isCancelledRef.current = false;

    const contexts = currentDataset.contexts;
    try {
      for (let i = 0; i < contexts.length; i++) {
        if (isCancelledRef.current) break;
        const ctx = contexts[i];
        setSelectedRow(ctx.row);
        setSelectedCol(ctx.column);
        const item = ctx.counts[0];

        const finished = await audioEngine.playContextRound(
          ctx.row,
          ctx.column,
          item.alice_bits,
          item.bob_bits,
          (event) => setActiveStepEvent(event)
        );

        if (!finished || isCancelledRef.current) break;
        // Pause between bars
        await new Promise((r) => setTimeout(r, 200));
      }
    } finally {
      setIsPlayingAll(false);
      setActiveStepEvent(null);
    }
  };

  const handleStop = () => {
    isCancelledRef.current = true;
    audioEngine.stopAll();
    setIsPlayingSample(false);
    setIsPlayingAll(false);
    setActiveStepEvent(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header */}
      <Header
        currentSource={currentSource}
        onSelectSource={(src) => setCurrentSource(src)}
        hasHardwareData={ibmData !== null}
        onImportFile={handleImportFile}
        onOpenAbout={() => setIsAboutOpen(true)}
        backendName={currentDataset?.backend_name || 'None'}
        jobId={currentDataset?.ibm_job_id}
      />

      {/* Global Notification Banner */}
      {notification && (
        <div
          className={`px-4 py-2 text-xs flex items-center justify-between border-b ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-200 border-emerald-800'
              : 'bg-rose-950/80 text-rose-200 border-rose-800'
          }`}
          role="alert"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs opacity-75 hover:opacity-100 font-bold px-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* If IBM hardware requested but not loaded -> Show Empty State */}
        {currentSource === 'ibm_hardware' && ibmData === null ? (
          <EmptyHardwareState
            onSwitchToAer={() => setCurrentSource('qiskit_aer')}
            onTriggerImport={() => {
              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
              fileInput?.click();
            }}
          />
        ) : currentContext && currentCountItem ? (
          <>
            {/* Top Row: Magic Grid & Audio Sonification Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: 3x3 Magic Square Interactive Grid */}
              <div className="lg:col-span-5 space-y-4">
                <MagicGrid
                  selectedRow={selectedRow}
                  selectedCol={selectedCol}
                  onSelectContext={(r, c) => {
                    handleStop();
                    setSelectedRow(r);
                    setSelectedCol(c);
                  }}
                  activeStepEvent={activeStepEvent}
                  aliceBits={currentCountItem.alice_bits}
                  bobBits={currentCountItem.bob_bits}
                />
              </div>

              {/* Right Column: Audio Controls & Recorded Outcome Inspector */}
              <div className="lg:col-span-7 space-y-4">
                <AudioControls
                  isPlayingSample={isPlayingSample}
                  isPlayingAll={isPlayingAll}
                  onPlaySample={handlePlaySample}
                  onPlayAll={handlePlayAll}
                  onStop={handleStop}
                  volume={volume}
                  onVolumeChange={(v) => {
                    setVolume(v);
                    audioEngine.setVolume(v);
                  }}
                  muted={muted}
                  onToggleMute={() => {
                    setMuted(!muted);
                    audioEngine.setMuted(!muted);
                  }}
                  activeStepEvent={activeStepEvent}
                />

                <OutcomeView
                  contextData={currentContext}
                  activeSampleIndex={sampleIndex}
                  onSelectSampleIndex={(idx) => setSampleIndex(idx)}
                  currentCountItem={currentCountItem}
                />
              </div>
            </div>

            {/* Classical Baseline Comparison & Parity Contradiction Proof */}
            <ClassicalComparison />

            {/* Measured Win Rate SVG Chart */}
            {currentDataset && (
              <WinRateChart
                contexts={currentDataset.contexts}
                selectedRow={selectedRow}
                selectedCol={selectedCol}
                onSelectContext={(r, c) => {
                  setSelectedRow(r);
                  setSelectedCol(c);
                }}
              />
            )}

            {/* Summary History Table */}
            {currentDataset && (
              <HistoryTable
                contexts={currentDataset.contexts}
                selectedRow={selectedRow}
                selectedCol={selectedCol}
                onSelectContext={(r, c) => {
                  setSelectedRow(r);
                  setSelectedCol(c);
                }}
              />
            )}
          </>
        ) : null}

        {/* Academic References Panel */}
        <SourcesPanel />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>The 8/9 Duet</strong> — Publicly Judgeable Qollab Quantum Hackathon Submission
          </div>
          <div className="flex items-center gap-4">
            <span>Vite + React + Web Audio API</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsAboutOpen(true)}
              className="text-cyan-400 hover:underline"
            >
              Scientific Limitations & About
            </button>
          </div>
        </div>
      </footer>

      {/* About & Limitations Modal */}
      <ExplainerModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
};

export default App;
