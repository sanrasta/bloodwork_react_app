import { z } from 'zod';

export const testResultSchema = z.object({
  testName: z.string().min(1, 'Test name is required'),
  value: z.number().positive('Value must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  referenceRange: z.object({
    min: z.number(),
    max: z.number(),
  }),
  status: z.enum(['normal', 'high', 'low', 'critical']),
});

export const bloodworkResultSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  testDate: z.string().datetime('Invalid test date'),
  testType: z.string().min(1, 'Test type is required'),
  results: z.array(testResultSchema).min(1, 'At least one test result is required'),
  doctorNotes: z.string().optional(),
  status: z.enum(['pending', 'completed', 'reviewed']),
});

export const bloodworkFiltersSchema = z.object({
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
  testType: z.string().optional(),
  status: z.enum(['pending', 'completed', 'reviewed']).optional(),
});

export type BloodworkResultInput = z.infer<typeof bloodworkResultSchema>;
export type BloodworkFiltersInput = z.infer<typeof bloodworkFiltersSchema>;
