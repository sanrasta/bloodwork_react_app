/**
 * Results Service - Business logic for bloodwork analysis results
 * 
 * WHY: This service manages the final analyzed bloodwork data that your
 * React Native ResultSummary component displays. It handles result creation,
 * retrieval, formatting, and analysis statistics that power your app's insights.
 * 
 * FUNCTIONALITY:
 * - Creates result records when analysis completes
 * - Retrieves results for React Native display
 * - Calculates statistics (normal vs abnormal counts)
 * - Formats data for optimal frontend consumption
 * - Manages result lifecycle and cleanup
 * 
 * RELATIONSHIP TO YOUR APP:
 * Background processor creates results -> This service stores them
 * React Native ResultSummary -> GET /results/:resultId -> This service provides data
 * Your app displays charts, insights, and recommendations based on this data
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloodworkResult, TestResult } from '../common/entities/bloodwork-result.entity';
import { AiRecommendationsService } from './ai-recommendations.service';

/**
 * Result statistics interface for frontend consumption
 * 
 * WHY: Your React Native ResultSummary component needs aggregated
 * statistics to show overview cards and summary information.
 */
export interface ResultStatistics {
  totalTests: number;
  normalCount: number;
  abnormalCount: number;
  criticalCount: number;
  testDate: string;
  testType: string;
  overallStatus: 'normal' | 'abnormal' | 'critical';
}

/**
 * Enhanced result response with computed fields
 * 
 * WHY: Adds calculated fields that your React Native app needs
 * without requiring complex calculations on the frontend.
 */
