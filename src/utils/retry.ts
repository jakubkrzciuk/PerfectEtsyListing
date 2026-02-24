// ============================================
// RETRY LOGIC WITH EXPONENTIAL BACKOFF
// ============================================

import { RETRY_CONFIG } from '../config/constants';

export interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  onRetry?: (attempt: number) => void;
  fallbackOperation?: () => Promise<any>;
}

/**
 * Retry operation with exponential backoff
 * Handles 503 (overloaded), 429 (rate limit), and network errors
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { 
    maxRetries = RETRY_CONFIG.MAX_RETRIES,
    delay = RETRY_CONFIG.INITIAL_DELAY,
    onRetry,
    fallbackOperation
  } = options;
  
  let lastError: any;
  let currentDelay = delay;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if error is retryable
      if (isRetryableError(error)) {
        console.warn(`Attempt ${i + 1} failed. Retrying in ${currentDelay}ms...`, error);
        onRetry?.(i + 1);
        
        await sleep(currentDelay);
        currentDelay *= RETRY_CONFIG.BACKOFF_MULTIPLIER;
      } else {
        // Non-retryable error - throw immediately
        throw error;
      }
    }
  }
  
  // Try fallback if provided
  if (fallbackOperation) {
    onRetry?.(maxRetries + 1);
    try {
      return await fallbackOperation();
    } catch (fallbackError) {
      throw fallbackError;
    }
  }
  
  throw lastError;
}

/**
 * Check if error should trigger retry
 */
function isRetryableError(error: any): boolean {
  const status = error?.status || error?.code || extractStatusFromMessage(error?.message);
  
  return (
    status === 503 ||
    status === 429 ||
    status === 502 ||
    status === 504 ||
    error?.message?.includes('overloaded') ||
    error?.message?.includes('rate limit') ||
    error?.message?.includes('timeout')
  );
}

/**
 * Extract HTTP status from error message
 */
function extractStatusFromMessage(message?: string): number | null {
  if (!message) return null;
  
  const match = message.match(/\b(503|429|502|504)\b/);
  return match ? parseInt(match[1]) : null;
}

/**
 * Sleep utility
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if error is billing/permission related (403)
 */
export const isBillingError = (error: any): boolean => {
  return (
    error?.status === 403 ||
    error?.code === 403 ||
    error?.message?.includes('403') ||
    error?.message?.includes('billing') ||
    error?.message?.includes('permission')
  );
};
