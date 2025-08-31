// UI-level types for Result Summary with inline insights

export type Insight = {
  explanation: string;
  symptoms?: string[];
  recommendations?: {
    supplements?: string[];
    foods?: string[];
    lifestyle?: string[];
  };
  whenToSeeDoctor?: string;
  // optional governance
  source?: 'editorial' | 'rules-engine' | 'llm';
  insightVersion?: string;
  lastUpdatedAt?: string; // ISO
};

export type TestStatus =
  | 'low'
  | 'optimal'
  | 'borderline'
  | 'high'
  | 'critical'
  | 'normal'; // allow legacy 'normal' and map to 'optimal' in UI

export type TestResult = {
  id: string;
  code: string; // e.g., "ZINC", "A1C"
  title: string;
  value: number | string | null;
  unit?: string;
  status: TestStatus;
  insight?: Insight; // inline per test
};

export type ResultSummaryDTO = {
  id: string;
  createdAt: string;
  patientId: string;
  tests: TestResult[];
};

// Reuse across badges
export const STATUS_THEME: Record<TestStatus, { bg: string; fg: string }> = {
  low: { bg: '#1E3A8A', fg: '#ffffff' },
  optimal: { bg: '#1E40AF', fg: '#ffffff' },
  borderline: { bg: '#F59E0B', fg: '#111827' },
  high: { bg: '#DC2626', fg: '#ffffff' },
  critical: { bg: '#B91C1C', fg: '#ffffff' },
  normal: { bg: '#1E40AF', fg: '#ffffff' },
};


