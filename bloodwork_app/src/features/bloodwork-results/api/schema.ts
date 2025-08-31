import { z } from 'zod';

export const InsightZ = z.object({
  explanation: z.string(),
  symptoms: z.array(z.string()).optional(),
  recommendations: z
    .object({
      supplements: z.array(z.string()).optional(),
      foods: z.array(z.string()).optional(),
      lifestyle: z.array(z.string()).optional(),
    })
    .optional(),
  whenToSeeDoctor: z.string().optional(),
  source: z.enum(['editorial', 'rules-engine', 'llm']).optional(),
  insightVersion: z.string().optional(),
  lastUpdatedAt: z.string().datetime().optional(),
});

const TestBaseZ = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string().optional(),
  name: z.string().optional(),
  value: z.union([z.number(), z.string()]).nullable().optional(),
  unit: z.string().optional(),
  status: z.enum(['low', 'optimal', 'borderline', 'high', 'critical', 'normal']).optional(),
  insight: InsightZ.optional(),
  meta: z.object({ insight: InsightZ.optional() }).partial().optional(),
});

export const ResultEnvelopeZ = z.object({
  id: z.string(),
  createdAt: z.string(),
  patientId: z.string(),
  results: z.array(TestBaseZ).optional(),
  tests: z.array(TestBaseZ).optional(),
});

export type ResultEnvelope = z.infer<typeof ResultEnvelopeZ>;


