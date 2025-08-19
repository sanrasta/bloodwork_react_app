/**
 * Create Analysis DTO - Contract for starting analysis jobs
 * 
 * WHY: This DTO validates the request body when your React Native app
 * calls POST /analysis. It ensures the uploadId is valid and properly
 * formatted before creating an analysis job.
 * 
 * FUNCTIONALITY:
 * - Validates uploadId is a proper UUID format
 * - Provides clear error messages for invalid requests
 * - Enables automatic API documentation
 * - Type-safe request handling
 * 
 * RELATIONSHIP TO YOUR APP:
 * Your startAnalysis API function sends { uploadId } in this format
 * UploadCard startAnalysisFlow uses this contract
 */

import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnalysisDto {
  /**
   * UUID of the uploaded file to analyze
   * Must be a valid UUID that exists in the uploads table
   * Validated automatically by NestJS validation pipe
   */
  @ApiProperty({
    description: 'UUID of the uploaded file to analyze',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString()
  @IsUUID()
  uploadId: string;
}
