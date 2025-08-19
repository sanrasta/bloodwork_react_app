/**
 * Uploads Module - NestJS module configuration for file upload functionality
 * 
 * WHY: This module acts as a self-contained package for all upload-related
 * functionality. It defines dependencies, exports services for other modules,
 * and registers the Upload entity with TypeORM.
 * 
 * FUNCTIONALITY:
 * - Registers Upload entity for database operations
 * - Configures UploadsService with proper dependencies
 * - Exports UploadsController for HTTP endpoints
 * - Makes UploadsService available to other modules (analysis)
 * - Sets up proper dependency injection
 * 
 * RELATIONSHIP TO YOUR APP:
 * This module powers the entire upload flow:
 * React Native -> UploadsController -> UploadsService -> Upload Entity -> Database
 * Other modules import UploadsService to access upload records
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { Upload } from '../common/entities/upload.entity';

@Module({
  /**
   * Import required modules and configure dependencies
   * 
   * WHY: NestJS uses dependency injection, so we must explicitly
   * declare what this module needs to function properly.
   */
  imports: [
    /**
     * TypeORM configuration for Upload entity
     * 
     * WHY: This registers the Upload entity with TypeORM so the
     * UploadsService can inject the Upload repository for database operations.
     * Without this, @InjectRepository(Upload) would fail.
     */
    TypeOrmModule.forFeature([Upload]),

    /**
     * Multer configuration for file upload handling
     * 
     * WHY: This configures multer globally for this module with
     * environment-based settings. The controller uses FileInterceptor
     * which requires multer to be properly configured.
     */
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dest: configService.get<string>('upload.path', './uploads'),
        limits: {
          fileSize: configService.get<number>('upload.maxSize', 10 * 1024 * 1024),
        },
      }),
      inject: [ConfigService],
    }),
  ],

  /**
   * Controllers that handle HTTP requests
   * 
   * WHY: UploadsController handles the POST /uploads endpoint
   * that your React Native app calls. NestJS needs to know
   * which classes are controllers to register their routes.
   */
  controllers: [UploadsController],

  /**
   * Services that provide business logic
   * 
   * WHY: UploadsService contains the core upload logic.
   * By declaring it as a provider, NestJS can inject it
   * into controllers and other services that need it.
   */
  providers: [UploadsService],

  /**
   * Services exported for use by other modules
   * 
   * WHY: The AnalysisModule needs to access upload records
   * to get file paths for processing. Exporting UploadsService
   * allows other modules to import and use it.
   * 
   * USAGE: AnalysisService imports UploadsService to validate
   * uploadIds and get file paths for processing.
   */
  exports: [UploadsService],
})
export class UploadsModule {
  /**
   * Optional: Module initialization hook
   * 
   * WHY: We could use this to create the uploads directory
   * if it doesn't exist, or perform other initialization tasks.
   */
  constructor(private configService: ConfigService) {
    this.ensureUploadDirectoryExists();
  }

  /**
   * Ensures the upload directory exists on startup
   * 
   * WHY: Prevents runtime errors when trying to save files
   * to a non-existent directory. Creates the directory structure
   * needed for file storage.
   */
  private ensureUploadDirectoryExists(): void {
    const fs = require('fs');
    const path = require('path');
    
    const uploadPath = this.configService.get<string>('upload.path', './uploads');
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(`Created upload directory: ${uploadPath}`);
    }
  }
}
