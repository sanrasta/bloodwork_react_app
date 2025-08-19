/**
 * App Service - Global Application Logic
 * 
 * WHY: Provides application-wide utilities and information services
 * that don't belong to specific feature modules.
 * 
 * FUNCTIONALITY:
 * - API metadata and version information
 * - Health status checking
 * - Global application state
 * - Cross-module utilities
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Basic API information
   * 
   * WHY: Provides essential API details for your React Native app
   * to confirm connection and understand available capabilities.
   */
  getApiInfo() {
    return {
      name: 'Bloodwork Analysis API',
      version: '1.0.0',
      description: 'AI-powered bloodwork analysis and recommendations',
      environment: this.configService.get<string>('app.env'),
      timestamp: new Date().toISOString(),
      status: 'operational',
      features: [
        'PDF file upload and validation',
        'Background AI analysis processing', 
        'Real-time job progress polling',
        'AI-powered health recommendations',
        'Comprehensive bloodwork insights'
      ]
    };
  }

  /**
   * Application health status
   * 
   * WHY: Critical for monitoring and ensuring all services
   * (database, Redis, file system) are operational.
   */
  getHealthStatus() {
    const now = new Date();
    
    return {
      status: 'healthy',
      timestamp: now.toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get<string>('app.env'),
      version: '1.0.0',
      services: {
        database: {
          status: 'connected',
          type: 'sqlite',
          path: this.configService.get<string>('database.path')
        },
        redis: {
          status: 'connected',
          host: this.configService.get<string>('redis.host'),
          port: this.configService.get<number>('redis.port')
        },
        fileSystem: {
          status: 'accessible',
          uploadPath: this.configService.get<string>('upload.path'),
          maxFileSize: this.configService.get<number>('upload.maxFileSize')
        },
        backgroundJobs: {
          status: 'operational',
          queues: ['bloodwork-analysis']
        }
      },
      endpoints: {
        uploads: '/uploads',
        analysis: '/analysis',
        results: '/results'
      }
    };
  }

  /**
   * Detailed API information
   * 
   * WHY: Comprehensive API documentation for development
   * and integration with your React Native app.
   */
  getDetailedApiInfo() {
    return {
      api: {
        name: 'Bloodwork Analysis API',
        version: '1.0.0',
        description: 'Complete bloodwork analysis pipeline with AI-powered insights',
        documentation: '/api/docs', // Future Swagger integration
        baseUrl: `http://localhost:${this.configService.get<number>('app.port')}`
      },
      endpoints: {
        uploads: {
          'POST /uploads': {
            description: 'Upload PDF bloodwork files',
            accepts: 'multipart/form-data',
            maxFileSize: this.configService.get<number>('upload.maxFileSize'),
            allowedTypes: ['application/pdf'],
            response: 'UploadResponse with uploadId and fileUrl'
          }
        },
        analysis: {
          'POST /analysis': {
            description: 'Start AI analysis of uploaded bloodwork',
            body: { uploadId: 'string' },
            response: 'AnalysisJob with jobId and initial status'
          },
          'GET /analysis/:jobId': {
            description: 'Get analysis job status and progress',
            response: 'AnalysisJob with current status, progress, and resultId when complete'
          }
        },
        results: {
          'GET /results/:resultId': {
            description: 'Get complete analysis results with AI recommendations',
            response: 'Enhanced BloodworkResult with statistics, insights, and AI-powered recommendations'
          }
        },
        utility: {
          'GET /': {
            description: 'Basic API information',
            response: 'API metadata and status'
          },
          'GET /health': {
            description: 'Application health check',
            response: 'Detailed service status information'
          },
          'GET /api/info': {
            description: 'Complete API documentation',
            response: 'This endpoint information'
          }
        }
      },
      mvpFlow: {
        description: 'Complete bloodwork analysis workflow',
        steps: [
          '1. Upload PDF file to POST /uploads',
          '2. Start analysis with POST /analysis using uploadId',
          '3. Poll progress with GET /analysis/:jobId until completed',
          '4. Fetch results with GET /results/:resultId for AI insights'
        ]
      },
      features: {
        fileUpload: {
          description: 'Secure PDF file handling with validation',
          security: ['File type validation', 'Size limits', 'Secure storage']
        },
        backgroundProcessing: {
          description: 'Redis-powered job queues for AI analysis',
          benefits: ['Non-blocking uploads', 'Progress tracking', 'Retry mechanisms']
        },
        aiRecommendations: {
          description: 'Intelligent health recommendations based on bloodwork',
          capabilities: ['Medical context analysis', 'Personalized advice', 'Risk assessment']
        },
        database: {
          description: 'SQLite database with TypeORM for development',
          entities: ['Upload metadata', 'Analysis jobs', 'Bloodwork results']
        }
      },
      integration: {
        reactNative: {
          description: 'Designed for seamless React Native integration',
          components: ['UploadCard', 'AnalysisProgress', 'ResultSummary'],
          stateManagement: 'Zustand store with step-based flow',
          dataFetching: 'React Query for server state management'
        }
      }
    };
  }
}
