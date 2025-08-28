/**
 * Common Responses - Barrel Export
 * 
 * WHY: This barrel export file provides a clean way to import all
 * common response types from a single location. It keeps imports
 * organized and makes the API surface more discoverable.
 * 
 * NAMING CONVENTION:
 * - All exports here are response types (output data)
 * - Use "Response" suffix for consistency
 * - Input data (DTOs) are exported from ../dto/index.ts
 * 
 * USAGE:
 * import { ApiEnvelope, AnalysisJobResponse, UploadResponse } from '../common/responses';
 * // Instead of individual imports from each file
 */

// Generic API envelope (transport wrapper)
export { ApiEnvelope, createApiEnvelope } from './api-response';

// Specific response types
export { AnalysisJobResponse } from './analysis-job-response';
export { UploadResponse } from './upload-response';
