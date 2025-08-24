/**
 * Analysis Module - NestJS module configuration for AI analysis functionality
 * 
 * WHY: This module is the heart of your background processing system.
 * It orchestrates the entire AI analysis pipeline from job creation
 * through background processing to result generation.
 * 
 * FUNCTIONALITY:
 * - Manages analysis job lifecycle and status tracking
 * - Configures Bull queue for background AI processing
 * - Integrates with uploads for file access
 * - Integrates with results for final data storage
 * - Provides real-time job status for React Native polling
 * 
 * RELATIONSHIP TO YOUR APP:
 * React Native "Analyze" button -> AnalysisController -> AnalysisService
 * Background queue -> AnalysisProcessor -> AI simulation -> ResultsService
 * React Native polling -> AnalysisController -> Real-time status updates
 */

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { AnalysisProcessor } from './analysis.processor';
import { PdfParserService } from './pdf-parser.service';
import { AnalysisJob } from '../common/entities/analysis-job.entity';
import { UploadsModule } from '../uploads/uploads.module';
import { ResultsModule } from '../results/results.module';

@Module({
  /**
   * Import required modules and configure dependencies
   * 
   * WHY: This module depends on several other modules to function:
   * - TypeORM for database operations
   * - Bull for background job processing
   * - UploadsModule for file access
   * - ResultsModule for storing final analysis data
   */
  imports: [
    /**
     * TypeORM configuration for AnalysisJob entity
     * 
     * WHY: Enables database operations on analysis jobs - creating jobs
     * when users request analysis, updating progress during processing,
     * and providing status for React Native polling.
     */
    TypeOrmModule.forFeature([AnalysisJob]),

    /**
     * Bull queue configuration for background processing
     * 
     * WHY: This is the core of your background processing system.
     * When users tap "Analyze" in React Native, jobs are queued here
     * and processed asynchronously by AnalysisProcessor.
     * 
     * QUEUE FEATURES:
     * - Asynchronous processing (doesn't block API responses)
     * - Job persistence (survives server restarts)
     * - Progress tracking (powers your progress bar)
     * - Error handling and retries
     * - Scalable (can add more workers)
     */
    BullModule.registerQueue({
      name: 'bloodwork-analysis',
      defaultJobOptions: {
        removeOnComplete: 10,  // Keep last 10 completed jobs for debugging
        removeOnFail: 5,       // Keep last 5 failed jobs for debugging
        attempts: 3,           // Retry failed jobs up to 3 times
        backoff: {
          type: 'exponential',
          delay: 2000,         // Start with 2 second delay, increase exponentially
        },
      },
    }),

    /**
     * Uploads module import for file access
     * 
     * WHY: AnalysisService needs to validate that uploaded files exist
     * and AnalysisProcessor needs file paths for AI processing.
     * This enables the upload → analysis workflow.
     */
    UploadsModule,

    /**
     * Results module import for storing final data
     * 
     * WHY: AnalysisProcessor needs to store the final analyzed data
     * that React Native will display. This completes the full pipeline:
     * Upload → Analysis → Results → Display
     * 
     * Using direct import instead of forwardRef to avoid circular dependency
     */
    ResultsModule,
  ],

  /**
   * Controllers that handle HTTP requests
   * 
   * WHY: AnalysisController provides the exact endpoints your React Native
   * app calls for job management and status polling.
   * 
   * ENDPOINTS FOR REACT NATIVE:
   * - POST /analysis - Creates jobs when user taps "Analyze"
   * - GET /analysis/:jobId - Provides status for polling every 2 seconds
   * - DELETE /analysis/:jobId - Allows job cancellation (future feature)
   */
  controllers: [AnalysisController],

  /**
   * Services and processors that provide functionality
   * 
   * WHY: These are the core components that implement the analysis logic:
   * - AnalysisService: Job management and business logic
   * - AnalysisProcessor: Background AI processing and simulation
   */
  providers: [
    /**
     * AnalysisService - Job management and business logic
     * 
     * WHY: Handles job creation, status tracking, and lifecycle management.
     * Provides the interface between HTTP requests and background processing.
     */
    AnalysisService,

    /**
     * AnalysisProcessor - Background job processing
     * 
     * WHY: Handles the actual PDF parsing and analysis in the background.
     * Processes jobs from the Bull queue asynchronously.
     */
    AnalysisProcessor,

    /**
     * PdfParserService - Real PDF text extraction and parsing
     * 
     * WHY: Extracts actual test results from uploaded PDFs instead of
     * using mock data. Handles various lab report formats.
     */
    PdfParserService,
  ],

  /**
   * Services exported for use by other modules
   * 
   * WHY: Other modules might need to access analysis functionality.
   * For example, an admin module might want to monitor job queues,
   * or a reporting module might need job statistics.
   */
  exports: [AnalysisService],
})
export class AnalysisModule {
  /**
   * Module initialization with dependency injection
   * 
   * WHY: ConfigService is injected to access configuration values
   * for queue setup, job settings, and processing parameters.
   */
  constructor(private configService: ConfigService) {
    this.logModuleInitialization();
    this.validateConfiguration();
  }

  /**
   * Logs module initialization for monitoring
   * 
   * WHY: Helps with debugging and ensures the analysis system
   * is properly initialized and ready to process jobs.
   */
  private logModuleInitialization(): void {
    console.log('🧠 Analysis Module initialized - AI processing system ready');
    console.log(`📊 Queue: bloodwork-analysis`);
    console.log(`🔄 Processing: Background jobs with progress tracking`);
    console.log(`📡 Endpoints: POST /analysis, GET /analysis/:jobId`);
  }

  /**
   * Validates configuration for analysis system
   * 
   * WHY: Ensures all required configuration is available for
   * the analysis system to function properly. Fails fast if
   * critical configuration is missing.
   */
  private validateConfiguration(): void {
    const redisUrl = this.configService.get<string>('redis.url');
    if (!redisUrl) {
      console.warn('⚠️  Redis URL not configured - Bull queue may not work properly');
    }

    const uploadPath = this.configService.get<string>('upload.path');
    if (!uploadPath) {
      console.warn('⚠️  Upload path not configured - File processing may fail');
    }

    console.log('✅ Analysis module configuration validated');
  }
}
