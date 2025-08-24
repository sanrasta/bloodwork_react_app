/**
 * App Controller - Main Application Endpoints
 * 
 * WHY: Provides essential application information and health checks
 * for your React Native app and development/monitoring tools.
 * 
 * ENDPOINTS:
 * - GET / - API welcome and basic info
 * - GET /health - Application health status
 * - GET /api/info - Detailed API information
 */

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Root endpoint - API welcome message
   * 
   * WHY: Useful for testing if your API is running and accessible
   * from your React Native app during development.
   */
  @Get()
  getApiInfo() {
    return this.appService.getApiInfo();
  }

  /**
   * Health check endpoint
   * 
   * WHY: Essential for monitoring, deployment health checks,
   * and ensuring all services (database, Redis) are operational.
   */
  @Get('health')
  getHealthStatus() {
    return this.appService.getHealthStatus();
  }

  /**
   * API information endpoint
   * 
   * WHY: Provides detailed API capabilities and endpoints
   * for your React Native app to discover available features.
   */
  @Get('info')
  getDetailedApiInfo() {
    return this.appService.getDetailedApiInfo();
  }
}
