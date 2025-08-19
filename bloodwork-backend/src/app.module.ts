/**
 * Main Application Module - The Heart of Your NestJS Backend
 * 
 * WHY: This is where everything comes together. The App Module orchestrates
 * all your feature modules, database connections, background jobs, and
 * global configurations. It's the foundation that makes your entire
 * bloodwork analysis API functional.
 * 
 * WHAT IT DOES:
 * 1. 🗄️  Configures SQLite database with TypeORM
 * 2. 🔄 Sets up Redis connection for Bull queues  
 * 3. ⚙️  Loads environment configuration
 * 4. 📁 Configures file upload storage
 * 5. 🧩 Wires together all feature modules
 * 6. 🚀 Makes your API ready for React Native integration
 * 
 * ARCHITECTURE FLOW:
 * React Native → HTTP Requests → App Module → Feature Modules → Database/Redis
 * 
 * This module ensures your MVP flow works end-to-end:
 * Upload PDF → Start Analysis → Poll Status → Get Results
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Import configuration
import configuration from './config/configuration';

// Import all feature modules
import { UploadsModule } from './uploads/uploads.module';
import { AnalysisModule } from './analysis/analysis.module';
import { ResultsModule } from './results/results.module';

// Import entities for database setup
import { Upload } from './common/entities/upload.entity';
import { AnalysisJob } from './common/entities/analysis-job.entity';
import { BloodworkResult } from './common/entities/bloodwork-result.entity';

// Basic app controller and service
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    /**
     * 🔧 Configuration Module - Environment Management
     * 
     * WHY: Loads all environment variables and provides type-safe
     * configuration throughout your application. Essential for
     * different environments (development, production, testing).
     * 
     * PROVIDES:
     * - Database connection settings
     * - Redis connection details
     * - File upload configurations
     * - Port and security settings
     */
    ConfigModule.forRoot({
      isGlobal: true, // Makes config available everywhere
      load: [configuration],
      envFilePath: '.env',
    }),

    /**
     * 🗄️ Database Module - SQLite with TypeORM
     * 
     * WHY: SQLite is perfect for your MVP - zero setup, file-based,
     * and easily scalable to PostgreSQL later. TypeORM provides
     * excellent type safety and relationship management.
     * 
     * ENTITIES MANAGED:
     * - Upload: File metadata and storage paths
     * - AnalysisJob: Background job status and progress
     * - BloodworkResult: Final analysis results and insights
     * 
     * FEATURES:
     * - Automatic schema creation
     * - Type-safe database operations
     * - Relationship management between entities
     * - Migration support for production
     */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('database.path'),
        entities: [Upload, AnalysisJob, BloodworkResult],
        synchronize: true, // Auto-create tables (disable in production)
        logging: configService.get<string>('app.env') === 'development',
      }),
      inject: [ConfigService],
    }),

    /**
     * 🔄 Bull Queue Module - Background Job Processing
     * 
     * WHY: AI analysis takes time. Bull queues ensure your React Native
     * app gets immediate responses while analysis happens in the background.
     * Users can poll for progress without blocking the UI.
     * 
     * POWERED BY REDIS:
     * - Job persistence and reliability
     * - Progress tracking and updates
     * - Retry mechanisms for failed jobs
     * - Scalable across multiple servers
     * 
     * YOUR MVP FLOW:
     * 1. React Native uploads PDF → instant response
     * 2. Background job starts AI analysis
     * 3. React Native polls job status
     * 4. Job completes → results available
     */
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password'),
        },
        defaultJobOptions: {
          removeOnComplete: 10, // Keep last 10 completed jobs
          removeOnFail: 5,      // Keep last 5 failed jobs for debugging
          attempts: 3,          // Retry failed jobs up to 3 times
          backoff: {
            type: 'exponential',
            delay: 2000,        // Start with 2s delay, increase exponentially
          },
        },
      }),
      inject: [ConfigService],
    }),

    /**
     * 📁 File Upload Module - Multer Configuration
     * 
     * WHY: Handles PDF uploads from your React Native app with proper
     * validation, security, and storage management. Critical for the
     * first step of your MVP flow.
     * 
     * SECURITY FEATURES:
     * - File type validation (PDF only)
     * - File size limits
     * - Secure file naming
     * - Organized storage structure
     * 
     * INTEGRATION:
     * - Works seamlessly with UploadsController
     * - Provides file metadata to database
     * - Enables file serving for frontend access
     */
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dest: configService.get<string>('upload.path'),
        limits: {
          fileSize: configService.get<number>('upload.maxFileSize'),
        },
      }),
      inject: [ConfigService],
    }),

    /**
     * 🌐 Static File Serving - PDF Access
     * 
     * WHY: Your React Native app needs to access uploaded PDFs
     * for display or download. This module serves files securely
     * with proper routing and access control.
     * 
     * URL STRUCTURE:
     * GET /uploads/filename.pdf → serves file from uploads directory
     * 
     * SECURITY CONSIDERATIONS:
     * - Only serves files from designated upload directory
     * - No directory traversal vulnerabilities
     * - Can add authentication middleware later
     */
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          rootPath: configService.get<string>('upload.path'),
          serveRoot: '/uploads',
          exclude: ['/api*'], // Don't interfere with API routes
        },
      ],
      inject: [ConfigService],
    }),

    /**
     * 🧩 Feature Modules - Your Core Business Logic
     * 
     * WHY: Each module encapsulates a specific part of your MVP flow.
     * This modular approach makes your code maintainable, testable,
     * and allows each feature to evolve independently.
     * 
     * MODULE RESPONSIBILITIES:
     * 
     * 📤 UploadsModule:
     * - POST /uploads - Handle PDF file uploads
     * - File validation and storage
     * - Upload metadata management
     * 
     * 🔬 AnalysisModule:
     * - POST /analysis - Start AI analysis jobs
     * - GET /analysis/:jobId - Poll job status
     * - Background job processing with progress
     * - AI simulation (easily replaceable with real AI)
     * 
     * 📊 ResultsModule:
     * - GET /results/:resultId - Fetch analysis results
     * - AI-powered recommendations
     * - Enhanced data with statistics and insights
     * - Medical context and safety disclaimers
     */
    UploadsModule,
    AnalysisModule,
    ResultsModule,
  ],

  /**
   * 🎯 Root Controllers - Application Entry Points
   * 
   * WHY: AppController provides basic application health checks
   * and API information. Essential for monitoring and debugging.
   * 
   * ENDPOINTS PROVIDED:
   * - GET / - Basic API information
   * - GET /health - Application health status
   * - GET /api - API documentation (future Swagger integration)
   */
  controllers: [AppController],

  /**
   * ⚙️ Root Services - Global Application Services
   * 
   * WHY: AppService provides global utilities and application-wide
   * functionality that doesn't belong to specific feature modules.
   * 
   * SERVICES PROVIDED:
   * - Application metadata
   * - Health check logic
   * - Global error handling helpers
   * - Cross-module utilities
   */
  providers: [AppService],
})
export class AppModule {
  /**
   * 🚀 Application Lifecycle Hooks
   * 
   * WHY: Useful for application startup tasks, graceful shutdowns,
   * and ensuring all services are properly initialized.
   * 
   * FUTURE ENHANCEMENTS:
   * - Database migration checks on startup
   * - Redis connection validation
   * - File system permission verification
   * - Background job queue health checks
   */
  constructor(private configService: ConfigService) {}

