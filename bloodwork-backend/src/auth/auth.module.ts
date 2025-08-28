/**
 * Authentication Module
 * 
 * WHY: Centralizes all authentication-related functionality including
 * guards, decorators, and services. Makes it easy to import auth
 * functionality into other modules.
 * 
 * FUNCTIONALITY:
 * - Provides ClerkAuthGuard for protecting routes
 * - Exports auth utilities for use in other modules
 * - Can be extended with additional auth services
 */

import { Module } from '@nestjs/common';
import { ClerkAuthGuard } from './clerk-auth.guard';

@Module({
  providers: [ClerkAuthGuard],
  exports: [ClerkAuthGuard],
})
export class AuthModule {}




