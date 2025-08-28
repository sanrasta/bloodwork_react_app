/**
 * Analysis Types - Barrel Export
 * 
 * WHY: This barrel export file provides a clean way to import all
 * analysis-related types from a single location. It keeps imports
 * organized and makes the API surface more discoverable.
 * 
 * USAGE:
 * import { BloodworkJobData, PatientInfo } from '../types';
 * // Instead of: import { BloodworkJobData } from '../types/bloodwork-job-data';
 */

export type { BloodworkJobData } from './bloodwork-job-data';
export type { PatientInfo } from './patient-info';

// Future analysis types can be exported here as well
// export { AnalysisResult } from './analysis-result';
// export { ProcessingStatus } from './processing-status';
