import { create } from 'zustand';
import type { BloodworkResult, BloodworkFilters, BloodworkListState, BloodworkFlowState, PickedFile } from '../types/types';

interface BloodworkStore extends BloodworkListState, BloodworkFlowState {
  // List Actions
  setResults: (results: BloodworkResult[]) => void;
  addResult: (result: BloodworkResult) => void;
  updateResult: (id: string, updates: Partial<BloodworkResult>) => void;
  removeResult: (id: string) => void;
  setSelectedResult: (result: BloodworkResult | null) => void;
  setFilters: (filters: Partial<BloodworkFilters>) => void;
  clearFilters: () => void;
  setLoading: (isLoading: boolean) => void;
  
  // MVP Flow Actions
  setStep: (step: BloodworkFlowState['step']) => void;
  setPickedFile: (file: PickedFile | undefined) => void;
  setUploadId: (uploadId: string | undefined) => void;
  setJobId: (jobId: string | undefined) => void;
  setResultId: (resultId: string | undefined) => void;
  setError: (error: string | undefined) => void;
  resetFlow: () => void;
  
  // Computed
  getFilteredResults: () => BloodworkResult[];
}

const initialFilters: BloodworkFilters = {
  dateRange: undefined,
  testType: undefined,
  status: undefined,
};

export const useBloodworkStore = create<BloodworkStore>((set, get) => ({
  // List State
  results: [],
  filters: initialFilters,
  selectedResult: null,
  isLoading: false,

  // MVP Flow State
  step: 'idle',
  pickedFile: undefined,
  uploadId: undefined,
  jobId: undefined,
  resultId: undefined,
  error: undefined,

  // List Actions
  setResults: (results) => set({ results }),
  
  addResult: (result) => set((state) => ({
    results: [...state.results, result]
  })),
  
  updateResult: (id, updates) => set((state) => ({
    results: state.results.map(result => 
      result.id === id ? { ...result, ...updates } : result
    )
  })),
  
  removeResult: (id) => set((state) => ({
    results: state.results.filter(result => result.id !== id)
  })),
  
  setSelectedResult: (result) => set({ selectedResult: result }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  
  clearFilters: () => set({ filters: initialFilters }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
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
  }),
  
  // Computed
  getFilteredResults: () => {
    const { results, filters } = get();
    
    return results.filter((result) => {
      // Filter by date range
      if (filters.dateRange) {
        const testDate = new Date(result.testDate);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        
        if (testDate < startDate || testDate > endDate) {
          return false;
        }
      }
      
      // Filter by test type
      if (filters.testType && result.testType !== filters.testType) {
        return false;
      }
      
      // Filter by status
      if (filters.status && result.status !== filters.status) {
        return false;
      }
      
      return true;
    });
  },
}));
