/**
 * Clerk Authentication Guard for NestJS
 * 
 * WHY: This guard ensures that only authenticated users can access protected
 * routes. It checks if the request has been populated with auth data by the
 * Clerk middleware.
 * 
 * FUNCTIONALITY:
 * - Validates that req.auth exists and contains userId
 * - Returns HTTP 401 if user is not authenticated
 * - Allows authenticated requests to proceed
 * - Can be applied to controllers, methods, or globally
 * 
 * USAGE:
 * @UseGuards(ClerkAuthGuard)
 * @Controller('protected-route')
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

// Extend Express Request to include auth property
interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
    claims: Record<string, any>;
  };
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    
    // Check if Clerk middleware populated the auth object
    if (!request.auth || !request.auth.userId) {
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }
}

/**
 * Public Route Decorator
 * 
 * WHY: Allows specific routes to bypass authentication when using
 * the ClerkAuthGuard globally.
 * 
 * USAGE:
 * @Public()
 * @Get('health')
 * checkHealth() { ... }
 */
import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata('isPublic', true);


