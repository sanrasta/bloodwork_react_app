/**
 * Bloodwork Parse Result Response
 * 
 * WHY: This interface provides a clean, strongly-typed contract for the
 * PDF parser service response. It replaces the inline Promise type and
 * ensures consistent data structure across the analysis pipeline.
 * 
 * FUNCTIONALITY:
 * - Defines the exact structure returned by PDF parsing
 * - Provides type safety for test results and patient information
 * - Enables better IntelliSense and compile-time error checking
 * - Makes the parsing API contract explicit and reusable
 * 
 * RELATIONSHIP TO YOUR APP:
 * PDF parser -> Returns this typed response -> Analysis processor uses it
 * Type safety -> Prevents runtime errors -> Better reliability
 * Clear contracts -> Easier testing and maintenance
 */

import { TestResult } from '../../common/entities/bloodwork-result.entity';
import { PatientInfo } from '../types/patient-info';

export interface BloodworkParseResult {
  /** Array of parsed test results with values and reference ranges */
  testResults: TestResult[];
  
  /** Type of bloodwork test (e.g., "Comprehensive Metabolic Panel", "Hormone Panel") */
  testType: string;
  
  /** Date when the test was performed (ISO string or parsed format) */
  testDate: string;
  
  /** Patient information extracted from the PDF (optional due to parsing variability) */
  patientInfo?: PatientInfo;
}
