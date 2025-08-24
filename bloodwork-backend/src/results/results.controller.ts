/**
 * Results Controller - HTTP endpoints for accessing analysis results
 * 
 * WHY: This controller provides the endpoints your React Native ResultSummary
 * component calls to display the final bloodwork analysis. It serves the
 * enhanced data with statistics, recommendations, and insights.
 * 
 * FUNCTIONALITY:
 * - GET /results/:resultId - Main endpoint for ResultSummary component
 * - Serves enhanced results with calculated statistics
 * - Provides proper error handling for missing results
 * - Includes monitoring endpoints for admin dashboards
 * 
 * RELATIONSHIP TO YOUR APP:
 * Analysis completes -> resultId available -> React Native calls GET /results/:resultId
 * ResultSummary component -> useResultQuery hook -> This controller -> Enhanced data
 * User sees beautiful results with insights, stats, and recommendations
 */

import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ResultsService, EnhancedBloodworkResult } from './results.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { BloodworkResult } from '../common/entities/bloodwork-result.entity';
import { ClerkAuthGuard, CurrentUser, Public } from '../auth';

@ApiTags('results')
@Controller('results')
// @UseGuards(ClerkAuthGuard) // Temporarily disabled for testing
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  /**
   * Get Enhanced Result by ID - Main endpoint for React Native
   * 
   * WHY: This is the exact endpoint your React Native useResultQuery hook
   * calls when displaying the ResultSummary component. It provides all the
   * data your app needs in a single, optimized response.
   * 
   * REQUEST FLOW (from your React Native app):
   * 1. Analysis job completes with resultId
   * 2. useResultQuery(resultId) calls this endpoint: GET /results/:resultId
   * 3. This controller returns enhanced data with statistics and insights
   * 4. ResultSummary component renders beautiful UI with the data
   * 
   * RESPONSE INCLUDES:
   * - Raw test results for detailed display
   * - Calculated statistics for overview cards
   * - Critical/abnormal test highlights
   * - Contextual recommendations for user action
   */
  @Get(':resultId')
  @ApiOperation({
    summary: 'Get bloodwork analysis result',
    description: 'Retrieves complete bloodwork analysis result with enhanced statistics, insights, and recommendations.',
  })
  @ApiParam({
    name: 'resultId',
    description: 'UUID of the analysis result',
    example: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
  })
  @ApiResponse({
    status: 200,
    description: 'Result retrieved successfully with enhancements',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'c3d4e5f6-g7h8-9012-cdef-345678901234' },
        jobId: { type: 'string', example: 'b2c3d4e5-f6g7-8901-bcde-f23456789012' },
        testType: { type: 'string', example: 'Complete Blood Count' },
        testDate: { type: 'string', example: '2024-01-15T10:30:00Z' },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              testName: { type: 'string' },
              value: { type: 'number' },
              unit: { type: 'string' },
              referenceRange: {
                type: 'object',
                properties: {
                  min: { type: 'number' },
                  max: { type: 'number' },
                },
              },
              status: { type: 'string', enum: ['normal', 'high', 'low', 'critical'] },
            },
          },
        },
        statistics: {
          type: 'object',
          properties: {
            totalTests: { type: 'number' },
            normalCount: { type: 'number' },
            abnormalCount: { type: 'number' },
            criticalCount: { type: 'number' },
            overallStatus: { type: 'string', enum: ['normal', 'abnormal', 'critical'] },
          },
        },
        recommendations: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Result not found',
  })
  async getResult(
    @Param('resultId', ParseUUIDPipe) resultId: string,
    // @CurrentUser() userId: string, // Temporarily disabled for testing
  ): Promise<ApiResponseDto<EnhancedBloodworkResult>> {
    /**
     * Delegate to service for enhanced data retrieval
     * 
     * WHY: The service layer handles all the complex calculations,
     * statistics generation, and recommendation logic. The controller
     * just handles HTTP concerns and returns the processed data.
     */
    const userId = 'test-user-id'; // Temporary for testing
    return this.resultsService.findByIdWithEnhancements(resultId, userId);
  }

  /**
   * Get Raw Result Data (without enhancements)
   * 
   * WHY: Sometimes you might need just the raw data without all the
   * calculated fields. Useful for API integrations, data exports,
   * or cases where you want minimal response size.
   * 
   * USAGE: Could be used by admin tools, data export features,
   * or third-party integrations that don't need the enhanced data.
   */
  @Get(':resultId/raw')
  @ApiOperation({
    summary: 'Get raw bloodwork result data',
    description: 'Retrieves raw bloodwork result without calculated statistics or recommendations. Minimal response for API integrations.',
  })
  @ApiParam({
    name: 'resultId',
    description: 'UUID of the analysis result',
  })
  @ApiResponse({
    status: 200,
    description: 'Raw result data retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Result not found',
  })
  async getRawResult(
    @Param('resultId', ParseUUIDPipe) resultId: string,
  ): Promise<BloodworkResult> {
    return this.resultsService.findById(resultId);
  }

  /**
   * Get Results by Date Range
   * 
   * WHY: Useful for analytics, trend analysis, or building a results
   * history feature in your React Native app. Could power a timeline
   * view showing how test values change over time.
   * 
   * POTENTIAL REACT NATIVE FEATURES:
   * - Results history screen
   * - Trend charts for specific test values
   * - Health progression tracking
   * - Comparative analysis between test dates
   */
  @Get()
  @ApiOperation({
    summary: 'Get results by date range',
    description: 'Retrieves bloodwork results within a specified date range. Useful for analytics and trend analysis.',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date for result range (ISO string)',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date for result range (ISO string)',
    example: '2024-01-31T23:59:59Z',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of results to return',
    type: Number,
    required: false,
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Results retrieved successfully',
    type: [BloodworkResult],
  })
  async getResultsByDateRange(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ): Promise<BloodworkResult[]> {
    // Default to last 30 days if no range specified
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const results = await this.resultsService.getResultsByDateRange(start, end);
    
    // Apply limit if specified
    if (limit && limit > 0) {
      return results.slice(0, limit);
    }
    
    return results;
  }

  /**
   * Get System Statistics
   * 
   * WHY: Provides aggregate statistics about all results in the system.
   * Useful for admin dashboards, system monitoring, or analytics about
   * the types of health patterns being detected.
   * 
   * POTENTIAL ADMIN FEATURES:
   * - System health dashboard
   * - Usage analytics
   * - Quality metrics
   * - Popular test types
   */
  @Get('system/statistics')
  @ApiOperation({
    summary: 'Get system-wide result statistics',
    description: 'Retrieves aggregate statistics about all bloodwork results in the system. Useful for monitoring and analytics.',
  })
  @ApiResponse({
    status: 200,
    description: 'System statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalResults: { type: 'number', description: 'Total number of results processed' },
        criticalResultsCount: { type: 'number', description: 'Number of results with critical findings' },
        averageTestsPerResult: { type: 'number', description: 'Average number of tests per result' },
        commonTestTypes: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Most common types of bloodwork tests'
        },
      },
    },
  })
  async getSystemStatistics(): Promise<{
    totalResults: number;
    criticalResultsCount: number;
    averageTestsPerResult: number;
    commonTestTypes: string[];
  }> {
    return this.resultsService.getOverallStatistics();
  }

  /**
   * Health Check for Results Service
   * 
   * WHY: Verifies the results service is healthy and can retrieve data.
   * Your React Native app could call this to verify the results endpoint
   * is available before attempting to fetch specific results.
   */
  @Public()
  @Get('health/status')
  @ApiOperation({
    summary: 'Check results service health',
    description: 'Verifies results service is healthy and database is accessible.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service health information',
  })
  async checkHealth(): Promise<{
    status: string;
    databaseConnection: string;
    totalResults: number;
    timestamp: string;
  }> {
    try {
      const stats = await this.resultsService.getOverallStatistics();
      
      return {
        status: 'healthy',
        databaseConnection: 'connected',
        totalResults: stats.totalResults,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        databaseConnection: 'error',
        totalResults: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
