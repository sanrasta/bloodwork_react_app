/**
 * Bloodwork Job Data Interface
 * 
 * WHY: This interface defines the structure of data passed to background
 * analysis jobs. It ensures type safety across the analysis processing
 * pipeline and makes the job queue contract explicit.
 * 
 * FUNCTIONALITY:
 * - Defines the exact data structure for Bull queue jobs
 * - Provides type safety for job processors
 * - Documents the required fields for analysis processing
 * 
 * RELATIONSHIP TO YOUR APP:
 * React Native -> POST /analysis -> Creates job with this data structure
 * Job queue -> Background processor -> Receives this typed data
 * Progress updates -> React Native polling -> Based on jobId from this interface
 */

export interface BloodworkJobData {
  /** UUID of the analysis job for tracking and updates */
  jobId: string;
  
  /** User ID who initiated the analysis */
  userId: string;
  
  /** UUID of the uploaded file being analyzed */
  uploadId: string;
  
  /** File system path to the uploaded PDF file */
  filePath: string;
  
  /** Original filename as uploaded by the user */
  originalName: string;
}
