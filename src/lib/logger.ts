/**
 * Simple logger utility with verbosity control
 * Set VERBOSE_LOGS=true in .env to enable detailed logging
 */

const VERBOSE = process.env.VERBOSE_LOGS === 'true';

export const logger = {
  // Always log these
  info: (message: string, ...args: any[]) => {
    console.log(message, ...args);
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(message, ...args);
  },
  
  // Only log if VERBOSE is enabled
  debug: (message: string, ...args: any[]) => {
    if (VERBOSE) {
      console.log(message, ...args);
    }
  },
  
  // Cache-specific logging (always show for now to diagnose)
  cache: (message: string, ...args: any[]) => {
    console.log(message, ...args);
  }
};
