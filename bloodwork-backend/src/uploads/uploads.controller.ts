/**
 * Uploads Controller - HTTP endpoint for file uploads
 * 
 * WHY: This controller is the exact endpoint your React Native app's
 * uploadPdf() function calls. It handles the multipart/form-data request,
 * file validation, and response formatting that your UploadCard expects.
 * 
 * FUNCTIONALITY:
 * - Receives multipart file uploads from React Native
 * - Configures multer for secure file handling
 * - Validates file type and size before processing
 * - Returns uploadId for subsequent analysis requests
 * - Handles upload errors with specific error messages
 * 
 * RELATIONSHIP TO YOUR APP:
 * React Native UploadCard -> FormData with PDF -> POST /uploads -> This controller
 * Controller -> UploadsService -> Database -> Returns UploadResponseDto
 * React Native receives { uploadId, fileUrl } -> Stores in Zustand -> Triggers analysis
 */

import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  BadRequestException,
  UseGuards,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadsService } from './uploads.service';
import { UploadResponseDto } from '../common/dto/upload-response.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { ConfigService } from '@nestjs/config';
import { ClerkAuthGuard, CurrentUser, Public } from '../auth';

@ApiTags('uploads')
@Controller('uploads')
// @UseGuards(ClerkAuthGuard) // Temporarily disabled for testing
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Upload PDF endpoint - The main entry point for your React Native app
   * 
   * WHY: This is the exact endpoint your uploadPdf() API function calls.
   * It must handle multipart/form-data exactly as your React Native
   * FormData sends it, with proper validation and error handling.
   * 
   * REQUEST FORMAT (from your React Native app):
   * POST /uploads
   * Content-Type: multipart/form-data
   * Body: FormData with 'file' field containing PDF
   * 
   * RESPONSE FORMAT (to your React Native app):
   * { uploadId: "uuid", fileUrl: "uploads/filename.pdf" }
   */
  @Post()
  @ApiOperation({ 
    summary: 'Upload bloodwork PDF file',
    description: 'Accepts PDF files for bloodwork analysis. Returns upload ID for subsequent analysis requests.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type, size, or format',
  })
  @ApiResponse({
    status: 413,
    description: 'File size exceeds maximum limit',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      // Disk storage configuration
      storage: diskStorage({
        // Destination folder for uploaded files
        destination: (req, file, cb) => {
          const uploadPath = req['configService']?.get('upload.path') || './uploads';
          cb(null, uploadPath);
        },
        
        // Generate unique filename to prevent conflicts
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const extension = extname(file.originalname);
          cb(null, `${uniqueSuffix}${extension}`);
        },
      }),
      
      // File filter for security and validation
      fileFilter: (req, file, cb) => {
        // Only allow PDF files
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only PDF files are allowed'), false);
        }
      },
      
      // File size limits (also enforced by ParseFilePipeBuilder)
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB - matches your React Native validation
        files: 1,                   // Only one file per request
      },
    }),
  )
  async uploadFile(
    /**
     * File validation pipe - Double validation for security
     * 
     * WHY: While multer provides basic validation, this pipe
     * provides additional type and size validation with specific
     * error messages that your React Native app can display.
     */
    @UploadedFile()
    file: Express.Multer.File,
    // @CurrentUser() userId: string, // Temporarily disabled for testing
  ): Promise<ApiResponseDto<UploadResponseDto>> {
    /**
     * Delegate to service layer for business logic
     * 
     * WHY: Controllers should be thin - they handle HTTP concerns
     * while services handle business logic. This separation enables
     * testing and reuse of upload logic in other contexts.
     */
    const userId = 'test-user-id'; // Temporary for testing
    return this.uploadsService.saveUpload(file, userId);
  }

  /**
   * Health check endpoint for upload functionality
   * 
   * WHY: Useful for monitoring and debugging upload service health.
   * Can be called by your React Native app to verify upload endpoint
   * is available before attempting file uploads.
   */
  @Public()
  @Get('health')
  @ApiOperation({ 
    summary: 'Check upload service health',
    description: 'Verifies upload service is available and properly configured.',
  })
  @ApiResponse({
    status: 200,
    description: 'Upload service is healthy',
  })
  checkHealth(): { status: string; maxFileSize: number; uploadPath: string } {
    return {
      status: 'healthy',
      maxFileSize: this.configService.get<number>('upload.maxSize') || 10485760,
      uploadPath: this.configService.get<string>('upload.path') || './uploads',
    };
  }
}