export interface EnhancedBloodworkResult extends BloodworkResult {
  statistics: ResultStatistics;
  criticalTests: TestResult[];
  abnormalTests: TestResult[];
  recommendations: string[];
  aiInsights: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    followUpTimeframe: string;
    keyFindings: string[];
    medicalDisclaimer: string;
  };
}

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(BloodworkResult)
    private readonly resultRepository: Repository<BloodworkResult>,
    private readonly aiRecommendationsService: AiRecommendationsService,
  ) {}

  /**
   * Creates a new bloodwork result record
   * 
   * WHY: Called by the background processor when AI analysis completes.
   * This method stores the final analyzed data that your React Native
   * app will fetch and display in the ResultSummary component.
   * 
   * USAGE: AnalysisProcessor calls this with generated/analyzed results
   */
  async createResult(resultData: Partial<BloodworkResult>): Promise<BloodworkResult> {
    // Validate required fields
    if (!resultData.jobId) {
      throw new Error('Job ID is required for result creation');
    }

    if (!resultData.results || !Array.isArray(resultData.results)) {
      throw new Error('Test results array is required');
    }

    // Create and save result entity
    const result = this.resultRepository.create(resultData);
    const savedResult = await this.resultRepository.save(result);

    return savedResult;
  }

  /**
   * Retrieves result by ID with enhanced data for a specific user
   * 
   * WHY: This is the main method called by your React Native app when
   * displaying the ResultSummary. It provides not just the raw data,
   * but also calculated statistics and insights.
   * 
   * USAGE: GET /results/:resultId endpoint calls this method
   */
  async findByIdWithEnhancements(id: string, userId: string): Promise<EnhancedBloodworkResult> {
    const result = await this.resultRepository.findOne({ where: { id, userId } });
    
    if (!result) {
      throw new NotFoundException(`Bloodwork result ${id} not found`);
    }

    // Calculate statistics for frontend display
    const statistics = this.calculateStatistics(result);
    
    // Identify critical and abnormal tests for highlighting
    const criticalTests = result.results.filter(test => test.status === 'critical');
    const abnormalTests = result.results.filter(test => 
      test.status === 'high' || test.status === 'low'
    );

    // Generate AI-powered recommendations based on complete analysis
    const aiRecommendations = await this.aiRecommendationsService.generateRecommendations({
      testResults: result.results,
      testType: result.testType,
      testDate: result.testDate,
      // TODO: Add patient context when available
      // patientContext: {
      //   age: patientAge,
      //   gender: patientGender,
      //   medicalHistory: patientHistory,
      // }
    });

    return {
      ...result,
      statistics,
      criticalTests,
      abnormalTests,
      recommendations: aiRecommendations.recommendations,
      aiInsights: {
        severity: aiRecommendations.severity,
        followUpTimeframe: aiRecommendations.followUpTimeframe,
        keyFindings: aiRecommendations.keyFindings,
        medicalDisclaimer: aiRecommendations.medicalDisclaimer,
      },
    };
  }

  /**
   * Simple result retrieval without enhancements
   * 
   * WHY: For cases where you just need the raw data without
   * additional calculations. Used by other services or admin endpoints.
   */
  async findById(id: string): Promise<BloodworkResult> {
    const result = await this.resultRepository.findOne({ where: { id } });
    
    if (!result) {
      throw new NotFoundException(`Bloodwork result ${id} not found`);
    }

    return result;
  }

  /**
   * Retrieves results by job ID
   * 
   * WHY: Useful for linking results back to the original analysis job.
   * Could be used for result history or debugging purposes.
   */
  async findByJobId(jobId: string): Promise<BloodworkResult | null> {
    return this.resultRepository.findOne({ where: { jobId } });
  }

  /**
   * Calculates result statistics for frontend display
   * 
   * WHY: Your React Native ResultSummary component shows overview
   * statistics like "12 total tests, 10 normal, 2 abnormal, 0 critical".
   * This method calculates those numbers from the test results.
   * 
   * FRONTEND USAGE:
   * - Overview stat cards in ResultSummary
   * - Progress indicators and health scores
   * - Alert badges and warning indicators
   */
  private calculateStatistics(result: BloodworkResult): ResultStatistics {
    const { results } = result;
    
    const totalTests = results.length;
    const normalCount = results.filter(test => test.status === 'normal').length;
    const highCount = results.filter(test => test.status === 'high').length;
    const lowCount = results.filter(test => test.status === 'low').length;
    const criticalCount = results.filter(test => test.status === 'critical').length;
    
    const abnormalCount = highCount + lowCount;
    
    // Determine overall status based on worst finding
    let overallStatus: 'normal' | 'abnormal' | 'critical';
    if (criticalCount > 0) {
      overallStatus = 'critical';
    } else if (abnormalCount > 0) {
      overallStatus = 'abnormal';
    } else {
      overallStatus = 'normal';
    }

    return {
      totalTests,
      normalCount,
      abnormalCount,
      criticalCount,
      testDate: result.testDate,
      testType: result.testType,
      overallStatus,
    };
  }

  /**
   * DEPRECATED: Replaced with AI-powered recommendations
   * 
   * WHY: The old rule-based recommendations have been replaced with
   * AI-generated recommendations that provide much more sophisticated
   * analysis and contextual advice through the AiRecommendationsService.
   * 
   * The AI approach considers:
   * - Complete medical context and test interactions
   * - Personalized advice based on specific patterns  
   * - Evidence-based medical recommendations
   * - Appropriate medical disclaimers and safety
   * 
   * When ready for real AI integration, simply update the
   * AiRecommendationsService to call OpenAI or other medical AI APIs.
   */

  /**
   * Retrieves all results for a specific time period
   * 
   * WHY: Useful for analytics, trend analysis, or admin dashboards.
   * Could power a "results history" feature in your React Native app.
   */
  async getResultsByDateRange(startDate: Date, endDate: Date): Promise<BloodworkResult[]> {
    return this.resultRepository
      .createQueryBuilder('result')
      .where('result.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('result.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Gets summary statistics across all results
   * 
   * WHY: Useful for admin dashboards, system monitoring, or aggregate
   * analytics about the types of results being processed.
   */
  async getOverallStatistics(): Promise<{
    totalResults: number;
    criticalResultsCount: number;
    averageTestsPerResult: number;
    commonTestTypes: string[];
  }> {
    const allResults = await this.resultRepository.find();
    
    const totalResults = allResults.length;
    const criticalResultsCount = allResults.filter(result => 
      result.results.some(test => test.status === 'critical')
    ).length;
    
    const totalTests = allResults.reduce((sum, result) => sum + result.results.length, 0);
    const averageTestsPerResult = totalResults > 0 ? Math.round(totalTests / totalResults) : 0;
    
    // Find most common test types
    const testTypeCounts = allResults.reduce((counts, result) => {
      counts[result.testType] = (counts[result.testType] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const commonTestTypes = Object.entries(testTypeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type]) => type);

    return {
      totalResults,
      criticalResultsCount,
      averageTestsPerResult,
      commonTestTypes,
    };
  }

  /**
   * Cleanup old results (for maintenance)
   * 
   * WHY: Prevents database from growing indefinitely. Can be called
   * by scheduled cleanup jobs to maintain system performance.
   */
  async cleanupOldResults(olderThanDays: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.resultRepository
      .createQueryBuilder()
      .delete()
      .from(BloodworkResult)
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}
