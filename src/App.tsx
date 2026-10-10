import React, { useState, useRef } from 'react';
import { MerminPeresDataset, SourceType } from './types/data';
import defaultAerDataset from './data/defaultAerData.json';
import { validateDatasetJson } from './utils/validator';
import { audioEngine, VisualStepEvent } from './audio/synth';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { GuidedRound } from './components/GuidedRound';
import { ActiveCircuit } from './components/ActiveCircuit';
import { ClassicalPuzzle } from './components/ClassicalPuzzle';
import { Act2Entangle } from './components/Act2Entangle';
import { Act3Corrupt } from './components/Act3Corrupt';
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
  const [activeTab, setActiveTab] = useState<string>('act1');
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [targetAct, setTargetAct] = useState<'act1' | 'act2' | null>(null);
  const [tutorialSessionKey, setTutorialSessionKey] = useState<number>(0);

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
        onGoHome={() => {
          setView('landing');
          setTargetAct(null);
        }}
        activeTab={view === 'landing' ? 'landing' : activeTab}
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

      {view === 'landing' ? (
        <Hero 
          dataset={currentDataset}
          onHearDuet={() => {
            setTargetAct('act2');
            setTutorialSessionKey((k) => k + 1);
            setView('app');
            setActiveTab('tutorial');
          }}
          onTour={() => {
            setTargetAct(null);
            setTutorialSessionKey((k) => k + 1);
            setView('app');
            setActiveTab('tutorial');
          }}
          onBeatClassical={() => {
            setTargetAct('act1');
            setTutorialSessionKey((k) => k + 1);
            setView('app');
            setActiveTab('tutorial');
          }}
        />
      ) : (
        <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-up">
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            if (val === 'tutorial') {
              setTutorialSessionKey((k) => k + 1);
              setTargetAct(null);
            }
            setActiveTab(val);
          }}
          className="w-full"
        >
          <TabsList className="mb-6 bg-surface border border-hairline flex flex-wrap h-auto">
            <TabsTrigger value="act1">Act 1: Break it</TabsTrigger>
            <TabsTrigger value="act2">Act 2: Entangle it</TabsTrigger>
            <TabsTrigger value="act3">Act 3: Corrupt it</TabsTrigger>
            <TabsTrigger value="tutorial">Why does this happen?</TabsTrigger>
            <TabsTrigger value="results">Data & Provenance</TabsTrigger>
          </TabsList>

          <TabsContent value="act1">
            <ClassicalPuzzle />
          </TabsContent>

          <TabsContent value="act2">
            <Act2Entangle />
          </TabsContent>

          <TabsContent value="act3">
            <Act3Corrupt ibmDataset={ibmData} />
          </TabsContent>

          <TabsContent value="tutorial" className="space-y-6">
            {currentSource === 'ibm_hardware' && ibmData === null && (
              <div className="bg-surface border border-hairline rounded-[10px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-surface to-surface shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-[4px] bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold tracking-wider uppercase border border-amber-500/30">
                    SIMULATION FALLBACK
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-ink">
                      No recorded IBM hardware run loaded.
                    </p>
                    <p className="text-[12px] text-muted">
                      Tutorial is running on verified Qiskit Aer simulator data.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentSource('qiskit_aer')}
                    className="text-[12px] px-3 py-1.5 rounded-full bg-surface border border-hairline hover:bg-hairline/50 text-ink font-medium transition-colors"
                  >
                    Switch to Aer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                      fileInput?.click();
                    }}
                    className="text-[12px] px-3 py-1.5 rounded-full bg-ink text-paper hover:scale-105 font-bold transition-transform"
                  >
                    Import IBM JSON
                  </button>
                </div>
              </div>
            )}

            <GuidedRound
              key={tutorialSessionKey}
              dataset={currentSource === 'ibm_hardware' && ibmData === null ? aerData : (currentDataset || aerData)}
              isFallbackAer={currentSource === 'ibm_hardware' && ibmData === null}
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
              targetAct={targetAct}
              onContinueToAct={(act) => {
                setActiveTab(act);
                setTargetAct(null);
              }}
            />
            
            <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <ActiveCircuit row={selectedRow} col={selectedCol} />
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-8">
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
            ) : null}
            <SourcesPanel dataset={currentDataset} />
          </TabsContent>
        </Tabs>
      </main>
      )}

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
