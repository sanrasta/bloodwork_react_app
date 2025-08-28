/**
 * Patient Information Interface
 * 
 * WHY: This interface provides strong typing for patient data extracted
 * from bloodwork PDFs. It ensures type safety and documents the expected
 * patient information structure across the analysis pipeline.
 * 
 * FUNCTIONALITY:
 * - Defines patient data fields commonly found in lab reports
 * - All fields optional due to varying PDF formats and parsing reliability
 * - Supports both demographic and medical context information
 * 
 * RELATIONSHIP TO YOUR APP:
 * PDF parsing -> Extracts patient info -> Typed with this interface
 * Analysis results -> Include patient context -> Better user experience
 */

export interface PatientInfo {
  /** Patient's full name as it appears on the lab report */
  name?: string;
  
  /** Date of birth in various formats (MM/DD/YYYY, DD/MM/YYYY, etc.) */
  dateOfBirth?: string;
  
  /** Unique patient identifier from the lab system */
  patientId?: string;
  
  /** Patient gender (Male, Female, M, F, etc.) */
  gender?: string;
  
  /** Patient age at time of test */
  age?: number;
  
  /** Patient address if present on report */
  address?: string;
  
  /** Contact phone number */
  phoneNumber?: string;
  
  /** Ordering physician name */
  physicianName?: string;
  
  /** Lab facility or hospital name */
  facilityName?: string;
  
  /** Lab report or requisition ID */
  reportId?: string;
  
  /** When the sample was collected (different from test date) */
  collectionDate?: string;
}
