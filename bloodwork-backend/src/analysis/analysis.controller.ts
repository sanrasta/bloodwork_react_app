/**
 * Analysis Controller - HTTP endpoints for job management
 * 
 * WHY: This controller provides the exact HTTP endpoints that your React Native
 * app's analysis hooks call. It handles job creation when users tap "Analyze"
 * and provides status updates for your polling mechanism.
 * 
 * FUNCTIONALITY:
 * - POST /analysis - Creates new analysis jobs (called by startAnalysisFlow)
 * - GET /analysis/:jobId - Provides job status for polling (called by useAnalysisJob)
 * - Additional endpoints for job management and monitoring
 * 
 * RELATIONSHIP TO YOUR APP:
 * React Native UploadCard -> startAnalysisFlow() -> POST /analysis -> Creates job
 * React Native useAnalysisJob -> polls GET /analysis/:jobId -> Gets status updates
 * React Native AnalysisProgress -> Shows UI based on status responses
 */

import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalysisService } from './analysis.service';
import { CreateAnalysisDto } from '../common/dto/create-analysis.dto';
import { AnalysisJobResponseDto } from '../common/dto/analysis-job-response.dto';
import { JobStatus } from '../common/entities/analysis-job.entity';

@ApiTags('analysis')
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  /**
   * Create Analysis Job Endpoint
   * 
   * WHY: This is the exact endpoint your React Native app calls when the user
   * taps "🧠 Analyze" in the UploadCard. It receives the uploadId and starts
   * the background processing that your app will poll for progress.
   * 
   * REQUEST FLOW (from your React Native app):
   * 1. User taps "Analyze" in UploadCard
   * 2. startAnalysisFlow() calls startAnalysisMutation.mutateAsync(uploadId)
   * 3. useStartAnalysis hook calls this endpoint: POST /analysis
   * 4. Request body: { uploadId: "uuid-string" }
   * 5. Response: { jobId: "uuid", status: "queued", ... }
   * 6. React Native stores jobId and transitions to analyzing state
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Start bloodwork analysis',
    description: 'Creates a new analysis job for the specified upload. The job will be queued for background processing.',
  })
  @ApiResponse({
    status: 201,
    description: 'Analysis job created successfully',
    type: AnalysisJobResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid uploadId or upload not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Analysis job already exists for this upload',
  })
  async createAnalysisJob(
    @Body() createAnalysisDto: CreateAnalysisDto,
  ): Promise<AnalysisJobResponseDto> {
    /**
     * Delegate to service layer for business logic
     * 
     * WHY: The controller handles HTTP concerns (validation, response codes)
     * while the service handles business logic (job creation, queue management).
     * This separation enables testing and code reuse.
     */
    return this.analysisService.startAnalysis(createAnalysisDto.uploadId);
  }

  /**
   * Get Job Status Endpoint
   * 
   * WHY: This is the polling endpoint that your React Native useAnalysisJob
   * hook calls every 2 seconds to get job progress updates. It powers the
   * real-time progress bar and status transitions in AnalysisProgress.
   * 
   * POLLING FLOW (from your React Native app):
   * 1. useAnalysisJob hook sets up interval timer (2 seconds)
   * 2. Timer calls this endpoint: GET /analysis/:jobId
   * 3. Response includes status, progress, resultId, etc.
   * 4. Hook compares response to detect changes
   * 5. React Native updates UI based on new status/progress
   * 6. Polling stops when status becomes 'completed' or 'failed'
   */
  @Get(':jobId')
  @ApiOperation({
    summary: 'Get analysis job status',
    description: 'Retrieves current status and progress of an analysis job. Used for polling job progress.',
  })
  @ApiParam({
    name: 'jobId',
    description: 'UUID of the analysis job',
    example: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
  })
  @ApiResponse({
    status: 200,
    description: 'Job status retrieved successfully',
    type: AnalysisJobResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found',
  })
  async getAnalysisStatus(
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ): Promise<AnalysisJobResponseDto> {
    /**
     * Simple delegation to service layer
     * 
     * WHY: This endpoint is called frequently (every 2 seconds during analysis)
     * so it needs to be fast and lightweight. The service handles caching
     * and optimization concerns.
     */
    return this.analysisService.getJobStatus(jobId);
  }

  /**
   * Cancel Job Endpoint
   * 
   * WHY: Allows users to cancel long-running analysis jobs. Could be exposed
   * in your React Native app as a "Cancel" button in AnalysisProgress.
   * Useful when users upload the wrong file or want to start over.
   * 
   * POTENTIAL REACT NATIVE INTEGRATION:
   * - Add "Cancel Analysis" button to AnalysisProgress component
   * - Call this endpoint when user taps cancel
   * - Reset Zustand state back to 'idle' step
   */
  @Delete(':jobId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Cancel analysis job',
    description: 'Cancels a queued or running analysis job. Completed jobs cannot be cancelled.',
  })
  @ApiParam({
    name: 'jobId',
    description: 'UUID of the analysis job to cancel',
  })
  @ApiResponse({
    status: 204,
    description: 'Job cancelled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Job cannot be cancelled (already completed or failed)',
  })
  async cancelJob(@Param('jobId', ParseUUIDPipe) jobId: string): Promise<void> {
    await this.analysisService.cancelJob(jobId);
  }

  /**
   * Get Jobs by Status Endpoint
   * 
   * WHY: Useful for monitoring and debugging. Could power an admin dashboard
   * in your React Native app to show queue health and job statistics.
   * 
   * POTENTIAL REACT NATIVE USAGE:
   * - Admin screen showing job queue status
   * - Monitoring dashboard for job success/failure rates
   * - Debugging interface for failed jobs
   */
  @Get()
  @ApiOperation({
    summary: 'Get analysis jobs',
    description: 'Retrieves analysis jobs, optionally filtered by status. Useful for monitoring and administration.',
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter jobs by status',
    enum: JobStatus,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of jobs to return',
    type: Number,
    required: false,
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Jobs retrieved successfully',
    type: [AnalysisJobResponseDto],
  })
  async getJobs(
    @Query('status') status?: JobStatus,
    @Query('limit') limit?: number,
  ): Promise<AnalysisJobResponseDto[]> {
    /**
     * Conditional logic based on query parameters
     * 
     * WHY: Provides flexibility for different monitoring needs.
     * Can get all jobs, filter by status, or limit results for performance.
     */
    if (status) {
      const jobs = await this.analysisService.getJobsByStatus(status);
      return jobs.map(job => ({
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        resultId: job.resultId,
        errorMessage: job.errorMessage,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      }));
    }

    const jobs = await this.analysisService.getAllJobs(limit || 50);
    return jobs.map(job => ({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      resultId: job.resultId,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    }));
  }

  /**
   * Health Check Endpoint
   * 
   * WHY: Verifies the analysis service is healthy and can process jobs.
   * Useful for monitoring and can be called by your React Native app
   * to verify the analysis service is available before starting jobs.
   * 
   * HEALTH CHECK INFORMATION:
   * - Queue connection status
   * - Database connectivity
   * - Current job counts by status
   * - Service configuration
   */
  @Get('health/status')
  @ApiOperation({
    summary: 'Check analysis service health',
    description: 'Verifies analysis service is healthy and ready to process jobs.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service health information',
  })
  async checkHealth(): Promise<{
    status: string;
    queueConnection: string;
    jobCounts: Record<JobStatus, number>;
    timestamp: string;
  }> {
    try {
      // Get job counts by status for health monitoring
      const [queued, running, completed, failed] = await Promise.all([
        this.analysisService.getJobsByStatus(JobStatus.QUEUED),
        this.analysisService.getJobsByStatus(JobStatus.RUNNING),
        this.analysisService.getJobsByStatus(JobStatus.COMPLETED),
        this.analysisService.getJobsByStatus(JobStatus.FAILED),
      ]);

      return {
        status: 'healthy',
        queueConnection: 'connected',
        jobCounts: {
          [JobStatus.QUEUED]: queued.length,
          [JobStatus.RUNNING]: running.length,
          [JobStatus.COMPLETED]: completed.length,
          [JobStatus.FAILED]: failed.length,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        queueConnection: 'error',
        jobCounts: {
          [JobStatus.QUEUED]: 0,
          [JobStatus.RUNNING]: 0,
          [JobStatus.COMPLETED]: 0,
          [JobStatus.FAILED]: 0,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }
}
