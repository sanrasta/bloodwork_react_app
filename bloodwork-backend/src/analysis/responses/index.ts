/**
 * Analysis Responses - Barrel Export
 * 
 * WHY: This barrel export file provides a clean way to import all
 * analysis response types from a single location. It keeps imports
 * organized and makes the API surface more discoverable.
 * 
 * USAGE:
 * import { BloodworkParseResult } from '../responses';
 * // Instead of: import { BloodworkParseResult } from '../responses/bloodwork-parse-result';
 */

export type { BloodworkParseResult } from './bloodwork-parse-result';

// Future analysis response types can be exported here as well
// export { AnalysisProcessResult } from './analysis-process-result';
// export { ValidationResult } from './validation-result';
