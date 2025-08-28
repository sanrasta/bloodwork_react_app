/**
 * Upload Response - Contract for file upload response
 * 
 * WHY: This response ensures your React Native app receives exactly the data
 * it expects from the upload endpoint. It matches the UploadResponse interface
 * in your frontend types/types.ts file.
 * 
 * FUNCTIONALITY:
 * - Defines the structure of POST /uploads response
 * - Provides uploadId for subsequent analysis request
 * - Includes fileUrl for potential file access
 * - Enables API documentation with Swagger
 * 
 * RELATIONSHIP TO YOUR APP:
 * Your uploadPdf API function expects this exact response format
 * UploadCard component uses uploadId to trigger analysis
 * 
 * NAMING CONVENTION:
 * - This is output data (response to user) → "Response" suffix
 * - Input data (from user) uses "Dto" suffix
 */

import { ApiProperty } from '@nestjs/swagger';

export class UploadResponse {
  /**
   * Unique identifier for the uploaded file
   * This is the UUID from the Upload entity
   * Your React Native app stores this in Zustand state
   */
  @ApiProperty({
    description: 'Unique identifier for the uploaded file',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  uploadId: string;

  /**
   * URL or path where the file can be accessed
   * Currently just the relative path, but could be full URL for CDN
   * Not currently used by your React Native app but useful for future features
   */
  @ApiProperty({
    description: 'URL where the uploaded file can be accessed',
    example: 'uploads/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf',
  })
  fileUrl: string;
}
