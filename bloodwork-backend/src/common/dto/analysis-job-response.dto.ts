/**
 * Analysis Job Response DTO - Contract for job status responses
 * 
 * WHY: This DTO standardizes the response format for both job creation
 * (POST /analysis) and job status polling (GET /analysis/:jobId).
 * Your React Native useAnalysisJob hook depends on this exact structure.
 * 
 * FUNCTIONALITY:
 * - Provides consistent job status information
 * - Includes progress data for your progress bar
 * - Contains resultId when analysis completes
 * - Includes error details for failure handling
 * 
 * RELATIONSHIP TO YOUR APP:
 * useAnalysisJob hook expects this format for polling
 * AnalysisProgress component reads status and progress
 * ResultSummary gets resultId from completed jobs
 */

import { ApiProperty } from '@nestjs/swagger';
import { JobStatus } from '../entities/analysis-job.entity';

export class AnalysisJobResponseDto {
  /**
   * Unique identifier for the analysis job
   * Used by your React Native app for polling status
   */
  @ApiProperty({
    description: 'Unique identifier for the analysis job',
    example: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
  })
  jobId: string;

  /**
   * Current status of the analysis job
   * Drives which component your React Native app renders
   */
  @ApiProperty({
    description: 'Current status of the analysis job',
    enum: JobStatus,
    example: JobStatus.RUNNING,
  })
  status: JobStatus;

  /**
   * Progress percentage (0-100) - optional, only present during processing
   * Used by your AnalysisProgress component for the progress bar
   */
  @ApiProperty({
    description: 'Progress percentage (0-100)',
    example: 75,
    required: false,
  })
  progress?: number;

  /**
   * Result ID when analysis completes successfully
   * Used by your app to fetch the final bloodwork results
   */
  @ApiProperty({
    description: 'ID of the analysis result when completed',
    example: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
    required: false,
  })
  resultId?: string;

  /**
   * Error message if the analysis fails
   * Displayed in your AnalysisProgress error state
   */
  @ApiProperty({
    description: 'Error message if analysis fails',
    example: 'PDF parsing failed: Corrupted file',
    required: false,
  })
  errorMessage?: string;

  /**
   * When the job was created
   * Used for timeout calculations and user feedback
   */
  @ApiProperty({
    description: 'When the job was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: string;

  /**
   * When the job was last updated
   * Used for detecting fresh updates during polling
   */
  @ApiProperty({
    description: 'When the job was last updated',
    example: '2024-01-15T10:32:15Z',
  })
  updatedAt: string;
}
