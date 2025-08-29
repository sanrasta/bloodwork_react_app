import { create } from 'zustand';
import type { BloodworkFilters, BloodworkListState, BloodworkFlowState, PickedFile } from '../types/types';

interface BloodworkStore extends BloodworkListState, BloodworkFlowState {
  // ✅ CLIENT/UI STATE ACTIONS
  setFilters: (filters: Partial<BloodworkFilters>) => void;
  clearFilters: () => void;
  setSelectedResultId: (id: string | null) => void;
  
  // ✅ MVP FLOW ACTIONS  
  setStep: (step: BloodworkFlowState['step']) => void;
  setPickedFile: (file: PickedFile | undefined) => void;
  setUploadId: (uploadId: string | undefined) => void;
  setJobId: (jobId: string | undefined) => void;
  setResultId: (resultId: string | undefined) => void;
  setError: (error: string | undefined) => void;
  resetFlow: () => void;
}

const initialFilters: BloodworkFilters = {
  dateRange: undefined,
  testType: undefined,
  status: undefined,
};

export const useBloodworkStore = create<BloodworkStore>((set, get) => ({
  // ✅ CLIENT/UI STATE ONLY
  filters: initialFilters,
  selectedResultId: null,

  // ✅ MVP FLOW STATE
  step: 'idle',
  pickedFile: undefined,
  uploadId: undefined,
  jobId: undefined,
  resultId: undefined,
  error: undefined,

  // ✅ CLIENT/UI ACTIONS
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  
  clearFilters: () => set({ filters: initialFilters }),
  
  setSelectedResultId: (selectedResultId) => set({ selectedResultId }),
  
  // MVP Flow Actions
  setStep: (step) => set({ step }),
  setPickedFile: (pickedFile) => set({ pickedFile }),
  setUploadId: (uploadId) => set({ uploadId }),
  setJobId: (jobId) => set({ jobId }),
  setResultId: (resultId) => set({ resultId }),
  setError: (error) => set({ error }),
  
  resetFlow: () => set({
    step: 'idle',
    pickedFile: undefined,
    uploadId: undefined,
    jobId: undefined,
    resultId: undefined,
    error: undefined,
    selectedResultId: null,
  }),
}));
