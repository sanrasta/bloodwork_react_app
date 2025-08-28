/**
 * Results Module - NestJS module configuration for results functionality
 * 
 * WHY: This module packages all results-related functionality into a
 * self-contained unit. It handles the final step of your application flow:
 * serving analyzed bloodwork data to your React Native ResultSummary component.
 * 
 * FUNCTIONALITY:
 * - Registers BloodworkResult entity for database operations
 * - Configures ResultsService with proper dependencies
 * - Exports ResultsController for HTTP endpoints
 * - Makes ResultsService available to other modules (AnalysisProcessor)
 * - Provides clean separation of results logic
 * 
 * RELATIONSHIP TO YOUR APP:
 * Background processor -> ResultsService -> Database -> BloodworkResult entity
 * React Native -> ResultsController -> ResultsService -> Enhanced data response
 * This module completes the full analysis pipeline your app depends on
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';
import { AiRecommendationsService } from './ai-recommendations.service';
import { BloodworkResult } from '../common/entities/bloodwork-result.entity';

@Module({
  /**
   * Import required modules and configure dependencies
   * 
   * WHY: NestJS dependency injection requires explicit declaration
   * of what this module needs to function. The TypeORM module
   * registration enables database operations on BloodworkResult.
   */
  imports: [
    /**
     * TypeORM configuration for BloodworkResult entity
     * 
     * WHY: This registers the BloodworkResult entity with TypeORM so the
     * ResultsService can inject the BloodworkResult repository for database
     * operations. Without this, @InjectRepository(BloodworkResult) would fail.
     * 
     * ENABLES:
     * - Creating result records when analysis completes
     * - Retrieving results for React Native display
     * - Calculating statistics and enhancements
     * - Managing result lifecycle and cleanup
     */
    TypeOrmModule.forFeature([BloodworkResult]),
  ],

  /**
   * Controllers that handle HTTP requests
   * 
   * WHY: ResultsController handles the GET /results/:resultId endpoint
   * that your React Native useResultQuery hook calls. NestJS needs to
   * know which classes are controllers to register their routes.
   * 
   * ENDPOINTS PROVIDED:
   * - GET /results/:resultId - Main endpoint for ResultSummary
   * - GET /results/:resultId/raw - Raw data without enhancements
   * - GET /results?startDate&endDate - Range queries for analytics
   * - GET /results/system/statistics - System-wide statistics
   * - GET /results/health/status - Service health monitoring
   */
  controllers: [ResultsController],

  /**
   * Services that provide business logic
   * 
   * WHY: ResultsService contains the core results processing logic,
   * and AiRecommendationsService provides intelligent, AI-powered
   * recommendations based on bloodwork analysis.
   * 
   * BUSINESS LOGIC PROVIDED:
   * - Result creation and storage (ResultsService)
   * - Statistics calculation (ResultsService)  
   * - Data enhancement with insights (ResultsService)
   * - AI-powered recommendation generation (AiRecommendationsService)
   * - Medical context analysis (AiRecommendationsService)
   * - Performance optimization (ResultsService)
   */
  providers: [ResultsService, AiRecommendationsService],

  /**
   * Services exported for use by other modules
   * 
   * WHY: The AnalysisProcessor needs to create result records when
   * AI analysis completes. Exporting ResultsService allows the
   * AnalysisModule to import and use it for result creation.
   * 
   * USAGE BY OTHER MODULES:
   * - AnalysisProcessor calls ResultsService.createResult()
   * - Future modules could access results for analytics
   * - Admin modules could use results for monitoring
   */
  exports: [ResultsService, AiRecommendationsService],
})
export class ResultsModule {
  /**
   * Optional: Module initialization hook
   * 
   * WHY: Could be used for results-specific initialization tasks
   * like setting up result retention policies, creating indexes
   * for better query performance, or initializing analytics.
   */
  constructor() {
    // Future: Add any results-specific initialization here
    this.logModuleInitialization();
  }

  /**
   * Logs module initialization for monitoring
   * 
   * WHY: Helps with debugging and monitoring module lifecycle.
   * Useful for ensuring all modules load properly during startup.
   */
  private logModuleInitialization(): void {
    console.log('✅ Results Module initialized - Ready to serve analysis results');
  }
}
