import { MerminPeresDataset } from '../types/data';
import { evaluateRound } from './scoring';

export interface ValidationOutcome {
  valid: boolean;
  error?: string;
  dataset?: MerminPeresDataset;
}

export function validateDatasetJson(parsed: unknown): ValidationOutcome {
  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, error: 'File content must be a valid JSON object.' };
  }

  const obj = parsed as Record<string, unknown>;

  if (obj.schema_version !== '1.0.0') {
    return { valid: false, error: `Invalid schema_version: "${obj.schema_version}". Expected "1.0.0".` };
  }

  if (obj.source_type !== 'ibm_hardware' && obj.source_type !== 'qiskit_aer') {
    return { valid: false, error: `Invalid source_type: "${obj.source_type}". Must be "ibm_hardware" or "qiskit_aer".` };
  }

  const sourceType = obj.source_type as 'ibm_hardware' | 'qiskit_aer';
  const backendName = typeof obj.backend_name === 'string' ? obj.backend_name.trim() : '';

  if (!backendName) {
    return { valid: false, error: 'Missing or empty backend_name.' };
  }

  if (sourceType === 'qiskit_aer') {
    if (obj.ibm_job_id !== null && obj.ibm_job_id !== undefined) {
      return { valid: false, error: 'qiskit_aer results must not have an ibm_job_id.' };
    }
    const lower = backendName.toLowerCase();
    if (lower.includes('ibm') && !lower.includes('aer') && !lower.includes('sim')) {
      return { valid: false, error: 'Aer simulator results must not falsely claim physical IBM backend.' };
    }
  }

  if (sourceType === 'ibm_hardware') {
    if (!obj.ibm_job_id || typeof obj.ibm_job_id !== 'string') {
      return { valid: false, error: 'ibm_hardware results must provide a valid string ibm_job_id.' };
    }
  }

  if (!Array.isArray(obj.contexts) || obj.contexts.length !== 9) {
    return { valid: false, error: 'Dataset must contain exactly 9 context items.' };
  }

  const seen = new Set<string>();
  let totalCalculatedShots = 0;
  let totalCalculatedWins = 0;

  for (let i = 0; i < obj.contexts.length; i++) {
    const ctx = obj.contexts[i] as Record<string, unknown>;
    const r = ctx.row as number;
    const c = ctx.column as number;

    if (r !== 0 && r !== 1 && r !== 2) {
      return { valid: false, error: `Context #${i} has invalid row ${r}. Must be 0, 1, or 2.` };
    }
    if (c !== 0 && c !== 1 && c !== 2) {
      return { valid: false, error: `Context #${i} has invalid column ${c}. Must be 0, 1, or 2.` };
    }

    const key = `${r},${c}`;
    if (seen.has(key)) {
      return { valid: false, error: `Duplicate context (row ${r}, col ${c}).` };
    }
    seen.add(key);

    const shots = ctx.shots as number;
    const wins = ctx.wins as number;
    if (typeof shots !== 'number' || shots < 1) {
      return { valid: false, error: `Context (${r},${c}) shots must be a positive integer.` };
    }
    if (typeof wins !== 'number' || wins < 0 || wins > shots) {
      return { valid: false, error: `Context (${r},${c}) wins must be between 0 and shots.` };
    }

    if (!Array.isArray(ctx.counts) || ctx.counts.length === 0) {
      return { valid: false, error: `Context (${r},${c}) has empty or invalid counts.` };
    }

    let sumCounts = 0;
    let sumWins = 0;
    for (const item of ctx.counts as Array<Record<string, unknown>>) {
      const count = item.count as number;
      if (typeof count !== 'number' || count < 1) {
        return { valid: false, error: `Context (${r},${c}) count item has invalid count.` };
      }
      sumCounts += count;

      const aBits = item.alice_bits as [number, number, number];
      const bBits = item.bob_bits as [number, number, number];
      if (!Array.isArray(aBits) || aBits.length !== 3 || !Array.isArray(bBits) || bBits.length !== 3) {
        return { valid: false, error: `Context (${r},${c}) invalid alice_bits or bob_bits.` };
      }

      const evalRes = evaluateRound(r, c, aBits, bBits);
      if (item.win !== evalRes.win) {
        return { valid: false, error: `Context (${r},${c}) win flag mismatch with actual bit outcome.` };
      }
      if (evalRes.win) {
        sumWins += count;
      }
    }

    if (sumCounts !== shots) {
      return { valid: false, error: `Context (${r},${c}) counts sum (${sumCounts}) does not match shots (${shots}).` };
    }
    if (sumWins !== wins) {
      return { valid: false, error: `Context (${r},${c}) calculated wins (${sumWins}) does not match wins field (${wins}).` };
    }

    totalCalculatedShots += shots;
    totalCalculatedWins += wins;
  }

  const summary = obj.summary as Record<string, unknown>;
  if (!summary || typeof summary !== 'object') {
    return { valid: false, error: 'Missing summary section.' };
  }
  if (summary.total_shots !== totalCalculatedShots) {
    return { valid: false, error: 'summary.total_shots mismatch with sum of context shots.' };
  }
  if (summary.total_wins !== totalCalculatedWins) {
    return { valid: false, error: 'summary.total_wins mismatch with sum of context wins.' };
  }

  return {
    valid: true,
    dataset: parsed as MerminPeresDataset
  };
}
