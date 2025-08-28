/**
 * Analysis Processor - Minimal Background Worker
 * 
 * WHY: This is a minimal processor that handles background analysis jobs
 * without the circular dependency issues. We'll build it up gradually.
 */

import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { ResultsService } from '../results/results.service';
import { PdfParserService } from './pdf-parser.service';
import { JobStatus } from '../common/entities/analysis-job.entity';
import { BloodworkJobData } from './types';

@Injectable()
@Processor('bloodwork-analysis')
export class AnalysisProcessor {
  private readonly logger = new Logger(AnalysisProcessor.name);

  constructor(
    private readonly analysisService: AnalysisService,
    private readonly resultsService: ResultsService,
    private readonly pdfParserService: PdfParserService,
  ) {}

  /**
   * Main processing method - handles bloodwork analysis
   */
  @Process('processBloodwork')
  async handleBloodworkAnalysis(job: Job<BloodworkJobData>): Promise<void> {
    const { jobId, userId, uploadId, filePath, originalName } = job.data;
    
    this.logger.log(`Starting analysis for job ${jobId}, file: ${originalName}`);

    try {
      // Phase 1: Initialize
      await this.updateJobProgress(jobId, JobStatus.RUNNING, 10);

      // Phase 2: Parse PDF
      this.logger.log(`Parsing PDF for job ${jobId}`);
      await this.updateJobProgress(jobId, JobStatus.RUNNING, 30);
      const parsedData = await this.pdfParserService.parseBloodworkResults(filePath);

      // Phase 3: Process results
      this.logger.log(`Processing results for job ${jobId}`);
      await this.updateJobProgress(jobId, JobStatus.RUNNING, 70);
      
      const processedResults = {
        testType: parsedData.testType,
        testDate: parsedData.testDate,
        results: parsedData.testResults,
        doctorNotes: `Analysis complete for ${parsedData.testType}. Please discuss these results with your healthcare provider.`,
        status: 'completed' as const,
      };

      // Phase 4: Save results
      await this.updateJobProgress(jobId, JobStatus.RUNNING, 90);
      const result = await this.resultsService.createResult({
        jobId,
        userId,
        ...processedResults,
      });

      // Phase 5: Complete
      await this.analysisService.updateJobStatus(jobId, {
        status: JobStatus.COMPLETED,
        progress: 100,
        resultId: result.id,
      });

      this.logger.log(`Analysis completed for job ${jobId}, result: ${result.id}`);

    } catch (error) {
      this.logger.error(`Analysis failed for job ${jobId}:`, error);
      
      await this.analysisService.updateJobStatus(jobId, {
        status: JobStatus.FAILED,
        errorMessage: error.message || 'Unknown error during analysis',
      });
      
      throw error;
    }
  }

  /**
   * Update job progress
   */
  private async updateJobProgress(jobId: string, status: JobStatus, progress: number): Promise<void> {
    await this.analysisService.updateJobStatus(jobId, { status, progress });
    this.logger.debug(`Job ${jobId} progress: ${progress}%`);
  }
}
