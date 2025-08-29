import { z } from 'zod';

export const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phoneNumber: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format'),
});

export const userPreferencesSchema = z.object({
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }),
  language: z.string().min(1, 'Language is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  units: z.enum(['metric', 'imperial']),
});

export const medicalInfoSchema = z.object({
  allergies: z.array(z.string()),
  medications: z.array(z.string()),
  conditions: z.array(z.string()),
  emergencyContact: emergencyContactSchema.optional(),
});

export const userProfileSchema = z.object({
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().datetime().optional(),
  phoneNumber: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format').optional(),
  preferences: userPreferencesSchema,
  medicalInfo: medicalInfoSchema,
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
export type MedicalInfoInput = z.infer<typeof medicalInfoSchema>;
