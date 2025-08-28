/**
 * Generic API Envelope - Transport wrapper for response data
 * 
 * WHY: Provides consistent transport format across all endpoints
 * that matches what the React Native app expects. This is the "envelope"
 * that contains the actual business response data.
 * 
 * NAMING CONVENTION:
 * - This is NOT domain data, it's a technical wrapper → "Envelope" suffix
 * - Actual domain output data uses "Response" suffix (AnalysisJobResponse, etc.)
 * - Input data (from user) uses "Dto" suffix
 * 
 * USAGE:
 * ApiEnvelope<AnalysisJobResponse> - envelope contains analysis job data
 * ApiEnvelope<UploadResponse> - envelope contains upload data
 */

import { ApiProperty } from '@nestjs/swagger';

export class ApiEnvelope<T> {
  @ApiProperty({
    description: 'Response data payload',
  })
  data: T;

  @ApiProperty({
    description: 'Success indicator',
    example: true,
  })
  success: boolean;
}

export function createApiEnvelope<T>(data: T): ApiEnvelope<T> {
  return {
    data,
    success: true,
  };
}
