/**
 * Data types for The 8/9 Duet Mermin-Peres experiments and game mechanics.
 */

export type SourceType = 'ibm_hardware' | 'qiskit_aer';

export interface CountItem {
  alice_bits: [number, number, number];
  bob_bits: [number, number, number];
  count: number;
  win: boolean;
  alice_parity_even?: boolean;
  bob_parity_odd?: boolean;
  shared_match?: boolean;
}

export interface ContextData {
  row: number; // 0, 1, 2 (displayed as 1, 2, 3)
  column: number; // 0, 1, 2 (displayed as 1, 2, 3)
  shots: number;
  wins: number;
  win_rate: number;
  confidence_interval_95?: [number, number];
  alice_parity_valid_count: number;
  bob_parity_valid_count: number;
  shared_cell_match_count: number;
  counts: CountItem[];
}

export interface DatasetSummary {
  total_shots: number;
  total_wins: number;
  overall_win_rate: number;
  confidence_interval_95?: [number, number];
}

export interface MerminPeresDataset {
  schema_version: string;
  source_type: SourceType;
  backend_name: string;
  ibm_job_id: string | null;
  timestamp: string;
  shots_per_context: number;
  contexts: ContextData[];
  summary: DatasetSummary;
}

export interface RoundEvaluation {
  aliceParityEven: boolean;
  bobParityOdd: boolean;
  sharedMatch: boolean;
  aliceSharedBit: number;
  bobSharedBit: number;
  win: boolean;
}

export interface PlaybackState {
  isPlayingSample: boolean;
  isPlayingAll: boolean;
  activeContextIndex: number | null; // 0..8
  activeStepInPhrase: number | null; // 0, 1, 2 (notes in chord/phrase)
  volume: number; // 0.0 .. 1.0
  muted: boolean;
  tempoBpm: number; // default 120
}
