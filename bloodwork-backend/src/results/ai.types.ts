export type Status = 'normal'|'high'|'low'|'critical';

export interface TestResultInput {
  id: string;
  testName: string;
  value: number;
  unit: string;
  referenceRange: { min: number; max: number };
  status: Status;
}

export interface InsightOut {
  id: string;
  aiNote: string;       // <= 25 words
  confidence: number;   // 0..1
  sourceModel: string;  // e.g., "openai:gpt-4o-mini"
}
