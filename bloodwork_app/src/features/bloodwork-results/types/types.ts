export interface BloodworkResult {
  id: string;
  patientId: string;
  testDate: string;
  testType: string;
  results: TestResult[];
  doctorNotes?: string;
  status: 'pending' | 'completed' | 'reviewed';
  createdAt: string;
  updatedAt: string;
}

export interface TestResult {
  id: string;
  testName: string;
  value: number;
  unit: string;
  referenceRange: {
    min: number;
    max: number;
  };
  status: 'normal' | 'high' | 'low' | 'critical';
}

export interface BloodworkFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  testType?: string;
  status?: BloodworkResult['status'];
}

export interface BloodworkListState {
  results: BloodworkResult[];
  filters: BloodworkFilters;
  selectedResult: BloodworkResult | null;
  isLoading: boolean;
}

// === MVP TYPES ===

export interface UploadResponse {
  uploadId: string;
  fileUrl: string;
}

export interface AnalysisJob {
  jobId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress?: number;
  resultId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PickedFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface BloodworkFlowState {
  step: 'idle' | 'picked' | 'uploaded' | 'analyzing' | 'completed' | 'failed';
  pickedFile?: PickedFile;
  uploadId?: string;
  jobId?: string;
  resultId?: string;
  error?: string;
}
