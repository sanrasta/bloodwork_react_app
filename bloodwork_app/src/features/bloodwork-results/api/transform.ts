import { ResultEnvelopeZ } from './schema';
import type { ResultSummaryDTO, TestResult } from '../types';

export function normalizeResult(input: unknown): ResultSummaryDTO {
  const env = ResultEnvelopeZ.parse(input);
  const raw = env.results ?? env.tests ?? [];

  const tests: TestResult[] = raw.map((t) => ({
    id: t.id,
    code: t.code,
    title: t.title ?? t.name ?? t.code,
    value: t.value ?? null,
    unit: t.unit,
    status: t.status ?? 'optimal',
    insight: t.insight ?? t.meta?.insight,
  }));

  return {
    id: env.id,
    createdAt: env.createdAt,
    patientId: env.patientId,
    tests,
  };
}


