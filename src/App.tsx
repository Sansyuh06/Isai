import React, { useState, useRef } from 'react';
import { MerminPeresDataset, SourceType } from './types/data';
import defaultAerDataset from './data/defaultAerData.json';
import { validateDatasetJson } from './utils/validator';
import { audioEngine, VisualStepEvent } from './audio/synth';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Header } from './components/Header';
import { GuidedRound } from './components/GuidedRound';
import { ActiveCircuit } from './components/ActiveCircuit';
import { ClassicalComparison } from './components/ClassicalComparison';
import { WinRateChart } from './components/WinRateChart';
import { HistoryTable } from './components/HistoryTable';
import { EmptyHardwareState } from './components/EmptyHardwareState';
import { ExplainerModal } from './components/ExplainerModal';
import { SourcesPanel } from './components/SourcesPanel';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [aerData, setAerData] = useState<MerminPeresDataset>(defaultAerDataset as unknown as MerminPeresDataset);
  const [ibmData, setIbmData] = useState<MerminPeresDataset | null>(null);
  const [currentSource, setCurrentSource] = useState<SourceType>('qiskit_aer');

  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [selectedCol, setSelectedCol] = useState<number>(0);
  
  const [activeStepEvent, setActiveStepEvent] = useState<VisualStepEvent | null>(null);

  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isCancelledRef = useRef<boolean>(false);

  const currentDataset = currentSource === 'ibm_hardware' ? ibmData : aerData;

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

  const handlePlayAll = async () => {
    if (!currentDataset) return;
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
        await new Promise((r) => setTimeout(r, 200));
      }
    } finally {
      setActiveStepEvent(null);
    }
  };

  const handleStop = () => {
    isCancelledRef.current = true;
    audioEngine.stopAll();
    setActiveStepEvent(null);
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans selection:bg-alice selection:text-surface">
      <Header
        currentSource={currentSource}
        onSelectSource={(src) => setCurrentSource(src)}
        hasHardwareData={ibmData !== null}
        onImportFile={handleImportFile}
        onOpenAbout={() => setIsAboutOpen(true)}
        backendName={currentDataset?.backend_name || 'None'}
        jobId={currentDataset?.ibm_job_id}
      />

      {notification && (
        <div
          className={`px-4 py-3 text-[14px] flex items-center justify-between border-b ${
            notification.type === 'success'
              ? 'bg-win/10 text-win border-win/20'
              : 'bg-loss/10 text-loss border-loss/20'
          }`}
          role="alert"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-win flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-loss flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-[12px] opacity-75 hover:opacity-100 font-bold px-2"
          >
            ×
          </button>
        </div>
      )}

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Tabs defaultValue="play" className="w-full">
          <TabsList className="mb-6 bg-surface border border-hairline">
            <TabsTrigger value="play">Play</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="classical">Why classical fails</TabsTrigger>
            <TabsTrigger value="sources">Sources and limits</TabsTrigger>
          </TabsList>

          <TabsContent value="play" className="space-y-6">
            {currentSource === 'ibm_hardware' && ibmData === null ? (
              <EmptyHardwareState
                onSwitchToAer={() => setCurrentSource('qiskit_aer')}
                onTriggerImport={() => {
                  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                  fileInput?.click();
                }}
              />
            ) : currentDataset ? (
              <>
                <GuidedRound
                  dataset={currentDataset}
                  audioEngine={audioEngine}
                  activeStepEvent={activeStepEvent}
                  onSetActiveStepEvent={setActiveStepEvent}
                  selectedRow={selectedRow}
                  selectedCol={selectedCol}
                  onSelectContext={(r, c) => {
                    handleStop();
                    setSelectedRow(r);
                    setSelectedCol(c);
                  }}
                  onPlayAll={handlePlayAll}
                />
                
                <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <ActiveCircuit row={selectedRow} col={selectedCol} />
                </div>
              </>
            ) : null}
          </TabsContent>

          <TabsContent value="results" className="space-y-8">
            {currentDataset && (
              <>
                <WinRateChart
                  contexts={currentDataset.contexts}
                  selectedRow={selectedRow}
                  selectedCol={selectedCol}
                  onSelectContext={(r, c) => {
                    setSelectedRow(r);
                    setSelectedCol(c);
                  }}
                />
                <HistoryTable
                  contexts={currentDataset.contexts}
                  selectedRow={selectedRow}
                  selectedCol={selectedCol}
                  onSelectContext={(r, c) => {
                    setSelectedRow(r);
                    setSelectedCol(c);
                  }}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="classical">
            <ClassicalComparison />
          </TabsContent>

          <TabsContent value="sources" className="space-y-6">
            <SourcesPanel dataset={currentDataset} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-hairline bg-surface py-6 text-center text-[14px] text-muted">
        <div className="max-w-[1400px] mx-auto px-4 flex flex-col items-center gap-2">
          <div>
            <strong>The 8/9 Duet</strong> — Publicly Judgeable Qollab Quantum Hackathon Submission
          </div>
          <div>This effort is supported by Qollab & IonQ.</div>
        </div>
      </footer>

      <ExplainerModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
};

export default App;
