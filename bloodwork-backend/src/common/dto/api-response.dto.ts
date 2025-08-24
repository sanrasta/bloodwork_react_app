/**
 * Generic API Response DTO - Standardized response wrapper
 * 
 * WHY: Provides consistent response format across all endpoints
 * that matches what the React Native app expects.
 */

import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'Response data',
  })
  data: T;

  @ApiProperty({
    description: 'Success indicator',
    example: true,
  })
  success: boolean;
}

export function createApiResponse<T>(data: T): ApiResponseDto<T> {
  return {
    data,
    success: true,
  };
}
