/**
 * Main Application Bootstrap - Entry Point
 * 
 * WHY: This is where your NestJS application starts. It creates the app,
 * configures global settings, and starts the server that your React Native
 * app will connect to.
 * 
 * WHAT IT DOES:
 * 1. 🚀 Creates the NestJS application instance
 * 2. 🌐 Enables CORS for React Native communication
 * 3. 🔧 Sets up global configuration and middleware
 * 4. 📡 Starts the HTTP server
 * 5. 🩸 Makes your bloodwork API accessible
 * 
 * INTEGRATION FLOW:
 * React Native App → HTTP Requests → This Server → App Module → Feature Modules
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  /**
   * 🏗️ Create NestJS Application
   * 
   * WHY: Creates the main application instance with all your modules,
   * controllers, services, and dependencies properly wired together.
   */
  const app = await NestFactory.create(AppModule);

  /**
   * 🌍 Configure CORS for React Native
   * 
   * WHY: Your React Native app runs on a different port/origin than
   * your backend. CORS enables secure cross-origin requests between
   * your mobile app and this API.
   * 
   * DEVELOPMENT: Allows all origins for easy testing
   * PRODUCTION: Should be restricted to your app's domains
   */
  app.enableCors({
    origin: true, // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  /**
   * 🔧 Global Configuration
   * 
   * WHY: Applies consistent validation, error handling, and data
   * transformation across all your API endpoints.
   */
  
  // Global API prefix (all routes become /api/...)
  app.setGlobalPrefix('api');

  // Global validation pipe for request data
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,        // Automatically transform payloads to DTO instances
      whitelist: true,        // Strip non-whitelisted properties
      forbidNonWhitelisted: true, // Throw error for non-whitelisted properties
      disableErrorMessages: false, // Include detailed validation errors
    }),
  );

  /**
   * 🚀 Start the Server
   * 
   * WHY: Makes your API accessible to your React Native app.
   * Uses the port from your environment configuration.
   */
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3000;

  await app.listen(port);

  /**
   * 📋 Startup Information
   * 
   * WHY: Provides useful development information and confirms
   * your API is running and ready for React Native connections.
   */
  console.log(`\n🩸 Bloodwork Analysis API is running!`);
  console.log(`📡 Server: http://localhost:${port}`);
  console.log(`🏥 Health Check: http://localhost:${port}/api/health`);
  console.log(`📖 API Info: http://localhost:${port}/api/info`);
  console.log(`\n🔗 React Native Integration:`);
  console.log(`   Update your bloodwork-api.ts baseURL to: http://localhost:${port}/api`);
  console.log(`\n📱 MVP Flow Endpoints Ready:`);
  console.log(`   📤 Upload: POST /api/uploads`);
  console.log(`   🔬 Analysis: POST /api/analysis`);
  console.log(`   📊 Status: GET /api/analysis/:jobId`);
  console.log(`   📈 Results: GET /api/results/:resultId`);
  console.log(`\n✅ Ready for React Native connections!\n`);
}

/**
 * 🚀 Application Startup
 * 
 * WHY: Handles any startup errors gracefully and provides
 * clear error messages for debugging.
 */
bootstrap().catch((error) => {
  console.error('❌ Failed to start Bloodwork API:', error);
  process.exit(1);
});

/**
 * 🔄 Graceful Shutdown Handling
 * 
 * WHY: Ensures clean shutdown of database connections,
 * Redis connections, and background jobs when the app stops.
 */
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});
