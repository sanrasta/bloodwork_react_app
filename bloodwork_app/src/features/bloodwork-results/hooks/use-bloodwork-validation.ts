import { useState, useCallback } from 'react';
import { bloodworkResultSchema, type BloodworkResultInput } from '../schemas/bloodwork-schema';
import type { ZodError } from 'zod';

interface ValidationErrors {
  [key: string]: string;
}

interface UseBloodworkValidationReturn {
  errors: ValidationErrors;
  isValid: boolean;
  validate: (data: BloodworkResultInput) => boolean;
  validateField: (field: keyof BloodworkResultInput, value: any) => boolean;
  clearErrors: () => void;
  clearFieldError: (field: keyof BloodworkResultInput) => void;
}

export const useBloodworkValidation = (): UseBloodworkValidationReturn => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const formatZodErrors = useCallback((zodError: ZodError): ValidationErrors => {
    const formattedErrors: ValidationErrors = {};
    
    zodError.errors.forEach((error) => {
      const path = error.path.join('.');
      formattedErrors[path] = error.message;
    });
    
    return formattedErrors;
  }, []);

  const validate = useCallback((data: BloodworkResultInput): boolean => {
    try {
      bloodworkResultSchema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Error && 'errors' in error) {
        const validationErrors = formatZodErrors(error as ZodError);
        setErrors(validationErrors);
      }
      return false;
    }
  }, [formatZodErrors]);

  const validateField = useCallback((field: keyof BloodworkResultInput, value: any): boolean => {
    try {
      // Create a partial schema for the specific field
      const fieldSchema = bloodworkResultSchema.pick({ [field]: true });
      fieldSchema.parse({ [field]: value });
      
      // Clear error for this field if validation passes
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      return true;
    } catch (error) {
      if (error instanceof Error && 'errors' in error) {
        const validationErrors = formatZodErrors(error as ZodError);
        setErrors((prev) => ({ ...prev, ...validationErrors }));
      }
      return false;
    }
  }, [formatZodErrors]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: keyof BloodworkResultInput) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    isValid,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
  };
};
