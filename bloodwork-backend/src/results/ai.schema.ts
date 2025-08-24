import { z } from 'zod';

export const InsightOutSchema = z.object({
  id: z.string().min(1),
  aiNote: z.string().min(4).max(200),
  confidence: z.number().min(0).max(1),
});

export const InsightOutArraySchema = z.array(InsightOutSchema).min(1);
