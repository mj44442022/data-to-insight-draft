/**
 * Custom error types for better error handling and categorization
 */

export class FontLoadError extends Error {
  constructor(message: string, public fontPath: string) {
    super(message);
    this.name = 'FontLoadError';
  }
}

export class ImageProcessingError extends Error {
  constructor(message: string, public slideNumber?: number) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

export class AIGenerationError extends Error {
  constructor(message: string, public isRetryable: boolean = false) {
    super(message);
    this.name = 'AIGenerationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        if (onRetry) {
          onRetry(lastError, attempt + 1);
        }

        console.log(`[RETRY] Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * backoffFactor, maxDelay);
      }
    }
  }

  throw lastError!;
}

/**
 * Check if error is retryable (network errors, timeouts, rate limits)
 */
export function isRetryableError(error: Error): boolean {
  const retryableMessages = [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'network',
    'timeout',
    'rate limit',
    '429',
    '503',
    '504',
  ];

  const errorMessage = error.message.toLowerCase();
  return retryableMessages.some(msg => errorMessage.includes(msg.toLowerCase()));
}
