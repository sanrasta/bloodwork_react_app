/**
 * Environment-aware logging utility
 * 
 * In development: Full logging with emojis and context
 * In production: Only errors are logged, info/debug are silent
 * 
 * Benefits:
 * - Performance: No console.log overhead in production
 * - Security: Prevents accidental data leaks in production logs
 * - Debugging: Rich logging in development
 */

interface Logger {
  info: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
}

const createLogger = (): Logger => {
  if (__DEV__) {
    // Development: Full logging with emojis for better visual distinction
    return {
      info: (message: string, ...args: any[]) => console.log(`ℹ️ ${message}`, ...args),
      error: (message: string, ...args: any[]) => console.error(`❌ ${message}`, ...args),
      debug: (message: string, ...args: any[]) => console.log(`🔍 ${message}`, ...args),
      warn: (message: string, ...args: any[]) => console.warn(`⚠️ ${message}`, ...args),
    };
  } else {
    // Production: Only errors, everything else is silenced
    return {
      info: () => {}, // Silent in production
      error: (message: string, ...args: any[]) => console.error(message, ...args), // Still log errors
      debug: () => {}, // Silent in production
      warn: () => {}, // Silent in production
    };
  }
};

export const logger = createLogger();

// Specialized loggers for different domains
export const reactQueryLogger = {
  polling: (message: string, ...args: any[]) => logger.debug(`[React Query] ${message}`, ...args),
  mutation: (message: string, ...args: any[]) => logger.info(`[Mutation] ${message}`, ...args),
  cache: (message: string, ...args: any[]) => logger.debug(`[Cache] ${message}`, ...args),
  error: (message: string, ...args: any[]) => logger.error(`[React Query] ${message}`, ...args),
};

export const apiLogger = {
  request: (message: string, ...args: any[]) => logger.debug(`[API] ${message}`, ...args),
  response: (message: string, ...args: any[]) => logger.debug(`[API] ${message}`, ...args),
  error: (message: string, ...args: any[]) => logger.error(`[API] ${message}`, ...args),
};
