/**
 * Test Classification Utilities
 * 
 * WHY: Pure functions for classifying and categorizing test results.
 * These utilities determine test types based on the names and patterns
 * of parsed test results, helping organize and display results appropriately.
 * 
 * FUNCTIONALITY:
 * - Determine test panel type based on test names (Hormone, Metabolic, etc.)
 * - Classify test results into logical categories
 * - Provide standardized test type labels for frontend display
 * 
 * BENEFITS:
 * - Pure functions - easy to test and extend
 * - Centralized classification logic
 * - Easy to add new test types and categories
 * - Consistent categorization across the application
 */

import { TestResult } from '../../common/entities/bloodwork-result.entity';

/**
 * Determine test type based on parsed test results
 */
export function determineTestType(results: TestResult[]): string {
  const testNames = results.map(r => r.testName.toLowerCase());
  
  if (testNames.some(name => name.includes('testosterone') || name.includes('shbg'))) {
    return 'Hormone Panel';
  } else if (testNames.some(name => name.includes('cholesterol') || name.includes('glucose'))) {
    return 'Metabolic Panel';
  } else if (testNames.some(name => name.includes('hemoglobin') || name.includes('wbc'))) {
    return 'Complete Blood Count';
  } else if (testNames.some(name => name.includes('igg') || name.includes('iga') || name.includes('igm'))) {
    return 'Immunology Panel';
  }
  
  return 'Laboratory Results';
}
