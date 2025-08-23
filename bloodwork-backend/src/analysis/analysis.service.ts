/**
 * Analysis Service - Core business logic for AI analysis job management
 * 
 * WHY: This service is the brain of your background processing system.
 * When your React Native app calls "Analyze", this service creates jobs,
 * manages their lifecycle, and provides status updates for polling.
 * 
 * FUNCTIONALITY:
 * - Creates analysis jobs linked to uploaded files
 * - Queues jobs for background processing with Bull
 * - Provides real-time job status for React Native polling
 * - Updates job progress during AI analysis
 * - Links completed jobs to final results
 * 
 * RELATIONSHIP TO YOUR APP:
 * React Native startAnalysisFlow -> POST /analysis -> This service creates job
 * React Native useAnalysisJob -> GET /analysis/:jobId -> This service provides status
 * Background processor updates job status -> React Native sees progress changes
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Repository } from 'typeorm';
import type { Queue } from 'bull';
import { AnalysisJob, JobStatus } from '../common/entities/analysis-job.entity';
import { AnalysisJobResponseDto } from '../common/dto/analysis-job-response.dto';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(AnalysisJob)
    private readonly jobRepository: Repository<AnalysisJob>,
    @InjectQueue('bloodwork-analysis')
    private readonly analysisQueue: Queue,
    private readonly uploadsService: UploadsService,
  ) {}

  /**
   * Creates a new analysis job and queues it for processing
   * 
   * WHY: This is the method called when your React Native user taps "Analyze".
   * It validates the upload exists, creates a job record, and starts background
   * processing that your app will poll for progress.
   * 
   * PROCESS:
   * 1. Validate uploadId exists and file is accessible
   * 2. Create job record in database with QUEUED status
   * 3. Add job to Bull queue for background processing
   * 4. Return job details for React Native polling
   */
  async startAnalysis(uploadId: string, userId: string): Promise<AnalysisJobResponseDto> {
    // Verify upload exists and file is accessible for this user
    const upload = await this.uploadsService.findByIdWithFileCheck(uploadId, userId);
    
    // Check if analysis already exists for this upload
    const existingJob = await this.jobRepository.findOne({
      where: { uploadId, userId, status: JobStatus.QUEUED },
    });
    
    if (existingJob) {
      throw new BadRequestException(
        `Analysis job already exists for upload ${uploadId}`
      );
    }

    // Create job record in database
    const job = this.jobRepository.create({
      userId,
      uploadId,
      status: JobStatus.QUEUED,
      progress: 0,
    });

    const savedJob = await this.jobRepository.save(job);

    // Add job to background processing queue
    await this.analysisQueue.add('processBloodwork', {
      jobId: savedJob.id,
      userId,
      uploadId,
      filePath: upload.path,
      originalName: upload.originalName,
    });

    // Format response for React Native
    return this.formatJobResponse(savedJob);
  }

  /**
   * Retrieves current job status for polling
   * 
   * WHY: Your React Native useAnalysisJob hook calls this every 2 seconds
   * to get updated progress, status changes, and completion signals.
   * This powers your AnalysisProgress component's real-time updates.
   * 
   * POLLING FLOW:
   * React Native timer -> GET /analysis/:jobId -> This method -> Updated status
   * Progress bar updates, status changes, completion detection
   */
  async getJobStatus(jobId: string, userId: string): Promise<AnalysisJobResponseDto> {
    const job = await this.jobRepository.findOne({ where: { id: jobId, userId } });
    
    if (!job) {
      throw new NotFoundException(`Analysis job ${jobId} not found`);
    }

    return this.formatJobResponse(job);
  }

  /**
   * Updates job status and progress (called by background processor)
   * 
   * WHY: The background processor calls this to update job progress
   * from 0% to 100%, change status from QUEUED to RUNNING to COMPLETED,
   * and record any errors that occur during processing.
   * 
   * USAGE:
   * - Background processor updates progress: 10%, 25%, 50%, 75%, 100%
   * - Status transitions: QUEUED -> RUNNING -> COMPLETED/FAILED
   * - Error handling: Records specific error messages for debugging
   */
  async updateJobStatus(jobId: string, updates: Partial<AnalysisJob>): Promise<void> {
    const result = await this.jobRepository.update(jobId, {
      ...updates,
      updatedAt: new Date(), // Ensure updatedAt timestamp changes
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Analysis job ${jobId} not found for update`);
    }
  }

  /**
   * Retrieves all jobs for monitoring and debugging
   * 
   * WHY: Useful for admin interfaces, monitoring dashboards,
   * and debugging issues with job processing. Could be exposed
   * via admin endpoints for operational visibility.
   */
  async getAllJobs(limit: number = 50): Promise<AnalysisJob[]> {
    return this.jobRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Retrieves jobs by status for queue monitoring
   * 
   * WHY: Enables monitoring of queue health - how many jobs
   * are queued, running, completed, or failed. Useful for
   * scaling decisions and error rate monitoring.
   */
  async getJobsByStatus(status: JobStatus): Promise<AnalysisJob[]> {
    return this.jobRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Cancels a queued or running job
   * 
   * WHY: Allows users to cancel long-running analysis jobs
   * if they uploaded the wrong file or want to start over.
   * Could be exposed via a "Cancel" button in React Native.
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    
    if (!job) {
      throw new NotFoundException(`Analysis job ${jobId} not found`);
    }

    if (job.status === JobStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed job');
    }

    if (job.status === JobStatus.FAILED) {
      throw new BadRequestException('Cannot cancel failed job');
    }

    // Remove from queue if still queued
    const queueJob = await this.analysisQueue.getJob(jobId);
    if (queueJob) {
      await queueJob.remove();
    }

    // Update job status
    await this.updateJobStatus(jobId, {
      status: JobStatus.FAILED,
      errorMessage: 'Job cancelled by user',
    });
  }

  /**
   * Cleanup failed or old jobs
   * 
   * WHY: Prevents database from growing indefinitely with old job records.
   * Can be called by scheduled cleanup tasks to maintain system health.
   */
  async cleanupOldJobs(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.jobRepository
      .createQueryBuilder()
      .delete()
      .from(AnalysisJob)
      .where('createdAt < :cutoffDate', { cutoffDate })
      .andWhere('status IN (:...statuses)', { 
        statuses: [JobStatus.COMPLETED, JobStatus.FAILED] 
      })
      .execute();

    return result.affected || 0;
  }

  /**
   * Formats job entity for API response
   * 
   * WHY: Centralizes the response formatting logic to ensure
   * consistent API responses that match your React Native
   * useAnalysisJob hook expectations.
   */
  private formatJobResponse(job: AnalysisJob): AnalysisJobResponseDto {
    return {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      resultId: job.resultId,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    };
  }
}
