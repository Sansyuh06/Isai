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
    <div className="bg-surface border border-hairline rounded-[10px] p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Playback Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Play Single Sample */}
          <button
            type="button"
            onClick={onPlaySample}
            disabled={isPlaying}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[6px] font-semibold text-[14px] transition-all shadow-sm border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
              isPlayingSample
                ? 'bg-paper text-ink border-hairline'
                : 'bg-ink hover:bg-ink/90 text-surface border-ink disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <Play className={`w-4 h-4 ${isPlayingSample ? 'fill-current' : ''}`} />
            <span>Play recorded sample</span>
          </button>

          {/* Play All 9 Pairs */}
          <button
            type="button"
            onClick={onPlayAll}
            disabled={isPlaying}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[6px] font-semibold text-[14px] transition-all shadow-sm border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
              isPlayingAll
                ? 'bg-paper text-ink border-hairline'
                : 'bg-surface hover:bg-paper text-ink border-hairline disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <ListMusic className="w-4 h-4" />
            <span>Play all 9 pairs</span>
          </button>

          {/* Stop Button */}
          {isPlaying && (
            <button
              type="button"
              onClick={onStop}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[6px] bg-surface hover:bg-paper text-ink border border-hairline text-[14px] font-semibold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop</span>
            </button>
          )}
        </div>

        {/* Volume & Sound Indicator */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onToggleMute}
            className="p-1.5 rounded-[6px] text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink transition-all"
            aria-label={muted ? 'Unmute audio' : 'Mute audio'}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-muted" />
            ) : (
              <Volume2 className="w-4 h-4 text-ink" />
            )}
          </button>

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
            className="w-20 h-1 bg-hairline rounded-full appearance-none cursor-pointer accent-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            aria-label="Audio Volume"
          />

          {/* Musical Activity Visualizer */}
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-[4px] text-[12px] font-mono font-medium transition-all border ${
              activeStepEvent
                ? activeStepEvent.step === 3
                  ? activeStepEvent.isMatch
                    ? 'bg-win/10 border-win/20 text-win'
                    : 'bg-loss/10 border-loss/20 text-loss'
                  : 'bg-paper border-hairline text-ink'
                : 'bg-paper border-hairline text-muted'
            }`}
          >
            <Music className="w-3 h-3" />
            <span>
              {activeStepEvent
                ? activeStepEvent.step === 3
                  ? activeStepEvent.isMatch
                    ? 'Shared cell: match'
                    : 'Shared cell: mismatch'
                  : `Playing note ${activeStepEvent.step + 1} of 3`
                : 'Idle'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
