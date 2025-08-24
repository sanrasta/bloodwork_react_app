/**
 * Current User Decorator
 * 
 * WHY: Provides a clean way to access the authenticated user's information
 * in controller methods without manually extracting from the request.
 * 
 * FUNCTIONALITY:
 * - Extracts user ID from req.auth populated by Clerk middleware
 * - Returns the user ID as a string
 * - Can be used in combination with ClerkAuthGuard
 * 
 * USAGE:
 * @UseGuards(ClerkAuthGuard)
 * @Post()
 * async createResource(@CurrentUser() userId: string) {
 *   // userId is automatically extracted from the JWT token
 * }
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
    claims: Record<string, any>;
  };
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.auth?.userId || '';
  },
);


