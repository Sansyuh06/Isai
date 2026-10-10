import { describe, it, expect } from 'vitest';
import { validateDatasetJson } from '../utils/validator';
import defaultAerDataset from '../data/defaultAerData.json';

describe('Dataset Schema & Integrity Validation', () => {
  it('validates bundled Aer simulator dataset successfully', () => {
    const res = validateDatasetJson(defaultAerDataset);
    expect(res.valid).toBe(true);
    expect(res.dataset?.source_type).toBe('qiskit_aer');
    expect(res.dataset?.contexts.length).toBe(9);
  });

  it('rejects unsupported schema version', () => {
    const invalid = { ...defaultAerDataset, schema_version: '2.0.0' };
    const res = validateDatasetJson(invalid);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('schema_version');
  });

  it('rejects aer simulator dataset that specifies an ibm_job_id', () => {
    const invalid = { ...defaultAerDataset, ibm_job_id: 'fake-job-id-999' };
    const res = validateDatasetJson(invalid);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('ibm_job_id');
  });

  it('rejects aer data that falsely claims ibm physical hardware backend', () => {
    const invalid = { ...defaultAerDataset, backend_name: 'ibm_brisbane' };
    const res = validateDatasetJson(invalid);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Aer simulator results must not falsely claim physical IBM backend');
  });

  it('rejects hardware run missing ibm_job_id', () => {
    const invalid = {
      ...defaultAerDataset,
      source_type: 'ibm_hardware',
      backend_name: 'ibm_brisbane',
      ibm_job_id: null
    };
    const res = validateDatasetJson(invalid);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('ibm_hardware results must provide a valid string ibm_job_id');
  });
});
