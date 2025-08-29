import { useMemo } from 'react';
import { useBloodworkStore } from '../../store/use-bloodwork-store';

/**
 * Minimal upload flow hook with strict performance guardrails
 * 
 * ✅ SAFE TIER 2 IMPLEMENTATION:
 * - Selective subscriptions (preserves Tier 1 gains)
 * - Memoized computed values (no fresh objects)
 * - Stable action references (Zustand actions are stable)
 * - Clear ownership boundaries (upload-only concerns)
 */
export const useUploadFlow = () => {
  // ✅ Subscribe to only what the Upload UI actually renders
  const step = useBloodworkStore(s => s.step);
  const pickedFile = useBloodworkStore(s => s.pickedFile);
  const error = useBloodworkStore(s => s.error);

  // ✅ Actions are stable in Zustand - no need for additional optimization
  const setStep = useBloodworkStore(s => s.setStep);
  const setPickedFile = useBloodworkStore(s => s.setPickedFile);
  const setUploadId = useBloodworkStore(s => s.setUploadId);
  const setJobId = useBloodworkStore(s => s.setJobId);
  const setError = useBloodworkStore(s => s.setError);

  // ✅ Computed values memoized (no fresh objects each render)
  const computed = useMemo(() => ({
    hasFile: !!pickedFile,
    hasError: !!error,
    isIdle: step === 'idle',
    isPicked: step === 'picked',
    isUploaded: step === 'uploaded',
    isAnalyzing: step === 'analyzing',
  }), [pickedFile, error, step]);

  // Return only what consumers need; avoid dumping the whole store
  return { 
    step, 
    pickedFile, 
    error,
    setStep,
    setPickedFile,
    setUploadId,
    setJobId,
    setError,
    ...computed 
  };
};
