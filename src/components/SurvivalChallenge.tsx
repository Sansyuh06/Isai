import React, { useState } from 'react';
import { 
  PlayCircle, 
  StopCircle, 
  RotateCcw, 
  ShieldCheck, 
  Heart, 
  AlertTriangle 
} from 'lucide-react';
import { 
  generatePromptSequence, 
  runSurvivalChallenge, 
  ChallengeMode, 
  ChallengeRunSummary 
} from '../utils/survival';
import { NullableBitGrid, areAllIndependentBitsSet } from '../utils/classicalStrategy';
import { audioEngine } from '../audio/synth';

interface Props {
  playerAliceGrid: NullableBitGrid;
  playerBobGrid: NullableBitGrid;
  onGoToAct1: () => void;
}

export const SurvivalChallenge: React.FC<Props> = ({
  playerAliceGrid,
  playerBobGrid,
  onGoToAct1
}) => {
  const [seed, setSeed] = useState<number>(42);
  const [initialLives, setInitialLives] = useState<number>(1);
  const [selectedMode, setSelectedMode] = useState<ChallengeMode>('classical');
  const [usePlayerStrategy, setUsePlayerStrategy] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeRoundIndex, setActiveRoundIndex] = useState<number>(-1);
  const [runSummary, setRunSummary] = useState<ChallengeRunSummary | null>(null);

  const isPlayerStrategyReady = areAllIndependentBitsSet(playerAliceGrid, playerBobGrid);

  const handleGenerateAndRun = (customSeed?: number) => {
    if (isPlaying) {
      audioEngine.stopAll();
      setIsPlaying(false);
      setActiveRoundIndex(-1);
    }

    const currentSeed = customSeed ?? seed;
    const prompts = generatePromptSequence(30, currentSeed);

    const summary = runSurvivalChallenge(prompts, selectedMode, {
      initialLives,
      aliceGrid: usePlayerStrategy && isPlayerStrategyReady ? playerAliceGrid : null,
      bobGrid: usePlayerStrategy && isPlayerStrategyReady ? playerBobGrid : null,
      noiseP: 0.03,
      simSeed: currentSeed + 999
    });

    summary.seed = currentSeed;
    setRunSummary(summary);
  };

  const handlePlayAudioSequence = async () => {
    if (isPlaying) {
      audioEngine.stopAll();
      setIsPlaying(false);
      setActiveRoundIndex(-1);
      return;
    }

    if (!runSummary) {
      handleGenerateAndRun();
    }

    const currentSummary = runSummary || runSurvivalChallenge(
      generatePromptSequence(30, seed),
      selectedMode,
      {
        initialLives,
        aliceGrid: usePlayerStrategy && isPlayerStrategyReady ? playerAliceGrid : null,
        bobGrid: usePlayerStrategy && isPlayerStrategyReady ? playerBobGrid : null,
        noiseP: 0.03,
        simSeed: seed + 999
      }
    );

    if (!runSummary) setRunSummary(currentSummary);

    setIsPlaying(true);
    const payload = currentSummary.rounds.map(r => ({
      row: r.row,
      col: r.col,
      aliceSharedBit: r.aliceBit,
      bobSharedBit: r.bobBit
    }));

    await audioEngine.playNineBeatFastLoop(payload, (idx) => {
      setActiveRoundIndex(idx);
    });

    setIsPlaying(false);
    setActiveRoundIndex(-1);
  };

  const handleNewSeed = () => {
    const nextSeed = Math.floor(Math.random() * 100000);
    setSeed(nextSeed);
    handleGenerateAndRun(nextSeed);
  };

  return (
    <div className="flex flex-col items-center max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-loss/10 text-loss border border-loss/20">
          Replay Challenge
        </div>
        <h2 className="text-[34px] font-display font-extrabold text-ink leading-tight">
          30-Round Survival Gauntlet
        </h2>
        <p className="text-muted text-[15px] max-w-2xl mx-auto leading-relaxed">
          Test whether a strategy can survive 30 random referee prompts without a semitone clash.
          Replay the <strong>exact same 30 prompts</strong> across classical, ideal quantum, and noisy quantum modes.
        </p>
      </div>

      {/* Configuration Controls Bar */}
      <div className="glass-card p-5 w-full flex flex-wrap items-center justify-between gap-4">
        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase text-muted">Mode:</span>
          <div className="flex rounded-lg bg-surface border border-hairline p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setSelectedMode('classical'); setRunSummary(null); }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                selectedMode === 'classical' ? 'bg-ink text-paper shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              Classical
            </button>
            <button
              type="button"
              onClick={() => { setSelectedMode('quantum_ideal'); setRunSummary(null); }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                selectedMode === 'quantum_ideal' ? 'bg-win text-paper shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              Ideal Quantum
            </button>
            <button
              type="button"
              onClick={() => { setSelectedMode('quantum_noisy'); setRunSummary(null); }}
              className={`px-3 py-1.5 rounded-md transition-all ${
                selectedMode === 'quantum_noisy' ? 'bg-bob text-paper shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              Noisy (p=0.03)
            </button>
          </div>
        </div>

        {/* Lives selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase text-muted">Rules:</span>
          <div className="flex rounded-lg bg-surface border border-hairline p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setInitialLives(1); setRunSummary(null); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all ${
                initialLives === 1 ? 'bg-ink text-paper shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current text-loss" /> 1 Life (Default)
            </button>
            <button
              type="button"
              onClick={() => { setInitialLives(2); setRunSummary(null); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all ${
                initialLives === 2 ? 'bg-ink text-paper shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current text-loss" /> 2 Lives (Casual)
            </button>
          </div>
        </div>

        {/* Seed & Strategy controls */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted">Seed: <strong>{seed}</strong></span>
          <button
            type="button"
            onClick={handleNewSeed}
            className="p-1.5 rounded-md bg-surface border border-hairline text-muted hover:text-ink transition-colors"
            title="Generate New Seed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Classical Strategy Choice (if in classical mode) */}
      {selectedMode === 'classical' && (
        <div className="w-full flex items-center justify-between p-3.5 rounded-lg bg-surface border border-hairline text-xs">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="radio"
                name="strategyChoice"
                checked={!usePlayerStrategy}
                onChange={() => { setUsePlayerStrategy(false); setRunSummary(null); }}
                className="accent-ink"
              />
              <span>Best-known 8/9 strategy</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="radio"
                name="strategyChoice"
                checked={usePlayerStrategy}
                disabled={!isPlayerStrategyReady}
                onChange={() => { setUsePlayerStrategy(true); setRunSummary(null); }}
                className="accent-ink"
              />
              <span>Use my Act 1 puzzle strategy</span>
            </label>
          </div>

          {!isPlayerStrategyReady && (
            <button
              type="button"
              onClick={onGoToAct1}
              className="text-bob hover:underline inline-flex items-center gap-1 font-mono"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Act 1 puzzle incomplete — fill it first
            </button>
          )}
        </div>
      )}

      {/* Action CTA Bar */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => handleGenerateAndRun()}
          className="px-6 py-3 rounded-full font-bold text-xs bg-surface border border-hairline text-ink hover:bg-surface/80 transition-all"
        >
          Evaluate 30 Rounds
        </button>

        <button
          type="button"
          onClick={handlePlayAudioSequence}
          className={`flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm transition-all shadow-md
            ${isPlaying 
              ? 'bg-loss text-white hover:bg-loss/90 animate-pulse' 
              : 'bg-ink text-paper hover:scale-105'
            }
          `}
        >
          {isPlaying ? (
            <>
              <StopCircle className="w-4 h-4" /> Stop Audio Loop
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4" /> Play 30-Round Audio Loop
            </>
          )}
        </button>
      </div>

      {/* Main Results Display */}
      {runSummary && (
        <div className="w-full space-y-6">
          {/* Outcome Banner */}
          <div className={`glass-card p-6 border flex flex-col md:flex-row items-center justify-between gap-6
            ${runSummary.survived 
              ? 'bg-win/5 border-win/30 text-win' 
              : 'bg-loss/5 border-loss/30 text-loss'
            }
          `}>
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-mono uppercase font-bold tracking-wider">
                {runSummary.survived ? (
                  <><ShieldCheck className="w-4 h-4" /> Challenge Survived!</>
                ) : (
                  <><AlertTriangle className="w-4 h-4" /> Eliminated at Round {runSummary.eliminationRound}</>
                )}
              </div>
              <h3 className="text-2xl font-display font-extrabold text-ink">
                {runSummary.totalMatches} / 30 Matches &nbsp;
                <span className="text-muted text-base font-normal">({runSummary.totalLosses} clashes)</span>
              </h3>
            </div>

            {/* Theoretical Comparison Tile */}
            <div className="p-4 rounded-xl bg-surface border border-hairline text-xs font-mono space-y-1.5 text-right w-full md:w-auto">
              <div className="text-muted uppercase text-[10px]">Classical 8/9 Theory (30 Rounds)</div>
              <div>Expected losses: <strong>{runSummary.theoreticalLosses.toFixed(2)}</strong> (~3.33)</div>
              <div>
                Chance of 0 clashes ({runSummary.initialLives} {runSummary.initialLives === 1 ? 'life' : 'lives'}): &nbsp;
                <strong className="text-ink">{(runSummary.theoreticalSurvivalRate * 100).toFixed(2)}%</strong>
              </div>
            </div>
          </div>

          {/* 30-Round Visual Scoreboard Grid */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-muted uppercase">
              <span>Referee Prompt Sequence (30 Rounds)</span>
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-win inline-block"></span> Unison</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-loss inline-block"></span> Clash</span>
                <span className="opacity-50">Dotted = Post-elimination</span>
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
              {runSummary.rounds.map((r, idx) => {
                const isActive = activeRoundIndex === idx;
                const isEliminationPoint = runSummary.eliminationRound === r.round;

                return (
                  <div
                    key={`round-${r.round}`}
                    className={`p-2 rounded-lg text-center font-mono transition-all border flex flex-col items-center justify-between min-h-[64px]
                      ${isActive ? 'ring-2 ring-ink scale-110 z-10 shadow-lg' : ''}
                      ${isEliminationPoint ? 'ring-2 ring-loss shadow-[0_0_15px_rgba(255,92,108,0.4)]' : ''}
                      ${r.isPostElimination ? 'border-dashed opacity-50' : ''}
                      ${r.match 
                        ? 'bg-win/10 border-win/30 text-win' 
                        : 'bg-loss/10 border-loss/30 text-loss'
                      }
                    `}
                  >
                    <span className="text-[10px] text-muted block">#{r.round}</span>
                    <span className="text-xs font-bold leading-none my-1">
                      {r.match ? '=' : '≠'}
                    </span>
                    <span className="text-[9px] opacity-75">
                      R{r.row + 1}C{r.col + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
