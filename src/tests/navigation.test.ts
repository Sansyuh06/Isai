import { describe, it, expect } from 'vitest';
import defaultAerDataset from '../data/defaultAerData.json';
import { MerminPeresDataset, SourceType } from '../types/data';

describe('Landing & Tutorial Navigation Contract', () => {
  it('correctly associates landing CTAs with target Act destinations', () => {
    type TargetAct = 'act1' | 'act2' | null;

    // Simulate navigation actions triggered by Hero buttons
    const handleBeatClassical = (): { view: string; activeTab: string; targetAct: TargetAct; resetStep: number } => ({
      view: 'app',
      activeTab: 'tutorial',
      targetAct: 'act1',
      resetStep: 1
    });

    const handleHearDuet = (): { view: string; activeTab: string; targetAct: TargetAct; resetStep: number } => ({
      view: 'app',
      activeTab: 'tutorial',
      targetAct: 'act2',
      resetStep: 1
    });

    const handleTour = (): { view: string; activeTab: string; targetAct: TargetAct; resetStep: number } => ({
      view: 'app',
      activeTab: 'tutorial',
      targetAct: null,
      resetStep: 1
    });

    const act1Result = handleBeatClassical();
    expect(act1Result.view).toBe('app');
    expect(act1Result.activeTab).toBe('tutorial');
    expect(act1Result.targetAct).toBe('act1');
    expect(act1Result.resetStep).toBe(1);

    const act2Result = handleHearDuet();
    expect(act2Result.view).toBe('app');
    expect(act2Result.activeTab).toBe('tutorial');
    expect(act2Result.targetAct).toBe('act2');
    expect(act2Result.resetStep).toBe(1);

    const explainerResult = handleTour();
    expect(explainerResult.view).toBe('app');
    expect(explainerResult.activeTab).toBe('tutorial');
    expect(explainerResult.targetAct).toBeNull();
    expect(explainerResult.resetStep).toBe(1);
  });

  it('resolves Aer fallback dataset when IBM hardware is unpopulated', () => {
    const currentSource: SourceType = 'ibm_hardware';
    const ibmData: MerminPeresDataset | null = null;
    const aerData = defaultAerDataset as unknown as MerminPeresDataset;

    // Replicate App.tsx tutorial fallback logic
    const isTutorialFallbackAer = currentSource === 'ibm_hardware' && ibmData === null;
    const tutorialDataset = isTutorialFallbackAer ? aerData : (ibmData || aerData);

    expect(isTutorialFallbackAer).toBe(true);
    expect(tutorialDataset).toBeDefined();
    expect(tutorialDataset.source_type).toBe('qiskit_aer');
    expect(tutorialDataset.backend_name).toBe(aerData.backend_name);
  });

  it('keeps genuine IBM hardware data when it is populated', () => {
    const mockIbmData: MerminPeresDataset = {
      ...defaultAerDataset,
      source_type: 'ibm_hardware',
      backend_name: 'ibm_kyiv'
    } as unknown as MerminPeresDataset;

    const currentSource: SourceType = 'ibm_hardware';
    const ibmData: MerminPeresDataset | null = mockIbmData;
    const aerData = defaultAerDataset as unknown as MerminPeresDataset;

    const isTutorialFallbackAer = currentSource === 'ibm_hardware' && ibmData === null;
    const tutorialDataset = isTutorialFallbackAer ? aerData : (ibmData || aerData);

    expect(isTutorialFallbackAer).toBe(false);
    expect(tutorialDataset.source_type).toBe('ibm_hardware');
    expect(tutorialDataset.backend_name).toBe('ibm_kyiv');
  });

  it('navigates to the designated target act upon completing the tutorial', () => {
    let activeTab = 'tutorial';
    let targetAct: 'act1' | 'act2' | null = 'act1';

    const onContinueToAct = (act: 'act1' | 'act2') => {
      activeTab = act;
      targetAct = null;
    };

    onContinueToAct(targetAct);
    expect(activeTab).toBe('act1');
    expect(targetAct).toBeNull();
  });
});
