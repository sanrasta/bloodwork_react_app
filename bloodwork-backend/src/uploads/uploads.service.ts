/**
 * Uploads Service - Core business logic for file handling
 * 
 * WHY: This service encapsulates all file upload business logic, separating
 * it from the HTTP layer (controller). It handles database persistence,
 * file validation, and response formatting.
 * 
 * FUNCTIONALITY:
 * - Saves upload metadata to database
 * - Validates file properties against business rules
 * - Generates consistent response format
 * - Provides file retrieval for other services
 * - Handles cleanup and error scenarios
 * 
 * RELATIONSHIP TO YOUR APP:
 * When your React Native UploadCard calls uploadPdf(), this service:
 * 1. Receives the uploaded file from multer
 * 2. Saves metadata to uploads table
 * 3. Returns uploadId for subsequent analysis
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from '../common/entities/upload.entity';
import { UploadResponseDto } from '../common/dto/upload-response.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Saves uploaded file metadata to database
   * 
   * WHY: This method bridges the gap between multer's file handling
   * and your application's business logic. It persists the upload
   * record that other services will reference.
   * 
   * PROCESS:
   * 1. Validates file meets business requirements
   * 2. Creates database record with metadata
   * 3. Returns structured response for React Native
   */
  async saveUpload(file: Express.Multer.File, userId: string): Promise<UploadResponseDto> {
    // Business validation beyond multer's basic checks
    this.validateUploadedFile(file);

    // Create database entity with file metadata
    const upload = this.uploadRepository.create({
      userId,                        // Associate with authenticated user
      filename: file.filename,        // UUID-based filename from multer
      originalName: file.originalname, // User's original filename
      mimetype: file.mimetype,        // Should be 'application/pdf'
      size: file.size,               // File size in bytes
      path: file.path,               // Full file system path
    });

    // Persist to database - this generates the UUID primary key
    const savedUpload = await this.uploadRepository.save(upload);

    // Format response for React Native app
    return {
      uploadId: savedUpload.id,      // UUID that your app will use for analysis
      fileUrl: `uploads/${savedUpload.filename}`, // Relative path for future access
    };
  }

  /**
   * Retrieves upload record by ID for a specific user
   * 
   * WHY: Other services (analysis, cleanup) need to access upload
   * metadata and file paths. This provides a clean interface with user isolation.
   * 
   * USAGE: Analysis service uses this to get file path for processing
   */
  async findById(id: string, userId: string): Promise<Upload> {
    const upload = await this.uploadRepository.findOne({ where: { id, userId } });
    
    if (!upload) {
      throw new NotFoundException(`Upload with ID ${id} not found`);
    }

    return upload;
  }

  /**
   * Retrieves upload record with file existence check for a specific user
   * 
   * WHY: Ensures the database record exists AND the actual file
   * is still on the file system. Protects against orphaned records.
   */
  async findByIdWithFileCheck(id: string, userId: string): Promise<Upload> {
    const upload = await this.findById(id, userId);
    
    // Check if physical file still exists
    const fs = require('fs');
    if (!fs.existsSync(upload.path)) {
      throw new NotFoundException(`File for upload ${id} no longer exists on disk`);
    }

    return upload;
  }

  /**
   * Business validation for uploaded files
   * 
   * WHY: While multer handles basic validation, this method
   * enforces business rules specific to bloodwork analysis.
   * 
   * VALIDATION RULES:
   * - File size within configured limits
   * - PDF format validation
   * - Filename safety checks
   */
  private validateUploadedFile(file: Express.Multer.File): void {
    const maxSize = this.configService.get<number>('upload.maxSize') || 10485760;

    // Validate file size against business limits
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size ${file.size} bytes exceeds maximum allowed size of ${maxSize} bytes`
      );
    }

    // Validate MIME type (should already be checked by multer)
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException(
        `Invalid file type. Expected PDF, received ${file.mimetype}`
      );
    }

    // Validate file has content
    if (file.size === 0) {
      throw new BadRequestException('Uploaded file is empty');
    }

    // Basic filename validation for security
    if (!file.originalname || file.originalname.length > 255) {
      throw new BadRequestException('Invalid filename');
    }
  }

  /**
   * Cleanup method for removing old uploads
   * 
   * WHY: Prevents disk space from growing indefinitely.
   * Can be called by scheduled jobs to clean old files.
   * 
   * FUTURE ENHANCEMENT: This could be enhanced with:
   * - Configurable retention periods
   * - Selective cleanup based on analysis status
   * - Batch processing for large datasets
   */
  async cleanupOldUploads(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const oldUploads = await this.uploadRepository
      .createQueryBuilder('upload')
      .where('upload.createdAt < :cutoffDate', { cutoffDate })
      .getMany();

    let deletedCount = 0;
    const fs = require('fs');

    for (const upload of oldUploads) {
      try {
        // Delete physical file
        if (fs.existsSync(upload.path)) {
          fs.unlinkSync(upload.path);
        }

        // Delete database record
        await this.uploadRepository.remove(upload);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to cleanup upload ${upload.id}:`, error);
      }
    }

    return deletedCount;
  }
}
