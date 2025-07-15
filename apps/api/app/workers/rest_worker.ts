/**
 * Exponential back-off wrapper for REST API calls
 * Handles retries with increasing delays for failed API requests
 */

/**
 * Configuration options for the retry mechanism
 */
interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 5,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 60000,    // 1 minute
  backoffFactor: 2,     // Double the delay each time
};

/**
 * Sleep for a specified number of milliseconds
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute a function with exponential back-off retry logic
 * 
 * @param fn The async function to execute
 * @param options Retry configuration options
 * @returns The result of the function execution
 * @throws The last error encountered if all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  // Merge provided options with defaults
  const retryOptions: RetryOptions = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  };
  
  let lastError: Error | null = null;
  let delay = retryOptions.initialDelayMs;
  
  // Try the function up to maxRetries times
  for (let attempt = 0; attempt <= retryOptions.maxRetries; attempt++) {
    try {
      // If not the first attempt, log retry information
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt}/${retryOptions.maxRetries} after ${delay}ms delay`);
      }
      
      // Execute the function and return the result if successful
      return await fn();
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If we've reached max retries, throw the last error
      if (attempt >= retryOptions.maxRetries) {
        throw lastError;
      }
      
      // Wait before the next retry
      await sleep(delay);
      
      // Increase the delay for the next retry (with a maximum cap)
      delay = Math.min(delay * retryOptions.backoffFactor, retryOptions.maxDelayMs);
    }
  }
  
  // This should never be reached due to the throw in the loop,
  // but TypeScript requires a return statement
  throw lastError || new Error('Unexpected error in retry logic');
}

/**
 * Wrap a worker function with retry logic
 * 
 * @param workerFn The worker function to wrap
 * @param options Retry configuration options
 * @returns A wrapped function with retry logic
 */
export function createRetryableWorker<T>(
  workerFn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): () => Promise<T> {
  return () => withRetry(workerFn, options);
}
