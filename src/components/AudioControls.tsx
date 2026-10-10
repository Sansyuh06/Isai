import React from 'react';
import { Play, Square, Volume2, VolumeX, ListMusic, Music } from 'lucide-react';
import { VisualStepEvent } from '../audio/synth';

interface Props {
  isPlayingSample: boolean;
  isPlayingAll: boolean;
  onPlaySample: () => void;
  onPlayAll: () => void;
  onStop: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  muted: boolean;
  onToggleMute: () => void;
  activeStepEvent: VisualStepEvent | null;
}

export const AudioControls: React.FC<Props> = ({
  isPlayingSample,
  isPlayingAll,
  onPlaySample,
  onPlayAll,
  onStop,
  volume,
  onVolumeChange,
  muted,
  onToggleMute,
  activeStepEvent
}) => {
  const isPlaying = isPlayingSample || isPlayingAll;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Playback Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Play Single Sample */}
          <button
            type="button"
            onClick={onPlaySample}
            disabled={isPlaying}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md ${
              isPlayingSample
                ? 'bg-cyan-500 text-slate-950 font-bold ring-2 ring-cyan-300'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white hover:shadow-cyan-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
            title="Replay stored outcome from loaded dataset"
          >
            <Play className={`w-4 h-4 ${isPlayingSample ? 'fill-current' : ''}`} />
            <span>Play recorded sample</span>
          </button>

          {/* Play All 9 Pairs */}
          <button
            type="button"
            onClick={onPlayAll}
            disabled={isPlaying}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md ${
              isPlayingAll
                ? 'bg-purple-500 text-slate-950 font-bold ring-2 ring-purple-300'
                : 'bg-slate-800 hover:bg-purple-600/80 text-purple-200 border border-purple-500/30 hover:border-purple-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
            title="Step through all 9 contexts in a nine-bar musical sequence"
          >
            <ListMusic className="w-4 h-4" />
            <span>Play all 9 pairs</span>
          </button>

          {/* Stop Button */}
          {isPlaying && (
            <button
              type="button"
              onClick={onStop}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-950/80 text-rose-300 border border-rose-500/50 hover:bg-rose-900 active:scale-95 text-sm font-medium transition-all"
              title="Stop audio playback"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop</span>
            </button>
          )}
        </div>

        {/* Volume & Sound Indicator */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Mute button */}
          <button
            type="button"
            onClick={onToggleMute}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
            aria-label={muted ? 'Unmute audio' : 'Mute audio'}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-rose-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-cyan-400" />
            )}
          </button>

          {/* Volume slider */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={muted ? 0 : volume}
            onChange={(e) => {
              if (muted) onToggleMute();
              onVolumeChange(parseFloat(e.target.value));
            }}
            className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            aria-label="Audio Volume"
          />

          {/* Musical Activity Visualizer */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
              activeStepEvent
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
            }`}
          >
            <Music className={`w-3.5 h-3.5 ${activeStepEvent ? 'animate-bounce text-emerald-400' : ''}`} />
            <span>
              {activeStepEvent
                ? activeStepEvent.step === 3
                  ? activeStepEvent.isMatch
                    ? 'Unison 🎶'
                    : 'Dissonance ⚡'
                  : `Note ${activeStepEvent.step + 1}/3`
                : 'Idle'}
            </span>
          </div>
        </div>
      </div>

      {/* Musical Replay Clarity Notice */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-400 gap-1.5">
        <p className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>
            <strong>Replay Notice:</strong> Sound sonifies stored measurement outcomes (Alice: Left pan, Bob: Right pan). Matching crossing bits sound in unison.
          </span>
        </p>
        <span className="text-slate-500 italic text-[10px]">
          Web Audio API · No external audio · No autoplay
        </span>
      </div>
    </div>
  );
};