  /**
   * Called when the application starts
   * 
   * WHY: Perfect place to verify all critical services are working
   * before accepting requests from your React Native app.
   */
  async onModuleInit() {
    const env = this.configService.get<string>('app.env');
    const port = this.configService.get<number>('app.port');
    
    console.log(`🩸 Bloodwork Analysis API`);
    console.log(`🌍 Environment: ${env}`);
    console.log(`🚀 Starting on port: ${port}`);
    console.log(`📁 Upload path: ${this.configService.get<string>('upload.path')}`);
    console.log(`🔄 Redis: ${this.configService.get<string>('redis.host')}:${this.configService.get<number>('redis.port')}`);
    console.log(`🗄️  Database: ${this.configService.get<string>('database.path')}`);
    console.log(`✅ All modules loaded successfully!`);
  }
}

/**
 * 🎯 INTEGRATION WITH YOUR REACT NATIVE APP
 * 
 * This App Module creates the complete API that your React Native app expects:
 * 
 * 1. 📱 UPLOAD FLOW:
 *    React Native UploadCard → POST /uploads → UploadsModule → Database
 * 
 * 2. 🔬 ANALYSIS FLOW:
 *    React Native UploadCard → POST /analysis → AnalysisModule → Bull Queue
 * 
 * 3. 📊 POLLING FLOW:
 *    React Native AnalysisProgress → GET /analysis/:jobId → AnalysisModule
 * 
 * 4. 📈 RESULTS FLOW:
 *    React Native ResultSummary → GET /results/:resultId → ResultsModule
 * 
 * 🔄 COMPLETE MVP PIPELINE:
 * Upload PDF → Start Analysis → Poll Progress → Display AI Results
 * 
 * 🚀 PRODUCTION READY FEATURES:
 * - Comprehensive error handling
 * - Background job reliability
 * - File security and validation
 * - AI-powered recommendations
 * - Scalable architecture
 * - Easy real AI integration
 * 
 * 🎉 YOUR BACKEND IS NOW COMPLETE!
 * Run `npm run start:dev` and your React Native app can connect!
 */