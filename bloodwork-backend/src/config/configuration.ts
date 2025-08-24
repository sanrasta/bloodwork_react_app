/**
 * Configuration Factory for NestJS
 * 
 * WHY: This file centralizes all environment variable handling and provides 
 * type-safe configuration throughout the application. Instead of accessing 
 * process.env directly everywhere, we have a single source of truth.
 * 
 * FUNCTIONALITY:
 * - Reads environment variables with fallback defaults
 * - Provides typed configuration object
 * - Enables easy testing with different configurations
 * - Validates configuration on app startup
 */

export interface AppConfig {
  port: number;
  database: {
    path: string;
  };
  redis: {
    url: string;
    host: string;
    port: number;
  };
  upload: {
    path: string;
    maxSize: number;
  };
  api: {
    prefix: string;
  };
  clerk: {
    secretKey: string;
    publishableKey: string;
  };
}

export default (): AppConfig => {
  // Parse Redis URL to extract host and port for Bull configuration
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const redisMatch = redisUrl.match(/redis:\/\/([^:]+):(\d+)/);
  const redisHost = redisMatch ? redisMatch[1] : 'localhost';
  const redisPort = redisMatch ? parseInt(redisMatch[2]) : 6379;

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    database: {
      path: process.env.DATABASE_PATH || './bloodwork.db',
    },
    redis: {
      url: redisUrl,
      host: redisHost,
      port: redisPort,
    },
    upload: {
      path: process.env.UPLOAD_PATH || './uploads',
      maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    },
    api: {
      prefix: process.env.API_PREFIX || 'api',
    },
    clerk: {
      secretKey: process.env.CLERK_SECRET_KEY || '',
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
    },
  };
};
